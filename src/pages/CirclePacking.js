import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";
import FilterType from "../components/FilterType";
import { activityTypeValues } from "../utils/global";
import Description from "../components/Description";
import { Menu } from "../component-styles/query-menu";
import { Content } from "../component-styles/content";
import Draggable from 'react-draggable';

const id = "circle-packing-chart";

export default function CirclePacking() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [isFullscreen, setFullscreen] = useState(false);

    // Possible set of activities/actors to choose from
    const possibleActivities = activityTypeValues;

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);

    const height = window.innerHeight;
    const width = window.innerWidth;

    const root = d3.pack()
        .size([width, height])
        .padding(1)
        (d3.hierarchy(data)
            .sum(d => 1)
            .sort((a, b) => b.value - a.value));

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue));

    const handleFullscreen = (e) => {
        setFullscreen(!isFullscreen);
    }

    useEffect(() => {
        circlePackingDiagram.current.init(id);
        circlePackingDiagram.current.draw(viewVariable);
    }, []);

    // const onViewVariableChange = useCallback((updatedView) => {
    //     circlePackingDiagram.current.updateDraw(updatedView)

    //     let inspect = d3.select(".Inspect");
    //     inspectHierarchySummary(inspect, data);
    //     updateViewVariable(updatedView)
    // }, [])

    useEffect(() => {
        circlePackingDiagram.current.updateDraw(viewVariable, selectedActivities);
        let inspect = d3.select(".Inspect");
        inspectHierarchySummary(inspect, data);
        // updateViewVariable(updatedView);
    }, [selectedActivities, viewVariable]);


    useEffect(() => {
        // Make the DIV element draggable:
        const dragElement = (elmnt) => {
            let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

            const dragMouseDown = (e) => {
                e = e || window.event;
                e.preventDefault();
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            };

            const elementDrag = (e) => {
                e = e || window.event;
                e.preventDefault();
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            };

            const closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            };
        };

        dragElement(document.getElementById("queryMenu"));
    }, []);

    return (
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <Draggable>
                    <Menu className="Query" id="FilterMenu" width={"22rem"}>
                        <Description>
                            <h4>Ecosystem</h4>
                            <p>Click on the circles to zoom into the process visualization.</p>
                        </Description>
                        <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Inspect by Activity Type" />
                    </Menu>
                </Draggable>
                <Main
                    viewVariable={viewVariable}
                    updateViewVariable={updateViewVariable}
                    viewHoverValue={viewHoverValue}
                    id={id}
                    controls={circlePackingDiagram.current.getControls()}
                    handleFullscreen={handleFullscreen}
                />
            </Content>
        </>
    )
}