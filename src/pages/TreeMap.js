import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { riskVariables, createColorScale, applyColorScale, createLabelScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import { StylesProvider } from "@material-ui/core/styles";

const id = "tree-map-chart";

// Set-up layout
const margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;

// Tooltip
function renderTooltip(riskVariable, updateHoverValue) {

    const labelScale = createLabelScale(riskVariable);

    let inspect = d3.select(".Inspect");

    d3.selectAll("rect")
        .on("mouseover", function(e, d) {

            let thisRect = d3.select(this);
            let type = d.data.treeLevel === 4? "Activity": "Process";
            let rs = d.data.riskStatus[riskVariable];
    
            inspect.style("display", "inline-block");
            inspect.style("visibility", "visible")
            inspect.select(".name .key").text(" " + type);
            inspect.select(".name .value").text(" " + d.data.name);
            inspect.select(".risk .key").text(" " + riskVariables[riskVariable].label);
            inspect.select(".risk .value").text(" " + labelScale(rs));

            // console.log(d.data.riskStatus[riskVariable])

            thisRect
                .attr("stroke", "grey")
                .attr("stroke-width", 2);

            updateHoverValue(d.data.riskStatus[riskVariable]);

        }).on("mouseout", function() {

            inspect.style("visibility", "hidden");
            inspect.style("display", "none");

            d3.selectAll("rect")
                .attr("opacity", 1)
                .attr("stroke", "none");

            updateHoverValue(undefined);
        });
}

function addProcessLabels(rectHeight) {

    const labels = ["Level 1 Processes", "Level 2 Processes", "Level 3 Processes", "Activities"]

    for (let i in labels) {
        d3.select(`#${id} svg`)
            .append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -110 - height)
            .attr("y", rectHeight/2 + rectHeight*i + margin.left) //+ height
            .attr("fill", "white")
            .attr("transform",`translate(${width/2},${height/2})`)
            .attr("transform","rotate(-90)")
            .text(labels[i])
    }
}

export default function TreeMap() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");
    const [hoverValue, updateHoverValue] = useState(undefined);

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale =  d3.scaleOrdinal()
            .domain([0, 1, 2, 3, 4])
            .range([.3, .4, .5, .6, .9]);

    // Set-up hierarchical data
    const root = d3.hierarchy(data).sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data
    d3.partition()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
        .padding(2)
        .round(false)
        (root);

    const descendants = root.descendants();

    useEffect(() => {
        const svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform",`translate(${width/2},${height/2})`)
            .attr("transform","rotate(90)")
            .append("g")
                .attr("transform",
                        `translate(${margin.left}, ${margin.top})`)
                .attr("transform", `translate(${margin.left}, -450)`);

        const rectHeight = descendants[0].y1 - descendants[0].y0; // calculate the size of the root rect
        addProcessLabels(rectHeight);

        const g = svg
            .selectAll("g")
            .data(descendants.shift()) //.shift pops off the root data
            .join("g")
            .attr("transform", d => `translate(${d.y0 - rectHeight},${d.x0})`); //shift the visualization the amount of the root rect

        g.append("rect")
            .attr("width", d => d.y1 - d.y0)
            .attr("height", d => (d.x1 - d.x0) + 1)
            .attr("fill", d => applyColorScale(d.data.riskStatus, riskVariable, colorScale))
            .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
            .attr("visibility", d => d.data.treeLevel === 0 ? "hidden": "visible");

        renderTooltip(riskVariable, updateHoverValue);
    }, [])

    useEffect(() => {
        d3.selectAll(`#${id} svg g rect`)
            .attr("fill", d => applyColorScale(d.data.riskStatus, riskVariable, colorScale))

        renderTooltip(riskVariable, updateHoverValue);
    }, [riskVariable])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} hoverValue={hoverValue} id={id} data={data}/>
            </div>
        </StylesProvider>
    )
}
