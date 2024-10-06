"use client";
import { useState, useCallback, useRef, useMemo } from "react";
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
import L from "leaflet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, MapPin, MapPinOff, Pentagon, RotateCcw } from "lucide-react";
import DayPrediction from "./day-prediction";
import CropPrediction from "./crop-prediction";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { calculatePolygonArea, ZoomControl } from "@/lib/utils";
import { pointIcon } from "@/lib/utils";
import { APIData, Coordinate, Geometry, InputType } from "@/lib/types";
import { exampleData, MAX_AREA } from "@/lib/constants";
import { dataRequest } from "@/lib/dataRequest";

interface MapData {
  type: InputType;
  coordinates: Coordinate | Coordinate[];
}

function MapEvents({
  onMapClick,
  inputType,
}: {
  onMapClick: (latlng: L.LatLng) => void;
  inputType: InputType;
}) {
  // const map = useMap();

  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
      if (inputType === "Point") {
        // map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  return null;
}

export default function MapInterface() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [inputType, setInputType] = useState<InputType>("Point");
  const [apiResponse, setApiResponse] = useState<APIData | null>(exampleData);
  const mapRef = useRef<L.Map | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleMapClick = useCallback(
    (latlng: L.LatLng) => {
      const { lat, lng } = latlng;
      if (inputType === "Polygon") {
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
    if (!mapData) return;
    setIsPending(true);

    const geometry: Geometry = {
      type: mapData.type,
      coordinates:
        mapData.type === "Point"
          ? (mapData.coordinates as number[])
          : [mapData.coordinates as number[][]],
    };

    const response = await dataRequest(geometry);
    console.log(response);

    console.log(geometry);
    setIsPending(false);
  };

  const polygonArea = useMemo(() => {
    if (mapData && mapData.type === "Polygon") {
      return calculatePolygonArea(mapData.coordinates as Coordinate[]);
    }
    return 0;
  }, [mapData]);

  const resetMap = () => {
    setMapData(null);
    setApiResponse(null);
    // if (mapRef.current) {
    //   mapRef.current.setView([0, 0], 2);
    // }
  };

  return (
    <div>
      <div className="h-screen">
        <MapContainer
          center={[0, 0]}
          zoom={3}
          minZoom={3}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          className="z-0"
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents onMapClick={handleMapClick} inputType={inputType} />
          {mapData && mapData.type === "Point" && (
            <Marker
              position={mapData.coordinates as Coordinate}
              icon={pointIcon}
            />
          )}
          {mapData && mapData.type === "Polygon" && (
            <Polygon positions={mapData.coordinates as Coordinate[]} />
          )}
          <ZoomControl />
        </MapContainer>
      </div>
      <div className="absolute top-[10px] bottom-[10px] left-[10px] right-[10px] z-50 flex gap-[10px] pointer-events-none">
        <div className="flex flex-col justify-between p-4 bg-card rounded-lg border-2 border-whit/20 pointer-events-auto w-72 shrink-0">
          <div className="flex flex-col gap-4 h-full">
            <Tabs
              value={inputType}
              className="w-full"
              onValueChange={(value) => {
                setMapData(null);
                setInputType(value as InputType);
              }}
            >
              <TabsList className="w-full">
                <TabsTrigger value="Point" className="w-full">
                  <MapPin className="size-3 text-muted-foreground mr-1" /> Punto
                </TabsTrigger>
                <TabsTrigger value="Polygon" className="w-full">
                  <Pentagon className="size-3 text-muted-foreground mr-1" />
                  Polígono
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {(inputType === "Point" && mapData) ||
            (inputType === "Polygon" &&
              mapData &&
              mapData.coordinates.length > 2) ? (
              <div>
                {/* <p>{polygonArea}</p> */}
                <p className="font-semibold text-lg">Cultivos recomendados</p>
                <div>
                  <CropPrediction name="Soja" percentage={95} />
                  <CropPrediction name="Trigo" percentage={91} />
                  <CropPrediction name="Girasol" percentage={83} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <MapPinOff className="text-muted-foreground" />
                <div className="flex flex-col items-center">
                  <p>Ningún area seleccionada</p>
                  <p className="text-muted-foreground text-center text-sm">
                    Haz click en el mapa para seleccionar un punto o un polígono
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {polygonArea > MAX_AREA && (
              <div className="text-red-500 flex items-center gap-2 border-2 border-dashed border-red-500 rounded-md p-1 pl-2">
                <Info className="size-4 flex shrink-0" />
                <p className="text-sm">
                  El area seleccionada es demasido grande y puede dar resultados
                  no tan precisos
                </p>
              </div>
            )}
            {mapData && (
              <Button onClick={resetMap} variant="outline">
                <RotateCcw className="size-3 text-muted-foreground mr-1" />
                Resetear
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={
                !mapData ||
                isPending ||
                (inputType === "Polygon" && mapData.coordinates.length < 3)
              }
              className="font-semibold"
            >
              Hacer predicción
            </Button>
          </div>
        </div>

        {apiResponse && (
          <ScrollArea className="bg-card rounded-lg border-2 border-whit2/20 py-2 mt-auto pointer-events-auto w-full">
            <div className="flex px-2">
              {apiResponse.dataTemperature.map((day, x) => (
                <DayPrediction
                  key={x}
                  temperature={apiResponse.dataTemperature[x]}
                  precipitation={apiResponse.dataPrecipitation[x]}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
