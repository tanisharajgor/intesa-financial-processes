import Navigation from "../components/Navigation";
import { riskVariables, createLegend, createColorScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';

export default function CirclePacking() {

    console.log(data)

    const margin = {top: 10, right: 10, bottom: 10, left: 10},
                width = 1000 - margin.left - margin.right,
                height = 1000 - margin.top - margin.bottom;

    const label = d => d.name;
    const padding = 3;
    const stroke = "#bbb";
    const strokeWidth = 1;
    const strokeOpacity = 1;
    const fill = "grey";
    const fillOpacity = 1;
    var riskVariable = "controlTypeMode";

    // Set- scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([.05, .15, .2, .3, 1.00]);

    createLegend(riskVariable, riskVariables);

    return(
        <div className="circle-packing">
            <h3>Circle packing</h3>
            <Navigation/>
            <div className="container">
                <div id="chart"></div>
                <div id="legend"></div>
            </div>
        </div>
    )
}