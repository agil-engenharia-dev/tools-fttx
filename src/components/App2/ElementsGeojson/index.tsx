import {  GeoJSON, Popup } from "react-leaflet";
import L from 'leaflet'
import { GeoJSONInterface } from "../../../@types/style";
import { TrashButtonContainer } from "../../TrashButtonContainer/style";
import { StyledPopup } from "../../StyledPopup/style";



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
                      fillColor: 'red',
                      })
                    }}
                >
                    <Popup>
                        <StyledPopup>
                        <TrashButtonContainer onClick={()=>{removeFeatureById(feature.id)}}/>
                        <p
                            style={{color:'#000'}}
                        >{feature.properties.name}</p>
                        </StyledPopup>
                    </Popup>
                </GeoJSON>)})}

        </>
    )
}