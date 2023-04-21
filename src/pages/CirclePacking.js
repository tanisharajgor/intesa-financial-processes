import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { createColorScale, applyColorScaleMode, createOpacityScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";

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

    function pack(data) {
        let x = d3.pack()
            .size([width, height])
            .padding(3)
            (d3.hierarchy(data)
            .sum(d => 1)
            .sort((a, b) => b.value - a.value));

        return x;
    }

    const root = pack(data);
    root.sum(d => d.children ? 0: 1);
    // console.log(root)
    let focus = root;
    let view;

    // Set-up scales
    colorScale = createColorScale(viewVariable);
    const opacityScale = createOpacityScale();

    // Draw circle packing once
    useEffect(() => {

        const svg = d3.select(`#${id}`).append("svg")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .attr("transform","rotate(-90)")
            .style("cursor", "pointer")
            .on("click", (event) => zoom(event, root));

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
    
        const circle = svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .join("circle")
                .attr("fill", d => applyColorScaleMode(d.data, viewVariable, colorScale))
                .on("mouseover", function() { d3.select(this).attr("stroke", "#000"); })
                .on("mouseout", function() { d3.select(this).attr("stroke", null); })
                .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()))
                .attr("stroke-width", .5)
                .attr("stroke", "grey")
                .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
                .attr("visibility", d => d.data.treeLevel === 0 ? "hidden": "visible");

        zoomTo([root.x, root.y, root.r * 2]);

        function zoomTo(v) {
            const k = width / v[2];

            view = v;
            circle.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            circle.attr("r", d => d.r * k);
        }

        function zoom(event, d) {
            const focus0 = focus;

            focus = d;

            const transition = svg.transition()
                .duration(event.altKey ? 7500 : 750)
                .tween("zoom", d => {
                const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                return t => zoomTo(i(t));
            });
        }

        inspectCirclePacking(data, viewVariable, updateViewHoverValue);

    }, [])

    // Update the visual aesthetics of the visualization that change with a user input
    useEffect(() => {
        d3.selectAll(`#${id} svg circle`)
            .attr("fill", d => applyColorScaleMode(d.data, viewVariable, colorScale));

        inspectCirclePacking(data, viewVariable, updateViewHoverValue);
    }, [viewVariable])

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} id={id}/>
            </div>
            {/* <div className="Query" id="FilterMenu"></div> */}
        </div>
    )
}