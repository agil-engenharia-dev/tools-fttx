import { FeatureGroup, GeoJSON, LayersControl, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { GeoJSONInterface } from "../../../../../@types/style";
import { StyledPopup } from "../../../../StyledPopup/style";
import { DiagramFibers } from "../../DiagramFibers";

interface props {
    geojsonCtos: GeoJSONInterface;
}


export function CtosGeojson({ geojsonCtos }: props) {
  return (
    <LayersControl.Overlay name = "Caixas" checked>
    <FeatureGroup>
      {geojsonCtos.features.map((feature) => {
        return (
          <GeoJSON
            key={feature.id}
            data={feature}
            style={() => ({ color: "#000", weight: 0 })}
            pointToLayer={(feature, latlng) => {
              return L.circle(latlng, {
                radius: 8,
                fillColor: "blue",
                fillOpacity: .7,
              });
            }}
          >
            <Popup autoClose={false} closeOnClick={false}>
                <DiagramFibers/>
            </Popup>
          </GeoJSON>
        );
      })}
    </FeatureGroup>
    </LayersControl.Overlay>
  );
}



