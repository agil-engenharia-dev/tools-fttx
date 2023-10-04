import mapboxgl from "mapbox-gl";
import { Component } from "react";
import { DefaultTheme } from "styled-components";
import { accessToken } from "../../utils";

interface Props {
    theme: DefaultTheme;
}

interface State {}

export class MapboxMap extends Component<Props, State> {
    mapContainer: HTMLDivElement | null = null;
    map: mapboxgl.Map | null = null;

    componentDidMount() {
        mapboxgl.accessToken = accessToken;
        this.map = new mapboxgl.Map({
            container: this.mapContainer!,
            //@ts-ignore
            style: this.props.theme.mapTheme,
            center: [-87.62712, 41.89033],
            zoom: 16.5,
            boxZoom: false,
            scrollZoom: false,
            doubleClickZoom: false,
            pitch: 45,
        });

        this.map.on("load", () => {
            // Start the animation.
            this.rotateCamera(0);

            // Add 3D buildings and remove label layers to enhance the map
            const layers = this.map!.getStyle().layers;
            for (const layer of layers) {
                if (layer.type === "symbol" && layer.layout!["text-field"]) {
                    // remove text labels
                    this.map!.removeLayer(layer.id);
                }
            }

            this.map!.addLayer({
                id: "3d-buildings",
                source: "composite",
                "source-layer": "building",
                filter: ["==", "extrude", "true"],
                type: "fill-extrusion",
                minzoom: 15,
                paint: {
                    //@ts-ignore
                    "fill-extrusion-color": `${this.props.theme.secondary}`,

                    // use an 'interpolate' expression to add a smooth transition effect to the
                    // buildings as the user zooms in
                    "fill-extrusion-height": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        15,
                        0,
                        15.05,
                        ["get", "height"],
                    ],
                    "fill-extrusion-base": [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        15,
                        0,
                        15.05,
                        ["get", "min_height"],
                    ],
                    "fill-extrusion-opacity": 0.7,
                },
            });
        });
    }

    rotateCamera(timestamp: number) {
        // clamp the rotation between 0 -360 degrees
        // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
        this.map!.rotateTo((timestamp / 400) % 360, { duration: 0 });
        // Request the next frame of the animation.
        requestAnimationFrame(this.rotateCamera.bind(this));
    }

    componentWillUnmount() {
        this.map!.remove();
    }

    render() {
        return (
            <div
                style={{ height: "100vh", width: "100vw", cursor: "initial" }}
                ref={(el) => (this.mapContainer = el)}
            />
        );
    }
}
