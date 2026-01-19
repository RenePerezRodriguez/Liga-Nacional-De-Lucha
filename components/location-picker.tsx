"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface LocationPickerProps {
    lat?: number;
    lng?: number;
    onLocationChange: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        }
    });
    return null;
}

export function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
    // Default to Cochabamba, Bolivia
    const defaultLat = lat || -17.3935;
    const defaultLng = lng || -66.1570;

    const [position, setPosition] = useState<[number, number]>([defaultLat, defaultLng]);

    useEffect(() => {
        if (lat && lng) {
            setPosition([lat, lng]);
        }
    }, [lat, lng]);

    const handleLocationChange = (newLat: number, newLng: number) => {
        setPosition([newLat, newLng]);
        onLocationChange(newLat, newLng);
    };

    return (
        <div className="w-full h-64 rounded-lg overflow-hidden border border-zinc-700">
            <MapContainer
                center={position}
                zoom={14}
                className="w-full h-full"
                style={{ background: "#1a1a1a" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={markerIcon} />
                <MapClickHandler onLocationChange={handleLocationChange} />
            </MapContainer>
        </div>
    );
}
