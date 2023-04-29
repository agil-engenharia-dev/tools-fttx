import { FeatureGroup, GeoJSON, LayersControl, Marker, Popup } from "react-leaflet";
import { GeoJSONInterface } from "../../../../../@types/style";
import { caboMeters } from "../../../../../utils";
import { StyledPopup } from "../../../../StyledPopup/style";


interface props {
  geojsonCabos: GeoJSONInterface;
}

export function CabosGeojson({ geojsonCabos }: props) {
  return (
    <LayersControl.Overlay name="Cabos" checked>
    <FeatureGroup>
      {geojsonCabos.features.map((feature) => {
        return (
          <GeoJSON
            key={feature.id}
            data={feature}
            style={() => ({ color: "#00ff00", weight: 4, opacity:.6 })}
          >
            <Popup>
              <StyledPopup>
                <p style={{ color: "#000" }}>{feature.properties.name}</p>
                <p style={{ color: "#000" }}>{Math.ceil(caboMeters(feature))}m</p>
              </StyledPopup>
            </Popup>
          </GeoJSON>
        );
      })}
  </FeatureGroup> 
  </LayersControl.Overlay>
  );
  
}
