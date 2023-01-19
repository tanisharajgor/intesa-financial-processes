import Main from "../components/Main";
import Navigation from "../components/Navigation";
import { StylesProvider } from "@material-ui/core/styles";
import { useEffect, useState } from "react";
import graph from "../data/processed/nested/network.json";
import * as d3 from 'd3';

const id = "network-chart";

export default function Network() {

    const [riskVariable, updateRiskVariable] = useState("controlTypeMode");

    let data = graph[0];

    useEffect(() => {

        var width = 800;
        var height = 600;
        var svg = d3.select(`#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // const rScale = d3.scaleLinear()
        //     .domain([d3.extent(data.nodes, function(d) {return d.n })])
        //     .range([3, 7]);

        const colorScale = d3.scaleLinear()
            .domain(["actor", "activity"])
            .range(["#0000FF", "#FF0000"])

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        var link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", "grey");

        var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(data.nodes)
            .enter().append("circle")
            .attr("fill", ((d) => colorScale(d.group)))
            // .attr("r", ((d) =>rScale(d.n)))
            .attr("r", 3);

        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);

        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
    }, [])

    return(
        <StylesProvider injectFirst>
            <div className="Content">
                <Navigation/>
                <div className="Query" id="FilterMenu"></div>
                <Main riskVariable={riskVariable} updateRiskVariable={updateRiskVariable} id={id}/>                
            </div>
        </StylesProvider>
    )
}
