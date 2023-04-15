import { riskVariables, createLabelScale } from "../utils/global";
import * as d3 from 'd3';

const treeLevelScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3, 4])
    .range(["root", "Process 1", "Process 2", "Process 3", "Activity"])

export function inspectNetworkSummary(inspect, data) {

    let nActors = data.nodes.filter(d => d.group === "Actor").length;
    let nActivities = data.nodes.filter(d => d.group === "Activity").length;

    inspect.select(".value1 .key").text("Number of actors: ");
    inspect.select(".value1 .value").text(`${nActors}`);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${nActivities}`);
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

    inspect.select(".value1 .key").text("Processes showing: ");
    inspect.select(".value1 .value").text(`1, 2, 3`);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${d3.hierarchy(data).sum(d => d.children ? 0: 1).value}`);
    inspect.select(".value3 .key").text("");
    inspect.select(".value3 .value").text(" ");

}

export function inspectHierarchyDetail(inspect, d, viewVariable) {

    let rs = d.data.riskStatus[viewVariable];
    const labelScale = createLabelScale(viewVariable);

    inspect.style("display", "inline-block");
    inspect.style("visibility", "visible")
    inspect.select(".value1 .key").text(`${treeLevelScale(d.data.treeLevel)}: `);
    inspect.select(".value1 .value").text(" " + d.data.name);
    inspect.select(".value2 .key").text("Number of activities: ");
    inspect.select(".value2 .value").text(`${d.sum(d => d.children ? 0: 1).value}`);
    inspect.select(".value3 .key").text(`${riskVariables[viewVariable].label}: `);
    inspect.select(".value3 .value").text(" " + labelScale(rs));
}

export function inspectCirclePacking(data, viewVariable, updateRiskHoverValue) {

    let inspect = d3.select(".Inspect");
    inspectHierarchySummary(inspect, data);

    d3.selectAll("circle").on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);
        thisCircle
            .attr("stroke", "grey")
            .attr("stroke-width", 2);

        inspectHierarchyDetail(inspect, d, viewVariable);
        updateRiskHoverValue(d.data.riskStatus[viewVariable]);

    }).on("mouseout", function() {

        inspectHierarchySummary(inspect, data);
        updateRiskHoverValue(undefined);

        d3.selectAll('circle')
            .attr("stroke-width", .5)
            .attr("stroke", "grey"); 
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
                </div>
            </div>
        </div>
    )
}
