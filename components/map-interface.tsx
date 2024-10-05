"use client";

import { useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import L from "leaflet";

type Coordinate = [number, number];
type GeometryType = "Point" | "Polygon";

interface MapData {
  type: GeometryType;
  coordinates: Coordinate | Coordinate[];
}

// Leaflet icon setup
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapEvents({
  onMapClick,
  isPolygon,
}: {
  onMapClick: (latlng: L.LatLng) => void;
  isPolygon: boolean;
}) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
      if (!isPolygon) {
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return null;
}

export default function MapInterface() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isPolygon, setIsPolygon] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      const { lat, lng } = latlng;
      if (isPolygon) {
        setMapData((prev) => {
          if (prev && prev.type === "Polygon") {
            return {
              type: "Polygon",
              coordinates: [...(prev.coordinates as Coordinate[]), [lat, lng]],
            };
          }
          return { type: "Polygon", coordinates: [[lat, lng]] };
        });
      } else {
        setMapData({ type: "Point", coordinates: [lat, lng] });
      }
    },
    [isPolygon]
  );

  const handleSubmit = async () => {
    if (!mapData) return;

    const baseUrl =
      "https://climateserv.servirglobal.net/chirps/submitDataRequest/";
    const params = new URLSearchParams({
      datatype: mapData.type === "Point" ? "44" : "42",
      begintime: "09/01/2024",
      endtime: mapData.type === "Point" ? "04/01/2025" : "03/01/2025",
      intervaltype: "0",
      operationtype: mapData.type === "Point" ? "0" : "1",
      isZip_CurrentDataType: "false",
    });

    const geometry = JSON.stringify({
      type: mapData.type,
      coordinates:
        mapData.type === "Point" ? mapData.coordinates : [mapData.coordinates],
    });

    params.append("geometry", geometry);

    try {
      const response = await fetch(`${baseUrl}?${params}`);
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setApiResponse({ error: "Failed to fetch data. Please try again." });
    }
  };

  const resetMap = () => {
    setMapData(null);
    setApiResponse(null);
    if (mapRef.current) {
      mapRef.current.setView([0, 0], 2);
    }
  };

  const finishPolygon = () => {
    if (
      mapData &&
      mapData.type === "Polygon" &&
      (mapData.coordinates as Coordinate[]).length > 2
    ) {
      setMapData((prev) => {
        if (prev && prev.type === "Polygon") {
          const coords = prev.coordinates as Coordinate[];
          return {
            type: "Polygon",
            coordinates: [...coords, coords[0]], // Close the polygon
          };
        }
        return prev;
      });
    }
  };

  return (
    <div>
      <div className="h-screen mb-4">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          className="z-0"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents onMapClick={handleMapClick} isPolygon={isPolygon} />
          {mapData && mapData.type === "Point" && (
            <Marker position={mapData.coordinates as Coordinate} icon={icon} />
          )}
          {mapData && mapData.type === "Polygon" && (
            <Polygon positions={mapData.coordinates as Coordinate[]} />
          )}
        </MapContainer>
      </div>
      <div className="flex justify-between mb-4 absolute bottom-0 left-0 right-0 z-50 p-4 bg-white shadow-lg">
        <Button
          onClick={() => {
            setIsPolygon(false);
            setMapData(null);
          }}
          variant={!isPolygon ? "default" : "outline"}
        >
          Mark Point
        </Button>
        <Button
          onClick={() => {
            setIsPolygon(true);
            setMapData(null);
          }}
          variant={isPolygon ? "default" : "outline"}
        >
          Create Polygon
        </Button>
        {isPolygon &&
          mapData &&
          mapData.type === "Polygon" &&
          (mapData.coordinates as Coordinate[]).length > 2 && (
            <Button onClick={finishPolygon}>Finish Polygon</Button>
          )}
        <Button
          onClick={handleSubmit}
          disabled={
            !mapData ||
            (mapData.type === "Polygon" &&
              (mapData.coordinates as Coordinate[]).length < 3)
          }
        >
          Submit Data
        </Button>
        <Button onClick={resetMap} variant="outline">
          Reset
        </Button>
      </div>

      <CardFooter>
        {apiResponse && (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto w-full">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        )}
      </CardFooter>
    </div>
  );
}
