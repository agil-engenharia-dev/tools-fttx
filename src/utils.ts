import { GeoJSONInterface, GeoJSONFeature,mapUrlAttribution } from "../src/@types/style";

export function addIdToPlacemarks(kml: string) {
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

export function findCenter(geojson: GeoJSONInterface) {
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

function pointInPolygon(
  point: GeoJSONFeature | Array<number>,
  polygon: GeoJSONFeature
) {
  // Extrair as coordenadas do ponto
  let pointCoords = Array.isArray(point) ? point : point.geometry.coordinates;

  let lon = pointCoords[0];
  let lat = pointCoords[1];

  // Extrair as coordenadas dos vértices do polígono
  let polygonCoords = polygon.geometry.coordinates[0];
  // Variável que determina se o ponto está dentro do polígono
  let inside = false;

  // Percorre todos os segmentos do polígono
  polygonCoords.forEach(
    (vertex: Array<number>, index: number, array: Array<Array<number>>) => {
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
      let intersect =
        lat1 > lat != lat2 > lat &&
        lon < ((lon2 - lon1) * (lat - lat1)) / (lat2 - lat1) + lon1;
      // Se o segmento intersecta a reta, inverte o estado da variável inside
      if (intersect) inside = !inside;
    }
  );

  // Retorna true se o ponto estiver dentro do polígono
  return inside;
}

export function featureInPolygon(
  feature: GeoJSONFeature,
  polygon: GeoJSONFeature
) {
  if (feature.geometry.type === "Point") {
    return pointInPolygon(feature, polygon);
  }
  let inside = true;
  feature.geometry.coordinates.forEach((coord: Array<number>) => {
    !pointInPolygon(coord, polygon) ? (inside = false) : inside;
  });
  return inside;
}

export function captureElements(tag: string, fileText: string) {
  const regex = new RegExp(`<${tag}(.|\n)+?<\/${tag}>`, "gs");
  const matches = fileText.match(regex);
  return matches;
}

export function extractPlacemarkId(placemark: string): string {
  const placemarkIdRegex = /id='(placemark-[\w-]+)'/;
  const match = placemark.match(placemarkIdRegex);

  if (!match) {
    throw new Error("Placemark ID not found in the input string");
  }

  return match[1];
}


export class MapStyles {
  #maps: Array<mapUrlAttribution> = [
    {
      url: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWRnYXJiYXJyb3NvIiwiYSI6ImNsZGthYm1haDA0cWQzdmxjdnNwcnJoeGoifQ.VWGQI2nHd22h3A54eYWXOQ",
      attribution: "Map data © Mapbox",
    },
    {
      url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      attribution: "Map data © Stadia Maps",
    },
  ];
  #index: number = 0;
  #len: number = this.#maps.length;
  constructor() {}
  changeMap() {
    this.#index += 1;
    if (this.#index == this.#len) {
      this.#index = 0;
    }
  }

  getUrl() {
    return this.#maps[this.#index].url;
  }
  getAttribution() {
    return this.#maps[this.#index].attribution;
  }
}
