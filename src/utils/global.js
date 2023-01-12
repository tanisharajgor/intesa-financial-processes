import * as d3 from 'd3';

export const riskVariables = {
    "controlTypeMode": {
        label: "Control type mode",
        values: ["NA", "Manual", "Semi-automatic", "Automatic"],
        colors: ["#ADADAD", "#FF0000", "#FFC41F", "#0071BC"]
    },
    "financialDisclosureRiskAny": {
        label: "Financial disclosure risk",
        values: ["NA", true, false],
        colors: ["#ADADAD", "#FF0000", "#0071BC"]
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
        .range([.05, .15, .2, .3, 1.00]);

    return scale;
}
