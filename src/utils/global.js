import * as d3 from 'd3';

export const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', 
'#e377c2', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', 
'#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'];

export const naColor = "#ADADAD";
const missingColor = "#4B4B4B";

export const riskVariables = {
    "controlTypeMode": {
        label: "Control type mode",
        values: ["Manual", "Semi-automatic", "Automatic", "Missing"],
        labels: ["Manual", "Semi-automatic", "Automatic", "Missing"],
        colors: ["#FF0000", "#FFC41F", "#0071BC", missingColor]
    },
    "financialDisclosureRiskAny": {
        label: "Financial disclosure risk",
        labels: ["Yes", "No", "Missing"],
        values: [true, false, "Missing"],
        colors: ["#FF0000", "#0071BC", missingColor]
    },
    "controlPeriodocityMode": {
        label: "Periodicity",
        values: [3650, 365, 182, 91, 30, 7, 1, .1, 'Missing'],
        labels: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event', 'Missing']
    }
}

// Creates a colorScales for different types of variables
// yellow: #FFC41F
// orange: #FF831D
export function createColorScale(variable, variableLookup) {

    let t = variableLookup[variable]
    if (variable === "controlPeriodocityMode") {

        console.log(d3.extent(t.values))

        var scale = d3.scaleSequentialLog(d3.interpolate("orange", "purple"))
            .domain(d3.extent(t.values));

        let interp = [3650, 365, 182, 91, 30, 7, 1, .1].map(d => scale(d))
        interp.push(missingColor)

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

export function applyColorScale(d, riskVariable, colorScale) {

    return d[riskVariable] === undefined || d[riskVariable] === "NA" ? naColor : colorScale(d[riskVariable])

}

export function createOpacityScale() {

    const scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([.05, .2, .3, .3, 1.00]);

    return scale;
}

export function createLabelScale(riskVariable) {

    const scale = d3.scaleOrdinal()
        .domain(riskVariables[riskVariable].values)
        .range(riskVariables[riskVariable].labels);

    return scale;
}


export function hover(data, hoverID, riskVariable) {

    if (data.children === undefined) {
        let rStatus = data.find((d) => d.id === hoverID);

        if (rStatus !== undefined) {
    
            if (rStatus.riskStatus[riskVariable] === undefined) {
                return "NA";
            } else {
                return rStatus.riskStatus[riskVariable];
            }
        } else {
            return undefined;
        }
    }
}
