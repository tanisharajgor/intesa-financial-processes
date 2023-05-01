import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { createColorScale, applyColorScaleMode } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";

const id = "circle-packing-chart";
let tooltip;
let colorScale;

export function inspectCirclePacking(data, viewVariable, updateViewHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectHierarchySummary(inspect, data);

    d3.selectAll("circle").on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        let x = e.layerX + 20;
        let y = e.layerY - 10;

        let type = d.data.treeLevel === 4? "Activity": "Process";

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`${type}: ${d.data.name}`);

        thisCircle
            .attr("stroke", "grey")
            .attr("stroke-width", 1.5);

        updateViewHoverValue(applyColorScaleMode(d.data, viewVariable, colorScale));

    }).on("mouseout", function() {

        inspectHierarchySummary(inspect, data);
        updateViewHoverValue(undefined);

        tooltip.style("visibility", "hidden");

        d3.selectAll('circle')
            .attr("stroke-width", .5)
            .attr("stroke", "grey"); 
    });
}

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

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1)))

    useEffect(() => {
        //tooltip
        tooltip = d3.select(`#${id}`)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("left", "0px")
            .style("top", "0px")
            .style("visibility", "hidden")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("border-radius", "5px")
            .style("background-color", "rgba(0, 0, 0, 0.65)")
            .style("font-family", '"Helvetica Neue", Helvetica, Arial, sans-serif')
            .style("font-weight", "normal")
            .style("border", "1px solid rgba(78, 81, 85, 0.7)")
            .style("font-size", "16px");

        circlePackingDiagram.current.init(id)
        circlePackingDiagram.current.draw(viewVariable)

        inspectCirclePacking(data, viewVariable, updateViewHoverValue);
    }, [])

    // Update the visual aesthetics of the visualization that change with a user input
    useEffect(() => {
        circlePackingDiagram.current.updateDraw(viewVariable)

        inspectCirclePacking(data, viewVariable, updateViewHoverValue);
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