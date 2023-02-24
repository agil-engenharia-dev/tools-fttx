import { FeatureGroup, GeoJSON, LayersControl, Marker, Popup } from "react-leaflet";
import L, { bounds } from "leaflet";
import { GeoJSONInterface } from "../../../../../@types/style";
import { StyledPopup } from "../../../../StyledPopup/style";

interface props {
    geojsonAnchors: GeoJSONInterface;

}

export function AnchorsGeojson({ geojsonAnchors}: props) {
  return (
    <LayersControl.Overlay name="Ancoragens/Passagens" checked>
    <FeatureGroup>
      {geojsonAnchors.features.map((feature) => {
        return (
          <GeoJSON
            key={feature.id}
            data={feature}
            style={() => ({ color: "#FFF", weight: 1 })}
            pointToLayer={(feature, latlng) => {
              const height = 10;
              const neCoord = latlng.toBounds(height / 2).getNorthEast();
              const swCoord = latlng.toBounds(height / 2).getSouthWest();

              return L.rectangle(new L.LatLngBounds(neCoord,swCoord), {
                fillColor: feature.properties.bap ? "#fb00ff" : "#C0C0C0",
                fillOpacity: 1,
              });
            }}
          >
            <Popup>
              <StyledPopup>
              <table border={1}>
                <thead>
                <tr>
                    <td>supas</td>
                    <td>alças</td>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{feature.properties.supa}</td>
                    <td>{feature.properties.alca}</td>
                </tr>
                </tbody>
               </table>
               
              </StyledPopup>
            </Popup>
          </GeoJSON>
        );
      })}
    </FeatureGroup>
    </LayersControl.Overlay>
  );
}
