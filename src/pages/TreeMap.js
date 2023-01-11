import Navigation from "../components/Navigation";
import { riskVariables, createLegend, createColorScale, createOpacityScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect } from "react";

// Tooltip
function renderTooltip(riskVariable, rect) {

    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

    d3.selectAll("rect")
        .on("mouseover", function(e, d) {

            let thisRect = d3.select(this);
            let x = e.layerX + 20;
            let y = e.layerY - 10;

            // console.log(e)

            tooltip.style("visibility", "visible")
                .style("top", `${y}px`)
                .style("left", `${x}px`)
                .html(`Process: <b>${d.data.name}</b><br>Control type: <b>${d.data.riskStatus[riskVariable]}</b>`);

            thisRect
                .attr("stroke", "grey")
                .attr("stroke-width", 2);

        }).on("mouseout", function() {

            tooltip.style("visibility", "hidden");
            rect.attr("opacity", 1);

            d3.selectAll('rect').attr("stroke", "none"); 
        });
}


export default function TreeMap() {

    const margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;
    var riskVariable = "controlTypeMode";

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale = createOpacityScale();
    const root = d3.hierarchy(data).sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data

    useEffect(() => {
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                    `translate(${margin.left}, ${margin.top})`)
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);

        console.log(root)

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.partition()
            .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
            .padding(2)
            .round(false)
            (root)

        const descendants = root.descendants();
        console.log(descendants)

        const g = svg
            .selectAll("g")
            .data(descendants)
            .join("g")
            .attr("transform", d => `translate(${d.y0},${d.x0})`);

        const rect = g.append("rect")
            .attr("width", d => d.y1 - d.y0)
            .attr("height", d => d.x1 - d.x0)
            .attr("fill", d => d.data.riskStatus[riskVariable] === undefined ? "#fff" : colorScale(d.data.riskStatus[riskVariable]))
            .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
            .attr("visibility", d => d.data.treeLevel == 0 ? "hidden": "visible")
            .attr("stroke-width", .5)
            .attr("stroke", "#D7D7D7");


        createLegend(riskVariable, riskVariables);
        renderTooltip(riskVariable, rect);

    }, [riskVariable])

    return(
        <div>
            <h3>Tree Map</h3>
            <Navigation/>
            <div class="container">
                <div id="chart"></div>
                <div id="legend"></div>
            </div>
        </div>
    )
}
