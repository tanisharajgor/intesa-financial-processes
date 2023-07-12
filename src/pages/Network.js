import Main from "../components/Main";
import Navigation from "../components/Navigation";
import InspectChapter from "../components/InspectChapter";
import FilterTaxonomy from "../components/FilterTaxonomy";
import FilterType from "../components/FilterType";
import { useEffect, useRef, useState } from "react";
import links from "../data/processed/nested/links.json";
import nodes from "../data/processed/nested/nodes.json";
import NetworkVisualization from "../visualization/network-visualization";
import * as Global from "../utils/global";
import { inspectNetworkSummary } from "../components/Inspect";
import * as d3 from 'd3';
import Description from "../components/Description";
import { Content } from "../component-styles/content";
import { Menu } from "../component-styles/query-menu";
import lu from '../data/processed/nested/lu.json';

const id = "network-chart";
const processes = lu["processes"];

// Combines the two types of links into a single array
function combineLink(links) {

    if (links.deve) {
        links.deve.map(d => d.connect_actor_activity = true);
        links.non_deve.map(d => d.connect_actor_activity = false);
        links = links.deve.concat(links.non_deve);
    }

    return links;
}
const visualizationXPadding = 200;

// Combines the nodes and links into a single object
function combineNodeLink(selectedLevel3ID, nodes, links) {

    let nodesData = Object.assign({}, nodes.find((d) => d.id === selectedLevel3ID)).nodes;
    let linksData = Object.assign({}, links.find((d) => d.id === selectedLevel3ID)).links;
    linksData = combineLink(linksData);
    let dataNew = {id: selectedLevel3ID, nodes: nodesData, links: linksData};

    return dataNew;
}


// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, selectedActivities, selectedActors) {

    let dataNew = combineNodeLink(selectedLevel3ID, nodes, links);

    let actorIdsFiltered = dataNew.nodes.filter(d => d.group === "Actor" && selectedActors.includes(d.type)).map(d => d.id);
    let activityIdsFiltered = dataNew.nodes.filter(d => d.group === "Activity" && selectedActivities.includes(d.type)).map(d => d.id);

    let linksNew = dataNew.links.filter(d => d.source.id === undefined ? actorIdsFiltered.includes(d.source) && activityIdsFiltered.includes(d.target): actorIdsFiltered.includes(d.source.id) && activityIdsFiltered.includes(d.target.id));
    let actorIds = [...new Set(linksNew.map(d => d.source.id === undefined ? d.source: d.source.id))];
    let activityIds = [...new Set(linksNew.map(d => d.target.id === undefined ? d.target: d.target.id))];
  
    let riskIds = Global.filterLinksSourceToTarget(dataNew.links, activityIds);
    let controlIds = Global.filterLinksSourceToTarget(dataNew.links, riskIds);

    let ids = controlIds.concat(riskIds.concat(actorIds.concat(activityIds)));

    dataNew.nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    dataNew.links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) && ids.includes(d.target): ids.includes(d.source.id) && ids.includes(d.target.id));

    return dataNew;
}

export default function Network() {

    // User Input selection
    const [viewVariable, updateViewVariable] = useState("riskType");
    const [selectedLevel1, updateLevel1] = useState(processes.children[0].id);
    const [selectedLevel3, updateLevel3] = useState(processes.children[0].children[0].children[0].id);
    const [selectedChapter, updateSelectedChapter] = useState(-1);
    const [valuesChapter, updateValuesChapter] = useState([{"id": -1, "descr": "All"}].concat(processes
        .children.find(d => d.id === selectedLevel1).children[0].children[0].children));

    // Status to update the opacity in the legend
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    // Data management steps
    let dataNew = combineNodeLink(selectedLevel3, nodes, links);

    const [data, updateData] = useState(dataNew);

    // Possible set of activities/actors to choose from
    const [possibleActivities, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [possibleActors, updateActorType] = useState( [...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);
    const [selectedActors, updateActors] = useState(possibleActors);

    const [isFullscreen, setFullscreen] = useState(false);
    const handleFullscreen = (e) => {
        setFullscreen(!isFullscreen);
    }

    // Initiating the network diagram
    const networkDiagram = useRef(new NetworkVisualization(data, updateSymbolHoverValue, updateViewHoverValue));

    // React Hooks
    useEffect(() => {
        networkDiagram.current.init(id);
        networkDiagram.current.draw(viewVariable);
        networkDiagram.current.animate();

        const width =  (document.getElementById(id).clientWidth / 2) - document.getElementsByClassName("Query")[0].clientWidth;
        const height = (document.getElementById(id).clientHeight / 2) - document.getElementsByClassName("Navigation")[0].clientHeight;

        networkDiagram.current.centerVisualization(width - visualizationXPadding, height, -0.40);
    }, []);

     // React Hooks
     useEffect(() => {

        const l1 = processes.children
            .find(d => d.id === selectedLevel1);
        const l2 = l1.children[0];
        const l3 = l2.children[0];

        updateValuesChapter(
            [{"id": -1, "descr": "All"}].concat(processes
                .children.find(d => d.id === selectedLevel1)
                .children.find(d => d.id === l2.id)
                .children.find(d => d.id === l3.id).children)
        );
    
        updateLevel3(l3.id);
    }, [selectedLevel1]);

    useEffect(() => {
    
         const l1 = processes.children
            .find(d => d.id === selectedLevel1);

        updateValuesChapter(
            [{"id": -1, "descr": "All"}].concat(l1.children.find(d => d.childrenIDs.includes(selectedLevel3)).children)
        );
    }, [selectedLevel3])

    // Filter data
    useEffect(() => {

        const filteredData = filterData(selectedLevel3, selectedActivities, selectedActors)
        updateData(filteredData);

        networkDiagram.current.data = filteredData;
        networkDiagram.current.initSimulation();
        networkDiagram.current.updateDraw(viewVariable, selectedChapter);

        let inspect = d3.select(".Inspect");
        inspectNetworkSummary(inspect, filteredData);

    }, [selectedLevel3, selectedActivities, selectedActors]);

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType(possibleActivities);
        updateActorType(possibleActors);
    }, [selectedLevel3]);

    useEffect(() => {
        networkDiagram.current.updateDraw(viewVariable, selectedChapter);
    }, [viewVariable, selectedChapter]);

    return(
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <Menu className="Query" id="FilterMenu" width={"22rem"} isFullscreen={isFullscreen}>
                    <Description>
                        <h4>Network</h4>
                        <p>Filter data in the actor network graph to explore activities and risks.</p>
                    </Description>
                    <InspectChapter selectedChapter={selectedChapter} updateSelectedChapter={updateSelectedChapter} valuesChapter={valuesChapter}/>
                    <FilterTaxonomy selectedLevel1={selectedLevel1} updateLevel1={updateLevel1} selectedLevel3={selectedLevel3} updateLevel3={updateLevel3}/>
                    <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Filter by Activity Type"/>
                    <FilterType typesChecked={selectedActors} updateSelection={updateActors} typeValues={possibleActors} label="Filter by Actor Type"/>
                </Menu>
                <Main
                    viewVariable={viewVariable}
                    updateViewVariable={updateViewVariable}
                    viewHoverValue={viewHoverValue}
                    symbolHoverValue={symbolHoverValue}
                    id={id}
                    controls={networkDiagram.current.getControls()}
                    handleFullscreen={handleFullscreen}
                />        
            </Content>        
        </>
    )
}
