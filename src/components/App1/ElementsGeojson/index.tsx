import { FeatureGroup, GeoJSON, Popup } from "react-leaflet";
import L, { bounds } from 'leaflet'
import { GeoJSONFeature, GeoJSONInterface } from "../../../interfaces/geojson";
import { ButtonRemoveElements } from "../ButtonRemoveElements";
import { ButtonRemoveElementContainer } from "./ButtonRemoveElement/style";



const stylesFeatures={
    'Point':{color: '#ff0000', weight: 1},
    'LineString':{color: '#00ff00', weight: 3},
    'Polygon':{color: '#00ff00', weight: 3},
    "MultiPoint" :{color: '#00ff00', weight: 3},
    "MultiLineString":{color: '#00ff00', weight: 3},
    "MultiPolygon":{color: '#00ff00', weight: 3},
  
  }

interface props{
    geojson:GeoJSONInterface;
    removeFeatureById:(id:string)=>void
}

export function ElementsGeojson({geojson,removeFeatureById}:props){

    return(
        <>
        {geojson.features.map((feature) => {
            return  (<GeoJSON
                key = {feature.id}
                data={feature}
                style={() => (stylesFeatures[`${feature.geometry.type}`])}
                pointToLayer={(feature, latlng) => {
                    return L.circle(latlng, {
                      radius: 10,
                      fillColor: "red",
                      })
                    }}
                >
                    <Popup>
                        <ButtonRemoveElementContainer onClick={()=>{removeFeatureById(feature.id)}}/>
                        <p
                            style={{color:'#000'}}
                        >{feature.properties.name}</p>
                    </Popup>
                </GeoJSON>)})}

        </>
    )
}