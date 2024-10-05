"use client";
import { useState, useCallback, useRef, useEffect } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Pentagon, RotateCcw } from "lucide-react";
import DayPrediction from "./day-prediction";
import CropPrediction from "./crop-prediction";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type Coordinate = [number, number];
type GeometryType = "Point" | "Polygon";

interface MapData {
  type: GeometryType;
  coordinates: Coordinate | Coordinate[];
}

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

function AddZoomControl() {
  const map = useMap();

  useEffect(() => {
    const zoomControl = L.control.zoom({ position: "topright" });
    map.addControl(zoomControl);

    return () => {
      map.removeControl(zoomControl);
    };
  }, [map]);

  return null;
}

export default function MapInterface() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [inputType, setInputType] = useState<"point" | "polygon">("point");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      const { lat, lng } = latlng;
      if (inputType === "polygon") {
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
    [inputType]
  );

  const handleSubmit = async () => {
    console.log(mapData);

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

  return (
    <div>
      <div className="h-screen">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          className="z-0"
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents
            onMapClick={handleMapClick}
            isPolygon={inputType === "polygon"}
          />
          {mapData && mapData.type === "Point" && (
            <Marker position={mapData.coordinates as Coordinate} icon={icon} />
          )}
          {mapData && mapData.type === "Polygon" && (
            <Polygon positions={mapData.coordinates as Coordinate[]} />
          )}
          <AddZoomControl />
        </MapContainer>
      </div>
      <div className="absolute top-[10px] bottom-[10px] left-[10px] right-[10px] z-50 flex gap-[10px] pointer-events-none">
        <div className="flex flex-col justify-between  p-4 bg-card rounded-lg border-2 border-whit2/20 pointer-events-auto">
          <div className="grid gap-4">
            <Tabs
              value={inputType}
              className="w-64"
              onValueChange={(value) => {
                setMapData(null);
                setInputType(value as "point" | "polygon");
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="point" className="w-full">
                  <MapPin className="size-3 text-muted-foreground mr-1" /> Punto
                </TabsTrigger>
                <TabsTrigger value="polygon" className="w-full">
                  <Pentagon className="size-3 text-muted-foreground mr-1" />
                  Polígono
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <p className="font-semibold text-lg">Cultivos recomendados</p>
              <div>
                <CropPrediction name="Soja" percentage={95} />
                <CropPrediction name="Trigo" percentage={91} />
                <CropPrediction name="Girasol" percentage={83} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {mapData && (
              <Button onClick={resetMap} variant="outline">
                <RotateCcw className="size-3 text-muted-foreground mr-1" />
                Resetear
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!mapData}
              className="font-semibold"
            >
              Hacer predicción
            </Button>
          </div>
        </div>

        <ScrollArea className="bg-card rounded-lg border-2 border-whit2/20 p-2 mt-auto pointer-events-auto w-full">
          <div className="flex">
            <DayPrediction date="2024-10-4" temperature={30} />
            <DayPrediction date="2024-10-5" temperature={32} />
            <DayPrediction date="2024-10-6" temperature={33} />
            <DayPrediction date="2024-10-7" temperature={29} />
            <DayPrediction date="2024-10-8" temperature={29} />
            <DayPrediction date="2024-10-9" temperature={30} />
            <DayPrediction date="2024-10-10" temperature={31} />
            <DayPrediction date="2024-10-11" temperature={22} />
            <DayPrediction date="2024-10-12" temperature={25} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
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
