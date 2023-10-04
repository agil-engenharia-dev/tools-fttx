import {
    GeoJSONInterface,
    GeoJSONFeature,
    mapUrlAttribution,
} from "../src/@types/style";
import L, { LatLngTuple } from "leaflet";

export const accessToken = "pk.eyJ1IjoiZWRnYXJiYXJyb3NvIiwiYSI6ImNsbDlweDM1ejBmN3gzam1ha2t5bzJmOXoifQ.eweemsPq2xCXhR_D8q1v0w"

export function addIdToPlacemarks(kml: string) {
    const kmlNoIds = removePlacemarkIds(kml);
    let placemarkCount = 0;
    let newKml = kmlNoIds.replace(/<Placemark.*?>/g, function (match) {
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

export function pointInPolygon(
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

export function featureTotallyInPolygon(
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

export function removePlacemarksByIds(
    kml: string,
    idsToKeep: string[]
): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kml, "application/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");

    for (let i = placemarks.length - 1; i >= 0; i--) {
        const placemark = placemarks[i];
        const id = placemark.getAttribute("id") ?? "";

        if (!idsToKeep.includes(id)) {
            placemark.parentNode?.removeChild(placemark);
        }
    }

    return new XMLSerializer().serializeToString(xmlDoc);
}

function removePlacemarkIds(kml: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kml, "application/xml");
    const placemarks = xmlDoc.getElementsByTagName("Placemark");

    for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i];
        placemark.removeAttribute("id");
    }

    return new XMLSerializer().serializeToString(xmlDoc);
}

export function isLineWithinRadiusOfPoint(
    point: GeoJSONFeature,
    lineString: GeoJSONFeature,
    acceptableDistance: number
) {
    for (let i = 0; i < lineString.geometry.coordinates.length - 1; i++) {
        const l1 = {
            lng: lineString.geometry.coordinates[i][0],
            lat: lineString.geometry.coordinates[i][1],
        };
        const l2 = {
            lng: lineString.geometry.coordinates[i + 1][0],
            lat: lineString.geometry.coordinates[i + 1][1],
        };
        const distance = distanceFromPointToLine(
            point.geometry.coordinates,
            //@ts-ignore
            l1,
            l2
        );
        if (distance <= acceptableDistance) {
            return true;
        }
    }
    return false;
}

export function convertKmlToGeojson(fileContent: string) {
    const doc = new DOMParser().parseFromString(fileContent, "text/xml");
    const placemarks = doc.getElementsByTagName("Placemark");
    const result: GeoJSONInterface = {
        type: "FeatureCollection",
        features: [],
    };

    for (let i = 0; i < placemarks.length; i++) {
        const placemark = placemarks[i];
        const element = placemark?.parentNode as Element;
        const folderName = element.getElementsByTagName("name")[0].textContent;
        const placemarkObj: GeoJSONFeature = {
            type: "Feature",
            properties: {
                folderName: folderName,
                name: "",
                description: "",
            },
            id: `placemark-${i}`,

            geometry: {
                type: "Point",
                coordinates: null,
            },
        };

        const nameElement = placemark.getElementsByTagName("name")[0];
        if (nameElement) {
            placemarkObj.properties.name = nameElement.textContent;
        }

        const descriptionElement =
            placemark.getElementsByTagName("description")[0];
        if (descriptionElement) {
            placemarkObj.properties.description =
                descriptionElement.textContent;
        }

        const pointElement = placemark.getElementsByTagName("Point")[0];
        if (pointElement) {
            const coordinates =
                pointElement.getElementsByTagName("coordinates")[0].textContent;
            placemarkObj.geometry.type = "Point";
            placemarkObj.geometry.coordinates = coordinates!
                .split(",")
                .map((stringNum) => Number(stringNum));
        }

        const lineStringElement =
            placemark.getElementsByTagName("LineString")[0];
        if (lineStringElement) {
            const coordinates =
                lineStringElement.getElementsByTagName("coordinates")[0]
                    .textContent;
            placemarkObj.geometry.type = "LineString";
            placemarkObj.geometry.coordinates = coordinates!
                .trim()
                .split(/\s+/)
                .map((coord) => coord.split(",").map(parseFloat));
        }

        const linearRingElement =
            placemark.getElementsByTagName("LinearRing")[0];
        if (linearRingElement) {
            const coordinates =
                linearRingElement.getElementsByTagName("coordinates")[0]
                    .textContent;
            placemarkObj.geometry.type = "Polygon";
            placemarkObj.geometry.coordinates = coordinates!
                .trim()
                .split(/\s+/)
                .map((coord) => coord.split(",").map(parseFloat));
        }

        result.features.push(placemarkObj);
    }

    return result;
}

