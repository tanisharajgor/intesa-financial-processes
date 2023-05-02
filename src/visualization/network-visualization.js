import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";
import * as Global from "../utils/global";
import graph from "../data/processed/nested/network2.json";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

export default class NetworkVisualization {

  activeLinks;
  activeLink;
  activeNode;
  app;
  containerLabels;
  containerNodes;
  containerLinks;
  colorScale;
  data;
  height;
  inspect;
  links;
  nodes;
  rootDOM;
  simulation;
  width;
  viewport;

  constructor(data = graph, updateSymbolHoverValue, updateViewHoverValue) {
    this.updateSymbolHoverValue = updateSymbolHoverValue;
    this.updateViewHoverValue = updateViewHoverValue;
    this.data = data;
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
    this.activeLink = [];

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
  }

  // Drawing functions ------------------------------------------------------

  // Initializes the links
  drawLinks() {
    this.containerLinks = new PIXI.Container();

    // Links
    this.links = new PIXI.Graphics();
    this.links.alpha = 0.5;
    this.containerLinks.addChild(this.links);

    // Active Links
    this.activeLinks = new PIXI.Graphics();
    this.activeLinks.alpha = 0.8;
    this.containerLinks.addChild(this.activeLinks);
    this.viewport.addChild(this.containerLinks);

    this.simulation.force("link")
    .links(this.data.links);
  }

  // Initializes the nodes
  drawNodes(viewVariable) {

    this.containerNodes = new PIXI.Container();
    this.colorScale = Global.createColorScale(viewVariable);

    this.nodes = [];
    this.data.nodes.forEach((node) => {

      const rSize = node.viewId === "Actor" ? Global.rScale(node.actorType.nActivity): 5;

      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(this.strokeScale(node), 0xFFFFFF);
      node.gfx.beginFill(Global.applyColorScale(node, viewVariable, this.colorScale))
      Global.symbolScalePixi(node, rSize);

      node.size = rSize;

      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.on("pointerover", () => this.pointerOver(node, viewVariable));
      node.gfx.on("pointerout", () => this.pointerOut(node));

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }

  // Updating the draw functions during the animation ------------------------------------------------------

  // Update the links position
  updateLinkPosition() {

    this.links.clear();
    this.data.links.forEach((link) => {
      let { source, target } = link;
      this.links.lineStyle(1, 0x888888);
      this.links.moveTo(target.x + (target.size / 2), target.y + (target.size / 2));
      this.links.lineTo(source.x + (source.size / 2), source.y + (source.size / 2));
    });

    this.activeLinks.clear();
    const activeLinkData = this.data.links
            .filter(d => this.activeLink.includes(d.source.id) && this.activeLink.includes(d.target.id));


//             .attr("opacity", d => l1.includes(d.index) ? 1: .5)
//             .attr("stroke", d => l1.includes(d.index)? "white": linkColor)
//             .attr("stroke-width", d => l1.includes(d.index)? 1: .5);

    activeLinkData.forEach((link) => {
      let { source, target } = link;
      this.activeLinks.lineStyle(1, 0xffffff); // darken the lines
      this.activeLinks.moveTo(source.x, source.y);
      this.activeLinks.lineTo(target.x, target.y);
    });
  }

  // Update the nodes position
  updateNodePosition() {
    this.nodes.forEach((node) => {
      let { x, y, focus, gfx } = node;
      gfx.x = x;
      gfx.y = y;
      if (focus) {
        gfx.tint = 0xffffff;
        gfx.zIndex = 1;
      } else {
        gfx.tint = 0xffffff;
        // 0x444444;
        gfx.zIndex = 0;
      }
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
    if (this.activeLinks !== undefined) {
      this.activeLinks.destroy();
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

  // Update aesthetic functions ------------------------------------------------------
  strokeScale(node) {
    const scale = d3
      .scaleOrdinal()
      .domain(["0", "1"])
      .range([0, 1.5])

    return scale(node.simulated);
  }

  highlightNetworkNodes(d) {
    if (d.group === "Actor") {

        let activityIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
        let riskIds = Global.filterLinksSourceToTarget(this.data.links, activityIds);
        let controlIds = Global.filterLinksSourceToTarget(this.data.links, riskIds);
        let ids = controlIds.concat(riskIds.concat(activityIds.concat(d.id)));

        return ids

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

  pointerOver(d, viewVariable) {
    
    // this.showInspect(d);
    d.gfx.filters = [
      new GlowFilter({
        distance: 5,
        innerStrength: 0,
        outerStrength: 2,
        color: 0xffffff,
        quality: 1,
      }),
    ];
    d.gfx.zIndex = 1;

    this.activeLink = this.highlightNetworkNodes(d);
    // this.activeNode = this.data.nodes.filter(function(i) {
    //       return this.activeLink.includes(i.id);
    //     });

    this.updateSymbolHoverValue(d.viewId);
    this.updateViewHoverValue(Global.applyColorScale(d, viewVariable, this.colorScale));
  }

  pointerOut(d) {
    // this.hideInspect(d);
    d.gfx.filters.pop();
    d.gfx.zIndex = 0;
    this.activeLink = [];
    // this.activeNode = [];

    this.updateViewHoverValue(undefined);
    this.updateSymbolHoverValue(undefined);
  }

  // Main functions ------------------------------------------------------

  run() {
    return this.simulation;
  }

  draw(viewVariable) {
    this.drawLinks();
    this.drawNodes(viewVariable);
    this.simulation.alpha(1).restart();
  }

  updateDraw(viewVariable) {
    this.destroyLinks();
    this.destroyNodes();
    this.draw(viewVariable);
    this.animate()
  }

  animate() {
    this.app.ticker.add(() => {
      this.updateLinkPosition();
      this.updateNodePosition();
    });
  }
}
