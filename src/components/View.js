import { Form, Select, MenuItem } from "cfd-react-components";
import { viewVars, viewObj, createColorScale, rScale, symbolScale, symbolType } from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";
import { InspectHTML } from "./Inspect";

const width = 216;
const height = 15;
let colorScale;

let riskLegendId = "Risk-Legend";
let shapeLegendId = "Shape-Legend";
let sizeLegendId = "Size-Legend";

const shapeData = [{"group": "Actor", "type": "Actor"},
                      {"group": "Activity", "type": "Activity"},
                      {"group": "Risk", "type": "Risk"},
                      {"group": "Control", "type": "Control"}];

const sizeData = [{"size": 1, "group": "Actor"},
                {"size": 100, "group": "Actor"},
                {"size": 300, "group": "Actor"}];
         

function drawRiskLegend(t, viewHoverValue) {

    let svg =  d3.select(`#${riskLegendId} svg`);

    let riskData = []
    for (let i in t.labels) {
        riskData.push({"id": t.id[i], "label": t.labels[i], "value": t.values[i], "color": colorScale(t.values[i]), "group": t.group})
    }

    svg
            .selectAll("path")
            .data(riskData, d => d.id)
            .join(
                enter  => enter
                    .append("path")
                    .attr("d", d3.symbol()
                    .type((d => symbolType(d.group)))
                        .size(60))
                    .attr("transform", function(d, i) {
                        return 'translate(' + 10 + ', ' + (i*23 + 15) + ')';
                    })
                    .attr('fill', (d => d.color)),
                update => update
                    .attr('opacity', (d => viewHoverValue === undefined || d.color == viewHoverValue? 1: .3)),
                    exit   => exit.remove()
            );

    svg
        .selectAll("text")
        .data(riskData, d => d.id)
        .join(
            enter  => enter
                .append("text")
                .attr("x", 25)
                .attr("y", ((d, i) => i*23 + 20))
                .text((d => d.label))
                .attr("font-size", 12)
                .attr("fill", "#cbcbcb"),
            update => update
                .attr('opacity', (d => viewHoverValue === undefined || d.color === viewHoverValue ? 1: .3)),
            exit   => exit.remove()
    );
}

// Initiates the legend svg and sets the non-changing attributes
function initRiskLegend(variable, viewHoverValue) {

    let t = viewObj[variable];
    let h = height + (t.values.length + 1)*20;

    d3.select(`#${riskLegendId}`)
        .append("svg")
        .attr('width', width)
        .attr('height', h);

    drawRiskLegend(t, viewHoverValue);
}

// Updates the legend attributes on variable change
function updateRiskLegend(variable, viewHoverValue) {

    let t = viewObj[variable];
    let h = height + (t.values.length + 1)*20;

    let svg = d3.select(`#${riskLegendId} svg`);
    svg.attr("height", h)

    drawRiskLegend(t, viewHoverValue);
}

function initShapeLegend(networkChart, symbolHoverValue) {

    let h = height + (shapeData.length + 1)*20;

    d3.select(`#${shapeLegendId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", h);

    drawShapeLegend(networkChart, symbolHoverValue);
}

function drawShapeLegend(networkChart, symbolHoverValue) {
    if (networkChart) {

        let svg = d3.select(`#${shapeLegendId} svg`);

        svg
            .selectAll("path")
            .data(shapeData, d => d.group)
            .join(
                enter  => enter
                    .append("path")
                    .attr("d", d3.symbol()
                    .type(((d) => symbolType(d.group)))
                        .size(60))
                    .attr("transform", function(d, i) {
                        return 'translate(' + 10 + ', ' + (i*23 + 15) + ')';
                    })
                    .attr("fill", "#cbcbcb"),
                update => update
                    .attr('opacity', ((d) => symbolType(d.group) === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
            );

        svg
            .selectAll("text")
            .data(shapeData, d => d.type)
            .join(
                enter  => enter
                    .append("text")
                    .attr("x", 25)
                    .attr("y", ((d, i) => i*23 + 20))
                    .attr("fill", "#cbcbcb")
                    .attr("font-size", 12)
                    .text((d) => d.type),
                update => update
                    .attr('opacity', ((d) => symbolType(d.group) === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
            );
    }
}

function updateShapeLegend(networkChart, symbolHoverValue) {
    drawShapeLegend(networkChart, symbolHoverValue);
}

function initSizeLegend(networkChart) {

    let h = height + (sizeData.length + 1)*20;

    d3.select(`#${sizeLegendId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", h);

    drawSizeLegend(networkChart);
}

function drawSizeLegend(networkChart) {
    if (networkChart) {

        const h = 40;

        let svg = d3.select(`#${sizeLegendId} svg`);

        let shape = svg.append("g")
            .selectAll("circle")
                .data(sizeData, d => d.size)
                .enter()
                .append("g")
            .attr("transform", (d, i) => `translate(${(i * 70) + 30}, ${h / 3})`);

        shape.append("path")
            .attr("d", d3.symbol()
                .type(((d) => symbolType(d.group)))
                .size(((d) => rScale(d.size))))
            .attr("fill", "#cbcbcb");

        shape.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 25)
            .attr("font-size", 12)
            .attr("fill", "#cbcbcb")
            .text(d => d.size);
    }
}

function shapeType() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Shape
            </span>
            <span className="layout_item"></span>
            <div id={shapeLegendId}></div>
        </div>
    )
}

function sizeType() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Size
            </span>
            <span className="layout_item"></span>
            <div id={sizeLegendId}></div>
        </div>
    )
}


function riskType() {
    return(
        <div className="layout_row">
            <span className="layout_item key"></span>
            <span className="layout_item"></span>
        </div>
    )
}

function viewInfo(networkChart) {
    return(
        <div className="inner">
            <div className="layout_group inline">
                {networkChart? shapeType(): <></>}
                {networkChart? sizeType(): <></>}
                {riskType()}
            </div>
        </div>
    )
}

export default function View({id, viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue, data}) {

    const networkChart = id === "network-chart";

    colorScale = createColorScale(viewVariable);

    const handleChange = (event) => {
        let newView = (Object.keys(viewObj).find((c) => viewObj[c].label === event.target.value));
        updateViewVariable(newView)
    }

    // Initiate legends
    useEffect(() => {
        initShapeLegend(networkChart, symbolHoverValue);
        initSizeLegend(networkChart);
        initRiskLegend(viewVariable);
    }, [])

    // Update the shape legend
    useEffect(() => {
        updateShapeLegend(networkChart, symbolHoverValue);
    }, [symbolHoverValue]);

    // Update the risk legend
    useEffect(() => {
        updateRiskLegend(viewVariable, viewHoverValue);
    }, [viewVariable, viewHoverValue]);

    return(
        <div className='View'>
            <div>View</div>
            <div className="inner">
                <InspectHTML/>
                {viewInfo(networkChart)}
                <Form variant="outlined" size="small">
                    <Select
                        labelId="view-select-label"
                        id="view-select"
                        displayEmpty
                        value={viewObj[viewVariable].label}
                        onChange={handleChange}
                    >
                        {
                        viewVars.map((viewBy) => {

                            let variable = viewObj[viewBy];
                            return (
                                <MenuItem key={variable.id} value={variable.label}><em>{variable.label}</em></MenuItem>
                            )
                        })}
                    </Select>
                    <div id={riskLegendId}></div>
                </Form>
            </div>
        </div>
    )
}
