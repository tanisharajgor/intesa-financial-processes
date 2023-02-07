import * as d3 from 'd3';

export const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', 
'#e377c2', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', 
'#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'];

export const naColor = "#ADADAD";

export const riskVariables = {
    "controlTypeMode": {
        label: "Control type mode",
        values: ["Manual", "Semi-automatic", "Automatic"],
        labels: ["Manual", "Semi-automatic", "Automatic"],
        colors: ["#FF0000", "#FFC41F", "#0071BC"]
    },
    "financialDisclosureRiskAny": {
        label: "Financial disclosure risk",
        labels: ["Yes", "No"],
        values: [true, false],
        colors: ["#FF0000", "#0071BC"]
    },
    "controlPeriodocityMode": {
        label: "Periodocity",
        values: [3650, 365, 182, 91, 30, 7, 1, .1],
        labels: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event'],
        colors: palette
    }
}

// Creates a colorScales for different types of variables
// yellow: #FFC41F
// orange: #FF831D
export function createColorScale(variable, variableLookup) {

    let t = variableLookup[variable]
    if (variable === "controlPeriodocityMode") {

        var scale = d3.scaleSequentialLog(d3.interpolate("orange", "purple"))
            .domain(d3.extent(t.values));

        return scale

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
