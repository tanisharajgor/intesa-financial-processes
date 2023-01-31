import * as d3 from 'd3';
import { useEffect, useState } from "react";
import lu from '../data/processed/nested/lu.json';
import { palette } from '../utils/global';

const id = "Filter-Process";

const rScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([5, 4, 3, 2])

const opacityScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([.4, .4, .4, 1])

// Tooltip
function renderTooltip(node) {

    let tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip")
        .attr("z-index", 500);

        node.on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        let x = e.layerX + 20;
        let y = e.layerY - 10;

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`Level ${d.data.treeLevel}<br><b>${d.data.name}</b>`);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");
        node.attr("opacity", 1);

        d3.selectAll('.Process-Node')
            .attr("stroke", "none"); 
    });
}

function clickProcess(updateLevel3ID) {

    d3.selectAll('.Process-Node').each(function (d, i) {
        d3.select(this)
            .on('click', (e, datum) => {
                updateLevel3ID(datum.data.id)

                var tooltip = d3.select(`#${id} .tooltip`);
                d3.select(`#${id} .tooltip`).remove();
                tooltip = tooltip.append("div").attr("class", "tooltip");
            })
    })
}

export default function FilterProcess({level3ID, updateLevel3ID}) {

    // contants
    const width = 375,
        height = 600;

    const levelDescr = lu["level3"].find((d) => d.id === level3ID).descr;

    const cluster = d3.cluster()
        .size([height, width - 100]);  // 100 is the margin I will have on the right side

    const hierarchyData = d3.hierarchy(lu["processes"]);

    // Give the data to this cluster layout:
    const root = d3.hierarchy(hierarchyData, function(d) {
        return d.children;
    });

    cluster(root);

    useEffect(() => {
    
        const svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Add the links between nodes:
        svg.selectAll('path')
            .data( root.descendants().slice(1) )
            .join('path')
            .attr("d", function(d) {
                return "M" + d.y + "," + d.x
                        + "C" + (d.parent.y + 50) + "," + d.x
                        + " " + (d.parent.y + 150) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                        + " " + d.parent.y + "," + d.parent.x;
                    })
            .style("fill", 'none')
            .attr("stroke", "#4e5155")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", .5)

        // Add a circle for each node.
        svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", function(d) {
                return `translate(${d.y},${d.x})`
            })
            .append("circle")
                .attr("r", d => rScale(d.data.data.treeLevel))
                .style("fill", "#69b3a2")
                .style("stroke-width", 2)
                // .attr("visibility", d => d.data.data.treeLevel == 0 ? "hidden" : "visible")
    }, [])

    useEffect(() => {
        const node = d3.selectAll(".Process-Node");
        clickProcess(updateLevel3ID);
        renderTooltip(node);
    })

    return(
        <div>
            <h4><span className='key'>Filter by Process:</span>
                <span className='spec'>{levelDescr}</span>
            </h4>
            <div id={id}></div>
        </div>
    )
}