import 'styled-components'
import { DefaultTheme } from 'styled-components';
import { darkTheme } from '../styles/themes/dark';
import { defaultTheme } from '../styles/themes/default';


type ThemeType = typeof defaultTheme;

declare module 'style-components' {
    export interface defaultTheme extends ThemeType{}
}


export interface GeoJSONFeature {
    type: "Feature";
    properties: { [key: string]: any };
    id:string;
    geometry: {
      type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon";
      coordinates: any;
    };
  }
  
export interface GeoJSONInterface {
    type: "FeatureCollection";
    features: GeoJSONFeature[];
}

export type mapUrlAttribution = {
  url: string;
  attribution: string;
};
