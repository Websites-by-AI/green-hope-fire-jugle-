import React, { useEffect, useRef, useState } from 'react';

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
}

const Map: React.FC<MapProps> = ({ selectedLocation, onLocationSelect, className, areaRadius }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [leafletLoaded, setLeafletLoaded] = useState<boolean>(!!window.L);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    let isMounted = true;
    
    const loadScripts = async () => {
      try {
        // Load Leaflet Script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.crossOrigin = "";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Leaflet Map script"));
          document.head.appendChild(script);
        });

        // Load Leaflet Draw Script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Leaflet Editor script"));
          document.head.appendChild(script);
        });

        if (isMounted) {
          setLeafletLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : String(err));
        }
      }
    };

    loadScripts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
    }).setView([36.175683, 58.465929], 13);
    
    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.attribution({ position: 'bottomright', prefix: false }).addAttribution('Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community').addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    }).addTo(map);

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

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedLocation) {
        if (!markerRef.current) {
            markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map);
        } else {
            markerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
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
  }, [selectedLocation, areaRadius]);

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