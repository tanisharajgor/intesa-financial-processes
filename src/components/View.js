import { Form, MenuItem } from "cfd-react-components";
import * as Global from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";
import { InspectHTML } from "./Inspect";
import { StyledSelect } from "../component-styles/select";
import { ViewStyles } from "../component-styles/view";

const width = 216;
const height = 15;
let colorScale;

let riskLegendId = "Risk-Legend";
let shapeLegendId = "Shape-Legend";
let lineLegendId = "Line-Legend";

const shapeData = [{"viewId": "Actor"},
                   {"viewId": "Control activity"},
                   {"viewId": "Other activity"},
                   {"viewId": "Risk"}];

const shapeData2 = [{"viewId": "Process"},
                    {"viewId": "Control activity"},
                    {"viewId": "Other activity"}];

const lineData = [{"type": "Responsible for", "line": "solid"},
                  {"type": "Links to", "line": "dashed"}];

function drawRiskLegend(t, viewHoverValue, networkChart) {

    let svg =  d3.select(`#${riskLegendId} svg`);

    let riskData = []
    for (let i in t.labels) {
        riskData.push({"id": t.id[i], "label": t.labels[i], "value": t.values[i], "color": colorScale(t.values[i]), "viewId": t.viewId})
    }

    svg
            .selectAll("path")
            .data(riskData, d => d.id)
            .join(
                enter  => enter
                    .append("path")
                    .attr("d", d3.symbol()
                    .type((d => networkChart? Global.symbolScaleD3(d): d3.symbolCircle))
                        .size(60))
                    .attr("transform", function(d, i) {
                        return 'translate(' + 10 + ', ' + (i*23 + 15) + ')';
                    })
                    .attr('fill', d => d.color)
                    .attr('stroke-width', 1),
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
function initRiskLegend(viewVariable, viewHoverValue, networkChart) {

    let t = Global.viewVariables[viewVariable];
    let h = height + (t.values.length + 1)*20;

    d3.select(`#${riskLegendId}`)
        .append("svg")
        .attr('width', width)
        .attr('height', h);

    drawRiskLegend(t, viewHoverValue, networkChart);
}

// Updates the legend attributes on variable change
function updateRiskLegend(variable, viewHoverValue, networkChart) {

    let t = Global.viewVariables[variable];
    let h = height + (t.values.length + 1)*20;

    let svg = d3.select(`#${riskLegendId} svg`);
    svg.attr("height", h);

    drawRiskLegend(t, viewHoverValue, networkChart);
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

    let svg = d3.select(`#${shapeLegendId} svg`);

    if (networkChart) {

        svg
            .selectAll("path")
            .data(shapeData, d => d.viewId)
            .join(
                enter  => enter
                    .append("path")
                    .attr("d", d3.symbol()
                    .type(((d) => Global.symbolScaleD3(d)))
                        .size(60))
                    .attr("transform", function(d, i) {
                        return 'translate(' + 10 + ', ' + (i*23 + 15) + ')';
                    })
                    .attr("fill", Global.naColorHex),
                update => update
                    .attr('opacity', ((d) => d.viewId === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
            );

        svg
            .selectAll("text")
            .data(shapeData, d => d.viewId)
            .join(
                enter  => enter
                    .append("text")
                    .attr("x", 25)
                    .attr("y", ((d, i) => i*23 + 20))
                    .attr("fill", "#cbcbcb")
                    .attr("font-size", 12)
                    .text((d) => d.viewId),
                update => update
                    .attr('opacity', ((d) => d.viewId === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
            );
    } else {
        svg
        .selectAll("path")
        .data(shapeData2, d => d.viewId)
        .join(
            enter  => enter
                .append("path")
                .attr("d", d3.symbol()
                .type(((d) => Global.symbolScaleD3(d)))
                    .size(60))
                .attr("transform", function(d, i) {
                    return 'translate(' + 10 + ', ' + (i*23 + 15) + ')';
                })
                .attr("fill", "#cbcbcb"),
            update => update
                .attr('opacity', ((d) => d.viewId === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
        );

    svg
        .selectAll("text")
        .data(shapeData2, d => d.viewId)
        .join(
            enter  => enter
                .append("text")
                .attr("x", 25)
                .attr("y", ((d, i) => i*23 + 20))
                .attr("fill", "#cbcbcb")
                .attr("font-size", 12)
                .text((d) => d.viewId),
            update => update
                .attr('opacity', ((d) => d.viewId === symbolHoverValue || symbolHoverValue === undefined? 1: .3))
        );
    }
}

function updateShapeLegend(networkChart, symbolHoverValue) {
    drawShapeLegend(networkChart, symbolHoverValue);
}

// Initialized the Line Legend SVG
function initLineLegend() {

    let h = height + (lineData.length + 1)*20;

    d3.select(`#${lineLegendId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", h);

    drawLineLegend();
}

// Draws the Line Legend
function drawLineLegend() {

    let svg = d3.select(`#${lineLegendId} svg`);

    svg.selectAll("line")
    .data(lineData, d => d.viewId)
    .join(
        enter => enter
            .append("line")
            .style("stroke", "grey")
            .attr("x1", 5)
            .attr("y1", (d, i) => i*23 + 15)
            .attr("x2", 20)
            .attr("y2", (d, i) => i*23 + 15)
            .style("stroke-dasharray", (d) => d.line === "dashed"? "5,5": "1,0")
    );

    svg
        .selectAll("text")
        .data(lineData, d => d.type)
        .join(
            enter  => enter
                .append("text")
                .attr("x", 25)
                .attr("y", (d, i) => i*23 + 20)
                .attr("fill", "#cbcbcb")
                .attr("font-size", 12)
                .text(d => d.type)
        );
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

function lineType() {
    return(
        <div className="layout_row">
            <span className="layout_item key">
                Line
            </span>
            <span className="layout_item"></span>
            <div id={lineLegendId}></div>
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
                {shapeType()}
                {networkChart? lineType(): <></>}
                {riskType()}
            </div>
        </div>
    )
}

export default function View({id, viewVariable, updateViewVariable, viewHoverValue, symbolHoverValue}) {

    const networkChart = id === "network-chart";

    colorScale = Global.createColorScale(viewVariable);

    const handleChange = (event) => {
        let newView = (Object.keys(Global.viewVariables).find((c) => Global.viewVariables[c].label === event.target.value));
        updateViewVariable(newView)
    }

    // Initiate legends
    useEffect(() => {
        initShapeLegend(networkChart, symbolHoverValue);
        initLineLegend();
        initRiskLegend(viewVariable, viewHoverValue, networkChart);
    }, []);

    // Update the shape legend
    useEffect(() => {
        updateShapeLegend(networkChart, symbolHoverValue);
    }, [symbolHoverValue]);

    // Update the risk legend
    useEffect(() => {
        updateRiskLegend(viewVariable, viewHoverValue, networkChart);
    }, [viewVariable, viewHoverValue]);

    return(
        <ViewStyles>
            <div>View</div>
            <div className="inner">
                <InspectHTML/>
                {viewInfo(networkChart)}
                <Form variant="outlined" size="small">
                    <StyledSelect
                        labelId="view-select-label"
                        id="view-select"
                        displayEmpty
                        value={Global.viewVariables[viewVariable].label}
                        onChange={handleChange}
                    >
                        {
                        Object.keys(Global.viewVariables).map((viewBy) => {
                            let variable = Global.viewVariables[viewBy];
                            return (
                                <MenuItem key={`view-key-${variable.id}`} value={variable.label}>{variable.label}</MenuItem>
                            )
                        })}
                    </StyledSelect>
                    <div id={riskLegendId}></div>
                </Form>
            </div>
        </ViewStyles>
    )
}
