import Main from "../components/Main";
import Navigation from "../components/Navigation";
import FilterProcess from "../components/FilterProcess";
import FilterType from "../components/FilterType";
import { StylesProvider } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network2.json";
import * as d3 from 'd3';
import { riskVariables, createColorScale, applyColorScale, hover } from "../utils/global";

const id = "network-chart";
let width = 1000;
let height = 600;
const linkColor = "#373d44";
let colorScale;
let nodes;

// Tooltip
function renderTooltip(data, updateHoverID) {

    let inspect = d3.select(".Inspect");

    nodes.on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);

        const b = data.links.filter((i) => i.source.id === d.id || i.target.id === d.id).map((d) => d.index)

        inspect.style("display", "inline-block");
        inspect.style("visibility", "visible")
        inspect.select(".group .key").text(" " + d.group);
        inspect.select(".group .value").text(" " + d.name);
        inspect.select(".type .value").text(" " + d.type);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        d3.selectAll(`#${id} svg path`).attr("opacity", .5)
        d3.select(this).attr("opacity", 1).raise();

        d3.selectAll(`#${id} .link`)
            .attr("opacity", d => b.includes(d.index) ? 1: .5)
            .attr("stroke", d => b.includes(d.index)? "grey": linkColor)
            .attr("stroke-width", d => b.includes(d.index)? 1.5: 1);

        updateHoverID(d.id);

    }).on("mouseout", function() {

        inspect.style("visibility", "hidden");
        inspect.style("display", "none");
        nodes.attr("opacity", 1);

        d3.selectAll(`#${id} svg path`)
            .attr("stroke-width", .5)
            .attr("stroke", "white");

        d3.selectAll(`#${id} .link`)
            .attr("opacity", 1)
            .attr("stroke", linkColor);

        updateHoverID(-1);
    });
}
function symbolType(d) {

    if (d.group === "Actor") {
        return d3.symbolCircle;
    } else {
        if (d.type === "Process activity") {
            return d3.symbolSquare;
        } else if (d.type === "Control activity") {
            return d3.symbolStar;
        } else if (d.type === "Common process activity") {
            return d3.symbolTriangle;
        } else {
            return d3.symbolDiamond;
        }
    }
}


// Filtes the data by level3ID and activity Type
function filterData(selectedLevel3ID, activityTypesChecks) {
    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));

    dataNew.nodes = dataNew.nodes.filter((d) => d.group === "Actor" || activityTypesChecks.includes(d.type));
    let ids = dataNew.nodes.map((d) => d.id)
    dataNew.links = dataNew.links.filter((d) => ids.includes(d.source.id === undefined ? d.source : d.source.id) && ids.includes(d.target.id === undefined ? d.target : d.target.id))
    return dataNew;
}

function initNetwork() {
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");
}

function renderNetwork(data, riskVariable) {

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
            .attr("stroke", linkColor)
            .attr("id", d => `link-${d.index}`)
            .attr("class", "link");

    var node = svg
        .append("g")
            .attr("class", "nodes")
            .selectAll("path")
            .data(data.nodes)
            .enter()
            .append("path")
            .attr("d", d3.symbol()
                .type(((d) => symbolType(d)))
                .size(((d) => d.nActivities === undefined ? 35: rScale(d.nActivities))))
            .attr("stroke-width", .5)
            .attr("stroke", "white")
            .attr("fill", d => applyColorScale(d.riskStatus, riskVariable, colorScale));

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

    const typeValues = ["Process activity", "Control activity", "Common process activity", "System activity"];
    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");
    const [selectedLevel3ID, updateLevel3ID] = useState(graph[0].id);
    const [hoverID, updateHoverID] = useState(-1);
    const [activityTypesChecks, updateActivityTypeChecks] = useState(typeValues);
    const [data, updateData] = useState(Object.assign({}, graph.find((d) => d.id === selectedLevel3ID)));
 
    // Hover
    let hoverValue = hover(data.nodes, hoverID, riskVariable);

    // Set-up scales
    colorScale = createColorScale(riskVariable, riskVariables);

    // React Hooks
    useEffect(() => {
        initNetwork();
    }, [])

    // Filter data
    useEffect(() => {
       updateData(filterData(selectedLevel3ID, activityTypesChecks))
    }, [activityTypesChecks, selectedLevel3ID])

    // Renders the network and tooltip and updates when a new level3 is selected of activity is checkec on/off
    useEffect(() => {
        renderNetwork(data, riskVariable);
        nodes = d3.selectAll(`#${id} svg path`);
        renderTooltip(data, updateHoverID);
    }, [selectedLevel3ID, activityTypesChecks, data])

    // Updates the color of the nodes without restarting the network simulation
    useEffect(() => {
        nodes
            .attr("fill", d => applyColorScale(d.riskStatus, riskVariable, colorScale));
    }, [riskVariable])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu">
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType activityTypesChecks={activityTypesChecks} updateActivityTypeChecks = {updateActivityTypeChecks} typeValues={typeValues}/>
                </div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} hoverValue={hoverValue} id={id} data={data}/>                
            </div>
        </StylesProvider>
    )
}
