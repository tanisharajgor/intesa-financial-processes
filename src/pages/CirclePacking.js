// Libraries
import React, {useState, useEffect, useRef, useCallback} from 'react';
import * as d3 from 'd3';

// Components
import Navigation from '../components/Navigation';
import Main from '../components/Main';
import { inspectHierarchySummary } from '../components/Inspect';
import FilterType from '../components/FilterType';
import InspectTaxonomy from '../components/InspectTaxonomy';
import { MenuHeader, MenuBody } from '../components/Menu';

import { activityTypeValues } from '../utils/global';
import { CirclePackingDiagram } from '../visualization/circle-packing-visualization';

// Data
import data from '../data/processed/nested/processes.json';

// Styles
import { QueryMenu } from '../component-styles/menu';
import { Content } from '../component-styles/content';

const selector = "circle-packing-chart";
const root = d3.pack()
  .size([window.innerWidth, window.innerHeight])
  .padding(1)(d3.hierarchy(data)
    .count()
    .sort((a, b) => b.value - a.value)
  );

export default function CirclePacking () {
  // View highlight states
  const [viewVariable, updateViewVariable] = useState('riskType');
  const [viewHoverValue, updateViewHoverValue] = useState("");
  const [symbolHoverValue, updateSymbolHoverValue] = useState("");
  const [isFullscreen, setFullscreen] = useState(false);
  const [shouldRotate] = useState(true);

  // Possible set of activities/actors to choose from
  const possibleActivities = activityTypeValues;

  // User selected activities and actors
  const [selectedActivities, updateActivities] = useState(activityTypeValues);
  const [selectedLevel1, updateSelectedLevel1] = useState({ id: -1, descr: 'All' });
  const [selectedLevel2, updateSelectedLevel2] = useState({ id: -1, descr: 'All' });
  const [selectedLevel3, updateSelectedLevel3] = useState({ id: -1, descr: 'All' });
  const [selectedChapter, updateSelectedChapter] = useState({ id: -1, descr: 'All' });

  const [valuesChapter, updateValuesChapter] = useState([]);

  const circlePackingDiagram = useRef(new CirclePackingDiagram(root.descendants().slice(1), selector, updateViewHoverValue, updateSymbolHoverValue));

  const handleFullscreen = () => {
    if (isFullscreen) {
      circlePackingDiagram.current.centerVisualization(-0.2);
    } else {
      circlePackingDiagram.current.centerVisualization(0.2);
    }
    setFullscreen(!isFullscreen);
  };

  const handleTaxonomyChange = (node, updateSelected, level) => {
  const nodeFromMap = circlePackingDiagram.current.dataMap[node.id];
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
        circlePackingDiagram.current.centerVisualization(-0.85, window.innerWidth / 2, window.innerHeight / 2);
        break;
      }
      if (parentNode) {
        circlePackingDiagram.current.centerOnNode(parentNode);
      }
    }
    updateSelected(node);
  };

  useEffect(() => {
    circlePackingDiagram.current.init(selector);
    circlePackingDiagram.current.draw(viewVariable);
    circlePackingDiagram.current.centerVisualization(-0.1, window.innerWidth / 2, (window.innerHeight / 2) - 75);
  }, []);

  const onViewVariableChange = useCallback((updatedView) => {
    circlePackingDiagram.current.updateDraw(updatedView, selectedActivities);
    const inspect = d3.select('.Inspect');
    inspectHierarchySummary(inspect, data);
    updateViewVariable(updatedView);
  }, []);

  const onInspectActivitiesChange = useCallback((updatedActivities) => {
    circlePackingDiagram.current.updateOpacity(updatedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter);
    const inspect = d3.select('.Inspect');
    inspectHierarchySummary(inspect, data);
    updateActivities(updatedActivities);
  }, [selectedActivities]);

  // Updates the Opacity on Inspect
  useEffect(() => {
    circlePackingDiagram.current.updateOpacity(selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter);
  }, [selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter]);

  return (
    <>
      <Navigation isFullscreen={isFullscreen} />
      <Content>
        <QueryMenu className="Query" isFullscreen={isFullscreen} style={{
          height: !shouldRotate ? '10vh' : '100vh',
          overflowY: !shouldRotate ? 'hidden' : 'scroll'
        }}>
          <MenuHeader label="Ecosystem" />
          <MenuBody shouldRotate={shouldRotate} pageDescription="Click on the circles to zoom into the process visualization.">
            <FilterType typesChecked={selectedActivities} updateSelection={onInspectActivitiesChange} typeValues={possibleActivities} label="Identify by Activity Type" />
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
        </QueryMenu>
        <Main
          viewVariable={viewVariable}
          updateViewVariable={onViewVariableChange}
          viewHoverValue={viewHoverValue}
          symbolHoverValue={symbolHoverValue}
          selector={selector}
          controls={circlePackingDiagram.current.getControls()}
          handleFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
        />
      </Content>
    </>
  );
}
