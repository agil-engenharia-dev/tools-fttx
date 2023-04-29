import { useEffect, useMemo, useRef, useState } from "react";
import { FeatureGroup, LayersControl, TileLayer } from "react-leaflet";
import { MapContainerStyle } from "./style";
import { GeoJSONFeature, GeoJSONInterface } from "./../../../src/@types/style";
import {
    findCenter,
    MapStyles,
    convertKmlToGeojson,
    calculateDistance,
    calculateAngleBetweenThreePoints,
    pointInPolygon,
    caboInPolygon,
    caboMeters,
    countUnrepeatedCabos,
    downloadFileCsv,
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
import { ButtonHome } from "../ButtonHome";

interface props {
    fileContent: string;
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
                } else if (
                    coordinate !== cabo.geometry.coordinates[index - 1]
                ) {
                    return true;
                }
            }
        );
    }
}

function joinCtosInPostes(ctos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
    ctos.forEach((cto: GeoJSONFeature) => {
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
                        if (
                            index === 0 ||
                            index === cabo.geometry.coordinates.length - 1
                        ) {
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

function calculeSupas(cabos: GeoJSONFeature[], postes: GeoJSONFeature[]) {
    postes.forEach((poste: GeoJSONFeature) => {
        let cabosInPoste: number[][][] = [];
        cabos.forEach((cabo: GeoJSONFeature) => {
            cabo.geometry.coordinates.forEach(
                (coordinate: number[], index: number) => {
                    if (poste.geometry.coordinates === coordinate) {
                        if (
                            index > 0 &&
                            index < cabo.geometry.coordinates.length - 1
                        ) {
                            cabosInPoste.push([
                                poste.geometry.coordinates,
                                cabo.geometry.coordinates[index - 1],
                            ]);
                            cabosInPoste.push([
                                poste.geometry.coordinates,
                                cabo.geometry.coordinates[index + 1],
                            ]);
                        } else if (index === 0) {
                            cabosInPoste.push([
                                poste.geometry.coordinates,
                                cabo.geometry.coordinates[index + 1],
                            ]);
                        } else if (
                            index ===
                            cabo.geometry.coordinates.length - 1
                        ) {
                            cabosInPoste.push([
                                poste.geometry.coordinates,
                                cabo.geometry.coordinates[index - 1],
                            ]);
                        }
                    }
                }
            );
        });
        poste.properties.supa += countUnrepeatedCabos(cabosInPoste);
    });
}

function calculePassagens(
    cabos: GeoJSONFeature[],
    postes: GeoJSONFeature[],
    ctos: GeoJSONFeature[]
) {
    postes.forEach((poste: GeoJSONFeature) => {
        cabos.forEach((cabo: GeoJSONFeature) => {
            cabo.geometry.coordinates.forEach(
                (coordinate: number[], index: number) => {
                    if (poste.geometry.coordinates === coordinate) {
                        if (
                            index > 0 &&
                            index < cabo.geometry.coordinates.length - 1
                        ) {
                            const angle = calculateAngleBetweenThreePoints(
                                cabo.geometry.coordinates[index - 1],
                                coordinate,
                                cabo.geometry.coordinates[index + 1]
                            );
                            if (Math.abs(angle - 180) < 20) {
                                //20°graus
                                let haveCto = false;
                                ctos.forEach((cto) => {
                                    if (
                                        cto.geometry.coordinates ===
                                        poste.geometry.coordinates
                                    ) {
                                        haveCto = true;
                                    }
                                });
                                if (
                                    !haveCto &&
                                    poste.properties.alca === 2 &&
                                    poste.properties.supa === 2
                                ) {
                                    poste.properties.alca -= 2;
                                    poste.properties.supa -= 1;
                                }
                            }
                        }
                    }
                }
            );
        });
    });
}

const initialGeoJSON: GeoJSONInterface = {
    type: "FeatureCollection",
    features: [],
};

export function App3({ fileContent }: props) {
    const refLayerPolygons = useRef(null);
    const refTileLayer = useRef(null);
    const mapStyles = useMemo(() => new MapStyles(), []);
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
        const cabos = geojson.features.filter(
            (feature) =>
                feature.properties.folderName.includes("Cabos") &&
                feature.geometry.type === "LineString"
        );
        const postes = geojson.features.filter(
            (feature) =>
                feature.properties.folderName.includes("Postes") &&
                feature.geometry.type === "Point"
        );
        const ctos = geojson.features.filter(
            (feature) =>
                (feature.properties.folderName.includes("Ramal") ||
                    feature.properties.folderName.includes(
                        "Caixas de atendimento"
                    )) &&
                feature.geometry.type === "Point"
        )
        setGeojsonPostes((state) => ({
            ...state,
            features: postes,
        }));
        setGeojsonCtos((state) => ({
            ...state,
            features: ctos,
        }));

        setGeojsonCabos((state) => ({
            ...state,
            features: cabos,
        }));
    }, [geojson]);
    const calculeAnchors = () => {
        const postes = geojsonPostes.features.map((poste: GeoJSONFeature) => {
            poste.properties = {
                ...poste.properties,
                supa: 0,
                alca: 0,
                bap: false,
            };
            return poste;
        });
        const cabos = geojsonCabos.features.map((cabo: GeoJSONFeature) => {
            // const listOfCoordinatesCable:Object[] = []
            // cabo.geometry.coordinates.forEach(
            //     (coordinate: [number, number], index: number) => {
            //         if (index > 0) {
            //             const listOfPoints:Object[] = [];
            //             postes.forEach((poste) => {
            //                 if (
            //                     distanciaPontoReta(
            //                         cabo.geometry.coordinates[index - 1],
            //                         coordinate,
            //                         poste.geometry.coordinates
            //                     ) < 5
            //                 ) {
            //                     listOfPoints.push({
            //                         coord:poste.geometry.coordinates,
            //                         //@ts-ignore
            //                         dist:L.latLng(listOfPoints.length===0 ? cabo.geometry.coordinates[index - 1]:listOfPoints[0].coord).distanceTo(L.latLng(poste.geometry.coordinates))
            //                     });
            //                 }

            //             });
            //             //@ts-ignore
            //             listOfPoints.sort((a, b) => a.dist - b.dist);
            //             listOfPoints.forEach(({coord})=>{
            //                 listOfCoordinatesCable.push(coord)
            //             })
            //         }
            //     }
            // );

            // console.log(listOfCoordinatesCable)
            return cabo;
        });
        const ctos = geojsonCtos.features.map((cto: GeoJSONFeature) => {
            return cto;
        });
        joinCabosInPostes(cabos, postes);
        joinCtosInPostes(ctos, postes);
        calculeBaps(cabos, postes);
        calculeAlcas(cabos, postes);
        calculeSupas(cabos, postes);
        calculePassagens(cabos, postes, ctos);

        setGeojson((state) => ({
            ...state,
            features: [...postes, ...cabos, ...ctos],
        }));

        setGeojsonAnchors((state) => ({
            ...state,
            features: postes,
        }));
    };

    const calculeAnchorsInPolygons = () => {
        //@ts-ignore
        let polygonsGeojson = refLayerPolygons.current!.toGeoJSON();
        //@ts-ignore
        const geojsonNewsCabos = initialGeoJSON;
        geojsonCabos.features.forEach((cabo) => {
            if (cabo.geometry.coordinates.length > 2) {
                cabo.geometry.coordinates.forEach(
                    (coodinate: number[], index: number) => {
                        if (index > 0) {
                            let feature: GeoJSONFeature;
                            feature = {
                                type: "Feature",
                                id: `${cabo.id}.${index}`,
                                properties: {},
                                geometry: {
                                    coordinates: [
                                        cabo.geometry.coordinates[index - 1],
                                        coodinate,
                                    ],
                                    type: "LineString",
                                },
                            };
                            geojsonNewsCabos.features.push(feature);
                        }
                    }
                );
            } else {
                geojsonNewsCabos.features.push(cabo);
            }
        });

        if (polygonsGeojson.features.length === 0) {
            return;
        }
        //@ts-ignore
        refLayerPolygons.current!.getLayers().map((layer) => {
            const polygon = layer.toGeoJSON();
            let reservaMeters = 0;
            let meters = 0;
            let baps = 0;
            let supas = 0;
            let alcas = 0;
            geojsonNewsCabos.features.forEach((feature: GeoJSONFeature) => {
                if (caboInPolygon(feature, polygon)) {
                    meters += caboMeters(feature);
                }
            });
            geojsonCabos.features.forEach((cabo: GeoJSONFeature) => {
                const meters = caboMeters(cabo);
                cabo.geometry.coordinates.forEach((coordinate: number[]) => {
                    geojsonCtos.features.forEach((cto, index) => {
                        if (
                            calculateDistance(
                                cto.geometry.coordinates,
                                coordinate
                            ) < 3
                        ) {
                            if (
                                index === 0 ||
                                index === cto.geometry.coordinates.length - 1
                            ) {
                                reservaMeters += 10;
                            } else {
                                reservaMeters += 20;
                            }
                        }
                    });
                });
            });

            geojsonAnchors.features.forEach((feature: GeoJSONFeature) => {
                if (pointInPolygon(feature, polygon)) {
                    if (feature.properties.bap) {
                        baps += 1;
                        supas += feature.properties.supa;
                        alcas += feature.properties.alca;
                    }
                }
            });
            return layer.bindPopup(`<table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="padding: 10px; border: 2px solid black; text-align: center;background-color: gray">baps</th>
                <th style="padding: 10px; border: 2px solid black; text-align: center;background-color: gray">supas</th>
                <th style="padding: 10px; border: 2px solid black; text-align: center;background-color: gray">alças</th>
                <th style="padding: 10px; border: 2px solid black; text-align: center;background-color: gray">Metros de cabo + reservas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 2px solid black; text-align: center;">${baps}</td>
                <td style="padding: 10px; border: 2px solid black; text-align: center;">${supas}</td>
                <td style="padding: 10px; border: 2px solid black; text-align: center;">${alcas}</td>
                <td style="padding: 10px; border: 2px solid black; text-align: center;">${Math.ceil(
                    meters
                )}m + ${reservaMeters}m</td>
              </tr>
            </tbody>
          </table>`);
        });
    };

    const saveCsv = () => {
        let csvAnchors = "nome;metragem;reservas";

        geojsonCabos.features.forEach((cabo) => {
            let reservaMeters = 0;
            const meters = caboMeters(cabo);
            cabo.geometry.coordinates.forEach((coordinate: number[]) => {
                geojsonCtos.features.forEach((cto, index) => {
                    if (
                        calculateDistance(
                            cto.geometry.coordinates,
                            coordinate
                        ) < 3
                    ) {
                        if (
                            index === 0 ||
                            index === cto.geometry.coordinates.length - 1
                        ) {
                            reservaMeters += 10;
                        } else {
                            reservaMeters += 20;
                        }
                    }
                });
            });
            csvAnchors += `\n${cabo.properties.name};${Math.ceil(
                meters
            )};${reservaMeters}`;
        });

        downloadFileCsv(csvAnchors);
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
            doubleClickZoom={false}>
            <TileLayer
                ref={refTileLayer}
                attribution={mapStyles.getAttribution()}
                url={mapStyles.getUrl()}
            />
            <LayersControl position="bottomleft">
                <FeatureGroup>
                    <AnchorsGeojson geojsonAnchors={geojsonAnchors} />
                    <CabosGeojson geojsonCabos={geojsonCabos} />
                    <CtosGeojson geojsonCtos={geojsonCtos} />
                    <PostesGeojson geojsonPostes={geojsonPostes} />
                </FeatureGroup>
            </LayersControl>
            <ButtonBar>
                <ButtonCalculeAllAnchors calculeAllAnchors={calculeAnchors} />
                <ButtonCalculeAnchorsInPolygons
                    calculeAnchorsInPolygons={calculeAnchorsInPolygons}
                />
                <DownloadButton save={saveCsv} />
                <ButtonChangeMap changeMap={changeMap} />
            </ButtonBar>
            <ButtonHome />

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
        </MapContainerStyle>
    );
}
