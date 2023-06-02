import Main from "../components/Main";
import Navigation from "../components/Navigation";
import FilterProcess from "../components/FilterProcess";
import FilterType from "../components/FilterType";
import { useEffect, useRef, useState } from "react";
import graph from "../data/processed/nested/network2.json";
import { QueryMenu } from "cfd-react-components";
import NetworkVisualization from "../visualization/network-visualization";
import * as Global from "../utils/global";
import { inspectNetworkSummary } from "../components/Inspect";
import * as d3 from 'd3';

const id = "network-chart";
let colorScale;

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, selectedActivities, selectedActors) {

    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));

    let actorIdsFiltered = dataNew.nodes.filter(d => d.group === "Actor" && selectedActors.includes(d.type)).map(d => d.id);
    let activityIdsFiltered = dataNew.nodes.filter(d => d.group === "Activity" && selectedActivities.includes(d.type)).map(d => d.id);

    let links = dataNew.links.filter(d => d.source.id === undefined ? actorIdsFiltered.includes(d.source) && activityIdsFiltered.includes(d.target): actorIdsFiltered.includes(d.source.id) && activityIdsFiltered.includes(d.target.id));
    let actorIds = [...new Set(links.map(d => d.source.id === undefined ? d.source: d.source.id))];
    let activityIds = [...new Set(links.map(d => d.target.id === undefined ? d.target: d.target.id))];
  
    let riskIds = Global.filterLinksSourceToTarget(dataNew.links, activityIds);
    let controlIds = Global.filterLinksSourceToTarget(dataNew.links, riskIds);

    let ids = controlIds.concat(riskIds.concat(actorIds.concat(activityIds)));

    dataNew.nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    dataNew.links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) && ids.includes(d.target): ids.includes(d.source.id) && ids.includes(d.target.id));

    return dataNew;
}

export default function Network() {

    const [viewVariable, updateViewVariable] = useState("riskType");

    // User Input selection
    const [selectedLevel3ID, updateLevel3ID] = useState(graph[0].id);
    const [data, updateData] = useState(Object.assign({}, graph.find((d) => d.id === selectedLevel3ID)));

    // Possible set of activities/actors to choose from
    const [possibleActivities, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [possibleActors, updateActorType] = useState( [...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);
    const [selectedActors, updateActors] = useState(possibleActors);

    // Status to update the opacity in the legend
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    // Initiating the network diagram
    const networkDiagram = useRef(new NetworkVisualization(data, updateSymbolHoverValue, updateViewHoverValue));

    // Set-up scales
    colorScale = Global.createColorScale(viewVariable);

    // React Hooks
    useEffect(() => {

        networkDiagram.current.init(id);
        networkDiagram.current.draw(viewVariable);
        networkDiagram.current.animate();

    }, []);

    // Filter data
    useEffect(() => {

        const filteredData = filterData(selectedLevel3ID, selectedActivities, selectedActors)
        updateData(filteredData);

        networkDiagram.current.data = filteredData;
        networkDiagram.current.initSimulation();
        networkDiagram.current.updateDraw(viewVariable);

        let inspect = d3.select(".Inspect");
        inspectNetworkSummary(inspect, filteredData);

    }, [selectedLevel3ID, selectedActivities, selectedActors])

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType(possibleActivities);
        updateActorType(possibleActors);
    }, [selectedLevel3ID])

    useEffect(() => {
        networkDiagram.current.updateDraw(viewVariable);
    }, [viewVariable]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType typesChecks={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Filter by Activity Type:"/>
                    <FilterType typesChecks={selectedActors} updateSelection={updateActors} typeValues={possibleActors} label="Filter by Actor Type:"/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} id={id} controls={networkDiagram.current.getControls()}/>        
            </div>        
        </div>
    )
}
