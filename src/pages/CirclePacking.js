import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";

const id = "circle-packing-chart";

export default function CirclePacking() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);

    const height = window.innerHeight;
    const width = window.innerWidth;

    const root = d3.pack()
        .size([width, height])
        .padding(1)
        (d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value));

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue))

    useEffect(() => {
        circlePackingDiagram.current.init(id);
        circlePackingDiagram.current.draw(viewVariable);
    }, [])

    const onViewVariableChange = useCallback((updatedView) => {
        circlePackingDiagram.current.updateDraw(updatedView)

        let inspect = d3.select(".Inspect");
        inspectHierarchySummary(inspect, data);
        updateViewVariable(updatedView)
    }, [])

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <Main viewVariable={viewVariable} updateViewVariable={onViewVariableChange} viewHoverValue={viewHoverValue} id={id} controls={circlePackingDiagram.current.getControls()}/>
            </div>
        </div>
    )
}
