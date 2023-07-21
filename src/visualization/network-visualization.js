import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";
import * as Global from "../utils/global";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

const nonHighlightOpacity = .3;

export default class NetworkVisualization {

  hoverLink;
  hoverNodes;
  app;
  clickNode;
  clickViewport;
  clickCount;
  containerNodes;
  containerLinks;
  data;
  height;
  inspect;
  inspectNodes;
  inspectLinks;
  links;
  nodes;
  rootDOM;
  selectedChapter;
  simulation;
  tooltip;
  width;
  viewport;
  viewVariable;

  constructor(data, updateSymbolHoverValue, updateViewHoverValue) {
    this.updateSymbolHoverValue = updateSymbolHoverValue;
    this.updateViewHoverValue = updateViewHoverValue;
    this.data = data;
    this.hoverLink = [];
    this.hoverNode = [];
    this.clickNode = false;
    this.clickViewport = false;
    this.clickCount = 0;
    this.inspectNode = [];
    this.inspectLink = [];
  }

  initSimulation() {

    let adjustmentFactor = .161;

    this.simulation = d3.forceSimulation()
      .nodes(this.data.nodes)
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-60))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(1))
      .force("collide", d3.forceCollide().strength(2).radius(8))
      .force("x", d3.forceX().strength(0.1))
      .force("y", d3.forceY().strength((adjustmentFactor * this.width) / this.height));
  }

  // Initializes the application
  init(selector) {
    this.rootDOM = document.getElementById(selector);
    this.width = this.rootDOM.clientWidth*.75; //fraction of the width until with view becomes moveable and collapseable
    this.height = this.rootDOM.clientHeight;

    this.initSimulation();
    this.tooltip = Global.initTooltip(selector);

    // create canvas
    this.app = new PIXI.Application({
      resizeTo: this.rootDOM,
      width: this.width,
      height: this.height,
      resolution: devicePixelRatio,
      antialias: true,
      autoDensity: true,
      backgroundColor: 0x08090b
    });

    this.app.stage.sortableChildren = true;
    this.rootDOM.appendChild(this.app.view);

    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.height,
      worldWidth: this.width,
      worldHeight: this.height,
      passiveWheel: false,
        interaction: this.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        events: this.app.renderer.events
      });

    this.app.stage.addChild(this.viewport);

    this.viewport
      .pinch({ percent: 1 })
      .wheel({ percent: 0.1 })
      .drag();

    this.viewport.on('click', () => this.clickOff());
  }

  // Set diagram to fill the vizualization frame
  centerVisualization(newX, newY, zoom) {
    this.viewport.zoomPercent(zoom, true)
    this.viewport.moveCenter(newX, newY);
  }

  clickOff() {

    this.clickCount++;
    if (this.clickCount > 2) {
      this.clickNode = false;
      this.clickCount = 0;
      this.hoverNodes
        .forEach(node => {
          let { gfx } = node;
          gfx.filters.pop();
          gfx.zIndex = 0;
        });

        this.hoverLink = [];
        this.hoverNode = [];
    }
  }

  clickOn(node) {

    this.clickNode = true;
    this.clickCount++;
    if (this.clickCount > 3) {
      this.clickNode = false;
      this.clickCount = 0;
    }

    this.hoverNodes
      .forEach(node => {
        let { gfx } = node;
        gfx.filters.pop();
        gfx.zIndex = 0;
      });
    this.highlightNetworkNodes(node);
  }

  // Drawing functions ------------------------------------------------------

  // Initializes the links
  drawLinks() {
    this.containerLinks = new PIXI.Container();

    // Links
    this.links = new PIXI.Graphics();
    this.containerLinks.addChild(this.links);

    // Inspect Links
    this.inspectLinks = new PIXI.Graphics();
    this.containerLinks.addChild(this.inspectLinks);

    this.viewport.addChild(this.containerLinks);

    this.simulation.force("link")
      .links(this.data.links);
  }

  reduceNestedList(emptyList, list) {
    emptyList.push(list);
    emptyList = emptyList.flat(1);
    let unique = [...new Set(emptyList)];
    return unique;
  }

  // Initializes the nodes
  drawNodes() {

    this.containerNodes = new PIXI.Container();
    this.nodes = [];

    this.data.nodes.forEach((node) => {

      const rSize = node.viewId === "Actor" ? Global.rScale(node.viewType.nActivity): 5;

      node.gfx = new PIXI.Graphics();

      if (node.viewId === "Actor") {
        node.gfx.beginFill(0xcbcbcb);
      } else {
        node.gfx.beginFill(Global.applyColorScale(node, this.viewVariable));
      }

      Global.symbolScalePixi(node, rSize);

      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.cursor = 'pointer';
      node.gfx.on("pointerover", () => this.pointerOver(node));
      node.gfx.on("pointerout", () => this.pointerOut(node));
      node.gfx.on('click', () => this.clickOn(node));

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }

  // Updating the draw functions during the animation ------------------------------------------------------

  defaultLine() {
    this.links.lineStyle(1, 0x686868);
  }

  highlightLine() {
    this.links.lineStyle(1, 0xffffff);
  }

  alphaLine() {
    this.links.alpha = 1;
  }

  solidLine(source, target) {
    this.links.moveTo(source.x, source.y);
    this.links.lineTo(target.x, target.y);
  }

  distance(p1, p2) {
    return Math.hypot(p2.x-p1.x, p2.y-p1.y)
  }

  // Adapated from https://codepen.io/shepelevstas/pen/WKbYyw
  dashedLine(source, target) {
    const dash = 5;
    const gap = 5;
    const p1 = {x: target.x, y: target.y};
    const p2 = {x: source.x, y: source.y};
    const len = this.distance(p1, p2);
    const norm = {x: (p2.x-p1.x)/len, y: (p2.y-p1.y)/len};
    this.links.moveTo(p1.x, p1.y).lineTo(p1.x+dash*norm.x, p1.y+dash*norm.y);
    let progress = dash+gap;
  
    while (progress < len) {
      this.links.moveTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += dash;
      this.links.lineTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += gap;
    }
  }

  lineType(source, target, connect_actor_activity) {
    if (connect_actor_activity) {
      this.solidLine(source, target);
    } else {
      this.dashedLine(source, target);
    }
  }

  // Hover on links
  highlightNetworkLinks(source, target) {
    if (this.hoverLink.includes(source.id) && this.hoverLink.includes(target.id)) {
      this.highlightLine();
    } else {
      this.defaultLine();
    }
  }

  // Inspect on links
  inspectNetworkLinks() {
    this.data.links
      .filter(d => (this.inspectLink.includes(d.source.id) && this.inspectLink.includes(d.target.id))
        && !(this.hoverLink.includes(d.source.id) && this.hoverLink.includes(d.target.id)))
      .forEach(link => {
        let { source, target, connect_actor_activity } = link;

        this.lineType(source, target, connect_actor_activity);
        this.defaultLine();
        this.alphaLine();
    });
  }

  // Update the links position
  // Note
  updateLinkPosition() {
    // Links
    this.links.clear();
    this.data.links.forEach(link => {
      let { source, target, connect_actor_activity } = link;

      if (this.selectedChapter === -1 || this.selectedChapter === undefined) {
        this.links.alpha = 1;
      } else {
        this.links.alpha = nonHighlightOpacity;
      }

      // Hover on links
      this.highlightNetworkLinks(source, target);

      // Line type
      this.lineType(source, target, connect_actor_activity);
    });
  
    // Inspect on links
    this.inspectNetworkLinks();
  }

  // Update the nodes position
  updateNodePosition() {
    this.nodes.forEach((node) => {
      let { x, y, gfx } = node;
      gfx.x = x;
      gfx.y = y;
    });
  }

  // Destroy the links on update ------------------------------------------------------

  // Destroys the links on data update
  destroyLinks() {

    if (this.containerLinks) {
      this.containerLinks.destroy();
    }
    if (this.links !== undefined) {
      this.links.destroy();
    }
    if (this.inspectLinks !== undefined) {
      this.inspectLinks.destroy();
    }
  }

  // Destroys the nodes on data update
  destroyNodes() {
    if (this.containerNodes) {
      this.containerNodes.destroy();
    }
  }

  // Dragging functions ------------------------------------------------------

  drag() {
    // d3 drag
    d3.select(this.app.view).call(() => {
      d3.drag()
        .container(this.app.view)
        // Returns the node closest to the position with the given search radius
        .subject((d) => this.simulation.find(d.x, d.y, 10))
        .on("start", (d, e) => {
          this.dragStarted(d, e);
        })
        .on("drag", (e) => {
          this.dragged(e);
        })
        .on("end", (e) => {
          this.dragEnded(e);
        })
    });
  }

  dragStarted(d, e) {
    this.hideInspect(d);
    if (!e.active) {
      this.simulation.alphaTarget(0.1).restart();
    }
    e.subject.fx = e.subject.x;
    e.subject.fy = e.subject.y;
  }

  dragged(e) {
    e.subject.fx = e.x;
    e.subject.fy = e.y;
  }

  dragEnded(e) {
    if (!e.active) {
      this.simulation.alphaTarget(0);
    }
    e.subject.fx = null;
    e.subject.fy = null;
  }

  // Controls ------------------------------------------------------

  getControls() {
    return {
      zoomIn: () => {
        this.viewport.zoomPercent(0.15, true);
      },
      zoomOut: () => {
        this.viewport.zoomPercent(-0.15, true);
      },
      reset: () => {
        this.viewport.fit();
        this.viewport.moveCenter(this.width / 2, this.height / 2);
      }
    }
  }

  // Update aesthetic functions ------------------------------------------------------

  listHighlightNetworkNodes(d) {
    if (d.group === "Actor") {

        let activityIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
        let riskIds = Global.filterLinksSourceToTarget(this.data.links, activityIds);
        let controlIds = Global.filterLinksSourceToTarget(this.data.links, riskIds);
        let ids = controlIds.concat(riskIds.concat(activityIds.concat(d.id)));

        return ids;

    } else if (d.group === "Activity") {

        let actorIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
        let riskIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
        let controlIds = Global.filterLinksSourceToTarget(this.data.links, riskIds);
        let ids = controlIds.concat(riskIds.concat(actorIds.concat(d.id)));

        return ids;

    } else if (d.group === "Risk") {

        let controlIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
        let activityIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
        let actorIds = Global.filterLinksTargetToSource(this.data.links, activityIds);
        let ids = actorIds.concat(activityIds.concat(controlIds.concat(d.id)));

        return ids;

    } else if (d.group === "Control") {

        let riskIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
        let activityIds = Global.filterLinksTargetToSource(this.data.links, riskIds);
        let actorIds = Global.filterLinksTargetToSource(this.data.links, activityIds);
        let ids = actorIds.concat(activityIds.concat(riskIds.concat(d.id)));

        return ids;
    }
  }

  highlightNetworkNodes(d) {
    this.hoverLink = this.listHighlightNetworkNodes(d);
    this.hoverNodes = this.data.nodes.filter(z => this.hoverLink.includes(z.id));
    this.hoverNodes
      .forEach(node => {
        let { gfx } = node;

        gfx.filters = [
          new GlowFilter({
            distance: 1,
            innerStrength: 0,
            outerStrength: 2,
            color: 0xffffff,
            quality: 1,
          }),
        ];
        gfx.zIndex = 1;
      });
  }

  tooltipText(d) {
    if (d.viewId === "Actor") {

        return `Type: ${d.type} <br> ${d.group}: ${d.descr} <br> # activities: ${d.viewType.nActivity} <br> # risks: ${d.viewType.nRisk} <br> # controls: ${d.viewType.nControl}`;

    } else if (d.viewId === "Other activity") {

        return `Type: ${d.type} <br> ${d.group}: ${d.descr} <br> # actors: ${d.viewType.nActor} <br> # risks: ${d.viewType.nRisk} <br> # controls: ${d.viewType.nControl}`;

    } else if (d.viewId === "Risk") {

        return `${d.group}: ${d.descr} <br> # actors: ${d.viewType.nActor} <br> # activity: ${d.viewType.nActivity} <br> # control: ${d.viewType.nControl}`;

    } else if (d.viewId === "Control activity") {

        return `Type: ${d.type} <br> ${d.group}: ${d.descr} <br> # actors: ${d.viewType.nActor} <br> # risks: ${d.viewType.nRisk}`;
    }
  }

  showTooltip(d) {
    let x = d.x + 20;
    let y = d.y - 10;

    this.tooltip.style("visibility", "visible")
      .style("top", `${y}px`)
      .style("left", `${x}px`)
      .html(this.tooltipText(d));
  }

  pointerOver(d) {

    if (!this.clickNode) {
      this.highlightNetworkNodes(d);
    }

    this.updateSymbolHoverValue(d.viewId);
    this.updateViewHoverValue(Global.applyColorScale(d, this.viewVariable));
    this.showTooltip(d);
  }

  pointerOut(d) {

    if (!this.clickNode) {
      this.hoverNodes
      .forEach(node => {
        let { gfx } = node;
        gfx.filters.pop();
        gfx.zIndex = 0;
      });

      this.hoverLink = [];
      this.hoverNode = [];
    }

    this.updateViewHoverValue(undefined);
    this.updateSymbolHoverValue(undefined);
    this.tooltip.style("visibility", "hidden");
    this.app.renderer.events.cursorStyles.default = 'default';
  }

  // Main functions ------------------------------------------------------

  run() {
    return this.simulation;
  }

  draw(viewVariable) {
    this.viewVariable = viewVariable;
    this.drawLinks();
    this.drawNodes();
    this.simulation.alpha(1).restart();
  }

  updateDraw(viewVariable) {
    this.hoverLink = [];
    this.hoverNode = [];
    this.hoverNodes = [];
    this.destroyLinks();
    this.destroyNodes();
    this.draw(viewVariable);
    this.animate();
  }

  // Identify nodes and links to highlight
  identifyNodesLinks(node) {
    let links = this.listHighlightNetworkNodes(node);
    let nodes = this.data.nodes.filter(z => links.includes(z.id)).map(d => d.id);
    this.inspectLink = this.reduceNestedList(this.inspectLink, links);
    this.inspectNode = this.reduceNestedList(this.inspectNode, nodes);
    node.gfx.alpha = 1;
  }

  // Apply ifelse logic to identified nodes
  highlightInspectedNodes(nodeEvaluation, node) {
    if (nodeEvaluation) {
      this.identifyNodesLinks(node);
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  // Highlights the non actor nodes according the inspect node list
  highlightNonActorNodes(node) {
    if (this.inspectNode.includes(node.id)) {
      node.gfx.alpha = 1;
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  // Identify inspected nodes by chapter and assign them an alpha level
  selectedChapterAlpha(node) {
    if (node.viewId === "Actor") {
      this.highlightInspectedNodes(node.levels.modelID.includes(this.selectedChapter), node);
    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Identify inspected nodes by organizational structure and assign them an alpha level
  selectedOrgAlpha(node) {
    if (node.viewId === "Actor") {
      if (this.selectedOrg2 !== -1) {
        this.highlightInspectedNodes(node.levels.orgStructure2ID.includes(this.selectedOrg2), node);
      } else {
        this.highlightInspectedNodes(node.levels.orgStructure1ID.includes(this.selectedOrg1), node);
      }
    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Logic to define the intersection of the chapter and organizational structure
  selectedChapterAndOrgStructureAlpha(node) {
    if (node.viewId === "Actor") {

      if (this.selectedOrg2 !== -1) {
        this.highlightInspectedNodes(node.levels.orgStructure2ID.includes(this.selectedOrg2) && node.levels.modelID.includes(this.selectedChapter), node);
      } else {
        this.highlightInspectedNodes(node.levels.orgStructure1ID.includes(this.selectedOrg1) && node.levels.modelID.includes(this.selectedChapter), node);
      }

    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Change the opacity of the actor nodes and their linked attributes when inspected
  updateNodeAlpha(selectedChapter, selectedOrg1, selectedOrg2) {
    this.selectedChapter = selectedChapter;
    this.selectedOrg1 = selectedOrg1.id;
    this.selectedOrg2 = selectedOrg2.id;

    this.inspectLink = [];
    this.inspectNode = [];

    this.nodes.forEach((node) => {
      if (this.selectedChapter !== -1 && this.selectedChapter !== undefined && this.selectedOrg1 !== -1) {
        this.selectedChapterAndOrgStructureAlpha(node);
      } else if (this.selectedChapter !== -1 && this.selectedChapter !== undefined) {
        this.selectedChapterAlpha(node);
      } else if (this.selectedOrg1 !== -1) {
        this.selectedOrgAlpha(node);
      } else {
        node.gfx.alpha = 1;
      }
    });
  }

  animate() {
    this.app.ticker.add(() => {
      this.updateLinkPosition();
      this.updateNodePosition();
    });
  }
}