import { FormControl, Select, MenuItem } from "@material-ui/core";
import { riskVariables, createColorScale, naColor } from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";

const width = 216;
let height = 100;

function drawLegend(svg, t, colorScale, hoverValue, variable) {

    if (!t.values.includes('NA')) {
        t.values.push('NA')
    }

    if (!t.labels.includes('na')) {
        t.labels.push('na')
    }

    for (let i in t.values) {

        svg
            .append("circle")
            .attr('cx', 10)
            .attr('cy', ((d) => 20 + i*20))
            .attr('r', 5)
            .attr('fill', ((d) => t.values[i] === "NA" ? naColor: colorScale(t.values[i])))
            .attr('opacity', ((d) => t.values[i] === hoverValue || hoverValue === undefined? 1: .5));

        svg
            .append("text")
            .attr("x", 20)
            .attr("y", ((d) => 25 + i*20))
            .text(((d) => t.labels[i]))
            .style("fill", "white")
    }
}

// Initiates the legend svg and sets the non-changing attributes
function initiateLegend(variable, variableLookup, colorScale, hoverValue) {

    let t = variableLookup[variable];

    if (t.values.length > 2) {
        height += (t.values.length + 1)*20;
    }

    const svg = d3.select("#view-legend")
        .append("svg")
        .attr('width', width)
        .attr('height', height)
        .append("g");

    drawLegend(svg, t, colorScale, hoverValue, variable);
}

// Updates the legend attributes on variable change
function updateLegend(variable, variableLookup, colorScale, hoverValue) {

    let t = variableLookup[variable];

    let svg = d3.select("#view-legend svg");

    d3.select("#view-legend svg g").remove();

    svg = svg.append("g");

    drawLegend(svg, t, colorScale, hoverValue, variable);
}

function shapeLegend(id) {
    if (id === "network-chart") {
        const data = [{"name": "Actor", "type": "circle"},
                      {"name": "Activity", "type": "triangle"}]

        var svg = d3.select(`#shape-legend`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        svg
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("d", d3.symbol()
            .type(function(d) { return d.type === "circle" ? d3.symbolCircle : d3.symbolTriangle; })
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
            .text((d) => d.name)
            .attr("fill", "white")
    }
}

function shapeType(id) {
    if (id === "network-chart") {
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

export default function View({id, riskVariable, updateRiskVariable, hoverValue}) {

    const colorScale = createColorScale(riskVariable, riskVariables);

    const handleChange = (event) => {
        let newView = (Object.keys(riskVariables).find((c) => riskVariables[c].label === event.target.value))
        updateRiskVariable(newView)
    }

    useEffect(() => {
        shapeLegend(id)
    }, [])

    useEffect(() => {
        initiateLegend(riskVariable, riskVariables, colorScale);
    }, [])

    useEffect(() => {
        updateLegend(riskVariable, riskVariables, colorScale, hoverValue);
    }, [riskVariable, hoverValue])

    return(
        <div>
            <div className="inner">
                <div className="layout_group inline">
                    {/* {shapeType(id)} */}
                    {riskType()}
                </div>
            </div>
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
