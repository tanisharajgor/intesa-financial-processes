// Libraries
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

// Components
import { Navigation, Main, Content } from "../components/layout/index";
import InspectChapter from "../components/widgets/inspectChapter/index";
import InspectOrgStructure from "../components/widgets/inspectOrgStructure/index";
import FilterTaxonomy from "../components/widgets/filterTaxonomy/index";
import FilterType from "../components/widgets/filterType/index";
import { MenuBody, MenuHeader } from "../components/features/index";
import { inspectNetworkSummary } from "../components/widgets/inspect/index";
import NetworkVisualization from "../visualization/network-visualization";
import * as Global from "../utils/global";

// Data
import links from "../data/processed/nested/links.json";
import nodes from "../data/processed/nested/nodes.json";
import orgStructure from "../data/processed/nested/org_structure.json";
import lu from '../data/processed/nested/lu.json';

// Styles
import { QueryMenu } from "../components/features/menu/style";

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
function combineNodeLink(selectedLevel3, nodes, links, orgStructure) {

    let nodesData = Object.assign({}, nodes.find((d) => d.id === selectedLevel3)).nodes;
    let linksData = Object.assign({}, links.find((d) => d.id === selectedLevel3)).links;
    let orgData = Object.assign({}, orgStructure.find((d) => d.id === selectedLevel3)).orgStructure;
    linksData = combineLink(linksData);
    let dataNew = { id: selectedLevel3, nodes: nodesData, links: linksData, orgStructure: orgData };

    return dataNew;
}

// Filters the data by level3ID and activity Type
function filterData(selectedLevel3, selectedActivities, selectedActors) {

    let dataNew = combineNodeLink(selectedLevel3, nodes, links, orgStructure);

    let actorIdsFiltered = dataNew.nodes.filter(d => d.group === "Actor" && selectedActors.includes(d.type)).map(d => d.id);
    let activityIdsFiltered = dataNew.nodes.filter(d => d.group === "Activity" && selectedActivities.includes(d.type)).map(d => d.id);

    let linksNew = dataNew.links.filter(d => d.source.id === undefined ? actorIdsFiltered.includes(d.source) && activityIdsFiltered.includes(d.target) : actorIdsFiltered.includes(d.source.id) && activityIdsFiltered.includes(d.target.id));
    let actorIds = [...new Set(linksNew.map(d => d.source.id === undefined ? d.source : d.source.id))];
    let activityIds = [...new Set(linksNew.map(d => d.target.id === undefined ? d.target : d.target.id))];

    let riskIds = Global.filterLinksSourceToTarget(dataNew.links, activityIds);
    let controlIds = Global.filterLinksSourceToTarget(dataNew.links, riskIds);

    let ids = controlIds.concat(riskIds.concat(actorIds.concat(activityIds)));

    dataNew.nodes = dataNew.nodes.filter(d => ids.includes(d.id));
    dataNew.links = dataNew.links.filter(d => d.source.id === undefined ? ids.includes(d.source) && ids.includes(d.target) : ids.includes(d.source.id) && ids.includes(d.target.id));

    return dataNew;
}

