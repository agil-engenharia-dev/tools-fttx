import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as joint from 'jointjs';
import {useRef, useEffect} from 'react'
import { dia } from 'jointjs';

export function DiagramFibers(){
    const refDiagram = useRef(null)


    useEffect(() => {
        var namespace = joint.shapes;

        var graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        var paper = new joint.dia.Paper({
            //@ts-ignore
            el: refDiagram.current,
            model: graph,
            width: 300,
            height: 300,
            cellViewNamespace: namespace,

        });

        var rect = new joint.shapes.standard.Rectangle();
        rect.position(100, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: 'blue'
            },
            label: {
                text: 'Hello',
                fill: 'white'
            }
        });
        rect.addTo(graph);

        var rect2 = rect.clone();
        rect2.position(200, 30);
        rect2.attr('label/text', 'World!');
        rect2.addTo(graph);

        var link = new joint.shapes.standard.Link();
        link.source(rect);
        link.target(rect2);
        link.addTo(graph);
    }, []);



    return(
        <div ref={refDiagram}>

        </div>
        )

}

