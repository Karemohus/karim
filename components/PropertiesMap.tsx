import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Property } from '../types';
import L from 'leaflet';

// Fix for default icon issue with bundlers like Vite/Webpack
const defaultIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


interface PropertiesMapProps {
    properties: Property[];
    onSelectProperty: (id: string) => void;
}

const PropertiesMap: React.FC<PropertiesMapProps> = ({ properties, onSelectProperty }) => {
    const defaultCenter: [number, number] = [24.7136, 46.6753];
    const mapCenter: [number, number] = properties.length > 0 ? [properties[0].latitude, properties[0].longitude] : defaultCenter;

    return (
        <MapContainer center={mapCenter} zoom={6} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {properties.map(prop => (
                <Marker key={prop.id} position={[prop.latitude, prop.longitude]} icon={defaultIcon}>
                    <Popup>
                        <div className="w-48">
                            <img src={prop.imageUrls[0]} alt={prop.title} className="w-full h-24 object-cover rounded-md mb-2"/>
                            <h4 className="font-bold text-base mb-1 truncate">{prop.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{prop.location}</p>
                            <button 
                                onClick={() => onSelectProperty(prop.id)} 
                                className="text-indigo-600 font-bold text-sm hover:underline"
                            >
                                عرض التفاصيل
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default PropertiesMap;