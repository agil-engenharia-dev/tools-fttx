import { useEffect, useMemo, useRef, useState } from "react";
import { FeatureGroup, LayersControl, TileLayer } from "react-leaflet";
import { MapContainerStyle } from "./style";
import { GeoJSONInterface } from "./../../../src/@types/style";
import { findCenter, MapStyles, convertKmlToGeojson } from "../../utils";
import { ButtonBar } from "../ButtonBar";
import { PostesGeojson } from "./components/ElementsGeojson/PostesGeojson";
import { CtosGeojson } from "./components/ElementsGeojson/CtosGeojson";
import { CabosGeojson } from "./components/ElementsGeojson/CabosGeojson";
import { ButtonHome } from "../ButtonHome";
import { ButtonChangeMap } from "../ButtonChangeMap";

interface props {
    fileContent: string;
}

const initialGeoJSON: GeoJSONInterface = {
    type: "FeatureCollection",
    features: [],
};

export function App4({ fileContent }: props) {
    const refTileLayer = useRef(null);
    const mapStyles = useMemo(() => new MapStyles(), []);
    const [geojson, setGeojson] = useState(convertKmlToGeojson(fileContent));
    const [geojsonPostes, setGeojsonPostes] =
        useState<GeoJSONInterface>(initialGeoJSON);
    const [geojsonCabos, setGeojsonCabos] =
        useState<GeoJSONInterface>(initialGeoJSON);
    const [geojsonCtos, setGeojsonCtos] =
        useState<GeoJSONInterface>(initialGeoJSON);
    useEffect(() => {
        setGeojsonPostes((state) => ({
            ...state,
            features: geojson.features.filter(
                (feature) =>
                    ["postes", "poste"].includes(
                        feature.properties.folderName.toLowerCase()
                    ) && feature.geometry.type === "Point"
            ),
        }));
        setGeojsonCtos((state) => ({
            ...state,
            features: geojson.features.filter(
                (feature) =>
                    ["caixas", "ceos", "caixa", "ceo"].includes(
                        feature.properties.folderName.toLowerCase()
                    ) && feature.geometry.type === "Point"
            ),
        }));

        setGeojsonCabos((state) => ({
            ...state,
            features: geojson.features.filter(
                (feature) =>
                    ["cabos", "cabo", "rede"].includes(
                        feature.properties.folderName.toLowerCase()
                    ) && feature.geometry.type === "LineString"
            ),
        }));
    }, [geojson]);

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
            <LayersControl position="bottomleft">
                <FeatureGroup>
                    <CabosGeojson geojsonCabos={geojsonCabos} />
                    <CtosGeojson geojsonCtos={geojsonCtos} />
                    <PostesGeojson geojsonPostes={geojsonPostes} />
                </FeatureGroup>
            </LayersControl>
            <ButtonBar>
                <ButtonChangeMap changeMap={changeMap} />
                {/* <ButtonCreateCto/>
        <ButtonCreateCabo/> */}
            </ButtonBar>
            <ButtonHome />
        </MapContainerStyle>
    );
}
