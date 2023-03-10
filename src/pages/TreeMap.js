import Navigation from "../components/Navigation";
import Main from "../components/Main";
import { riskVariables, createColorScale, applyColorScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import { StylesProvider } from "@material-ui/core/styles";
import { inspectTreeMap } from "../components/Inspect";

const id = "tree-map-chart";

// Set-up layout
const margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

function addProcessLabels(rectHeight) {

    const labels = ["Level 1", "Level 2", "Level 3", "Activities"]

    for (let i in labels) {
        d3.select(`#${id} svg`)
            .append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -50 - height)
            .attr("y", rectHeight/2 + rectHeight*i + margin.left) //+ height
            .attr("fill", "white")
            .attr("transform",`translate(${width/2},${height/2})`)
            .attr("transform","rotate(-90)")
            .text(labels[i])
    }
}

export default function TreeMap() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");
    const [riskHoverValue, updateRiskHoverValue] = useState(undefined);

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale =  d3.scaleOrdinal()
            .domain([0, 1, 2, 3, 4])
            .range([.3, .4, .5, .6, .9]);

    // Set-up hierarchical data
    const root = d3.hierarchy(data).sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data
    root.sum(d => d.children ? 0: 1);
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
            // .append("g")
            //     .attr("transform",
            //             `translate(${margin.left}, ${margin.top})`)
            //     .attr("transform", `translate(${margin.left}, -450)`);

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

        inspectTreeMap(data, riskVariable, updateRiskHoverValue);
    }, [])

    useEffect(() => {
        d3.selectAll(`#${id} svg g rect`)
            .attr("fill", d => applyColorScale(d.data.riskStatus, riskVariable, colorScale))

        inspectTreeMap(data, riskVariable, updateRiskHoverValue);
    }, [riskVariable])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} id={id} data={data}/>
            </div>
        </StylesProvider>
    )
}
