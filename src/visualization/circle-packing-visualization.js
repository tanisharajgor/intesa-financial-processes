import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import graph from "../data/processed/nested/network2.json";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

const opacityScale = d3.scaleOrdinal()
  .domain([0, 1, 2, 3, 4])
  .range([.05, .3, .4, .5, .9]);

const lineWidth = d3.scaleOrdinal()
  .domain([0, 1, 2, 3, 4])
  .range([.5, .5, .5, .5, 0]);

export class CirclePackingDiagram {
    app;
    containerNodes;
    data;
    height;
    inspect;
    nodes;
    rootDOM;
    tooltip;
    width;
    viewport;
    zoomedNodeId
  
    constructor(data = graph, updateViewHoverValue) {
      this.data = data;
      this.zoomedNodeId = 0;
      this.currentNodeId = 0;
      this.updateViewHoverValue = updateViewHoverValue;
    }
  
    // Initializes the application
    init(selector) {
      this.rootDOM = document.getElementById(selector);
      this.width = this.rootDOM.clientWidth;
      this.height = this.rootDOM.clientHeight;
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
    
    draw(viewVariable) {
        this.drawBackground();
        this.drawNodes(viewVariable);
    }

    drawBackground() {
        const bkgrd = new PIXI.Graphics();
        bkgrd.beginFill(0xFFFFFF, 0.01)
        bkgrd.drawRect(-466, -466, this.width * 2, this.height * 2)
        bkgrd.interactive = true;
        bkgrd.on("click", (e) => this.onClick({depth: 0, id: 0}, e))

        this.viewport.addChild(bkgrd);
    }

    // Initializes the nodes
    drawNodes(viewVariable) {

      this.containerNodes = new PIXI.Container();
      this.nodes = [];

      this.data.forEach((node) => {
          node.viewId = node.data.viewId;
          node.gfx = new PIXI.Graphics();
          node.gfx.lineStyle(lineWidth(node.data.treeLevel), 0xFFFFFF, 1);
          node.gfx.lineWidth = 1;
          node.gfx.beginFill(Global.applyColorScale(node.data, viewVariable));
          Global.symbolScalePixi(node, node.r);
          node.gfx.endFill();

          node.gfx.x = node.x;
          node.gfx.y = node.y;
          node.gfx.alpha = opacityScale(node.data.treeLevel);
          node.gfx.interactive = true;
          node.gfx.buttonMode = true;
          node.gfx.cursor = 'pointer';
          node.gfx.on("pointerover", (e) => this.pointerOver(node, e, viewVariable));
          node.gfx.on("pointerout", (e) => this.pointerOut(node, e));
          node.gfx.on("click", (e) => this.onClick(node, e))

          this.nodes.push(node);
          this.containerNodes.addChild(node.gfx); 
      });

      this.viewport.addChild(this.containerNodes);
    }
  
    // Updating the draw functions on mouse interaction ------------------------------------------------------

    tooltipText(d) {
      return `${d.data.treeLevel === 4? "Activity": "Process"}: ${d.data.name}`;
    }

    showTooltip(d, event) {
      let x;
      let y;

      if (this.zoomedNodeId === 0) {
        x = d.x + d.r;
        y = d.y - d.r;
      } else {
        x = event.client.x;
        y = event.client.y;
      }

      this.tooltip.style("visibility", "visible")
        .style("top", `${y}px`)
        .style("left", `${x}px`)
        .html(this.tooltipText(d));
    }

    pointerOver(node, event, viewVariable) {
      console.log(event)
        node.gfx.alpha = .9;
        this.showTooltip(node, event);
        this.updateViewHoverValue(Global.applyColorScale(node.data, viewVariable));
    }

    pointerOut(node, event) {
        node.gfx.alpha = opacityScale(node.data.treeLevel);
        this.tooltip.style("visibility", "hidden");
        this.updateViewHoverValue(undefined);
        this.app.renderer.events.cursorStyles.default = 'default';
    }

    getCenter = (node) => {

      if (node.depth === 0) {
          return new PIXI.Point(this.width / 2, this.height / 2);
      } else if (this.currentNodeId === this.zoomedNodeId) {
          return new PIXI.Point(node.parent.x, node.parent.y);
      } else {
          return new PIXI.Point(node.x, node.y);
      }
    }

    getZoomWidth = (node) => {

      const scale = d3.scaleLinear()
        .range([1, 20])
        .domain([0, 4]);

      if (this.currentNodeId === this.zoomedNodeId && node.depth !== 0) {
        return scale(node.depth - 1);
      }

      return scale(node.depth);
    }

    onClick(node) {
        this.currentNodeId = node.depth !== 0 ? node.data.id : 0;

        this.viewport.animate({
            position: this.getCenter(node),
            scale: this.getZoomWidth(node),
        })

        this.zoomedNodeId = this.currentNodeId;
    }
  
    // Destroys the nodes on data update
    destroyNodes() {
      if (this.containerNodes) {
        this.containerNodes.destroy();
      }
    }

    updateDraw(viewVariable) {
      this.destroyNodes();
      this.drawBackground();
      this.drawNodes(viewVariable);
    }
}
