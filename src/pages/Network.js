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
const linkColor = "#373d44";
let colorScale;

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks) {

    let dataNew = Object.assign({}, graph.find((d) => d.id === selectedLevel3ID));

    let actorIdsFiltered = dataNew.nodes.filter(d => d.group === "Actor" && actorTypesChecks.includes(d.type)).map(d => d.id);
    let activityIdsFiltered = dataNew.nodes.filter(d => d.group === "Activity" && activityTypesChecks.includes(d.type)).map(d => d.id);

    let links = dataNew.links.filter(d => d.source.id === undefined ? actorIdsFiltered.includes(d.source) && activityIdsFiltered.includes(d.target): actorIdsFiltered.includes(d.source.id) && activityIdsFiltered.includes(d.target.id));
    let actorIds = links.map(d => d.source.id === undefined ? d.source: d.source.id);
    let activityIds = links.map(d => d.target.id === undefined ? d.target: d.target.id);

    let riskIds = Global.filterLinksSourceToTarget(dataNew.links, activityIds);
    let controlIds = Global.filterLinksSourceToTarget(dataNew.links, riskIds);

    let ids = controlIds.concat(riskIds.concat(actorIds.concat(activityIds)));

    dataNew.nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    dataNew.links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) && ids.includes(d.target): ids.includes(d.source.id) && ids.includes(d.target.id));

    return dataNew;
}

export default function Network() {

    const [viewVariable, updateViewVariable] = useState("riskType");
    const [selectedLevel3ID, updateLevel3ID] = useState(graph[0].id);
    const [activityTypesChecks, updateActivityTypeChecks] = useState(Global.activityTypeValues);
    const [actorTypesChecks, updateActorTypeChecks] = useState(Global.actorTypeValues);
    const [data, updateData] = useState(Object.assign({}, graph.find((d) => d.id === selectedLevel3ID)));
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    const networkDiagram = useRef(new NetworkVisualization(data, updateSymbolHoverValue, updateViewHoverValue));
    const [activityTypes, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [actorTypes, updateActorType] = useState([...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // Set-up scales
    colorScale = Global.createColorScale(viewVariable);

    // React Hooks
    useEffect(() => {
        networkDiagram.current.init(id);
        networkDiagram.current.draw(viewVariable);
        networkDiagram.current.animate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter data
    useEffect(() => {

        const filteredData = filterData(selectedLevel3ID, activityTypesChecks, actorTypesChecks);
        updateData(filteredData);

        networkDiagram.current.data = filteredData;
        networkDiagram.current.initSimulation();
        networkDiagram.current.updateDraw(viewVariable);

        let inspect = d3.select(".Inspect");
        inspectNetworkSummary(inspect, filteredData);
    }, [selectedLevel3ID, activityTypesChecks, actorTypesChecks]);

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
        updateActorType([...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);
    }, [selectedLevel3ID]);

    useEffect(() => {
        networkDiagram.current.updateDraw(viewVariable);
    }, [viewVariable]);

    return(
        <div className="Content">
            <Navigation/>
            <div style={{display: 'flex'}}>
                <QueryMenu className="Query" id="FilterMenu" width={"22rem"}>
                    <FilterProcess selectedLevel3ID = {selectedLevel3ID} updateLevel3ID={updateLevel3ID}/>
                    <FilterType typesChecks={activityTypesChecks} updateTypeChecks={updateActivityTypeChecks} typeValues={activityTypes} label="Filter by Activity Type:"/>
                    <FilterType typesChecks={actorTypesChecks} updateTypeChecks={updateActorTypeChecks} typeValues={actorTypes} label="Filter by Actor Type:"/>
                </QueryMenu>
                <Main viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} id={id}/>        
            </div>        
        </div>
    )
}