export default function Network() {

    // User Input selection
    const [viewVariable, updateViewVariable] = useState("riskType");
    const [selectedLevel1, updateLevel1] = useState(processes.children[0].id);
    const [selectedLevel3, updateLevel3] = useState(processes.children[0].children[0].children[0].id);
    const [selectedChapter, updateSelectedChapter] = useState(-1);
    const [valuesChapter, updateValuesChapter] = useState([{ "id": -1, "descr": "All" }].concat(processes
        .children.find(d => d.id === selectedLevel1).children[0].children[0].children));

    const [selectedOrg1, updateSelectedOrg1] = useState({ "id": -1, "descr": "All" });
    const [selectedOrg2, updateSelectedOrg2] = useState({ "id": -1, "descr": "All" });

    // Status to update the opacity in the legend
    const [viewHoverValue, updateViewHoverValue] = useState(undefined);
    const [symbolHoverValue, updateSymbolHoverValue] = useState(undefined);

    // Data management steps
    let dataNew = combineNodeLink(selectedLevel3, nodes, links, orgStructure);

    const [data, updateData] = useState(dataNew);
    const [orgStructureValues, updateOrgStructure] = useState(data.orgStructure);

    // Possible set of activities/actors to choose from
    const [possibleActivities, updateActivityType] = useState([...new Set(data.nodes.filter(d => d.group === "Activity").map(d => d.type))]);
    const [possibleActors, updateActorType] = useState([...new Set(data.nodes.filter(d => d.group === "Actor").map(d => d.type))]);

    // User selected activities and actors
    const [selectedActivities, updateActivities] = useState(possibleActivities);
    const [selectedActors, updateActors] = useState(possibleActors);

    const [isFullscreen, setFullscreen] = useState(false);
    const handleFullscreen = (e) => {
        setFullscreen(!isFullscreen);
    }

    const [shouldRotate, setRotate] = useState(true);
    const handleRotate = () => setRotate(!shouldRotate);

    // Initiating the network diagram
    const networkDiagram = useRef(new NetworkVisualization(data, updateSymbolHoverValue, updateViewHoverValue));

    // React Hooks
    useEffect(() => {
        networkDiagram.current.init(id);
        networkDiagram.current.draw(viewVariable);
        networkDiagram.current.animate();

        const width = (document.getElementById(id).clientWidth / 2) - document.getElementsByClassName("Query")[0].clientWidth;
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
            [{ "id": -1, "descr": "All" }].concat(l1
                .children.find(d => d.id === l2.id)
                .children.find(d => d.id === l3.id).children)
        );

        updateLevel3(l3.id);
        updateSelectedChapter(-1);
    }, [selectedLevel1]);

    useEffect(() => {
        const l1 = processes.children
            .find(d => d.id === selectedLevel1);

        updateValuesChapter(
            [{ "id": -1, "descr": "All" }].concat(l1
                .children.find(d => d.childrenIDs.includes(selectedLevel3))
                .children.find(d => d.id === selectedLevel3).children)
        );

        updateOrgStructure(
            orgStructure.find(d => d.id === selectedLevel3).orgStructure
        );

        updateSelectedChapter(-1);
    }, [selectedLevel3]);

    // Filter data
    useEffect(() => {

        const filteredData = filterData(selectedLevel3, selectedActivities, selectedActors)
        updateData(filteredData);

        networkDiagram.current.data = filteredData;
        networkDiagram.current.initSimulation();
        networkDiagram.current.updateDraw(viewVariable);

        let inspect = d3.select(".Inspect");
        inspectNetworkSummary(inspect, filteredData);

    }, [selectedLevel3, selectedActivities, selectedActors]);

    // Update filter possibilities when level changes
    useEffect(() => {
        updateActivityType(possibleActivities);
        updateActorType(possibleActors);
    }, [selectedLevel3]);

    useEffect(() => {
        networkDiagram.current.updateDraw(viewVariable);
    }, [viewVariable]);

    useEffect(() => {
        networkDiagram.current.updateNodeAlpha(selectedChapter, selectedOrg1, selectedOrg2);
    }, [selectedChapter, selectedOrg1, selectedOrg2]);

    return (
        <>
            <Navigation isFullscreen={isFullscreen} />
            <Content>
                <QueryMenu className="Query" isFullscreen={isFullscreen} style={{
                    height: !shouldRotate ? "10vh" : "100vh",
                    overflowY: !shouldRotate ? "hidden" : "scroll",
                    visibility: isFullscreen ? 'hidden' : 'visible'
                }}>
                    <MenuHeader label="Network" />
                    <MenuBody shouldRotate={shouldRotate} pageDescription="Filter data in the actor network graph to explore activities and risks.">
                        <InspectChapter selectedChapter={selectedChapter} updateSelectedChapter={updateSelectedChapter} valuesChapter={valuesChapter}/>
                        <InspectOrgStructure selectedOrg1={selectedOrg1} updateSelectedOrg1={updateSelectedOrg1} selectedOrg2={selectedOrg2} updateSelectedOrg2={updateSelectedOrg2} orgStructure={orgStructureValues}/>
                        <FilterTaxonomy selectedLevel1={selectedLevel1} updateLevel1={updateLevel1} selectedLevel3={selectedLevel3} updateLevel3={updateLevel3} />
                        <FilterType typesChecked={selectedActivities} updateSelection={updateActivities} typeValues={possibleActivities} label="Filter by Activity Type" />
                        <FilterType typesChecked={selectedActors} updateSelection={updateActors} typeValues={possibleActors} label="Filter by Actor Type" />
                    </MenuBody>
                </QueryMenu>
                <Main
                    viewVariable={viewVariable}
                    updateViewVariable={updateViewVariable}
                    viewHoverValue={viewHoverValue}
                    symbolHoverValue={symbolHoverValue}
                    id={id}
                    controls={networkDiagram.current.getControls()}
                    handleFullscreen={handleFullscreen}
                    isFullscreen={isFullscreen}
                />        
            </Content>        

        </>
    )
}
