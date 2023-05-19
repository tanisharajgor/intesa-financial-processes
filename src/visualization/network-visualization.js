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
  activeNodes;
  app;
  clickNode;
  clickViewport;
  clickCount;
  containerLabels;
  containerNodes;
  containerLinks;
  data;
  height;
  inspect;
  links;
  nodes;
  rootDOM;
  simulation;
  tooltip;
  width;
  viewport;

  constructor(data = graph, updateSymbolHoverValue, updateViewHoverValue) {
    this.updateSymbolHoverValue = updateSymbolHoverValue;
    this.updateViewHoverValue = updateViewHoverValue;
    this.data = data;
    this.activeLink = [];
    this.activeNodes = [];
    this.clickNode = false;
    this.clickViewport = false;
    this.clickCount = 0;
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
    this.initTooltip(selector);

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

  clickOff() {

    this.clickCount++;
    if (this.clickCount > 2) {
      this.clickNode = false;
      this.clickCount = 0;
      this.activeNodes
        .forEach(node => {
          let { gfx } = node;
          gfx.filters.pop();
          gfx.zIndex = 0;
        });

        this.activeLink = [];
        this.activeNode = [];
    }
  }

  clickOn(node) {

    this.clickNode = true;
    this.clickCount++;
    if (this.clickCount > 3) {
      this.clickNode = false;
      this.clickCount = 0;
    }
    console.log(this.clickCount)

    this.activeNodes
      .forEach(node => {
        let { gfx } = node;
        gfx.filters.pop();
        gfx.zIndex = 0;
      });
    this.highlightNetworkNodes(node);
  }

  initTooltip(selector) {
    this.tooltip = d3.select(`#${selector}`)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("left", "0px")
      .style("top", "0px")
      .style("visibility", "hidden")
      .style("padding", "10px")
      .style("pointer-events", "none")
      .style("border-radius", "5px")
      .style("background-color", "rgba(0, 0, 0, 0.65)")
      .style("font-family", '"IBM Plex", ""Helvetica Neue", Helvetica, Arial, sans-serif')
      .style("font-weight", "normal")
      .style("border", "1px solid rgba(78, 81, 85, 0.7)")
      .style("font-size", "16px");
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
    this.nodes = [];
    this.data.nodes.forEach((node) => {

      const rSize = node.viewId === "Actor" ? Global.rScale(node.viewType.nActivity): 5;

      node.gfx = new PIXI.Graphics();
      // node.gfx.lineStyle(Global.applyStrokeScaleWeight(node, viewVariable), Global.missingColorBorder);
      node.gfx.beginFill(Global.applyColorScale(node, viewVariable));
      Global.symbolScalePixi(node, rSize);

      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.cursor = 'pointer';
      node.gfx.on("pointerover", () => this.pointerOver(node, viewVariable));
      node.gfx.on("pointerout", () => this.pointerOut(node));
      node.gfx.on('click', () => this.clickOn(node));

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }

  // Updating the draw functions during the animation ------------------------------------------------------

  distance(p1, p2) {
    return Math.hypot(p2.x-p1.x, p2.y-p1.y)
  }

  solidLine(source, target) {
    this.links.lineStyle(.5, 0x888888);
    this.links.moveTo(target.x, target.y);
    this.links.lineTo(source.x, source.y);
  }

  highlightSolidLine(source, target) {
    this.activeLinks.lineStyle(1, 0xffffff);
    this.activeLinks.moveTo(source.x, source.y);
    this.activeLinks.lineTo(target.x, target.y);
  }

  // Adapated from https://codepen.io/shepelevstas/pen/WKbYyw
  dashedLine(source, target) {
    const dash = 5;
    const gap = 5;
    const p1 = {x: target.x, y: target.y};
    const p2 = {x: source.x, y: source.y};
    const len = this.distance(p1, p2);
    const norm = {x: (p2.x-p1.x)/len, y: (p2.y-p1.y)/len};
    this.links.lineStyle(0.5, 0x888888);
    this.links.moveTo(p1.x, p1.y).lineTo(p1.x+dash*norm.x, p1.y+dash*norm.y);
    let progress = dash+gap;
  
    while (progress < len) {
      this.links.moveTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += dash;
      this.links.lineTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += gap;
    }
  }

  highlightDashedLine(source, target) {

    const dash = 5;
    const gap = 5;
    const p1 = {x: target.x, y: target.y};
    const p2 = {x: source.x, y: source.y};
    const len = this.distance(p1, p2);
    const norm = {x: (p2.x-p1.x)/len, y: (p2.y-p1.y)/len};
    this.activeLinks.lineStyle(1, 0xffffff);
    this.activeLinks.moveTo(p1.x, p1.y).lineTo(p1.x+dash*norm.x, p1.y+dash*norm.y);
    let progress = dash+gap;

    while (progress < len) {
      this.activeLinks.moveTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += dash;
      this.activeLinks.lineTo(p1.x+progress*norm.x, p1.y+progress*norm.y);
      progress += gap;
    }
  }

  // Update the links position
  updateLinkPosition() {

    // Links
    this.links.clear();
    this.data.links.forEach(link => {
      let { source, target } = link;

      if (source.viewId === "Actor" && target.viewId === "Other activity") {
        this.solidLine(source, target);
      } else {
        this.dashedLine(source, target);
      }
    });

    // Hover on links
    this.activeLinks.clear();
    const activeLinkData = this.data.links
            .filter(d => this.activeLink.includes(d.source.id) && this.activeLink.includes(d.target.id));

    activeLinkData.forEach(link => {
      let { source, target } = link;

      if (source.viewId === "Actor" && target.viewId === "Other activity") {
        this.highlightSolidLine(source, target);
      } else {
        this.highlightDashedLine(source, target);
      }
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

  // Controls ------------------------------------------------------

  getControls() {
    return {
      zoomIn: () => {
        this.viewport.zoomPercent(0.15, true);
        // Object.keys(this).forEach((k) => {
        //   if (k.includes("labelContainer")) {
        //     let child = this[k];
        //     let scale = 0.1
        //       if (child.scale.x >= 0.2) child.scale.set(child.scale.x - scale, child.scale.y - scale)
        //   }
        // })
      },
      zoomOut: () => {
        this.viewport.zoomPercent(-0.15, true);
        // Object.keys(this).forEach((k) => {
        //   if (k.includes("labelContainer")) {
        //     let child = this[k];
        //     let scale = 0.1
        //     child.scale.set(child.scale.x + scale, child.scale.y + scale)
        //   }
        // })
      },
      reset: () => {
        this.viewport.fit();
        this.viewport.moveCenter(this.width / 2, this.height / 2)
        // Object.keys(this).forEach((k) => {
        //   if (k.includes("labelContainer")) {
        //     let child = this[k];
        //     child.scale.set(1, 1)
        //   }
        // })
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
    this.activeLink = this.listHighlightNetworkNodes(d);
    this.activeNodes = this.data.nodes.filter(z => this.activeLink.includes(z.id));
    this.activeNodes
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

        return `Type: ${d.type} <br> ${d.group}: ${d.name} <br> # activities: ${d.viewType.nActivity} <br> # risks: ${d.viewType.nRisk} <br> # controls: ${d.viewType.nControl}`;

    } else if (d.viewId === "Other activity") {

        return `Type: ${d.type} <br> ${d.group}: ${d.name} <br> # actors: ${d.viewType.nActor} <br> # risks: ${d.viewType.nRisk} <br> # controls: ${d.viewType.nControl}`;

    } else if (d.viewId === "Risk") {
    
        return `${d.group}: ${d.name} <br> # actors: ${d.viewType.nActor} <br> # activity: ${d.viewType.nActivity} <br> # control: ${d.viewType.nControl}`;

    } else if (d.viewId === "Control activity") {
    
        return `Type: ${d.type} <br> ${d.group}: ${d.name} <br> # actors: ${d.viewType.nActor} <br> # risks: ${d.viewType.nRisk}`;
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

  pointerOver(d, viewVariable) {

    if (!this.clickNode) {
      this.highlightNetworkNodes(d);
    }

    this.updateSymbolHoverValue(d.viewId);
    this.updateViewHoverValue(Global.applyColorScale(d, viewVariable));
    this.showTooltip(d);
  }

  pointerOut(d) {

    if (!this.clickNode) {
      this.activeNodes
      .forEach(node => {
        let { gfx } = node;
        gfx.filters.pop();
        gfx.zIndex = 0;
      });

      this.activeLink = [];
      this.activeNode = [];
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
