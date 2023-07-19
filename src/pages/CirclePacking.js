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
import { Menu } from "../component-styles/query-menu";
import { Content } from "../component-styles/content";
import Draggable from 'react-draggable';
import { MenuHeader, MenuBody } from "../components/Menu";

const id = "circle-packing-chart";
const root = d3.pack()
    .size([window.innerWidth, window.innerHeight])
    .padding(1)
    (d3.hierarchy(data)
        .sum(d => 1)
        .sort((a, b) => b.value - a.value)
    );

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
    const [selectedLevel1, updateSelectedLevel1] = useState({ "id": -1, "descr": "All" });
    const [selectedLevel2, updateSelectedLevel2] = useState({ "id": -1, "descr": "All" });
    const [selectedLevel3, updateSelectedLevel3] = useState({ "id": -1, "descr": "All" });
    const [selectedChapter, updateSelectedChapter] = useState({ "id": -1, "descr": "All" });

    const [valuesChapter, updateValuesChapter] = useState([]);

    const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), updateViewHoverValue));

    const handleFullscreen = (e) => {
        setFullscreen(!isFullscreen);
    }

    const handleTaxonomyChange = (node, updateSelected, level) => {
        const nodeFromMap = circlePackingDiagram.current.dataMap[node.id]
        if (nodeFromMap !== undefined) {
            circlePackingDiagram.current.centerOnNode(nodeFromMap);
        } else if (node.id === -1) {
            let parentNode;
            switch (level) {
                case 2:
                    parentNode = circlePackingDiagram.current.dataMap[selectedLevel1.id];
                    break;
                case 3:
                    parentNode = circlePackingDiagram.current.dataMap[selectedLevel2.id];
                    break;
                case 4:
                    parentNode = circlePackingDiagram.current.dataMap[selectedLevel3.id];
                    break;
                default:
                    circlePackingDiagram.current.centerVisualization(-0.85, window.innerWidth / 2, window.innerHeight / 2)
                    break;
            }
            if (parentNode) {
                circlePackingDiagram.current.centerOnNode(parentNode);
            }
        }
        updateSelected(node);
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
        circlePackingDiagram.current.updateDraw(viewVariable, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter);
        inspectHierarchySummary(data);
    }, [viewVariable]);

    useEffect(() => {
        circlePackingDiagram.current.updateOpacity(selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter)
    }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, selectedActivities]);

    return (
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <Draggable bounds="body" handle="strong">
                    <Menu className="Query" id="FilterMenu" style={{
                        position: 'absolute',
                        padding: '1%',
                        height: !shouldRotate ? "10vh" : "65vh", width: "22vw",
                        overflowY: !shouldRotate ? "hidden" : "scroll"
                    }}>
                        <MenuHeader label="Ecosystem" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
                        <MenuBody shouldRotate={shouldRotate} pageDescription=">Click on the circles to zoom into the process visualization.">
                            <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Inspect by Activity Type"/>
                            <InspectTaxonomy
                                handleTaxonomyChange={handleTaxonomyChange}
                                selectedLevel1={selectedLevel1}
                                updateSelectedLevel1={updateSelectedLevel1}
                                selectedLevel2={selectedLevel2}
                                updateSelectedLevel2={updateSelectedLevel2}
                                selectedLevel3={selectedLevel3}
                                updateSelectedLevel3={updateSelectedLevel3}
                                selectedChapter={selectedChapter}
                                updateSelectedChapter={updateSelectedChapter}
                                valuesChapter={valuesChapter}
                                updateValuesChapter={updateValuesChapter}
                            />
                            </MenuBody>
                    </Menu>
                </Draggable>
                <Main
                    viewVariable={viewVariable}
                    updateViewVariable={updateViewVariable}
                    viewHoverValue={viewHoverValue}
                    id={id}
                    controls={circlePackingDiagram.current.getControls()}
                    handleFullscreen={handleFullscreen}
                    isFullscreen={isFullscreen}
                />
            </Content>
        </>
    )
}