function distanceFromPointToLine(
    p0: Array<number>,
    l1: L.LatLng,
    l2: L.LatLng
) {
    const p = L.latLng(p0[1], p0[0]);
    const dx = l2.lng - l1.lng;
    const dy = l2.lat - l1.lat;
    if (dx === 0 && dy === 0) {
        return p.distanceTo(l1);
    }

    const t =
        ((p.lng - l1.lng) * dx + (p.lat - l1.lat) * dy) / (dx * dx + dy * dy);

    if (t < 0) {
        return p.distanceTo(l1);
    }
    if (t > 1) {
        return p.distanceTo(l2);
    }

    const nearestPoint = L.latLng(l1.lat + t * dy, l1.lng + t * dx);
    return p.distanceTo(nearestPoint);
}

export function calculateDistance(
    feature1: GeoJSONFeature | LatLngTuple[] | unknown,
    feature2: GeoJSONFeature | LatLngTuple[] | unknown
): number {
    // Extrai as coordenadas dos dois pontos do GeoJSON ou dos arrays de coordenadas
    const coords1 = Array.isArray(feature1)
        ? (feature1 as LatLngTuple)
        : ((feature1 as GeoJSONFeature).geometry.coordinates as LatLngTuple);
    const coords2 = Array.isArray(feature2)
        ? (feature2 as LatLngTuple)
        : ((feature2 as GeoJSONFeature).geometry.coordinates as LatLngTuple);

    // Cria objetos L.LatLng a partir das coordenadas
    const latLng1 = L.latLng(coords1[1], coords1[0]);
    const latLng2 = L.latLng(coords2[1], coords2[0]);

    // Calcula a distância entre os dois pontos em metros
    const distance = latLng1.distanceTo(latLng2);

    // Retorna a distância em metros
    return distance;
}

export function calculateAngleBetweenThreePoints(
    c2: number[],
    c1: number[],
    c3: number[]
): number {
    // Convert coordinates to radians
    const c1_lat_rad = c1[1] * (Math.PI / 180);
    const c1_lon_rad = c1[0] * (Math.PI / 180);
    const c2_lat_rad = c2[1] * (Math.PI / 180);
    const c2_lon_rad = c2[0] * (Math.PI / 180);
    const c3_lat_rad = c3[1] * (Math.PI / 180);
    const c3_lon_rad = c3[0] * (Math.PI / 180);

    // Calculate angles between the coordinates
    const a = Math.acos(
        Math.sin(c2_lat_rad) * Math.sin(c3_lat_rad) +
            Math.cos(c2_lat_rad) *
                Math.cos(c3_lat_rad) *
                Math.cos(c3_lon_rad - c2_lon_rad)
    );
    const b = Math.acos(
        Math.sin(c1_lat_rad) * Math.sin(c2_lat_rad) +
            Math.cos(c1_lat_rad) *
                Math.cos(c2_lat_rad) *
                Math.cos(c2_lon_rad - c1_lon_rad)
    );
    const c = Math.acos(
        Math.sin(c3_lat_rad) * Math.sin(c1_lat_rad) +
            Math.cos(c3_lat_rad) *
                Math.cos(c1_lat_rad) *
                Math.cos(c1_lon_rad - c3_lon_rad)
    );

    // Calculate final angle
    let angle: number;
    try {
        angle = Math.acos(
            (Math.cos(a) - Math.cos(b) * Math.cos(c)) /
                (Math.sin(b) * Math.sin(c))
        );
        angle = angle * (180 / Math.PI);
    } catch {
        angle = 180;
    }
    if (Number.isNaN(angle)) {
        return 180;
    }
    return angle;
}

export function convertGeojsonPointsInKml(geojson: GeoJSONInterface) {
    const points = geojson.features.map((point: GeoJSONFeature) => {
        return (
            "<Placemark>" +
            `<name>${point.id}</name>` +
            "<Point>" +
            `<coordinates>${point.geometry.coordinates[0]},${point.geometry.coordinates[1]},0</coordinates>` +
            "</Point>" +
            "</Placemark>"
        );
    });
    const kml =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">' +
        "<Document>" +
        "<name>KmlFile</name>" +
        `${points}` +
        "</Document>" +
        "</kml>";

    return kml;
}

