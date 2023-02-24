import { useEffect, useMemo, useRef, useState } from "react";
import {
  FeatureGroup,
  LayersControl,
  TileLayer,
} from "react-leaflet";
import { MapContainerStyle } from "./style";
import { GeoJSONFeature, GeoJSONInterface } from "./../../../src/@types/style";
import {
  findCenter,
  addIdToPlacemarks,
  MapStyles,
  convertKmlToGeojson,
  calculateDistance,
  calculateAngleBetweenThreePoints,
  convertGeojsonPointsInKml,
  pointInPolygon,
  caboInPolygon,
  caboMeters,
  countUnrepeatedCabos,
} from "../../utils";
import { DownloadButton } from "../DownloadButton";
import { ButtonBar } from "../ButtonBar";
import { ButtonChangeMap } from "../ButtonChangeMap";
import { ButtonCalculeAllAnchors } from "./components/ButtonCalculeAllAnchors";
import { ButtonCalculeAnchorsInPolygons } from "./components/ButtonCalculeAnchorsInPolygons";
import { PostesGeojson } from "./components/ElementsGeojson/PostesGeojson";
import { CtosGeojson } from "./components/ElementsGeojson/CtosGeojson";
import { CabosGeojson } from "./components/ElementsGeojson/CabosGeojson";
import { AnchorsGeojson } from "./components/ElementsGeojson/AnchorsGeojson";
import { EditControl } from "react-leaflet-draw";

interface props {
  fileContent: string;
}

interface CaboAnchors {
  coordinates: [number, number][];
  anchors: boolean[];
}

function joinCabosInPostes(cabos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
  cabos.forEach((cabo) => {
    cabo.geometry.coordinates = cabo.geometry.coordinates.map(
      (coordinate: number[]) => {
        let shorterDistance = 30; // metros
        let coordShorterDistance = coordinate;
        postes.forEach((poste: GeoJSONFeature) => {
          let dist = calculateDistance(coordinate, poste);
          if (dist < shorterDistance) {
            shorterDistance = dist;
            coordShorterDistance = poste.geometry.coordinates;
          }
        });
        return coordShorterDistance;
      }
    );
  });

  for (let cabo of cabos) {
    cabo.geometry.coordinates = cabo.geometry.coordinates.filter(
      (coordinate: [number, number], index: number) => {
        if (index === 0) {
          return true;
        } else if (coordinate !== cabo.geometry.coordinates[index - 1]) {
          return true;
        }
      }
    );
  }
}

function joinCtosInPostes(ctos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
  ctos.forEach((cto:GeoJSONFeature) => {
    let shorterDistance = 30; // metros
    let coordShorterDistance = cto.geometry.coordinates;
    postes.forEach((poste: GeoJSONFeature) => {
      let dist = calculateDistance(cto, poste);
      if (dist < shorterDistance) {
        shorterDistance = dist;
        coordShorterDistance = poste.geometry.coordinates;
      }
    });
    cto.geometry.coordinates = coordShorterDistance;
  });
}

function calculeBaps(cabos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
  postes.forEach((poste: GeoJSONFeature) => {
    cabos.forEach((cabo: GeoJSONFeature) => {
      cabo.geometry.coordinates.forEach((coordinate: number[]) => {
        if (poste.geometry.coordinates === coordinate) {
          poste.properties.bap = true;
        }
      });
    });
  });
}

function calculeAlcas(cabos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
  postes.forEach((poste: GeoJSONFeature) => {
    let contAlcas = 0;
    cabos.forEach((cabo: GeoJSONFeature) => {
      cabo.geometry.coordinates.forEach(
        (coordinate: number[], index: number) => {
          if (poste.geometry.coordinates === coordinate) {
            if (index === 0 || index === cabo.geometry.coordinates.length-1) {
              contAlcas += 1;
            } else {
              contAlcas += 2;
            }
          }
        }
      );
    });
    poste.properties.alca += contAlcas;
  });
}

function calculeSupas(cabos: GeoJSONFeature[], postes: GeoJSONFeature[]){
  postes.forEach((poste: GeoJSONFeature) => {
    let cabosInPoste:number[][][] = [];
    cabos.forEach((cabo: GeoJSONFeature) => {
      cabo.geometry.coordinates.forEach(
        (coordinate: number[], index: number) => {
          if (poste.geometry.coordinates === coordinate) {
            if (index > 0 && index < cabo.geometry.coordinates.length-1) {
              cabosInPoste.push([poste.geometry.coordinates,cabo.geometry.coordinates[index-1]])
              cabosInPoste.push([poste.geometry.coordinates,cabo.geometry.coordinates[index+1]])
            } else if(index === 0) {
              cabosInPoste.push([poste.geometry.coordinates,cabo.geometry.coordinates[index+1]])
            }else if(index === cabo.geometry.coordinates.length-1) {
              cabosInPoste.push([poste.geometry.coordinates,cabo.geometry.coordinates[index-1]])
            }
          }
        }
      );
    });
    poste.properties.supa += countUnrepeatedCabos(cabosInPoste)
  });
}

