import * as d3 from 'd3';

export const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', 
'#e377c2', '#bcbd22', '#ADADAD'];

export const riskVariables = {
    "controlTypeMode": {
        label: "Control type mode",
        values: ["Manual", "Semi-automatic", "Automatic", "NA"],
        colors: ["#FF0000", "#FFC41F", "#0071BC", "#ADADAD"]
    },
    "financialDisclosureRiskAny": {
        label: "Financial disclosure risk",
        values: [true, false, "NA"],
        colors: ["#FF0000", "#0071BC", "#ADADAD"]
    },
    "controlPeriodocityMode": {
        label: "Periodocity",
        values: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event', 'NA'],
        colors: palette
    }
}

// Creates a colorScales for different types of variables
// yellow: #FFC41F
// orange: #FF831D
export function createColorScale(variable, variableLookup) {

    let t = variableLookup[variable]

    const scale = d3.scaleOrdinal()
        .domain(t.values)
        .range(t.colors);

    return scale;
}

export function createOpacityScale() {

    const scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([.05, .2, .3, .3, 1.00]);

    return scale;
}
