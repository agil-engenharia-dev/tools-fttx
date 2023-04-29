import { FeatureGroup, GeoJSON, LayersControl, Marker, Popup } from "react-leaflet";
import L, { bounds } from "leaflet";
import { GeoJSONInterface } from "../../../../../@types/style";
import { StyledPopup } from "../../../../StyledPopup/style";

interface props {
    geojsonPostes: GeoJSONInterface;

}

export function PostesGeojson({ geojsonPostes}: props) {
  return (
    <LayersControl.Overlay name="Postes" checked>
    <FeatureGroup>
      {geojsonPostes.features.map((feature) => {
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
                fillColor: "#C0C0C0",
                fillOpacity: 1,
              });
            }}
          >
            <Popup>
              <StyledPopup>
                <p style={{ color: "#000" }}>{feature.properties.name}</p>
              </StyledPopup>
            </Popup>
          </GeoJSON>
        );
      })}
    </FeatureGroup>
    </LayersControl.Overlay>
  );
}
