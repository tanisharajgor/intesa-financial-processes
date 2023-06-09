import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";
import { QueryMenu } from "cfd-react-components";
import Description from "../components/Description";

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
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <Description text={`
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        `}/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={onViewVariableChange} viewHoverValue={viewHoverValue} id={id} controls={circlePackingDiagram.current.getControls()}/>
            </div>
        </div>
    )
}
