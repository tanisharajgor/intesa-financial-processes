import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";
import { QueryMenu } from "cfd-react-components";
import FilterType from "../components/FilterType";

const id = "circle-packing-chart";

export default function CirclePacking() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    let typeValues = ["Process activity", "Control activity", "Common process activity", "System activity"];

    // Possible set of activities/actors to choose from
    const [possibleActivities, updateActivityType] = useState(typeValues);

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);

    // 
    const [filteredTypes, updateFilter] = useState([]);

    const height = window.innerHeight;
    const width = window.innerWidth;

    const root = d3.pack()
        .size([width, height])
        .padding(1)
        (d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value));

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue));

    useEffect(() => {
        circlePackingDiagram.current.init(id);
        circlePackingDiagram.current.draw(viewVariable, filteredTypes);
    }, [])

    const onViewVariableChange = useCallback((updatedView, filteredTypes) => {
        circlePackingDiagram.current.updateDraw(updatedView, filteredTypes)
        let inspect = d3.select(".Inspect");
        inspectHierarchySummary(inspect, data);
        updateViewVariable(updatedView);
    }, [filteredTypes]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <FilterType typesChecks={selectedActivities} updateSelection={updateActivities} typeValues={typeValues} filteredTypes={filteredTypes} updateFilter={updateFilter} label="Filter by Activity Type"/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={onViewVariableChange} viewHoverValue={viewHoverValue} id={id} controls={circlePackingDiagram.current.getControls()}/>
            </div>
        </div>
    )
}
