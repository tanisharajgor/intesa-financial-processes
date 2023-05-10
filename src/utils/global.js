import * as d3 from 'd3';

export const palette = [0x1f77b4, 0xff7f0e, 0x2ca02c, 0xd62728, 0x9467bd, 0x8c564b, 
    0xe377c2, 0xbcbd22, 0x17becf, 0xaec7e8, 0xffbb78, 0x98df8a, 0xff9896, 
    0xc5b0d5, 0xc49c94, 0xf7b6d2, 0xc7c7c7, 0xdbdb8d, 0x9edae5];

export const naColor = 0xADADAD;
const missingColor = 0x4B4B4B;

export const viewVariables = {

    // "financialDisclosureRiskAny": {
    //     label: "Financial disclosure risk",
    //     labels: ["Yes", "No", "Missing", "NA"],
    //     id: [6, 7, 8, 9],
    //     values: [true, false, "Missing", "NA"],
    //     colors: ["#FF0000", "#0071BC", missingColor, naColor]
    // },
    // ,
    // "nControl": {
    //     label: "Number of controls",
    //     labels: [0, 1],
    //     id: [25, 26],
    //     values: [0, 1],
    //     colors: ["#FF0000", "#0071BC"],
    //     group: "Risk"
    // },
    // "nRisk": {
    //     label: "Number of risks",
    //     labels: [0, 1, 2],
    //     id: [27, 28, 29],
    //     values: [0, 1, 2],
    //     colors: ["#0071BC", "#FFC41F", "#FF0000"],
    //     group: "Activity"
    // },
    "riskType": {
        label: "Risk type",
        labels: ['Financial Information Risk', 'Legal and non-compliance', 'Information and Communication Technology risk', 'Other risks (operational)', 'Missing', 'NA'],
        id: [20, 21, 22, 23, 24],
        values: ['Financial Information Risk (ex 262/2005)', 'Legal and non-compliance', 'Information and Communication Technology risk', 'Other risks (operational)', 'Missing', 'NA'],
        colors: [0xf27800, 0x35b7ad, 0xedb900, 0xb04492, missingColor, naColor],
        viewId: "Risk"
    },
    "controlType": {
        label: "Control type",
        values: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
        id: [1, 2, 3, 4, 5],
        labels: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
        colors: [0xFF0000, 0xFFC41F, 0x0071BC, missingColor, naColor],
        viewId: "Control activity"
    },
    "controlPeriodocity": {
        label: "Control periodicity",
        values: [3650, 365, 182, 91, 30, 7, 1, .1, 'Missing', 'NA'],
        id: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        labels: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event', 'Missing', 'NA'],
        viewId: "Control activity"
    }
}

// Creates a colorScales for different types of variables
// yellow: #FFC41F
// orange: #FF831D
export function createColorScale(variable) {

    let t = viewVariables[variable];

    if (variable === "controlPeriodocity") {

        var scale = d3.scaleSequentialLog(d3.interpolate("orange", "purple"))
            .domain(d3.extent(t.values));

        let interp = [3650, 365, 182, 91, 30, 7, 1, .1].map(d => scale(d))
        interp.push('#4B4B4B')
        interp.push('#ADADAD')

        var s = d3.scaleOrdinal()
            .domain(t.values)
            .range(interp)

        return s;

    } else {
        const hexColors = t.colors.map(col => `#${col.toString(16)}`)

        const scale = d3.scaleOrdinal()
            .domain(t.values)
            .range(hexColors);

        return scale;
    }
}

export function applyColorScale(d, viewVariable) {

    let colorScale = createColorScale(viewVariable);

    return d.viewType[viewVariable] === "NA" || d.viewType[viewVariable] === undefined? naColor : colorScale(d.viewType[viewVariable]);   
}

export function applyStrokeScaleWeight(d, viewVariable) {

    console.log(viewVariable)
    console.log(d)

    if (Object.keys(viewVariables).includes(viewVariable)) {


        return 0;
        // if (d.riskType[viewVariable] === "Missing") {
        //     return 2;
        // } else {
        //     return 0;
        // }

    } else {
        return 0;
    }
}

export function applyColorScaleMode(d, viewVariable, colorScale) {
    return d[viewVariable] === "NA" ? naColor : colorScale(d[viewVariable]);
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
    .range([5, 30]);

export const actorTypeValues = ["Organizational unit", "Position", "Person", "Missing", "External Organizational unit"];
export const activityTypeValues = ["Process activity", "Control activity", "Common process activity", "System activity"];

// Symbol Scale for D3
export function symbolScaleD3(node) {

    if (node.viewId === "Actor") {
        return d3.symbolSquare;
    } else if (node.viewId === "Control activity") {
        return d3.symbolStar;
    } else if(node.viewId === "Other activity") {
        return d3.symbolCircle;
    } else if (node.viewId === "Risk") {
        return d3.symbolTriangle;
    } else {
        return d3.symbolDiamond;
    }
}

// Symbol Scale for Pixi
export function symbolScalePixi(node, rSize) {

    switch(node.viewId) {
        case "Other activity":
          node.gfx.drawCircle(0, 0, rSize*.8);
          node.shape = "circle";
          break;
        case "Actor":
          node.gfx.drawRect(-rSize/2, -rSize/2, rSize, rSize);
          node.shape = "square";
          break;
        case "Control activity":
          node.gfx.drawStar(0, 0, 5, rSize);
          node.shape = "star";
          break;
        case "Risk":
          node.gfx.drawRegularPolygon(0, 0, rSize, 3);
          node.shape = "triangle";
          break;
        default:
          node.gfx.drawRegularPolygon(0, 0, rSize, 4, 1.7);
          node.shape = "diamond";
          break;
    }
}

// Filters source ids and returns corresponding target ids
export function filterLinksSourceToTarget(data, ids) {

    let links = data.filter(d => d.source.id === undefined ? ids.includes(d.source): ids.includes(d.source.id))
        .map(d => d.target.id === undefined ? d.target: d.target.id);
    links = [...new Set(links)];

    return links;
}

// Filters targets ids and returns corresponding source ids
export function filterLinksTargetToSource(data, ids) {

    let links = data.filter(d => d.target.id === undefined ? ids.includes(d.target): ids.includes(d.target.id))
        .map(d => d.source.id === undefined ? d.source: d.source.id);
    links = [...new Set(links)];

    return links;
}
