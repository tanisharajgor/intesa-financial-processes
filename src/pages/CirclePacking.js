import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { createColorScale, applyColorScaleMode } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";

const id = "circle-packing-chart";
let colorScale;

export default function CirclePacking() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);

    const height = 932, width = 932;

    const root = d3.pack()
        .size([width, height])
        .padding(3)
        (d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value));

    // Set-up scales
    colorScale = createColorScale(viewVariable);

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue))

    useEffect(() => {
        circlePackingDiagram.current.init(id);
        circlePackingDiagram.current.draw(viewVariable);
    }, [])

    // Update the visual aesthetics of the visualization that change with a user input
    useEffect(() => {
        circlePackingDiagram.current.updateDraw(viewVariable)

        let inspect = d3.select(".Inspect");
        inspectHierarchySummary(inspect, data);
    }, [viewVariable])

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} id={id}/>
            </div>
        </div>
    )
}
