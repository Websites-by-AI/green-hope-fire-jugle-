/**
 * Cloudflare AI Gateway resilient client helper
 * Designed for high reliability, hybrid authentication models, dynamic routing fallback flags,
 * cross-client payload normalization, and precise Cloudflare Edge diagnostics.
 */

export type ProviderType = 'openai' | 'openrouter' | 'anthropic' | 'gemini' | 'workers-ai';

export interface GatewayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GatewayRequestConfig {
  provider: ProviderType;
  model: string;
  messages: GatewayMessage[];
  temperature?: number;
  maxTokens?: number;
  // Cloudflare and Gateway routing headers
  gatewayId?: string;
  skipCache?: boolean;
  providerApiKey?: string; // Standard API Key for OpenAI/Anthropic/Gemini if running direct Gateway proxying
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  defaultGatewayId: string;
  useLegacyGatewayDomain?: boolean; // Set to true to utilize gateway.ai.cloudflare.com
}

export interface DiagnosticReport {
  isError: boolean;
  status: number;
  diagnosticCode: string;
  message: string;
  remediationAction: string;
}

export class CloudflareAIGatewayError extends Error {
  public status: number;
  public diagnostics: DiagnosticReport;

  constructor(status: number, diagnostics: DiagnosticReport) {
    super(`[CloudflareAI][${diagnostics.diagnosticCode}] ${diagnostics.message}`);
    this.name = 'CloudflareAIGatewayError';
    this.status = status;
    this.diagnostics = diagnostics;
  }
}

export class CloudflareAIGatewayService {
  private config: CloudflareConfig;

  constructor(config: CloudflareConfig) {
    if (!config.accountId) throw new Error('Cloudflare configuration: accountId is required.');
    if (!config.apiToken) throw new Error('Cloudflare configuration: apiToken is required.');
    if (!config.defaultGatewayId) throw new Error('Cloudflare configuration: defaultGatewayId is required.');
    this.config = config;
  }

  /**
   * Translates incoming parameters into format-compliant payloads depending on the active provider.
   */
  private mapPayload(provider: ProviderType, model: string, messages: GatewayMessage[], temperature?: number, maxTokens?: number) {
    const tempValue = temperature !== undefined ? temperature : 0.7;
    
    switch (provider) {
      case 'openai':
      case 'openrouter':
        return {
          model: model,
          messages: messages,
          temperature: tempValue,
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        };

      case 'anthropic': {
        const systemMessage = messages.find(m => m.role === 'system')?.content;
        const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }));

