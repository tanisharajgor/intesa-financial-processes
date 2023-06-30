import Main from "../components/Main";
import Navigation from "../components/Navigation";
import InspectChapter from "../components/InspectChapter";
import FilterTaxonomy from "../components/FilterTaxonomy";
import FilterType from "../components/FilterType";
import { useEffect, useRef, useState } from "react";
import links from "../data/processed/nested/links.json";
import nodes from "../data/processed/nested/nodes.json";
import { QueryMenu } from "cfd-react-components";
import NetworkVisualization from "../visualization/network-visualization";
import * as Global from "../utils/global";
import { inspectNetworkSummary } from "../components/Inspect";
import * as d3 from 'd3';
import Description from "../components/Description";
import { Content } from "../component-styles/content";
import { Menu } from "../component-styles/query-menu";

const id = "network-chart";

// Combines the nodes and links into a single object
function combineNodeLink(selectedLevel3ID, nodes, links) {

    let nodesData = Object.assign({}, nodes.find((d) => d.id === selectedLevel3ID)).nodes;
    let linksData = Object.assign({}, links.find((d) => d.id === selectedLevel3ID)).links;
    let dataNew = {id: selectedLevel3ID, nodes: nodesData, links: linksData};

    return dataNew;
}

// Combines the two types of links into a single array
function combineLink(data) {

    if (data.links.deve) {
        data.links.deve.map(d => d.connect_actor_activity = true);
        data.links.non_deve.map(d => d.connect_actor_activity = false);
        data.links = data.links.deve.concat(data.links.non_deve);
    }

    return data;
}

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3ID, selectedActivities, selectedActors) {

    let dataNew = combineNodeLink(selectedLevel3ID, nodes, links);
    combineLink(dataNew);

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

    const [viewVariable, updateViewVariable] = useState("riskType");

    // User Input selection
    const [selectedLevel3, updateLevel3] = useState(links[0].id);

    let dataNew = combineNodeLink(selectedLevel3, nodes, links);

    const [data, updateData] = useState(dataNew);

    combineLink(data);

    // Possible set of activities/actors to choose from
    const [possibleActivities, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [possibleActors, updateActorType] = useState( [...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);
    const [selectedActors, updateActors] = useState(possibleActors);

    // Status to update the opacity in the legend
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);
    
    const [isFullscreen, setFullscreen] = useState(false);

    // const [selectedChapters, updateChapters] = useState(lu.map(d => d.descr));

    // Initiating the network diagram
    const networkDiagram = useRef(new NetworkVisualization(data, updateSymbolHoverValue, updateViewHoverValue));

    const handleFullscreen = (e) => {
        setFullscreen(!isFullscreen);
    }

    // React Hooks
    useEffect(() => {

        networkDiagram.current.init(id);
        networkDiagram.current.draw(viewVariable);
        networkDiagram.current.animate();

    }, []);

    // Filter data
    useEffect(() => {

        const filteredData = filterData(selectedLevel3, selectedActivities, selectedActors)
        updateData(filteredData);

        networkDiagram.current.data = filteredData;
        networkDiagram.current.initSimulation();
        networkDiagram.current.updateDraw(viewVariable);

        let inspect = d3.select(".Inspect");
        inspectNetworkSummary(inspect, filteredData);

    }, [selectedLevel3, selectedActivities, selectedActors])

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType(possibleActivities);
        updateActorType(possibleActors);
    }, [selectedLevel3]);

    useEffect(() => {
        networkDiagram.current.updateDraw(viewVariable);
    }, [viewVariable]);

    return(
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <Menu className="Query" id="FilterMenu" width={"22rem"} isFullscreen={isFullscreen}>
                    <Description>
                            <h4>Network</h4>
                            <p>Filter data in the actor network graph to explore activities and risks.</p>
                    </Description>
                    <InspectChapter/>
                    <FilterTaxonomy selectedLevel3={selectedLevel3} updateLevel3={updateLevel3}/>
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
