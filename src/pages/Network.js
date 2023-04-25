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


function highlightNetworkNodes(data, d) {
    if (d.group === "Actor") {

        let activityIds = filterLinksSourceToTarget(data.links, [d.id]);
        let riskIds = filterLinksSourceToTarget(data.links, activityIds);
        let controlIds = filterLinksSourceToTarget(data.links, riskIds);
        let ids = controlIds.concat(riskIds.concat(activityIds.concat(d.id)));

        return ids

    } else if (d.group === "Activity") {

        let actorIds = filterLinksTargetToSource(data.links, [d.id]);
        let riskIds = filterLinksSourceToTarget(data.links, [d.id]);
        let controlIds = filterLinksSourceToTarget(data.links, riskIds);
        let ids = controlIds.concat(riskIds.concat(actorIds.concat(d.id)));

        return ids;

    } else if (d.group === "Risk") {

        let controlIds = filterLinksSourceToTarget(data.links, [d.id]);
        let activityIds = filterLinksTargetToSource(data.links, [d.id]);
        let actorIds = filterLinksTargetToSource(data.links, activityIds);
        let ids = actorIds.concat(activityIds.concat(controlIds.concat(d.id)));

        return ids;

    } else if (d.group === "Control") {

        let riskIds = filterLinksTargetToSource(data.links, [d.id]);
        let activityIds = filterLinksTargetToSource(data.links, riskIds);
        let actorIds = filterLinksTargetToSource(data.links, activityIds);
        let ids = actorIds.concat(activityIds.concat(riskIds.concat(d.id)));

        return ids;
    }
}

function tooltipText(data, d) {
    if (d.group === "Actor") {

        let activityIds = filterLinksSourceToTarget(data.links, [d.id]);
        let riskIds = filterLinksSourceToTarget(data.links, activityIds);
        let controlIds = filterLinksSourceToTarget(data.links, riskIds);

        return `Type: ${d.type} <br> ${d.group}: ${d.name} <br> # activities: ${activityIds.length} <br> # risks: ${riskIds.length} <br> # controls: ${controlIds.length}`;

    } else if (d.group === "Activity") {

        let actorIds = filterLinksTargetToSource(data.links, [d.id]);
        let riskIds = filterLinksSourceToTarget(data.links, [d.id]);
        let controlIds = filterLinksSourceToTarget(data.links, riskIds);

        return `Type: ${d.type} <br> ${d.group}: ${d.name} <br> # actors: ${actorIds.length} <br> # risks: ${riskIds.length} <br> # controls: ${controlIds.length}`;

    } else if (d.group === "Risk") {

        let controlIds = filterLinksSourceToTarget(data.links, [d.id]);
        let activityIds = filterLinksTargetToSource(data.links, [d.id]);
        let actorIds = filterLinksTargetToSource(data.links, activityIds);

        return `${d.group}: ${d.name} <br> # actors: ${actorIds.length} <br> # activity: ${activityIds.length} <br> # control: ${controlIds.length}`;

    } else if (d.group === "Control") {

        let riskIds = filterLinksTargetToSource(data.links, [d.id]);
        let activityIds = filterLinksTargetToSource(data.links, riskIds);
        let actorIds = filterLinksTargetToSource(data.links, activityIds);

        return `${d.group}: ${d.name} <br> # actors: ${actorIds.length} <br> # activity: ${activityIds.length} <br> # risks: ${riskIds.length}`;
    }
}

