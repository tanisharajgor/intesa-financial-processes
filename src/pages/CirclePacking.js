import Navigation from "../components/Navigation";
import { riskVariables, createLegend, createColorScale } from "../utils/global";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';

function renderTooltip(riskVariable, circle) {
    
    // Tooltip
    let tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

        d3.selectAll("circle").on("mouseover", function(e, d) {

            let thisCircle = d3.select(this);
            let x = e.layerX + 20;
            let y = e.layerY - 10;

            // console.log(e)

            tooltip.style("visibility", "visible")
                .style("top", `${y}px`)
                .style("left", `${x}px`)
                .html(`Process: <b>${d.data.name}</b><br>Control type: <b>${d.data.riskStatus[riskVariable]}</b>`);

            thisCircle
                .attr("stroke", "grey")
                .attr("stroke-width", 2);

            d3.select(this).attr("opacity", 1).raise();

        }).on("mouseout", function() {

            tooltip.style("visibility", "hidden");
            circle.attr("opacity", 1);

            d3.selectAll('circle')
                .attr("stroke-width", .5)
                .attr("stroke", "grey"); 
        });

}


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
    var tooltip;

    // Set- scales
    const colorScale = createColorScale(riskVariable, riskVariables);
    const opacityScale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([.05, .15, .2, .3, 1.00]);

    createLegend(riskVariable, riskVariables);


    const root = d3.hierarchy(data).sum(function(d) { return 1 });
                const descendants = root.descendants();
                const leaves = descendants.filter(d => !d.children);
                leaves.forEach((d, i) => d.index = i);
                const L = label == null ? null : leaves.map(d => label(d.data, d));

                root.sort((a, b) => d3.descending(a.value, b.value));

                const svg = d3.select("#chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform",
                            `translate(${margin.left}, ${margin.top})`)
                    .attr("font-family", "sans-serif")
                    .attr("font-size", 10);

                // Compute the layout.
                d3.pack()
                    .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
                    .padding(padding)
                    (root);
                
                const node = svg.selectAll("g")
                    .data(descendants)
                    .join("g")
                    .attr("transform", d => `translate(${d.x},${d.y})`);

                console.log(descendants)

                const circle = node.append("circle")
                    .attr("fill", d => d.children ? "#fff" : fill)
                    .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
                    .attr("r", d => d.r)
                    .attr("fill", d => d.data.riskStatus[riskVariable] === undefined ? "#fff" : colorScale(d.data.riskStatus[riskVariable]))
                    .attr("stroke-width", .5)
                    .attr("stroke", "grey")
                    .attr("visibility", d => d.data.treeLevel == 0 ? "hidden": "visible")

                // if (L) {
                //     // A unique identifier for clip paths (to avoid conflicts).
                //     const uid = `O-${Math.random().toString(16).slice(2)}`;

                //     const leaf = node
                //         .filter(d => !d.children && d.r > 10 && L[d.index] != null);

                //     leaf.append("clipPath")
                //         .attr("id", d => `${uid}-clip-${d.index}`)
                //         .append("circle")
                //         .attr("r", d => d.r)
                //         .attr("fill", function(d) { return console.log(d)})


                //     leaf.append("text")
                //         .attr("clip-path", d => `url(${new URL(`#${uid}-clip-${d.index}`, location)})`)
                //         .selectAll("tspan")
                //         .data(d => `${L[d.index]}`.split(/\n/g))
                //         .join("tspan")
                //         .attr("x", 0)
                //         .attr("y", (d, i, D) => `${(i - D.length / 2) + 0.85}em`)
                //         .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
                //         .text(d => d);
                // }

                renderTooltip(riskVariable, circle);

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