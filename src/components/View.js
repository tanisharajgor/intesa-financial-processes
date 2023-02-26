import { FormControl, Select, MenuItem } from "@material-ui/core";
import { riskVariables, createColorScale, naColor } from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";

const width = 216;
const height = 15;
let colorScale;

let riskLegendId = "Risk-Legend";
let shapeLegendId = "Shape-Legend";

const shapeData = [{"group": "Actor", "type": "Actor"},
                      {"group": "Activity", "type": "Process activity"},
                      {"group": "Activity", "type": "Control activity"},
                      {"group": "Activity", "type": "Common process activity"},
                      {"group": "Activity", "type": "System activity"}]

function drawRiskLegend(t, riskHoverValue) {

    let svg =  d3.select(`#${riskLegendId} svg`);

    if (!t.values.includes('NA')) {
        t.values.push('NA')
    }

    if (!t.labels.includes('NA')) {
        t.labels.push('NA')
    }

    let riskData = []
    for (let i in t.labels) {
        riskData.push({"id": t.id[i], "label": t.labels[i], "value": t.values[i]})
    }

    svg
        .selectAll("circle")
        .data(riskData, d => d.id)
        .join(
            enter  => enter
                .append("circle")
                .attr('cx', 10)
                .attr('cy', ((d, i) => 20 + i*20))
                .attr('r', 5)
                .attr('fill', ((d) => d.value === "NA" ? naColor: colorScale(d.value)))
                .attr('opacity', ((d) => d.value === riskHoverValue || riskHoverValue === undefined? 1: .5)),
            update => update,             
            exit   => exit.remove()
        );

    svg
        .selectAll("text")
        .data(riskData, d => d.id)
        .join(
            enter  => enter
                .append("text")
                .attr("x", 20)
                .attr("y", ((d, i) => 25 + i*20))
                .text(((d) => d.label))
                .style("fill", "white")
                .attr('opacity', ((d) => d.value === riskHoverValue || riskHoverValue === undefined? 1: .5)),
            update => update,             
            exit   => exit.remove()
    );
}

// Initiates the legend svg and sets the non-changing attributes
function initRiskLegend(variable, variableLookup, riskHoverValue) {

    let t = variableLookup[variable];
    let h = height + (t.values.length + 1)*20;

    d3.select(`#${riskLegendId}`)
        .append("svg")
        .attr('width', width)
        .attr('height', h);

    drawRiskLegend(t, riskHoverValue);
}

// Updates the legend attributes on variable change
function updateRiskLegend(variable, variableLookup, riskHoverValue) {

    let t = variableLookup[variable];
    let h = height + (t.values.length + 1)*20;

    let svg = d3.select(`#${riskLegendId} svg`);
    svg.attr("height", h)

    drawRiskLegend(t, riskHoverValue);
}

export function symbolType(d) {

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

export function symbolScale(d) {

    if (d.group === "Actor") {
        return 1;
    } else {
        if (d.type === "Process activity") {
            return 2;
        } else if (d.type === "Control activity") {
            return 3;
        } else if (d.type === "Common process activity") {
            return 4;
        } else {
            return 5;
        }
    }
}

function initShapeLegend() {

    let h = height + (shapeData.length + 1)*20;

    d3.select(`#${shapeLegendId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", h);
}

function updateShapeLegend(networkChart, symbolHoverValue) {

    if (networkChart) {

        let svg = d3.select(`#${shapeLegendId} svg`)

        svg
            .selectAll("path")
            .data(shapeData)
            .enter()
            .append("path")
            .attr("d", d3.symbol()
            .type(((d) => symbolType(d)))
                .size(100))
            .attr("transform", function(d, i) {
                return 'translate(' + 10 + ', ' + (i*25 + 15) + ')';
            })
            .attr("fill", "white")
            .attr('opacity', function(d) {
                console.log(symbolScale(d))
                console.log(symbolScale(d) === symbolHoverValue)
            })
            // .attr('opacity', ((d) => symbolScale(d) === symbolHoverValue || symbolHoverValue === undefined? 1: .5));

        svg
            .selectAll("text")
            .data(shapeData)
            .enter()
            .append("text")
            .attr("x", 25)
            .attr("y", ((d, i) => i*25 + 20))
            .attr("fill", "white")
            .attr('opacity', ((d) => symbolScale(d) === symbolHoverValue || symbolHoverValue === undefined? 1: .5))
            .text((d) => d.type);
    }
}

function shapeType() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Shape
            </span>
            <span className="layout_item"></span>
            <div id="shape-legend"></div>
        </div>
    )
}

function viewNNodes() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Number of nodes: 
            </span>
            <span id="nNodes" className="layout_item"></span>
        </div>
    )
}

function viewNActors() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Number of actors: 
            </span>
            <span id="nActors" className="layout_item"></span>
        </div>
    )
}

function viewNActivities() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Number of activities: 
            </span>
            <span id="nActivities" className="layout_item"></span>
        </div>
    )
}

function riskType() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Risk type
            </span>
            <span className="layout_item"></span>
        </div>
    )
}

function viewInfo(networkChart) {
    return(
        <div className="inner">
            <div className="layout_group inline">
                {networkChart? viewNNodes(): <></> }
                {networkChart? viewNActors(): <></> }
                {networkChart? viewNActivities(): <></> }
                {networkChart? shapeType(): <></>}
                {riskType()}
            </div>
        </div>
    )
}

function updateViewInfo(networkChart, data) {
    if (networkChart) {
            
        d3.select("#nNodes")
        .text(` ${data.nodes.length}`);

        d3.select("#nActors")
            .text(` ${data.nodes.filter(d => d.group === "Actor").length}`);

        d3.select("#nActivities")
            .text(` ${data.nodes.filter(d => d.group === "Activity").length}`);
    }
}

export default function View({id, riskVariable, updateRiskVariable, riskHoverValue, symbolHoverValue, data}) {

    const networkChart = id === "network-chart";

    colorScale = createColorScale(riskVariable, riskVariables);

    const handleChange = (event) => {
        let newView = (Object.keys(riskVariables).find((c) => riskVariables[c].label === event.target.value));
        updateRiskVariable(newView)
    }

    // Initiate the shape legend
    useEffect(() => {
        initShapeLegend();
    }, [])

    // Update the shape legend
    useEffect(() => {
        updateShapeLegend(networkChart, symbolHoverValue);
    }, [symbolHoverValue]);

    // Initiate the risk legend
    useEffect(() => {
        initRiskLegend(riskVariable, riskVariables);
    }, []);

    // Update the risk legend
    useEffect(() => {
        updateRiskLegend(riskVariable, riskVariables, riskHoverValue);
    }, [riskVariable, riskHoverValue]);

    useEffect(() => {
        updateViewInfo(networkChart, data);
    }, [data])

    return(
        <div>
            <div>View</div>
            {viewInfo(networkChart)}
            <div className='View'>
                <FormControl variant="outlined" size="small">
                    <Select
                        labelId="view-select-label"
                        id="view-select"
                        displayEmpty
                        value={riskVariables[riskVariable].label}
                        onChange={handleChange}
                    >
                        {
                        Object.keys(riskVariables).map((viewBy) => {
                            let variable = riskVariables[viewBy];
                            return (
                                <MenuItem key={variable.label} value={variable.label}><em>{variable.label}</em></MenuItem>
                            )
                        })}
                    </Select>
                    <div id={riskLegendId}></div>
                </FormControl>
            </div>
        </div>
    )
}
