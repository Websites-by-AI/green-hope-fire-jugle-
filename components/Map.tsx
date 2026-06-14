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

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
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
  }, []);

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