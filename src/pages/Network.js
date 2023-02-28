import Main from "../components/Main";
import Navigation from "../components/Navigation";
import FilterProcess from "../components/FilterProcess";
import FilterType from "../components/FilterType";
import { StylesProvider } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network2.json";
import * as d3 from 'd3';
import { symbolType, symbolScale } from "../components/View";
import { riskVariables, createColorScale, applyColorScale, actorTypeValues, activityTypeValues } from "../utils/global";
import { inspectNetworkDetail, inspectNetworkSummary } from "../components/Inspect";

const id = "network-chart";
let width = 1000;
let height = 600;
const linkColor = "#373d44";
let colorScale;
let nodes;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-1.5))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().strength(2).radius(8));

const rScale = d3.scaleLinear()
    .range([8, 15]);

// Tooltip
function inspectNetwork(data, riskVariable, updateRiskHoverValue, updateSymbolHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectNetworkSummary(inspect, data);

    nodes.on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);

        const b = data.links
            .filter((i) => i.source.id === d.id || i.target.id === d.id)
            .map((d) => d.index);

        inspectNetworkDetail(inspect, d, b);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        d3.selectAll(`#${id} svg path`).attr("opacity", .5)
        d3.select(this).attr("opacity", 1).raise();

        d3.selectAll(`#${id} .link`)
            .attr("opacity", d => b.includes(d.index) ? 1: .5)
            .attr("stroke", d => b.includes(d.index)? "grey": linkColor)
            .attr("stroke-width", d => b.includes(d.index)? 1.5: 1);

        updateSymbolHoverValue(symbolScale(d));
        updateRiskHoverValue(d.riskStatus[riskVariable]);

    }).on("mouseout", function() {

        inspectNetworkSummary(inspect, data);
        
        nodes.attr("opacity", 1);

        d3.selectAll(`#${id} svg path`)
            .attr("stroke-width", .5)
            .attr("stroke", "white");

        d3.selectAll(`#${id} .link`)
            .attr("opacity", 1)
            .attr("stroke", linkColor);

        updateRiskHoverValue(undefined);
        updateSymbolHoverValue(undefined);
    });
}

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks) {
    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));
    let activityIds = dataNew.nodes.filter(d => d.group === "Activity" && activityTypesChecks.includes(d.type)).map(d => d.id);
    let actorIds = dataNew.nodes.filter(d => d.group === "Actor" && actorTypesChecks.includes(d.type)).map(d => d.id);
    console.log(actorIds)
    let links = dataNew.links.filter(d => d.source.id === undefined ? activityIds.includes(d.source) : activityIds.includes(d.source.id));
    links = links.filter(d => d.target.id === undefined ? actorIds.includes(d.target) : actorIds.includes(d.target.id));

    actorIds = links.map(d => d.target.id === undefined ? d.target: d.target.id);
    activityIds = links.map(d => d.source.id === undefined ? d.source: d.source.id)

    let ids = activityIds.concat(actorIds)

    dataNew.nodes = dataNew.nodes.filter((d) => ids.includes(d.id));
    dataNew.links = links;
    return dataNew;
}

function initNetwork(data, riskVariable) {
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    renderNetwork(data, riskVariable);
}

function renderNetwork(data, riskVariable) {

    var svg = d3.select(`#${id} svg`);

    rScale.domain = d3.extent(data.nodes, ((d) => d.nActivities === undefined ? 1: d.nActivities));

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
                    .type(((d) => symbolType(d)))
                    .size(((d) => d.nActivities === undefined ? 35: rScale(d.nActivities))))
                .attr("stroke-width", .5)
                .attr("stroke", "white")
                .attr("fill", d => applyColorScale(d.riskStatus, riskVariable, colorScale)),
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

        node.attr("transform", transform)
    }
}

export default function Network() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");
    const [selectedLevel3ID, updateLevel3ID] = useState(graph[0].id);
    const [activityTypesChecks, updateActivityTypeChecks] = useState(activityTypeValues);
    const [actorTypesChecks, updateActorTypeChecks] = useState(actorTypeValues);
    const [data, updateData] = useState(Object.assign({}, graph.find((d) => d.id === selectedLevel3ID)));
    const [riskHoverValue, updateRiskHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    // Set-up scales
    colorScale = createColorScale(riskVariable, riskVariables);

    // Filter data
    useEffect(() => {
        updateData(filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks))
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks])

    // React Hooks
    useEffect(() => {
        initNetwork(data, riskVariable);
    }, []);

    // Renders the network and tooltip and updates when a new level3 is selected of activity is checkec on/off
    useEffect(() => {
        renderNetwork(data, riskVariable);
        nodes = d3.selectAll(`#${id} svg path`);
        renderTooltip(data, riskVariable, updateRiskHoverValue, updateSymbolHoverValue);
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data]);

    useEffect(() => {
        renderTooltip(data, riskVariable, updateRiskHoverValue, updateSymbolHoverValue);
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks, data, riskVariable]);

    // Updates the color of the nodes without restarting the network simulation
    useEffect(() => {
        nodes
            .attr("fill", d => applyColorScale(d.riskStatus, riskVariable, colorScale));
    }, [riskVariable]);

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu">
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType typesChecks={activityTypesChecks} updateTypeChecks = {updateActivityTypeChecks} typeValues={activityTypeValues} label="Filter by Activity Type:"/>
                    <FilterType typesChecks={actorTypesChecks} updateTypeChecks = {updateActorTypeChecks} typeValues={actorTypeValues} label="Filter by Actor Type:"/>
                </div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} riskHoverValue={riskHoverValue} symbolHoverValue={symbolHoverValue} id={id} data={data}/>                
            </div>
        </StylesProvider>
    )
}
