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