export function caboInPolygon(
    feature: GeoJSONFeature,
    polygon: GeoJSONFeature
) {
    if (feature.geometry.type === "Point") {
        return pointInPolygon(feature, polygon);
    }
    let inside = false;
    feature.geometry.coordinates.forEach((coord: Array<number>) => {
        pointInPolygon(coord, polygon) ? (inside = true) : inside;
    });
    return inside;
}

export function caboMeters(cabo: GeoJSONFeature) {
    let meters = 0;
    cabo.geometry.coordinates.forEach((coordinate: number[], index: number) => {
        if (index > 0) {
            const coord1 = L.latLng(
                cabo.geometry.coordinates[index - 1][1],
                cabo.geometry.coordinates[index - 1][0]
            );
            const coord2 = L.latLng(coordinate[1], coordinate[0]);
            meters += coord1.distanceTo(coord2);
        }
    });

    return meters;
}

export function angleWithNorth(coord1: number[], coord2: number[]): number {
    try {
        const lon1 = coord1[0];
        const lat1 = coord1[1];
        const lon2 = coord2[0];
        const lat2 = coord2[1];
        const dy = lat2 - lat1;
        const dx = Math.cos((Math.PI / 180) * lat1) * (lon2 - lon1);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return Math.ceil(angle < 0 ? angle + 360 : angle);
    } catch {
        return 90;
    }
}

export function countUnrepeatedCabos(coordinates: number[][][]) {
    const listAngles: number[] = [];
    coordinates.forEach((listCoords: number[][]) => {
        const coord1 = listCoords[0];
        const coord2 = listCoords[1];
        listAngles.push(angleWithNorth(coord1, coord2));
    });
    const uniqueArr: number[] = [...new Set(listAngles)];
    return uniqueArr.length;
}

export class MapStyles {
    #maps: Array<mapUrlAttribution> = [
        {
            url: `https://api.mapbox.com/styles/v1/mapbox/light-v8/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
            attribution: "Map data © Mapbox",
        },
        {
            url: `https://api.mapbox.com/styles/v1/mapbox/dark-v8/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
            attribution: "Map data © Mapbox",
        },
        {
            url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
            attribution: "Map data © Mapbox",
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

export function downloadFileKml(kmlFileText: string) {
    const blob = new Blob([kmlFileText], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "file.kml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function downloadFileCsv(csvFileText: string) {
    const blob = new Blob([csvFileText], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "ferragens.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function distanciaPontoReta(
    ponto1: [number, number],
    ponto2: [number, number],
    ponto3: [number, number]
): number {
    // Convertendo as coordenadas de graus para radianos
    const lat1 = (ponto1[0] * Math.PI) / 180;
    const lon1 = (ponto1[1] * Math.PI) / 180;
    const lat2 = (ponto2[0] * Math.PI) / 180;
    const lon2 = (ponto2[1] * Math.PI) / 180;
    const lat3 = (ponto3[0] * Math.PI) / 180;
    const lon3 = (ponto3[1] * Math.PI) / 180;

    // Calculando a distância entre os pontos 1 e 2
    const R = 6371e3; // Raio médio da Terra em metros
    const phi1 = lat1;
    const phi2 = lat2;
    const deltaPhi = lat2 - lat1;
    const deltaLambda = lon2 - lon1;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
            Math.cos(phi2) *
            Math.sin(deltaLambda / 2) *
            Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    // Calculando a projeção ortogonal do ponto 3 na reta
    const x1 = R * Math.cos(lat1) * Math.cos(lon1);
    const y1 = R * Math.cos(lat1) * Math.sin(lon1);
    const z1 = R * Math.sin(lat1);
    const x2 = R * Math.cos(lat2) * Math.cos(lon2);
    const y2 = R * Math.cos(lat2) * Math.sin(lon2);
    const z2 = R * Math.sin(lat2);
    const x3 = R * Math.cos(lat3) * Math.cos(lon3);
    const y3 = R * Math.cos(lat3) * Math.sin(lon3);
    const z3 = R * Math.sin(lat3);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    const u =
        ((x3 - x1) * dx + (y3 - y1) * dy + (z3 - z1) * dz) /
        (dx * dx + dy * dy + dz * dz);
    const x = x1 + u * dx;
    const y = y1 + u * dy;
    const z = z1 + u * dz;

    const distancia = Math.sqrt(
        (x - x3) * (x - x3) + (y - y3) * (y - y3) + (z - z3) * (z - z3)
    );

    return distancia;
}
