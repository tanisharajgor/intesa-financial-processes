import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { riskVariables, createColorScale, createOpacityScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import { StylesProvider } from "@material-ui/core/styles";

const id = "circle-packing-chart";

// Tooltip
function renderTooltip(riskVariable, circle) {

    let tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");

    d3.selectAll("circle").on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        let x = e.layerX + 20;
        let y = e.layerY - 10;

        // console.log(e)

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`Process: <b>${d.data.name}</b><br>${riskVariables[riskVariable].label}: <b>${d.data.riskStatus[riskVariable]}</b>`);

        thisCircle
            .attr("stroke", "grey")
            .attr("stroke-width", 2);

        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");
        circle.attr("opacity", 1);

        d3.selectAll('circle')
            .attr("stroke-width", .5)
            .attr("stroke", "grey"); 
    });
}

export default function CirclePacking() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");

    // Set-up layout
    const margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 1000 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;
    const padding = 3;

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale = createOpacityScale();

    // Set-up hierarchical data structures
    const root = d3.hierarchy(data).sum(function(d) { return 1 });
    const descendants = root.descendants();
    const leaves = descendants.filter(d => !d.children);
    leaves.forEach((d, i) => d.index = i);
    root.sort((a, b) => d3.descending(a.value, b.value));
     // Compute the layout.
     d3.pack()
     .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
     .padding(padding)
     (root);

    // Draw circle packing once
    useEffect(() => {

        const svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                    `translate(${margin.left}, ${margin.top})`)
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);

        const node = svg
            .selectAll("g")
            .data(descendants)
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node
            .append("circle")
            .attr("fill", d => d.children ? "#fff" : "grey")
            .attr("r", d => d.r)
            .attr("stroke-width", .5)
            .attr("stroke", "grey")
            .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
            .attr("visibility", d => d.data.treeLevel === 0 ? "hidden": "visible")

    }, [])

    // Update the visual aesthetics of the visualization that change with a user input
    useEffect(() => {
        const circle = d3.selectAll(`#${id} svg circle`)
            .attr("fill", d => d.data.riskStatus[riskVariable] === undefined ? "#fff" : colorScale(d.data.riskStatus[riskVariable]))

        renderTooltip(riskVariable, circle);

    }, [riskVariable])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} id={id}/>
            </div>
        </StylesProvider>
    )
}