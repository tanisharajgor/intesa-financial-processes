import Main from "../components/Main";
import Navigation from "../components/Navigation";
import { StylesProvider } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network.json";
import * as d3 from 'd3';
import { riskVariables, createColorScale } from "../utils/global";

const id = "network-chart";

// Tooltip
function renderTooltip(riskVariable, circle) {

    let tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");

    circle.on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        let x = e.layerX + 20;
        let y = e.layerY - 10;

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`Node type: <b>${d.group}</b><br>${riskVariables[riskVariable].label}: <b>${d.riskStatus[riskVariable]}</b>`)
            // .html(`<b>${d.group}</b><br>${d.name}`);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");
        circle.attr("opacity", 1);

        d3.selectAll('circle')
            .attr("stroke-width", .5)
            .attr("stroke", "white"); 
    });
}

export default function Network() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");

    let data = graph[0];

    // Set-up scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const rScale = d3.scaleLinear()
        .domain(d3.extent(data.nodes, ((d) => d.nActivities === undefined ? 1: d.nActivities)))
        .range([5, 20]);

    useEffect(() => {

        var width = 800;
        var height = 600;
        var svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-1.5))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().strength(2).radius((d) => d.nActivities === undefined ? 3: rScale(d.nActivities)));

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", "grey");

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("r", ((d) => d.nActivities === undefined ? 3: rScale(d.nActivities)))
            .attr("stroke-width", .5)
            .attr("stroke", "white");

        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    }, [])

    useEffect(() => {
        const circle = d3.selectAll(`#${id} svg circle`)
            .attr("fill", d => d.riskStatus[riskVariable] === undefined ? "#ADADAD" : colorScale(d.riskStatus[riskVariable]))

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
