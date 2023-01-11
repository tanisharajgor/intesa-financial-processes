import * as d3 from 'd3';

export const riskVariables = {
    "controlTypeMode": {
        values: ["NA", "Manual", "Semi-automatic", "Automatic"],
        colors: ["#ADADAD", "#FF0000", "#FFC41F", "#0071BC"]
    },
    "financialDisclosureRisk": {
        values: ["NA", "True", "False"],
        colors: ["#ADADAD", "#FF0000", "#0071BC"]
    }
}

export function createLegend(variable, variableLookup) {
    const width = 216;
    let height = 100;
    let t = variableLookup[variable]

    const svg = d3.select("#legend")
        .append("svg")
        .attr('width', width)
        .attr('height', height);

    for (let i in t.values) {

        svg
            .append("circle")
            .attr('cx', 10)
            .attr('cy', ((d) => 20 + i*20))
            .attr('r', 5)
            .attr('fill', ((d) => t.colors[i]));

        svg
            .append("text")
            .attr("x", 20)
            .attr("y", ((d) => 25 + i*20))
            .text(((d) => t.values[i]))

    }
}

// Creates a colorScales for different types of variables
export function createColorScale(variable, variableLookup) {
    // yellow: #FFC41F
    // orange: #FF831D

    let t = variableLookup[variable]

    const colorScale = d3.scaleOrdinal()
        .domain(t.values)
        .range(t.colors);

    return colorScale
}