function calculePassagens(cabos: GeoJSONFeature[], postes: GeoJSONFeature[],ctos:GeoJSONFeature[]){
  postes.forEach((poste: GeoJSONFeature) => {
    cabos.forEach((cabo: GeoJSONFeature) => {
      cabo.geometry.coordinates.forEach(
        (coordinate: number[], index: number) => {
          if (poste.geometry.coordinates === coordinate) {
              if (index > 0 && index < cabo.geometry.coordinates.length-1){
                const angle = calculateAngleBetweenThreePoints(
                cabo.geometry.coordinates[index-1],
                coordinate,
                cabo.geometry.coordinates[index+1])
                if (Math.abs(angle-180)<20){ //20°graus
                  let haveCto = false
                  ctos.forEach((cto)=>{
                    if(cto.geometry.coordinates===poste.geometry.coordinates){haveCto=true}
                  })
                  if (!haveCto){
                    poste.properties.alca-=2;
                    poste.properties.supa-=1;
                  }
                  
                }
            }
            
          }
        }
      );
    });
  });

}

export function App3({ fileContent }: props) {
  const refLayerPolygons = useRef(null);
  const refTileLayer = useRef(null);
  const mapStyles = useMemo(() => new MapStyles(), []);
  const kmlWithIDs = useMemo(() => addIdToPlacemarks(fileContent), []);
  const initialGeoJSON: GeoJSONInterface = {
    type: "FeatureCollection",
    features: [],
  };
  const [geojson, setGeojson] = useState(convertKmlToGeojson(fileContent));
  const [geojsonPostes, setGeojsonPostes] =
    useState<GeoJSONInterface>(initialGeoJSON);
  const [geojsonCabos, setGeojsonCabos] =
    useState<GeoJSONInterface>(initialGeoJSON);
  const [geojsonCtos, setGeojsonCtos] =
    useState<GeoJSONInterface>(initialGeoJSON);
  const [geojsonAnchors, setGeojsonAnchors] =
    useState<GeoJSONInterface>(initialGeoJSON);
  useEffect(() => {
    setGeojsonPostes((state) => ({
      ...state,
      features: geojson.features.filter(
        (feature) =>
          feature.properties.folderName === "Postes" &&
          feature.geometry.type === "Point"
      ),
    }));
    setGeojsonCtos((state) => ({
      ...state,
      features: geojson.features.filter(
        (feature) =>
          feature.geometry.type === "Point" &&
          feature.properties.folderName != "Postes"
      ),
    }));
    setGeojsonCabos((state) => ({
      ...state,
      features: geojson.features.filter(
        (feature) => feature.geometry.type != "Point"
      ),
    }));
  }, [geojson]);

  const calculeAnchors = () => {
    const postes = geojsonPostes.features.map((poste: GeoJSONFeature) => {
      poste.properties = {
        supa: 0,
        alca: 0,
        bap: false,
      };
      return poste;
    });

    const cabos = geojsonCabos.features.map((cabo: GeoJSONFeature) => {
      return cabo;
    });

    const ctos = geojsonCtos.features.map((cto: GeoJSONFeature) => {
      return cto;
    });

    joinCabosInPostes(cabos, postes);
    joinCtosInPostes(ctos, postes);
    calculeBaps(cabos, postes);
    calculeAlcas(cabos, postes);
    calculeSupas(cabos,postes);
    calculePassagens(cabos,postes,ctos)

    setGeojsonAnchors((state) => ({
      ...state,
      features: postes,
    }));
  };

  const calculeAnchorsInPolygons = () => {
    //@ts-ignore
    let polygonsGeojson = refLayerPolygons.current!.toGeoJSON();
    //@ts-ignore
    const elementsGeojson = geojsonCabos;
    if (polygonsGeojson.features.length === 0) {
      return;
    }
    //@ts-ignore
    refLayerPolygons.current!.getLayers().map((layer) => {
      const polygon = layer.toGeoJSON();
      let meters = 0;
      let supas = 0;
      let alcas = 0;
      elementsGeojson.features.forEach((feature: GeoJSONFeature) => {
        if (caboInPolygon(feature, polygon)) {
          meters += caboMeters(feature);
        }
      });
      geojsonAnchors.features.forEach((feature: GeoJSONFeature) => {
        if(pointInPolygon(feature,polygon)){
          supas+=feature.properties.supa
          alcas+=feature.properties.alca
        }
        
      });
      return layer.bindPopup(`
      <table border="1">
        <thead>
        <tr>
            <td>supas</td>
            <td>alças</td>
            <td>Metros de cabo</td>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>${supas}</td>
            <td>${alcas}</td>
            <td>${Math.ceil(meters)}m</td>
        </tr>
        </tbody>
      </table>
      `);
    });
  };

  const saveKml = () => {
    const kmlAnchors = convertGeojsonPointsInKml(geojsonAnchors);
    downloadFile(kmlAnchors);
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
      <LayersControl position="topleft">
        <FeatureGroup>
          <AnchorsGeojson geojsonAnchors={geojsonAnchors} />
          <CabosGeojson geojsonCabos={geojsonCabos} />
          <CtosGeojson geojsonCtos={geojsonCtos} />
          <PostesGeojson geojsonPostes={geojsonPostes} />
        </FeatureGroup>
      </LayersControl>

      <ButtonBar>
        <ButtonCalculeAnchorsInPolygons
          calculeAnchorsInPolygons={calculeAnchorsInPolygons}
        />
        <ButtonCalculeAllAnchors
          calculeAllAnchors={calculeAnchors}
        />
        <DownloadButton saveKml={saveKml} />
        <ButtonChangeMap changeMap={changeMap} />
      </ButtonBar>
    </MapContainerStyle>
  );
}
