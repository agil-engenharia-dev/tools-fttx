import { useMemo, useRef, useState } from "react";
import { FeatureGroup, TileLayer } from "react-leaflet";

import { MapContainerStyle } from "./style";
import omnivore from "leaflet-omnivore";
import { ElementsGeojson } from "./ElementsGeojson";
import { GeoJSONFeature } from "./../../../src/@types/style";
import {
  findCenter,
  addIdToPlacemarks,
  captureElements,
  MapStyles,
  isLineWithinRadiusOfPoint,
  convertKmlToGeojson,
  removePlacemarksByIds,
  downloadFileKml,
} from "../../utils";
import { DownloadButton } from "../DownloadButton";
import { ButtonBar } from "../ButtonBar";
import { ButtonChangeMap } from "../ButtonChangeMap";
import { ButtonRemovePointsNotUsed } from "./ButtonRemovePointsNotUsed";
import { InputRadiusPoints } from "./InputRadiusPoints";
import { ButtonContainer } from "../ButtonStyle/style";
import { ButtonHome } from "../ButtonHome";

interface props {
  fileContent: string;
}

export function App2({ fileContent }: props) {
  const refLayerPolygons = useRef(null);
  const refLayerElements = useRef(null);
  const refTileLayer = useRef(null);
  const mapStyles = useMemo(() => new MapStyles(), []);
  const kmlWithIDs = useMemo(() => addIdToPlacemarks(fileContent), []);
  const [geojson, setGeojson] = useState(convertKmlToGeojson(fileContent));

  const removeNotUsedPoints = () => {
    const radius = 10;
    const geojsonPoints = geojson.features.filter(
      (feature: GeoJSONFeature) => feature.geometry.type === "Point"
    );
    const geojsonLinestrings = geojson.features.filter(
      (feature: GeoJSONFeature) => feature.geometry.type === "LineString"
    );
    const geojsonNotUsedPoints = geojsonPoints.filter(
      (featurePoint: GeoJSONFeature) => {
        let used = false;
        geojsonLinestrings.forEach((featureLineString: GeoJSONFeature) => {
          if (
            isLineWithinRadiusOfPoint(featurePoint, featureLineString, radius)
          ) {
            if (!used) {
              used = true;
            }
          }
        });
        return !used;
      }
    );

    const idsToDelete = geojsonNotUsedPoints.map(
      (featurePoint: GeoJSONFeature) => featurePoint.id
    );
    removeFeatureById(idsToDelete);
  };

  const removeFeatureById = (id: string | Array<string>) => {
    let ids: string[];

    if (Array.isArray(id)) {
      ids = id;
    } else {
      ids = [id];
    }

    const newGeojson = geojson.features.filter((feature: GeoJSONFeature) => {
      return !ids.includes(feature.id);
    });

    setGeojson({
      type: "FeatureCollection",
      features: newGeojson,
    });
  };

  const saveKml = () => {
    let newFileContent = kmlWithIDs;
    const notDeletedIDs = geojson.features.map(
      (feature: GeoJSONFeature) => feature.id
    );
    newFileContent = removePlacemarksByIds(newFileContent, notDeletedIDs);
    downloadFileKml(newFileContent);
  };

  const changeRadiusOfPoints = () => {};

  const changeMap = () => {
    mapStyles.changeMap();
    //@ts-ignore
    refTileLayer.current!.setUrl(mapStyles.getUrl());
  };
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
        url={mapStyles.getUrl()}
      />

      <FeatureGroup ref={refLayerElements}>
        <ElementsGeojson
          geojson={geojson}
          removeFeatureById={removeFeatureById}
        />
      </FeatureGroup>
      <ButtonBar>
        <ButtonRemovePointsNotUsed removeNotUsedPoints={removeNotUsedPoints} />
        <DownloadButton save={saveKml} />
        <ButtonChangeMap changeMap={changeMap} />
      </ButtonBar>
      <ButtonHome />
    </MapContainerStyle>
  );
}