// Tooltip
function inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectNetworkSummary(inspect, data);

    nodes.on("mouseover", function(e, d) {

        // Data management steps
        let x = +d3.select(this).attr("x") + 20;
        let y = +d3.select(this).attr("y") - 10;

        let ids = highlightNetworkNodes(data, d);

        let l1 = data.links
            .filter(d => ids.includes(d.source.id) && ids.includes(d.target.id))
            .map((d) => d.index);

        let connectedNodes = nodes.filter(function(i) {
            return ids.includes(i.id);
        });

        // Applying the aesthetic changes
        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(tooltipText(data, d));

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

// Filters source ids and returns corresponding target ids
function filterLinksSourceToTarget(data, ids) {

    let links = data.filter(d => d.source.id === undefined ? ids.includes(d.source): ids.includes(d.source.id))
        .map(d => d.target.id === undefined ? d.target: d.target.id);
    links = [...new Set(links)];

    return links;
}

// Filters targets ids and returns corresponding source ids
function filterLinksTargetToSource(data, ids) {

    let links = data.filter(d => d.target.id === undefined ? ids.includes(d.target): ids.includes(d.target.id))
        .map(d => d.source.id === undefined ? d.source: d.source.id);
    links = [...new Set(links)];

    return links;
}

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks) {

    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));

    let actorIdsFiltered = dataNew.nodes.filter(d => d.group === "Actor" && actorTypesChecks.includes(d.type)).map(d => d.id);
    let activityIdsFiltered = dataNew.nodes.filter(d => d.group === "Activity" && activityTypesChecks.includes(d.type)).map(d => d.id);

    let links = dataNew.links.filter(d => d.source.id === undefined ? actorIdsFiltered.includes(d.source) && activityIdsFiltered.includes(d.target): actorIdsFiltered.includes(d.source.id) && activityIdsFiltered.includes(d.target.id));
    let actorIds = links.map(d => d.source.id === undefined ? d.source: d.source.id);
    let activityIds = links.map(d => d.target.id === undefined ? d.target: d.target.id);

    let riskIds = filterLinksSourceToTarget(dataNew.links, activityIds);
    let controlIds = filterLinksSourceToTarget(dataNew.links, riskIds);

    let ids = controlIds.concat(riskIds.concat(actorIds.concat(activityIds)));

    dataNew.nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    dataNew.links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) && ids.includes(d.target): ids.includes(d.source.id) && ids.includes(d.target.id));

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

    renderNetwork(data, viewVariable);
}

function renderNetwork(data, viewVariable) {

    var svg = d3.select(`#${id} svg`);

    svg.append("g").attr("class", "links");
    svg.append("g").attr("class", "nodes");

    var link = svg.select(".links").selectAll(".link")
        .data(data.links, function (d) { return d.source.id + "-" + d.target.id; })
        .join(
            enter  => enter
                .append("line")
                .attr("stroke", linkColor)
                .attr("id", d => `link-${d.index}`)
                .attr("class", "link"),
            update => update,         
            exit   => exit.remove()
        );

    var node = svg
        .selectAll("path")
        .data(data.nodes, d => d.id)
        .join(
            enter  => enter
                .append("path")
                .attr("d", d3.symbol()
                    .type(((d) => symbolType(d.group)))
                    .size(((d) => d.group === "Actor" ? rScale(d.nActivities): 40)))
                .attr("stroke-width", .5)
                .attr("stroke", "white")
                .attr("fill", d => applyColorScale(d, viewVariable, colorScale)),
            update => update,         
            exit   => exit.remove()
        );

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
    const [activityTypes, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [actorTypes, updateActorType] = useState([...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // console.log(activityTypes, actorTypes)

    // Set-up scales
    colorScale = createColorScale(viewVariable);

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
        updateActorType([...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);
    }, [selectedLevel3ID])

    // Filter data
    useEffect(() => {
        updateData(filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks));
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks])

    // React Hooks
    useEffect(() => {
        initNetwork(data, viewVariable);
    }, []);

    // Renders the network and tooltip and updates when a new level3 is selected of activity is checkec on/off
    useEffect(() => {
        renderNetwork(data, viewVariable);
        nodes = d3.selectAll(`#${id} svg path`);
        inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue);
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data]);

    useEffect(() => {
        inspectNetwork(data, viewVariable, updateViewHoverValue, updateSymbolHoverValue);
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data, viewVariable]);

    // Updates the color of the nodes without restarting the network simulation
    useEffect(() => {
        nodes
            .attr("fill", d => applyColorScale(d, viewVariable, colorScale));
    }, [viewVariable]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType typesChecks={activityTypesChecks} updateTypeChecks={updateActivityTypeChecks} typeValues={activityTypes} label="Filter by Activity Type:"/>
                    <FilterType typesChecks={actorTypesChecks} updateTypeChecks={updateActorTypeChecks} typeValues={actorTypes} label="Filter by Actor Type:"/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} id={id}/>        
            </div>        
        </div>
    )
}
