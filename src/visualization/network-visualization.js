import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";
import * as Global from "../utils/global";
import lookUp from "../data/processed/nested/lu.json";
import graph from "../data/processed/nested/network2.json";
import { Viewport } from 'pixi-viewport'
import * as forceInABox from "force-in-a-box";
import '@pixi/graphics-extras';

export default class NetworkVisualization {

  activeLinks;
  activeLink;
  app;
  average;
  containerLabels;
  containerNodes;
  containerLinks;
  data;
  deviation;
  height;
  inspect;
  links;
  nodes;
  rootDOM;
  simulation;
  width;
  value;
  viewport;
  viewBy;
  yScale;
  rScale = d3.scaleLinear()
    .range([5, 13])

  constructor(data = graph) {
    this.data = data;
    this.maxRadius = 25;
    this.nodeRadius = [1, d3.max(this.data.nodes, (d) => d.radius)];
    this.simulation = d3.forceSimulation()
      .nodes(this.data.nodes);
    this.value = "score";
  }

  // Initializes the application
  init(selector) {
    this.rootDOM = document.getElementById(selector);
    this.width = this.rootDOM.clientWidth;
    this.height = this.rootDOM.clientHeight;

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

    this.yScale = d3
      .scaleLinear()
      .domain([1, 5])
      .range([this.height]); // - Global.margin.bottom, Global.margin.top]);

    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.height,
      worldWidth: this.width,
      worldHeight: this.height,
      passiveWheel: false,
        interaction: this.app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        events: this.app.renderer.events
      })
  
      this.app.stage.addChild(this.viewport)
  
    this.viewport
      .pinch({ percent: 1 })
      .wheel({ percent: 0.1 })
      .drag()
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
  }

  // Initializes the nodes
  drawNodes(viewVariable) {
    this.rScale.domain(d3.extent(this.data.nodes, ((d) => d.nActivities === undefined ? 1: d.nActivities)));
    this.containerNodes = new PIXI.Container();

    this.nodes = [];
    this.data.nodes.forEach((node) => {
      const rSize = node.group === "Actor" ? this.rScale(node.nActivities): 10

      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(this.strokeScale(node), 0xFFFFFF);
      node.gfx.beginFill(Global.applyColorScale(node, viewVariable, Global.createColorScale(viewVariable))) //0xffffff) // applyColorScale(node.riskStatus, riskVariable, this.colorScale));

      switch(node.group) {
        case "Actor":
          node.gfx.drawCircle(0, 0, rSize);
          node.shape = "circle"
          break;
        case "Activity":
          node.gfx.drawRect(0, 0, rSize, rSize);
          node.shape = "square"
          break;
        case "Control":
          node.gfx.drawStar(0, 0, 5, rSize);
          node.shape = "start"
          break;
        case "Risk":
          node.gfx.drawRegularPolygon(0, 0, rSize, 3);
          node.shape = "triangle"
          break;          
        default:
          node.gfx.drawRegularPolygon(0, 0, rSize, 4, 1.7);
          node.shape = "diamond"
          break;
      }
      node.size = rSize

      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      // node.gfx.on("pointerover", () => this.pointerOver(node));
      // node.gfx.on("pointerout", () => this.pointerOut(node));

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }


  // Updating the draw functions during the animation ------------------------------------------------------

  // Update the links position
  updateLinkPosition(analyzeLineStyle = false) {

    this.links.clear();
    this.data.links.forEach((link) => {
      let { source, target } = link;

      if (analyzeLineStyle) {
        this.links.lineStyle(2, 0x888888);
      } else {
        this.links.lineStyle(1, 0x888888);
      }

      this.links.moveTo(target.x + (target.size / 2), target.y + (target.size / 2));
      this.links.lineTo(source.x + (source.size / 2), source.y + (source.size / 2));
    });

    this.activeLinks.clear();
    const activeLinkData = this.data.links.filter((d) =>
      d.source.id === this.activeLink ||
      d.target.id === this.activeLink
    );
    activeLinkData.forEach((link) => {
      let { source, target } = link;
      this.activeLinks.lineStyle(1, 0x999999); // darken the lines
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
  convertNumericHex(d) {
    return parseInt(d.slice(1), 16)
  }

  colorScale(d, defaultColor = '#e0e0e0') {

    let lu = lookUp[this.viewBy];
    let uniqueGroups = Array.from(new Set(this.data.nodes.map((d) => d[this.viewBy])));
    lu = lu.filter((d) => uniqueGroups.includes(d.id)).sort((a, b) => a.id - b.id);

    let scale = d3.scaleOrdinal()
      .domain(lu.map((d) => d.id))
      .range(Global.palette);

    return d === "area" || d === undefined ? this.convertNumericHex(defaultColor) : this.convertNumericHex(scale(d));
  }

  radiusScale(node) {
    const scale = d3
      .scaleSqrt()
      .domain(this.nodeRadius)
      .range([3, this.maxRadius]);

    return scale(node.radius);
  }

  strokeScale(node) {
    const scale = d3
      .scaleOrdinal()
      .domain(["0", "1"])
      .range([0, 1.5])

    return scale(node.simulated);
  }

  // Inspect functions ------------------------------------------------------

  // showInspect(d) {
  //   let thisCircle = d3.select(this);

  //   const b = this.data.links
  //       .filter((i) => i.source.id === d.id || i.target.id === d.id)
  //       .map((d) => d.index);

  //   inspectNetworkDetail(inspect, d, b);

  //   thisCircle
  //     .attr("stroke", "white")
  //     .attr("stroke-width", 2);

  //   d3.selectAll(`#${id} svg path`).attr("opacity", .5)
  //   d3.select(this).attr("opacity", 1).raise();

  //   d3.selectAll(`#${id} .link`)
  //     .attr("opacity", d => b.includes(d.index) ? 1: .5)
  //     .attr("stroke", d => b.includes(d.index)? "grey": linkColor)
  //     .attr("stroke-width", d => b.includes(d.index)? 1.5: 1);

  //   updateSymbolHoverValue(symbolScale(d));
  //   updateRiskHoverValue(d.riskStatus[riskVariable]);
  // }

  pointerOver(d) {
    this.showInspect(d);
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

    this.activeLink = d.id;
  }

  pointerOut(d) {
    this.hideInspect(d);
    d.gfx.filters.pop();
    d.gfx.zIndex = 0;
    this.activeLink = null;
  }

  // Main functions ------------------------------------------------------

  run() {
    return this.simulation;
  }

  draw(viewVariable) {
    this.drawLinks();
    this.drawNodes(viewVariable);
  }

  updateDraw(viewVariable) {
      this.destroyLinks();
      this.destroyNodes();
      this.draw(viewVariable);
  }

  animate(analyzeLineStyle = false) {
    this.app.ticker.add(() => {
        this.updateLinkPosition(analyzeLineStyle);
        this.updateNodePosition();
    });
  }

  updateReactParams(cluster, clusterBy, viewBy, identifiedNodes) {

    this.diagram.cluster = cluster;
    this.diagram.viewBy = viewBy;
    this.diagram.clusterBy = clusterBy;

    for (let n in this.diagram.data.nodes) {
        this.diagram.data.nodes[n].focus = identifiedNodes.includes(this.diagram.data.nodes[n].id);
    }
}

  layout() {
    let w = this.width * 0.5;
    let h = this.height * 0.5;

    this.simulation
      .alpha(1).restart()
      .nodes(this.data.nodes)
      .force('link', d3.forceLink().id((d) => d.id).distance(30)) // .distance(30) // .strength(0.3)
      .force('charge', d3.forceManyBody().strength(-1.5)) // spreads things out
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collide", d3.forceCollide().strength(2).radius(8))
      .force('x', d3.forceX()
        .x(function (d) {
            return d.xRadial === undefined ? w : d.xRadial;
          })
        )
      .force('y', d3.forceY()
          .y(function (d) {
              return d.yRadial === undefined ? h : d.yRadial;
          })
      )
      .force("forceInABox", forceInABox()
          .strength(0.5)
          // .forceNodeSize(d => 10)
          .size([this.width, this.height])
      )
      this.simulation.force("link").links(this.data.links);
  }
}
