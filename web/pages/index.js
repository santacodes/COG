import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("../components/insat"), { ssr: false });

const MapPage = () => {
  return <LeafletMap />;

};

export default MapPage;
