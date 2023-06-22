import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";
import { QueryMenu } from "cfd-react-components";
import FilterType from "../components/FilterType";
import InspectProcesses from "../components/InspectProcesses";

import { activityTypeValues } from "../utils/global";
import Description from "../components/Description";

const id = "circle-packing-chart";

export default function CirclePacking() {

    // View highlight states
    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined); 

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(activityTypeValues);
    const [selectedLevel1, updateSelectedLevel1] = useState(-1);
    const [selectedLevel2, updateSelectedLevel2] = useState(-1);
    const [selectedLevel3, updateSelectedLevel3] = useState(-1);
    const [selectedChapter, updateSelectedChapter] = useState(-1);

    const root = d3.pack()
        .size([window.innerWidth, window.innerHeight])
        .padding(1)
        (d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value));

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue));

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
        circlePackingDiagram.current.updateDraw(viewVariable, selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter);
        inspectHierarchySummary(data);
    }, [viewVariable, selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <Description>
                      <h4>Ecosystem</h4>
                      <p>Click on the circles to zoom into the process visualization.</p>
                    </Description>
                    <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={activityTypeValues} label="Inspect by Activity Type" />
                    <InspectProcesses selectedLevel1={selectedLevel1} updateSelectedLevel1={updateSelectedLevel1} selectedLevel2={selectedLevel2} updateSelectedLevel2={updateSelectedLevel2} selectedLevel3={selectedLevel3} updateSelectedLevel3={updateSelectedLevel3} selectedChapter={selectedChapter} updateSelectedChapter={updateSelectedChapter}/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} id={id} controls={circlePackingDiagram.current.getControls()}/>
            </div>
        </div>
    )
}
