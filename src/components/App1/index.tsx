import { useMemo, useRef, useState } from "react";
import { FeatureGroup, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { MapContainerStyle } from "./style";
import omnivore from "leaflet-omnivore";
import { ButtonRemoveElements } from "./ButtonRemoveElements";
import { ElementsGeojson } from "./ElementsGeojson";
import { GeoJSONFeature } from "./../../../src/@types/style";
import {
  findCenter,
  addIdToPlacemarks,
  featureInPolygon,
  captureElements,
  extractPlacemarkId,
  MapStyles,
} from "../../utils";
import { DownloadButton } from "./DownloadButton";
import { ButtonBar } from "./ButtonBar";
import { ButtonChangeMap } from "./ButtonChangeMap";

interface props {
  fileContent: string;
}

export function App1({ fileContent }: props) {
  const refLayerPolygons = useRef(null);
  const refLayerElements = useRef(null);
  const refTileLayer = useRef(null);
  const mapStyles = useMemo(() => new MapStyles(), []);
  const kmlWithIDs = useMemo(() => addIdToPlacemarks(fileContent), []);
  const [geojson, setGeojson] = useState(
    omnivore.kml.parse(kmlWithIDs).toGeoJSON()
  );

  const removeElementsInPolygon = () => {
    //@ts-ignore
    const polygonsGeojson = refLayerPolygons.current!.toGeoJSON();
    //@ts-ignore
    const elementsGeojson = refLayerElements.current!.toGeoJSON();
    if (polygonsGeojson.features.length > 0) {
      const arrayFeaturesInPolygon: Array<GeoJSONFeature> = [];
      elementsGeojson.features.forEach((feature: GeoJSONFeature) => {
        polygonsGeojson.features.forEach((polygon: GeoJSONFeature) => {
          !featureInPolygon(feature, polygon) &&
            arrayFeaturesInPolygon.push(feature);
        });
      });
      setGeojson({
        type: "FeatureCollection",
        features: arrayFeaturesInPolygon,
      });
      //@ts-ignore
      refLayerPolygons.current!.clearLayers();
    }
  };

  const removeFeatureById = (id: string) => {
    const newGeojson = geojson.features.filter((feature: GeoJSONFeature) => {
      return feature.id !== id;
    });
    setGeojson({
      type: "FeatureCollection",
      features: newGeojson,
    });
  };

  const saveKml = () => {
    let newFileContent = kmlWithIDs;
    const placemarks = captureElements("Placemark", kmlWithIDs)!;
    const notDeletedIDs = geojson.features.map(
      (feature: GeoJSONFeature) => feature.id
    );
    placemarks.forEach((placemark) => {
      const id = extractPlacemarkId(placemark);
        if (!notDeletedIDs.includes(id)) {
          newFileContent = newFileContent.replace(placemark, "");
        }
    });

    downloadFile(newFileContent);
  };

  const downloadFile = (kmlFileText: string) => {
    const blob = new Blob([kmlFileText], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "pontos-removidos.kml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const changeMap = ()=>{
    mapStyles.changeMap()
    //@ts-ignore
    refTileLayer.current!.setUrl(mapStyles.getUrl())
    
  }
  return (
    <MapContainerStyle
      zoomControl={false}
      center={findCenter(geojson)}
      zoom={14}
      doubleClickZoom={false}
    >
      <TileLayer
        ref={refTileLayer}
        attribution={mapStyles.getAttribution()}
        url={mapStyles.getUrl()}/>

      <FeatureGroup ref={refLayerPolygons}>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polyline: false,
          }}
        />
      </FeatureGroup>
      <FeatureGroup ref={refLayerElements}>
        <ElementsGeojson
          geojson={geojson}
          removeFeatureById={removeFeatureById}
        />
      </FeatureGroup>
      <ButtonBar>
        <DownloadButton saveKml={saveKml} />
        <ButtonRemoveElements removeElementsInPolygon={removeElementsInPolygon} />
        <ButtonChangeMap changeMap={changeMap}/>
      </ButtonBar>
    </MapContainerStyle>
  );
}
