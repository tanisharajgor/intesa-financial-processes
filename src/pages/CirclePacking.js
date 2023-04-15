import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { createColorScale, applyColorScale, createOpacityScale, createLabelScale, hover } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import { inspectCirclePacking } from "../components/Inspect";

const id = "circle-packing-chart";

export default function CirclePacking() {

    const [viewVariable, updateViewVariable] = useState("controlTypeMode");
    const [riskHoverValue, updateRiskHoverValue] = useState(undefined);

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
    const colorScale = createColorScale(viewVariable);
    const opacityScale = createOpacityScale();

    // Draw circle packing once
    useEffect(() => {

        const svg = d3.select(`#${id}`).append("svg")
            .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
            .attr("transform","rotate(-90)")
            .style("cursor", "pointer")
            .on("click", (event) => zoom(event, root));
    
        const circle = svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .join("circle")
                // .attr("fill", d => applyColorScale(d.data.riskStatus, viewVariable, colorScale))
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

        inspectCirclePacking(data, viewVariable, updateRiskHoverValue);

    }, [])

    // Update the visual aesthetics of the visualization that change with a user input
    useEffect(() => {
        // d3.selectAll(`#${id} svg circle`)
        //     .attr("fill", d => applyColorScale(d.data.riskStatus, viewVariable, colorScale))

        inspectCirclePacking(data, viewVariable, updateRiskHoverValue);
    }, [viewVariable])

    return(
        <div className="Content">
            <Navigation/>
            <div className="Query" id="FilterMenu"></div>
            <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} riskHoverValue={riskHoverValue} id={id} data={data}/>
        </div>
    )
}