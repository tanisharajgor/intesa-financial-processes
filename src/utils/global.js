import * as d3 from 'd3';

export const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', 
'#e377c2', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', 
'#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'];

export const naColor = "#ADADAD";
const missingColor = "#4B4B4B";

export const viewVariables = {

    "riskType": {
        // "financialDisclosureRiskAny": {
        //     label: "Financial disclosure risk",
        //     labels: ["Yes", "No", "Missing", "NA"],
        //     id: [6, 7, 8, 9],
        //     values: [true, false, "Missing", "NA"],
        //     colors: ["#FF0000", "#0071BC", missingColor, naColor]
        // },
        "riskType": {
            label: "Risk type",
            labels: ['Financial Information Risk', 'Legal and non-compliance', 'Information and Communication Technology risk', 'Other risks (operational)', 'Missing', 'NA'],
            id: [20, 21, 22, 23, 24],
            values: ['Financial Information Risk (ex 262/2005)', 'Legal and non-compliance', 'Information and Communication Technology risk', 'Other risks (operational)', 'Missing', 'NA'],
            colors: ['#ff7f0e', '#9467bd', '#2ca02c', '#e377c2', missingColor, naColor],
            group: "Risk"
        },
        "nControl": {
            label: "Number of controls",
            labels: [0, 1],
            id: [25, 26],
            values: [0, 1],
            colors: ["#FF0000", "#0071BC"],
            group: "Risk"
        }
    },
    "controlType": {
        "controlType": {
            label: "Control type",
            values: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
            id: [1, 2, 3, 4, 5],
            labels: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
            colors: ["#FF0000", "#FFC41F", "#0071BC", missingColor, naColor],
            group: "Control"
        },
        "controlPeriodocity": {
            label: "Control periodicity",
            values: [3650, 365, 182, 91, 30, 7, 1, .1, 'Missing', 'NA'],
            id: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
            labels: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event', 'Missing', 'NA'],
            group: "Control"
        }
    }
}

export const viewVars = Object.keys(viewVariables['riskType']).concat(Object.keys(viewVariables['controlType']));
export const viewObj = {...viewVariables['riskType'], ...viewVariables['controlType']}

// Creates a colorScales for different types of variables
// yellow: #FFC41F
// orange: #FF831D
export function createColorScale(variable) {

    let t = viewObj[variable];

    if (variable === "controlPeriodocity") {

        var scale = d3.scaleSequentialLog(d3.interpolate("orange", "purple"))
            .domain(d3.extent(t.values));

        let interp = [3650, 365, 182, 91, 30, 7, 1, .1].map(d => scale(d))
        interp.push(missingColor)
        interp.push(naColor)

        var s = d3.scaleOrdinal()
            .domain(t.values)
            .range(interp)

        return s

    } else {

        const scale = d3.scaleOrdinal()
            .domain(t.values)
            .range(t.colors);

        return scale
    }
}

export function applyColorScale(d, viewVariable, colorScale) {

    if (d.group === "Risk") {

        if (Object.keys(viewVariables['riskType']).includes(viewVariable)) {
            return d[viewVariable] === "NA" ? naColor : colorScale(d['riskType'][viewVariable]);
        } else {
            return naColor;
        }
    } else if (d.group === "Control") {

        if (Object.keys(viewVariables['controlType']).includes(viewVariable)) {
            return d[viewVariable] === "NA" ? naColor : colorScale(d['controlType'][viewVariable]);
        } else {
            return naColor;
        }
    } else {
        return naColor;
    }
}

export function createOpacityScale() {

    const scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([.05, .2, .3, .3, 1.00]);

    return scale;
}

export function createLabelScale(viewVariable) {

    const scale = d3.scaleOrdinal()
        .domain(viewVariables[viewVariable].values)
        .range(viewVariables[viewVariable].labels);

    return scale;
}

// import graph from "../data/processed/nested/network2.json";
// let g = graph.map(d => d.nodes.filter(d => d.group === "Actor")).flat(1);

export const rScale = d3.scaleSqrt()
    // .domain(d3.extent(g, (d => d.nActivities)))
    .domain([1, 300])
    .range([20, 400]);

export const actorTypeValues = ["Organizational unit", "Position", "Person", "Missing", "External Organizational unit"];
export const activityTypeValues = ["Process activity", "Control activity", "Common process activity", "System activity"];

export function symbolType(d) {

    if (d === "Actor") {
        return d3.symbolCircle;
    } else if(d === "Activity") {
        return d3.symbolSquare;
    } else if (d === "Risk") {
        return d3.symbolTriangle;
    } else if (d === "Control") {
        return d3.symbolStar;
    } else {
        return d3.symbolDiamond;
    }
}
