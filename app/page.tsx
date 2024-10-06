import dynamic from "next/dynamic";
const MapInterface = dynamic(() => import("@/components/map-interface"), {
  ssr: false,
});

export default function Home() {
  // console.log(getSeedsForClimate(exampleData))
  return (
    <main>
      <MapInterface />
    </main>
  );
}
