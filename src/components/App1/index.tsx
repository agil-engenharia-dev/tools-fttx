import { useRef, useState } from "react";
import { FeatureGroup, TileLayer } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { MapContainerStyle } from "./style";
import omnivore from "leaflet-omnivore";
import { ButtonRemoveElements } from "./ButtonRemoveElements";
import { ElementsGeojson } from "./ElementsGeojson";
import { GeoJSONInterface , GeoJSONFeature} from "../../interfaces/geojson";

function addIdToPlacemarks(kml: string) {
  let placemarkCount = 0;
  let newKml = kml.replace(/<Placemark.*?>/g, function (match) {
    placemarkCount++;
    return match.replace(
      "<Placemark",
      "<Placemark id='placemark-" + placemarkCount + "'"
    );
  });
  return newKml;
}

function findCenter(geojson: GeoJSONInterface) {
  let center = {
    lat: 0,
    lng: 0,
  };
  let numPoints = 0;

  for (let feature of geojson.features) {
    if (feature.geometry.type === "Point") {
      center.lat += feature.geometry.coordinates[1];
      center.lng += feature.geometry.coordinates[0];
      numPoints++;
    }
  }

  center.lat /= numPoints;
  center.lng /= numPoints;

  return center;
}

function pointInPolygon(point:GeoJSONFeature | Array<number>, polygon:GeoJSONFeature) {
  // Extrair as coordenadas do ponto
  let pointCoords = Array.isArray(point) ? point :point.geometry.coordinates;
  
  let lon = pointCoords[0];
  let lat = pointCoords[1];

  // Extrair as coordenadas dos vértices do polígono
  let polygonCoords = polygon.geometry.coordinates[0];
  // Variável que determina se o ponto está dentro do polígono
  let inside = false;

  // Percorre todos os segmentos do polígono
  polygonCoords.forEach((vertex:Array<number>, index:number, array:Array<Array<number>>) => {
    // Coordenadas dos pontos de cada segmento do polígono
    let lon1 = vertex[0];
    let lat1 = vertex[1];
    let lon2, lat2;
    if (index === array.length - 1) {
      lon2 = array[0][0];
      lat2 = array[0][1];
    } else {
      lon2 = array[index + 1][0];
      lat2 = array[index + 1][1];
    }
    // Verifica se o segmento intersecta a reta horizontal que parte do ponto em questão
    let intersect = ((lat1 > lat) != (lat2 > lat))
      && (lon < (lon2 - lon1) * (lat - lat1) / (lat2 - lat1) + lon1);
    // Se o segmento intersecta a reta, inverte o estado da variável inside
    if (intersect) inside = !inside;
    
  });

  // Retorna true se o ponto estiver dentro do polígono
  return inside;
}

function featureInPolygon(feature:GeoJSONFeature, polygon:GeoJSONFeature){
  if (feature.geometry.type==='Point'){return pointInPolygon(feature,polygon)}
  let inside = true;
    feature.geometry.coordinates.forEach((coord:Array<number>) => {
      !pointInPolygon(coord,polygon) ? inside=false: inside;
    });
  return inside

}

interface props {
  fileContent: string;
}

export function App1({ fileContent }: props) {
  const refLayerPolygons = useRef(null);
  const refLayerElements = useRef(null);
  const [geojson, setGeojson] = useState(omnivore.kml.parse(addIdToPlacemarks(fileContent)).toGeoJSON());
  const removeElementsInPolygon = () => {
    console.log(refLayerPolygons)
    const polygonsGeojson = refLayerPolygons.current!.toGeoJSON();
    const elementsGeojson = refLayerElements.current!.toGeoJSON();
    const arrayFeaturesInPolygon:Array<GeoJSONFeature>=[];
    elementsGeojson.features.forEach((feature:GeoJSONFeature)=>{
      polygonsGeojson.features.forEach((polygon:GeoJSONFeature)=>{
        !featureInPolygon(feature,polygon) && arrayFeaturesInPolygon.push(feature)
      })
    })
    setGeojson({
      type: "FeatureCollection",
      features: arrayFeaturesInPolygon})
    refLayerPolygons.current!.clearLayers();
}

  const removeFeatureById = (id:string)=>{
    const newGeojson = geojson.features.filter((feature:GeoJSONFeature)=>{
        return (feature.id !== id)
    })
    setGeojson({
      type: "FeatureCollection",
      features: newGeojson})
  }
    


  return (
    <MapContainerStyle
      zoomControl={false}
      center={findCenter(geojson)}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <FeatureGroup
        ref={refLayerPolygons}
      >
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
      <ButtonRemoveElements removeElementsInPolygon={removeElementsInPolygon}/>
      <FeatureGroup
        ref={refLayerElements}  
      >
        <ElementsGeojson geojson={geojson} removeFeatureById={removeFeatureById}/>
      </FeatureGroup>
      
    </MapContainerStyle>
  );
}
