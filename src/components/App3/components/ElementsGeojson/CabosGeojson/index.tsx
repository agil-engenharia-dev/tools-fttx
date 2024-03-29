import { FeatureGroup, GeoJSON, LayersControl, Marker, Popup } from "react-leaflet";
import { GeoJSONInterface } from "../../../../../@types/style";
import { caboMeters } from "../../../../../utils";
import { StyledPopup } from "../../../../StyledPopup/style";


interface props {
  geojsonCabos: GeoJSONInterface;
}

type ColorsCabos = {
  [key: string]: string;
};

const colorsCabos: ColorsCabos = {
  '01f':'#00ff00',
  '02f':'#ffff00',
  '06f':'#ff0000',//'#8000ff' em bb
  '12f':'#00ffff',//'#ffaa00' em bb
  '24f':'#ff00ff',
  '36f':'#0000ff',
  '72f':'#aa0000',
  '144f':'#fff',
} 

function detectColor(name:string){
  for(let color in colorsCabos){
    if(name.includes(color)){
      return colorsCabos[`${color}`]
    }
  }
  return '#000'
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
            style={() => ({ color: detectColor(feature.properties.name), weight: 4, opacity:.6 })}
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
