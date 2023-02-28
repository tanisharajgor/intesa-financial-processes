import { riskVariables, createLabelScale } from "../utils/global";
import { symbolScale } from "./View";
import * as d3 from 'd3';

const treeLevelScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4])
    .range(["root", "Process 1", "Process 2", "Process 3", "Activity"])

const linkColor = "#373d44";

export function inspectNetworkSummary(inspect, data) {

    let nActors = data.nodes.filter(d => d.group === "Actor").length;
    let nActivities = data.nodes.filter(d => d.group === "Activity").length;

    inspect.select(".value1 .key").text("Number of actors: ");
    inspect.select(".value1 .value").text(`${nActors}`);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${nActivities}`);
    // inspect.select(".value3 .layout_row").style("margin-top", 0);
    inspect.select(".value3 .key").text("");
    inspect.select(".value3 .value").text(" ");
}

export function inspectNetworkDetail(inspect, d, b) {

    inspect.select(".value1 .key").text(`${d.group}: `);
    inspect.select(".value1 .value").text(" " + d.name);
    inspect.select(".value2 .key").text("Type: ");
    inspect.select(".value2 .value").text(" " + d.type);
    // inspect.select(".connections .key").text(" " + d.group === "Activity"? "# activities": "# actors");
    inspect.select(".value3 .key").text("Number of connections: ");
    inspect.select(".value3 .value").text(" " + b.length);
}

export function inspectHierarchySummary(inspect, data) {

    console.log(data.children)
    // let nActors = data.nodes.filter(d => d.group === "Actor").length;
    // let nActivities = data.nodes.filter(d => d.group === "Activity").length;
    let nActivities = 0;

    inspect.select(".value1 .key").text("Processes showing: ");
    inspect.select(".value1 .value").text(`1, 2, 3`);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${nActivities}`);
    inspect.select(".value3 .key").text("");
    inspect.select(".value3 .value").text(" ");
    // inspect.select(".value4 .key").text("");
    // inspect.select(".value4 .value").text(" ");

}

export function inspectHierarchyDetail(inspect, data, d, riskVariable) {

    console.log(d.data)

    let rs = d.data.riskStatus[riskVariable];
    const labelScale = createLabelScale(riskVariable);
    let nActivities = 0;

    inspect.style("display", "inline-block");
    inspect.style("visibility", "visible")
    inspect.select(".value1 .key").text(`${treeLevelScale(d.data.treeLevel)}: `);
    inspect.select(".value1 .value").text(" " + d.data.name);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${nActivities}`);
    inspect.select(".value3 .key").text(`${riskVariables[riskVariable].label}: `);
    inspect.select(".value3 .value").text(" " + labelScale(rs));
}

export function inspectCirclePacking(data, riskVariable, updateRiskHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectHierarchySummary(inspect, data);

    d3.selectAll("circle").on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        thisCircle
            .attr("stroke", "grey")
            .attr("stroke-width", 2);

        inspectHierarchyDetail(inspect, data, d, riskVariable);
        updateRiskHoverValue(d.data.riskStatus[riskVariable]);

    }).on("mouseout", function() {

        inspectHierarchySummary(inspect, data);
        updateRiskHoverValue(undefined);

        d3.selectAll('circle')
            .attr("stroke-width", .5)
            .attr("stroke", "grey"); 
    });
}

export function inspectTreeMap(data, riskVariable, updateRiskHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectHierarchySummary(inspect, data);

    d3.selectAll("rect")
        .on("mouseover", function(e, d) {

            let thisRect = d3.select(this);
            thisRect
                .attr("stroke", "grey")
                .attr("stroke-width", 2);

            inspectHierarchyDetail(inspect, data, d, riskVariable);
            updateRiskHoverValue(d.data.riskStatus[riskVariable]);

        }).on("mouseout", function() {

            inspectHierarchySummary(inspect, data);

            d3.selectAll("rect")
                .attr("opacity", 1)
                .attr("stroke", "none");

            updateRiskHoverValue(undefined);
        });
}

/*Creates the inspect html dom object*/
export function InspectHTML() {

    return (
        <div className="Inspect">
            <div className="inner">
                <div className="layout_group inline">
                    <div className="value1 layout_row">
                        <span className="layout_item key"></span>
                        <span className="layout_item value"></span>
                    </div>
                    <div className="value2 layout_row">
                        <span className="layout_item key"></span>
                        <span className="layout_item value"></span>
                    </div>
                    <div className="value3 layout_row">
                        <span className="layout_item key"></span>
                        <span className="layout_item value"></span>
                    </div>
                    <div className="value4 layout_row">
                        <span className="layout_item key"></span>
                        <span className="layout_item value"></span>
                    </div>
                </div>
            </div>
        </div>
    )
}
