import Main from "../components/Main";
import Navigation from "../components/Navigation";
import FilterProcess from "../components/FilterProcess";
import FilterType from "../components/FilterType";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network2.json";
import * as d3 from 'd3';
import { createColorScale, applyColorScale, actorTypeValues, activityTypeValues, rScale, symbolType  } from "../utils/global";
import { inspectNetworkSummary } from "../components/Inspect";
import { QueryMenu } from "cfd-react-components";
import NetworkVisualization from "../visualization/network-visualization";

const id = "network-chart";
let width = 1000;
let height = 600;
const linkColor = "#373d44";
let colorScale;
let nodes;
let tooltip;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-1.65))
    .force("center", d3.forceCenter(width / 2, height / 2).strength(1.7))
    .force("collide", d3.forceCollide().strength(2).radius(8));

// Tooltip
function inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectNetworkSummary(inspect, data);

    nodes.on("mouseover", function(e, d) {

        // Data management steps
        let x = +d3.select(this).attr("x") + 20;
        let y = +d3.select(this).attr("y") - 10;

        let l1 = data.links
            .filter((i) => i.source.id === d.id || i.target.id === d.id)

        const l1source = l1.map(j => j.source.id);
        const l1target = l1.map(j => j.target.id);
        let l1connectedNodeIds = [...new Set([d.id].concat(l1source.concat(l1target)))];

        l1 = l1.map((d) => d.index);

        let l2 = data.links
            .filter((i) => l1connectedNodeIds.includes(i.source.id) || l1connectedNodeIds.includes(i.target.id));

        const l2source = l2.map(j => j.source.id);
        const l2target = l2.map(j => j.target.id);
        let l2connectedNodeIds = [...new Set([d.id].concat(l2source.concat(l2target)))];

        let connectedNodes = nodes.filter(function(i) {
            return l1connectedNodeIds.includes(i.id);
        });

        // Applying the aesthetic changes
        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`${d.group}: ${d.name} <br> Number of connections: ${l1.length}`);

        d3.selectAll(`#${id} svg path`)
            .attr("opacity", .5);

        connectedNodes
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 1)
            .raise();

        d3.selectAll(`#${id} .link`)
            .attr("opacity", d => l1.includes(d.index) ? 1: .5)
            .attr("stroke", d => l1.includes(d.index)? "white": linkColor)
            .attr("stroke-width", d => l1.includes(d.index)? 1: .5);

        updateSymbolHoverValue(d.group);
        updateViewHoverValue(applyColorScale(d, viewVariable, colorScale));

    }).on("mouseout", function() {

        inspectNetworkSummary(inspect, data);

        tooltip.style("visibility", "hidden");
        
        nodes.attr("opacity", 1);

        d3.selectAll(`#${id} svg path`)
            .attr("stroke-width", .5)
            .attr("stroke", "white");

        d3.selectAll(`#${id} .link`)
            .attr("opacity", 1)
            .attr("stroke", linkColor);

        updateViewHoverValue(undefined);
        updateSymbolHoverValue(undefined);
    });
}

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks) {
    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));
    let activityIds = dataNew.nodes.filter(d => d.group === "Activity" && activityTypesChecks.includes(d.type)).map(d => d.id);
    let actorIds = dataNew.nodes.filter(d => d.group === "Actor" && actorTypesChecks.includes(d.type)).map(d => d.id);
    let controlIds = dataNew.nodes.filter(d => d.group === "Control").map(d => d.id);
    let riskIds = dataNew.nodes.filter(d => d.group === "Risk").map(d => d.id);

    let ids = riskIds.concat(controlIds.concat(activityIds.concat(actorIds)));

    let nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    let links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) : ids.includes(d.source.id));
    links = links.filter(d => d.target.id === undefined ? ids.includes(d.target) : ids.includes(d.target.id));

    dataNew.nodes = nodes;
    dataNew.links = links;
    return dataNew;
}

function initNetwork(data, viewVariable) {
    //chart svg
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //tooltip
    tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip");

    renderNetwork(data, viewVariable);
}

function renderNetwork(data, viewVariable) {

    var svg = d3.select(`#${id} svg`);

    svg.append("g").attr("class", "links");
    svg.append("g").attr("class", "nodes");

    var link = svg.select(".links").selectAll(".link")

    var node = svg
        .selectAll("path")

    simulation.alpha(1).restart();

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

        node.attr("transform", transform);

        node.attr("x", d => d.x);
        node.attr("y", d => d.y);
    }
}

export default function Network() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [selectedLevel3ID, updateLevel3ID] = useState(graph[0].id);
    const [activityTypesChecks, updateActivityTypeChecks] = useState(activityTypeValues);
    const [actorTypesChecks, updateActorTypeChecks] = useState(actorTypeValues);
    const [data, updateData] = useState(Object.assign({}, graph.find((d) => d.id === selectedLevel3ID)));
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    const networkDiagram = new NetworkVisualization(data)

    // Set-up scales
    colorScale = createColorScale(viewVariable);

    // React Hooks
    useEffect(() => {
        console.log('test2')
        networkDiagram.init(id)
        networkDiagram.draw(viewVariable)
        networkDiagram.animate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter data
    useEffect(() => {
        console.log('test1')
        updateData(filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks))
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks])

    // // Renders the network and tooltip and updates when a new level3 is selected of activity is checkec on/off
    // useEffect(() => {
    //     // networkDiagram.updateDraw(viewVariable)
    //     // renderNetwork(data, viewVariable);
    //     // networkDiagram.animate()
    //     networkDiagram.init(id)
    //     nodes = d3.selectAll(`#${id} svg path`);
    //     inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue);
    // }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data, viewVariable]);

    // useEffect(() => {
    //     inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue);
    // }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data, viewVariable]);

    // Updates the color of the nodes without restarting the network simulation
    // useEffect(() => {
    //     nodes
    //         .attr("fill", d => applyColorScale(d, viewVariable, colorScale));
    // }, [viewVariable]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType typesChecks={activityTypesChecks} updateTypeChecks = {updateActivityTypeChecks} typeValues={activityTypeValues} label="Filter by Activity Type:"/>
                    <FilterType typesChecks={actorTypesChecks} updateTypeChecks = {updateActorTypeChecks} typeValues={actorTypeValues} label="Filter by Actor Type:"/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} id={id}/>        
            </div>        
        </div>
    )
}