        return {
          model: model,
          messages: chatMessages,
          ...(systemMessage ? { system: systemMessage } : {}),
          max_tokens: maxTokens || 4096,
          temperature: tempValue,
        };
      }

      case 'gemini': {
        // Map messages array to Gemini's expected Content nested format: 
        // { contents: [{ role: 'user', parts: [{ text: '...' }] }] }
        const geminiContents = messages.map(msg => {
          // Gemini role mapping: 'system' maps to 'user' in standard contents or should be processed separately.
          // For resilience, unified system instructions are injected in system_instruction or mapped to 'user'.
          const role = msg.role === 'assistant' ? 'model' : 'user';
          return {
            role: role,
            parts: [{ text: msg.content }],
          };
        });

        // Search for system message
        const systemPrompt = messages.find(m => m.role === 'system')?.content;

        return {
          contents: geminiContents,
          generationConfig: {
            temperature: tempValue,
            ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
          },
          ...(systemPrompt ? {
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            }
          } : {})
        };
      }

      case 'workers-ai':
      default:
        // Cloudflare Native Workers AI Schema (similar to chat completions)
        return {
          messages: messages,
          temperature: tempValue,
          ...(maxTokens ? { max_tokens: maxTokens } : {}),
        };
    }
  }

  /**
   * Interprets downstream/edge network errors and provides specific diagnostic codes and remediation steps.
   */
  private analyzeEdgeError(status: number, responseBody: string): DiagnosticReport {
    const lowercaseBody = responseBody.toLowerCase();

    // 1. Cloudflare Geo-blocking / WAF blocks
    if (status === 403 && (lowercaseBody.includes('cloudflare') || lowercaseBody.includes('blocked') || lowercaseBody.includes('waf') || lowercaseBody.includes('ray id'))) {
      return {
        isError: true,
        status,
        diagnosticCode: 'CF_EDGE_WAF_GEO_BLOCK',
        message: 'Your request was intercepted and forbidden by Cloudflare Edge Protection/WAF rules.',
        remediationAction: 'Check Cloudflare Dashboard WAF settings, IP access rules, or bypass rules for your host domain. If calling directly from a frontend context, verify CORS policy configurations.'
      };
    }

    // 2. Client Authentication & Permission Mismatch
    if (status === 401 || status === 403) {
      if (lowercaseBody.includes('token') || lowercaseBody.includes('unauthorized') || lowercaseBody.includes('permission')) {
        return {
          isError: true,
          status,
          diagnosticCode: 'CF_TOKEN_PERMISSION_ERROR',
          message: 'The Cloudflare API Token lacks proper permissions or scopes.',
          remediationAction: 'Ensure your Cloudflare API token includes "AI Gateway - Edit" and "Workers AI - Read/Edit" permission scopes on the target Account.'
        };
      }
    }

    // 3. Downstream provider issues or timeout states (502 Bad Gateway / 504 Gateway Timeout)
    if (status === 502 || status === 504 || status === 503) {
      return {
        isError: true,
        status,
        diagnosticCode: 'CF_DOWNSTREAM_PROVIDER_TIMEOUT',
        message: 'Cloudflare AI Gateway received an invalid response or timeout from the downstream LLM provider.',
        remediationAction: 'The targeting LLM Provider node is unresponsive or experiencing regional outage. Utilize Cloudflare AI Gateway fallback arrays or enable "cf-aig-skip-cache" to bypass stalled edge-caches.'
      };
    }

    return {
      isError: true,
      status,
      diagnosticCode: 'CF_UNEXPECTED_HTTP_ERROR',
      message: `Edge gateway returned unexpected feedback: ${responseBody.slice(0, 200)}`,
      remediationAction: 'Inspect full Cloudflare AI Gateway telemetry logs and request templates for structural payloads compliance.'
    };
  }

  /**
   * Dispatches the chat completion context via Cloudflare AI Gateway
   */
  public async createChatCompletion(config: GatewayRequestConfig): Promise<any> {
    const { provider, model, messages, temperature, maxTokens, gatewayId, skipCache, providerApiKey } = config;
    const targetGatewayId = gatewayId || this.config.defaultGatewayId;

    // Build standard URL or legacy provider-native pathing URL.
    let targetUrl = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.useLegacyGatewayDomain) {
      // Legacy Provider-Native Routing Endpoints, e.g., gateway.ai.cloudflare.com/v1/{accountId}/{gatewayId}/{provider}
      targetUrl = `https://gateway.ai.cloudflare.com/v1/${this.config.accountId}/${targetGatewayId}/${provider}/chat/completions`;
      
      // Prevent header stripping: Shift Cloudflare Token to 'cf-aig-authorization', keep provider specific credentials in standard Authorization header.
      headers['cf-aig-authorization'] = `Bearer ${this.config.apiToken}`;
      if (providerApiKey) {
        headers['Authorization'] = `Bearer ${providerApiKey}`;
      }
    } else {
      // Modern Cloudflare AI REST endpoint: Unified interface
      targetUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/ai/v1/chat/completions`;
      headers['Authorization'] = `Bearer ${this.config.apiToken}`;
      
      // Inject required Gateway configuration headers
      headers['cf-aig-gateway-id'] = targetGatewayId;
    }

    // Dynamic routing / Skip Cache policy headers
    if (skipCache) {
      headers['cf-aig-skip-cache'] = 'true';
    }

    // Map payload accurately to downstream provider layout
    const requestPayload = this.mapPayload(provider, model, messages, temperature, maxTokens);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const diagnostics = this.analyzeEdgeError(response.status, errorText);
        throw new CloudflareAIGatewayError(response.status, diagnostics);
      }

      return await response.json();
    } catch (err: any) {
      if (err instanceof CloudflareAIGatewayError) {
        throw err;
      }
      
      // Direct connection issue / CORS preflight interruption / network failure
      const networkFailureReport: DiagnosticReport = {
        isError: true,
        status: 0,
        diagnosticCode: 'CF_NETWORK_PREFLIGHT_BLOCKED',
        message: err.message || 'CORS Interruption, Pre-flight block, or active connection failure at endpoint lookup.',
        remediationAction: 'Verify options of the local proxy or confirm CORS Headers allowance settings in the Cloudflare Dashboard for custom domain endpoints.'
      };
      throw new CloudflareAIGatewayError(0, networkFailureReport);
    }
  }
}
