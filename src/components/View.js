import { FormControl, Select, MenuItem } from "@material-ui/core";
import { riskVariables } from "../utils/global";
import * as d3 from 'd3';
import { useEffect } from "react";

// Initiates the legend svg and sets the non-changing attributes
function initiateLegend(variable, variableLookup) {
    const width = 216;
    let height = 100;
    let t = variableLookup[variable];

    const svg = d3.select("#legend")
        .append("svg")
        .attr('width', width)
        .attr('height', height)
        .append("g");

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
            .style("fill", "white")
    }
}

// Updates the legend attributes on variable change
function updateLegend(variable, variableLookup) {

    let t = variableLookup[variable];

    let svg = d3.select("#legend svg")

    d3.select("#legend svg g").remove();

    svg = svg.append("g")

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
            .style("fill", "white")

    }
}


export default function View({riskVariable, updateRiskVariable}) {

    const handleChange = (event) => {
        let newView = (Object.keys(riskVariables).find((c) => riskVariables[c].label === event.target.value))
        updateRiskVariable(newView)
    }

    useEffect(() => {
        initiateLegend(riskVariable, riskVariables);
    }, [])

    useEffect(() => {
        updateLegend(riskVariable, riskVariables);
    }, [riskVariable])

    return(
        <div className='View'>
            <h3>View by risk type</h3>
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
            </FormControl>
            <div id="legend"></div>
        </div>
    )
}