import * as d3 from 'd3';
import { useEffect, useState } from "react";
import lu from '../data/processed/nested/lu.json';
import { palette } from '../utils/global';

const id = "Filter-Process";

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

export default function FilterProcess({updateLevel3ID}) {

    const radToDeg = (radians) => {
        return radians * (180 / Math.PI);
    }

    // contants
    const width = 375,
        height = 375,
        radius = width * 0.5,
        outerMargin = width * 0.15;

    // configure layout generator
    const tree = d3.cluster()
        .size([2 * Math.PI, radius - outerMargin]); // x = angle, y = r

    // create instance of d3 hierarchy
    const hierarchyData = d3.hierarchy(lu["processes"]);

    // apply cluster layout
    const root = tree(hierarchyData);

    // console.log(root.children.length)

    let color = d3.scaleOrdinal()
        .domain([0, root.children.length - 1])
        .range(palette);

    root.children.forEach((child, i) => child.index = i);

    useEffect(() => {
    
        const svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const plot = svg.append("g")
            .attr("transform", `translate(${160},${160})`)
            .attr('id', 'Process-Plot');

        const link = plot.append("g")
            .attr("fill", "none")
            .attr("stroke", "#4e5155")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", .5)
            .selectAll("path")
            .data(root.links())
            .enter()
            .append("path")
            .attr("d", (d3.linkRadial())
                .angle(d => d.x)
                .radius(d => d.y));

        const node = plot
            .append("g")
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("g")
            .data(root.descendants().reverse())
            .enter()
            .append("g")
            .attr("transform", d => `rotate(${radToDeg(d.x) - 90}) translate(${d.y},0)`);

        node.append("circle")
            .attr("r", d => d.children ? 3 : 2)
            .attr("visibility", d => d.data.treeLevel == 0 ? "hidden" : "visible")
            .attr('id', d => d.data.descr)
            .attr('class', 'Process-Node')
            .attr("fill", palette ? d => color(d.ancestors().reverse()[1]?.index) : "#ccc")

    }, [])

    useEffect(() => {
        const node = d3.selectAll(".Process-Node");
        clickProcess(updateLevel3ID);
        renderTooltip(node);
    })

    return(

        <div>
            <h4><span className='key'>Filter by Process</span></h4>
            <div id={id}></div>
        </div>
    )
}