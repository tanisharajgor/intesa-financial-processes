import Navigation from "../components/Navigation";
import Main from "../components/Main";
import data from "../data/processed/nested/processes.json";
import * as d3 from 'd3';
import { useCallback, useEffect, useRef, useState } from "react";
import { inspectHierarchySummary } from "../components/Inspect";
import { CirclePackingDiagram } from "../visualization/circle-packing-visualization";
import FilterType from "../components/FilterType";
import InspectTaxonomy from "../components/InspectTaxonomy";

import { activityTypeValues } from "../utils/global";
import Description from "../components/Description";
import { DragBar, Menu, MenuControls } from "../component-styles/query-menu";
import { Content } from "../component-styles/content";
import Draggable from 'react-draggable';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from '../components/Ripple.js';

const id = "circle-packing-chart";

export default function CirclePacking() {

    // View highlight states
    const [viewVariable, updateViewVariable] = useState("riskType");
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [isFullscreen, setFullscreen] = useState(false);
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

    // Possible set of activities/actors to choose from
    const possibleActivities = activityTypeValues;

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(activityTypeValues);
    const [selectedLevel1, updateSelectedLevel1] = useState(-1);
    const [selectedLevel2, updateSelectedLevel2] = useState(-1);
    const [selectedLevel3, updateSelectedLevel3] = useState(-1);
    const [selectedChapter, updateSelectedChapter] = useState(-1);

    const [valuesChapter, updateValuesChapter] = useState([]);

    const root = d3.pack()
        .size([window.innerWidth, window.innerHeight])
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

        circlePackingDiagram.current.centerVisualization(-0.30);
    }, []);

    // const onViewVariableChange = useCallback((updatedView) => {
    //     circlePackingDiagram.current.updateDraw(updatedView)

    //     let inspect = d3.select(".Inspect");
    //     inspectHierarchySummary(inspect, data);
    //     updateViewVariable(updatedView)
    // }, [])

    useEffect(() => {
        circlePackingDiagram.current.updateDraw(viewVariable, selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter);
        inspectHierarchySummary(data);
    }, [viewVariable, selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter]);

    return (
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <Draggable bounds="parent" handle="strong">
                    <Menu className="Query" id="FilterMenu" style={{
                        position: 'absolute', left: '20px',
                        padding: '1%',
                        height: !shouldRotate ? "10vh" : "65vh", width: "22vw",
                        overflowY: !shouldRotate ? "hidden" : "scroll"
                    }}>
                        <MenuControls>
                            <strong className="cursor">
                                <DragBar>Inspect Pane</DragBar>
                            </strong>
                            <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ border: "2px solid #1d8693", paddingLeft: "2%", paddingRight: "2%" }}>
                                <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"} />
                                <Ripple color={"#FFFFFF"} duration={1000} />
                            </ChevronButton>
                        </MenuControls>
                        <div className="Description" style={{ visibility: !shouldRotate ? 'hidden' : 'visible' }}>
                            <Description>
                                <h4>Ecosystem</h4>
                                <p>Click on the circles to zoom into the process visualization.</p>
                            </Description>
                            <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Inspect by Activity Type" />
                            <InspectTaxonomy selectedLevel1={selectedLevel1} updateSelectedLevel1={updateSelectedLevel1} selectedLevel2={selectedLevel2} updateSelectedLevel2={updateSelectedLevel2} selectedLevel3={selectedLevel3} updateSelectedLevel3={updateSelectedLevel3} selectedChapter={selectedChapter} updateSelectedChapter={updateSelectedChapter} valuesChapter={valuesChapter} updateValuesChapter={updateValuesChapter} />
                        </div>
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