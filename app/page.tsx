import MapInterface from "@/components/map-interface";
import { exampleData } from "@/lib/constants";
import { getSeedsForClimate } from "@/lib/selectSeed";

export default function Home() {
  // console.log(getSeedsForClimate(exampleData))
  return (
    <main>
      <MapInterface />
    </main>
  );
}
