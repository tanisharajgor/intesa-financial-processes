import Main from "../components/Main";
import Navigation from "../components/Navigation";
import FilterProcess from "../components/FilterProcess";
import { StylesProvider } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network.json";
import * as d3 from 'd3';
import { riskVariables, createColorScale } from "../utils/global";

const id = "network-chart";
var width = 800;
var height = 600;

function initTooltip() {
    d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");
}

// Tooltip
function renderTooltip(node) {

    var tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");

    node.on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        let x = e.layerX + 20;
        let y = e.layerY - 10;

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`<b>${d.group}</b>: <b>${d.name}</b>`);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        d3.selectAll(`#${id} svg path`).attr("opacity", .5)
        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");
        node.attr("opacity", 1);

        d3.selectAll(`#${id} svg path`)
            .attr("stroke-width", .5)
            .attr("stroke", "white"); 
    });
}

function initNetwork() {
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");
}

function renderNetwork(data, riskVariable, colorScale) {

    var svg = d3.select(`#${id} svg`);

    d3.select(`#${id} svg g`).remove();

    svg = svg.append("g")

    const rScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, ((d) => d.nActivities === undefined ? 1: d.nActivities)))
        .range([100, 300]);

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-1.5))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().strength(2).radius(8));

    var link = svg
        .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", "grey");

    var node = svg
        .append("g")
            .attr("class", "nodes")
            .selectAll("path")
            .data(data.nodes)
            .enter()
            .append("path")
            .attr("d", d3.symbol()
                .type(function(d) { return d.group === "actor" ? d3.symbolCircle : d3.symbolTriangle; })
                .size(((d) => d.nActivities === undefined ? 35: rScale(d.nActivities))))
            .attr("stroke-width", .5)
            .attr("stroke", "white")
            .attr("fill", d => d.riskStatus[riskVariable] === undefined ? "#ADADAD" : colorScale(d.riskStatus[riskVariable]));

    simulation
        .nodes(data.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.links);

    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", transform)
    }
}

export default function Network() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");
    const [level3ID, updateLevel3ID] = useState(graph[0].id);

    let data = graph.find((d) => d.id === level3ID);

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);

    useEffect(() => {
        initNetwork();
    }, [])

    useEffect(() => {
        renderNetwork(data, riskVariable, colorScale);
        const node = d3.selectAll(`#${id} svg path`);
        renderTooltip(node);
    }, [level3ID])

    useEffect(() => {
        const node = d3.selectAll(`#${id} svg path`)
            .attr("fill", d => d.riskStatus[riskVariable] === undefined ? "#ADADAD" : colorScale(d.riskStatus[riskVariable]))

        renderTooltip(node);

    }, [riskVariable])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu">
                    <FilterProcess updateLevel3ID={updateLevel3ID}/>
                </div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} id={id}/>                
            </div>
        </StylesProvider>
    )
}
