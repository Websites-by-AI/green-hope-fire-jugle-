import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapProps {
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  className?: string;
  areaRadius?: number; // in meters
  suitabilityScore?: number;
}

const TRANSLATIONS = {
  fa: {
    satellite: 'تصویر ماهواره‌ای',
    terrain: 'نقشه برجستگی (توپوگرافی)',
    streets: 'نقشه ساده شهری',
    layerTitle: 'نوع نقشه',
  },
  ar: {
    satellite: 'الأقمار الصناعية',
    terrain: 'التضاريس والموقع',
    streets: 'خريطة الشوارع',
    layerTitle: 'نوع الخريطة',
  },
  en: {
    satellite: 'Satellite View',
    terrain: 'Terrain & Topo',
    streets: 'Street Map',
    layerTitle: 'Map Layers',
  }
};

const LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
  },
  terrain: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service'
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

const Map: React.FC<MapProps> = ({ selectedLocation, onLocationSelect, className, areaRadius, suitabilityScore }) => {
  const { language } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'satellite' | 'terrain' | 'streets'>('satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(!!window.L);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: true
    }).setView([36.175683, 58.465929], 13);
    
    if (map.attributionControl) {
      map.attributionControl.setPrefix(false);
    }
    
    L.control.zoom({ position: 'topleft' }).addTo(map);

    const initialTileLayer = L.tileLayer(LAYERS[activeLayer].url, {
      maxZoom: 19,
      attribution: LAYERS[activeLayer].attribution
    }).addTo(map);
    tileLayerRef.current = initialTileLayer;

    map.on('click', (e: any) => {
      onLocationSelect(e.latlng);
    });

    map.on('mousemove', (e: any) => {
        setCoords(e.latlng);
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
    });

    map.on('mouseout', () => {
        setCoords(null);
    });

    mapInstanceRef.current = map;
    
    setTimeout(() => map.invalidateSize(), 100);
  }, [leafletLoaded]);

  // Effect to swap layers reactively when activeLayer state changes
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current || !tileLayerRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    map.removeLayer(tileLayerRef.current);

    const newTileLayer = L.tileLayer(LAYERS[activeLayer].url, {
      maxZoom: 19,
      attribution: LAYERS[activeLayer].attribution
    }).addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [activeLayer, leafletLoaded]);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedLocation) {
        // Create custom div icon based on suitability score
        let colorClass = 'bg-blue-500';
        let ringClass = 'bg-blue-400';
        let labelText = '';
        
        if (suitabilityScore !== undefined) {
            labelText = `${suitabilityScore}%`;
            if (suitabilityScore >= 80) {
                colorClass = 'bg-emerald-500';
                ringClass = 'bg-emerald-400';
            } else if (suitabilityScore >= 50) {
                colorClass = 'bg-amber-500';
                ringClass = 'bg-amber-400';
            } else {
                colorClass = 'bg-rose-500';
                ringClass = 'bg-rose-400';
            }
        }

        const isRtl = window.document.documentElement.dir === 'rtl';
        const labelHtml = suitabilityScore !== undefined 
            ? `<div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 font-bold px-2 py-0.5 rounded text-[11px] text-white shadow-xl z-20 whitespace-nowrap">
                 ${isRtl ? 'تناسب:' : 'Suitability:'} <span class="text-emerald-400">${labelText}</span>
               </div>`
            : '';

        const iconHtml = `
            <div class="relative flex items-center justify-center w-8 h-8">
                ${labelHtml}
                <div class="animate-ping absolute inline-flex h-full w-full rounded-full ${ringClass} opacity-75"></div>
                <div class="relative flex items-center justify-center rounded-full h-5 w-5 ${colorClass} border border-white shadow-md">
                    <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
            </div>
        `;

        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'bg-transparent border-none',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        if (!markerRef.current) {
            markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng], { icon: customIcon }).addTo(map);
        } else {
            markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
            markerRef.current.setIcon(customIcon);
        }
        
        // Check if we need to fly to the location (e.g. if it's far from center)
        const center = map.getCenter();
        const dist = map.distance(center, [selectedLocation.lat, selectedLocation.lng]);
        if (dist > 1000) { // Only fly if distance is significant
            map.flyTo([selectedLocation.lat, selectedLocation.lng], 13, { duration: 1.5 });
        }

        // Handle area circle
        if (areaRadius) {
            if (!circleRef.current) {
                circleRef.current = L.circle([selectedLocation.lat, selectedLocation.lng], {
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.2,
                    radius: areaRadius
                }).addTo(map);
            } else {
                circleRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
                circleRef.current.setRadius(areaRadius);
            }
        } else if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
        }
    } else {
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }
        if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
        }
    }
  }, [selectedLocation, areaRadius, suitabilityScore]);

  const handleFindMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onLocationSelect({ lat: latitude, lng: longitude });
                setIsLocating(false);
            },
            (error) => {
                console.error("Error getting location", error);
                setIsLocating(false);
                alert("Could not retrieve your location.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
        setIsLocating(false);
    }
  };

  const currentLang = (language as 'en' | 'fa' | 'ar') || 'en';
  const tMenu = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  if (errorMessage) {
    return (
      <div className={`flex flex-col items-center justify-center relative w-full h-[60vh] lg:h-[85vh] rounded-lg bg-slate-800 border border-slate-700 shadow-lg text-slate-300 p-6 ${className || ''}`}>
        <div className="text-center max-w-md">
          <i className="fas fa-map-marked-alt text-4xl text-emerald-500 mb-4"></i>
          <h3 className="text-lg font-bold mb-2">امکان بارگذاری نقشه زنده میسر نشد</h3>
          <p className="text-sm text-slate-400 mb-4">نقشه آنلاین به دلیل محدودیت‌های ارتباطی یا فیلترینگ اینترنت نتوانست دریافت شود. اما برنامه قطعا و به طور کامل کار می‌کند!</p>
          <div className="bg-slate-900/60 rounded px-4 py-2 mt-4 font-mono text-xs text-left text-slate-500 border border-slate-800">
            {errorMessage}
          </div>
          <p className="text-xs text-slate-400 mt-4">نکته: شما می‌توانید بدون نقشه از دکمه «تحلیل مکان نمونه روستای سالاریه» استفاده کنید تا گزارش کامل را مشاهده نمایید.</p>
        </div>
      </div>
    );
  }

  if (!leafletLoaded) {
    return (
      <div className={`flex flex-col items-center justify-center relative w-full h-[60vh] lg:h-[85vh] rounded-lg bg-slate-800 border border-slate-700 shadow-lg text-slate-300 ${className || ''}`}>
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500 mb-4"></i>
          <p className="text-sm text-slate-400">در حال دریافت داده‌های جغرافیایی نقشه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[60vh] lg:h-[85vh] rounded-lg bg-slate-800 border border-slate-700 shadow-lg overflow-hidden ${className || ''}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {coords && (
            <div 
                className="fixed z-[1001] bg-slate-900/80 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap"
                style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
            >
                {window.document.documentElement.dir === 'rtl' ? 'عرض' : 'Lat'}: {coords.lat.toFixed(4)}, {window.document.documentElement.dir === 'rtl' ? 'طول' : 'Lng'}: {coords.lng.toFixed(4)}
            </div>
        )}

        {/* Map Layer Selector floating overlay */}
        <div id="map-layer-control-container" className="absolute top-4 right-4 z-[400] flex flex-col items-end">
            <button
                id="map-layer-toggle-btn"
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="bg-slate-900/90 hover:bg-slate-800 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700/60 transition-all duration-200 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                title={tMenu.layerTitle}
            >
                <i className="fas fa-layer-group text-emerald-400"></i>
                <span>{tMenu.layerTitle}</span>
                <i className={`fas fa-chevron-${showLayerMenu ? 'up' : 'down'} text-[10px] text-slate-400 ml-1 rtl:ml-0 rtl:mr-1`}></i>
            </button>

            {showLayerMenu && (
                <div id="map-layer-dropdown-menu" className="mt-2 bg-slate-900/95 border border-slate-700/80 rounded-xl p-2 shadow-2xl w-48 text-left rtl:text-right flex flex-col gap-1.5 animate-fade-in">
                    {/* Satellite layer selection */}
                    <button
                        id="map-layer-sat-btn"
                        onClick={() => {
                            setActiveLayer('satellite');
                            setShowLayerMenu(false);
                        }}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg text-xs font-semibold select-none transition-all ${
                            activeLayer === 'satellite' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'text-slate-300 hover:bg-slate-800 border border-transparent hover:text-white'
                        }`}
                    >
                        <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                            <i className="fas fa-satellite text-emerald-400"></i>
                        </div>
                        <span className="truncate">{tMenu.satellite}</span>
                        {activeLayer === 'satellite' && (
                            <i className="fas fa-check text-[10px] text-emerald-400 ml-auto rtl:ml-0 rtl:mr-auto"></i>
                        )}
                    </button>

                    {/* Terrain layer selection */}
                    <button
                        id="map-layer-terrain-btn"
                        onClick={() => {
                            setActiveLayer('terrain');
                            setShowLayerMenu(false);
                        }}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg text-xs font-semibold select-none transition-all ${
                            activeLayer === 'terrain' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'text-slate-300 hover:bg-slate-800 border border-transparent hover:text-white'
                        }`}
                    >
                        <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                            <i className="fas fa-mountain text-amber-500"></i>
                        </div>
                        <span className="truncate">{tMenu.terrain}</span>
                        {activeLayer === 'terrain' && (
                            <i className="fas fa-check text-[10px] text-emerald-400 ml-auto rtl:ml-0 rtl:mr-auto"></i>
                        )}
                    </button>

                    {/* Street map layer selection */}
                    <button
                        id="map-layer-streets-btn"
                        onClick={() => {
                            setActiveLayer('streets');
                            setShowLayerMenu(false);
                        }}
                        className={`flex items-center gap-3 w-full p-2 rounded-lg text-xs font-semibold select-none transition-all ${
                            activeLayer === 'streets' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'text-slate-300 hover:bg-slate-800 border border-transparent hover:text-white'
                        }`}
                    >
                        <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center border border-white/5 overflow-hidden flex-shrink-0">
                            <i className="fas fa-map-marked text-sky-400"></i>
                        </div>
                        <span className="truncate">{tMenu.streets}</span>
                        {activeLayer === 'streets' && (
                            <i className="fas fa-check text-[10px] text-emerald-400 ml-auto rtl:ml-0 rtl:mr-auto"></i>
                        )}
                    </button>
                </div>
            )}

        </div>

        <button
            onClick={handleFindMe}
            className="absolute bottom-4 right-4 z-[400] bg-slate-800 text-white p-2 rounded-md shadow-lg border border-slate-600 hover:bg-slate-700 transition-colors"
            title="Find My Location"
        >
            {isLocating ? (
                <i className="fas fa-spinner fa-spin"></i>
            ) : (
                <i className="fas fa-crosshairs"></i>
            )}
        </button>
    </div>
  );
};

export default Map;