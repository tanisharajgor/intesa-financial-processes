import { FormControl, Select, MenuItem } from "@material-ui/core";
import { riskVariables, createColorScale, naColor } from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";

const width = 216;
const height = 15;
var colorScale;

function drawLegend(svg, t, riskHoverValue, variable) {

    if (!t.values.includes('NA')) {
        t.values.push('NA')
    }

    if (!t.labels.includes('NA')) {
        t.labels.push('NA')
    }

    for (let i in t.values) {

        svg
            .append("circle")
            .attr('cx', 10)
            .attr('cy', ((d) => 20 + i*20))
            .attr('r', 5)
            .attr('fill', ((d) => t.values[i] === "NA" ? naColor: colorScale(t.values[i])))
            .attr('opacity', ((d) => t.values[i] === riskHoverValue || riskHoverValue === undefined? 1: .5));

        svg
            .append("text")
            .attr("x", 20)
            .attr("y", ((d) => 25 + i*20))
            .text(((d) => t.labels[i]))
            .style("fill", "white")
            .attr('opacity', ((d) => t.values[i] === riskHoverValue || riskHoverValue === undefined? 1: .5));
    }
}

// Initiates the legend svg and sets the non-changing attributes
function initiateLegend(variable, variableLookup, riskHoverValue) {

    let t = variableLookup[variable];
    let h = height + (t.values.length + 1)*20;

    const svg = d3.select("#view-legend")
        .append("svg")
        .attr('width', width)
        .attr('height', h)
        .append("g");

    drawLegend(svg, t, riskHoverValue, variable);
}

// Updates the legend attributes on variable change
function updateLegend(variable, variableLookup, riskHoverValue) {

    let t = variableLookup[variable];
    let h = height + (t.values.length + 1)*20;

    let svg = d3.select("#view-legend svg");
    svg.attr("height", h)
    d3.select("#view-legend svg g").remove();
    svg = svg.append("g");

    drawLegend(svg, t, riskHoverValue, variable);
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

function shapeLegend(networkChart) {
    if (networkChart) {
        const data = [{"group": "Actor", "type": "Actor"},
                      {"group": "Activity", "type": "Process activity"},
                      {"group": "Activity", "type": "Control activity"},
                      {"group": "Activity", "type": "Common process activity"},
                      {"group": "Activity", "type": "System activity"}]

        let h = height + (data.length + 1)*20;

        var svg = d3.select(`#shape-legend`)
            .append("svg")
            .attr("width", width)
            .attr("height", h);

        svg
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", d3.symbol()
            .type(((d) => symbolType(d)))
                .size(100))
            .attr("transform", function(d, i) {
                return 'translate(' + 10 + ', ' + (i*25 + 15) + ')';
            })
            .attr("fill", "white")

        svg
            .selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .attr("x", 25)
            .attr("y", ((d, i) => i*25 + 20))
            .text((d) => d.type)
            .attr("fill", "white")
    }
}

function shapeType(id) {
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
                Risk type:
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

export default function View({id, riskVariable, updateRiskVariable, riskHoverValue, data}) {

    const networkChart = id === "network-chart";

    colorScale = createColorScale(riskVariable, riskVariables);

    const handleChange = (event) => {
        let newView = (Object.keys(riskVariables).find((c) => riskVariables[c].label === event.target.value))
        updateRiskVariable(newView)
    }

    useEffect(() => {
        shapeLegend(networkChart);
    }, []);

    useEffect(() => {
        initiateLegend(riskVariable, riskVariables);
    }, []);

    useEffect(() => {
        updateLegend(riskVariable, riskVariables, riskHoverValue);
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
                    <div id="view-legend"></div>
                </FormControl>
            </div>
        </div>
    )
}
