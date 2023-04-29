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
  featureTotallyInPolygon,
  captureElements,
  MapStyles,
  convertKmlToGeojson,
  removePlacemarksByIds,
  downloadFileKml,
} from "../../utils";
import { DownloadButton } from "../DownloadButton";
import { ButtonChangeMap } from "../ButtonChangeMap";
import { ButtonBar } from "../ButtonBar";
import { ButtonContainer } from "../ButtonStyle/style";
import { ButtonHome } from "../ButtonHome";

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
    convertKmlToGeojson(fileContent)
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
          !featureTotallyInPolygon(feature, polygon) &&
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
    setGeojson(state=>({...state,features:newGeojson}));
  };

  
  const saveKml = () => {
    let newFileContent = kmlWithIDs;
    const notDeletedIDs = geojson.features.map(
      (feature: GeoJSONFeature) => feature.id
    );
    newFileContent = removePlacemarksByIds(newFileContent,notDeletedIDs)
    downloadFileKml(newFileContent);
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
        <DownloadButton save={saveKml} />
        <ButtonRemoveElements removeElementsInPolygon={removeElementsInPolygon} />
        <ButtonChangeMap changeMap={changeMap}/>
      </ButtonBar>
        <ButtonHome/>
    </MapContainerStyle>
  );
}
