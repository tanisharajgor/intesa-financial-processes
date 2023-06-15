import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';
import { activityTypeValues } from "../utils/global";

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
  selectedActivities;
  selectedLevels;
  tooltip;
  width;
  viewport;
  zoomedNodeId;

  constructor(data, updateViewHoverValue) {
    this.data = data;
    this.zoomedNodeId = 0;
    this.currentNodeId = 0;
    this.updateViewHoverValue = updateViewHoverValue;
    this.selectedActivities = [];
    this.selectedLevels = [];
  }

  // Initializes the application
  init(selector) {
    this.rootDOM = document.getElementById(selector);
    this.width = this.rootDOM.clientWidth;
    this.height = this.rootDOM.clientHeight;
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

    this.viewport
      .pinch({ percent: 1 })
      .wheel({ percent: 0.1 })
      .drag();

    this.app.stage.addChild(this.viewport);
  }
  
  // Drawing functions ------------------------------------------------------

  selectedActivitiesOpacity(node) {
    if (node.data.treeLevel < 4) {
      node.gfx.alpha = .1;
    } else {
      if (this.selectedActivities.includes(node.data.activityType)) {
        node.gfx.alpha = 1;
      } else {
        node.gfx.alpha = .1;
      }
    }
  }

  selectedLevelsOpacity(node) {

    if (node.data.treeLevel < 4) {
      node.gfx.alpha = .1;
    } else {

      if (this.selectedLevels.includes(node.data.id)) {
        node.gfx.alpha = 1;
      } else {
        node.gfx.alpha = .1;
      }
    }
  }

  opacityScale(node) {
  
    if (this.selectedActivities.length !== 0 && this.selectedLevels.length !== 0) {

      // this.selectedActivitiesOpacity(node);

    } else if(this.selectedActivities.length !== 0) {
      this.selectedActivitiesOpacity(node);
    } else if(this.selectedLevels.length !== 0) {
      this.selectedLevelsOpacity(node);
    } else {

      const scale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range([.05, .3, .4, .5, .9]);

      node.gfx.alpha = scale(node.data.treeLevel);
    }
  }

  draw(viewVariable) {
    this.drawNodes(viewVariable);
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

      this.opacityScale(node);

      Global.symbolScalePixi(node, node.r);
      node.gfx.endFill();

      node.gfx.x = node.x;
      node.gfx.y = node.y;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.cursor = 'zoom-in';
      node.gfx.on("pointerover", (e) => this.pointerOver(node, e, viewVariable));
      node.gfx.on("pointerout", (e) => this.pointerOut(node, e));
      node.gfx.on("click", (e) => this.onClick(node, e))

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx); 
    });

    this.containerNodes.x = this.app.screen.width / 2;
    this.containerNodes.y = this.app.screen.height / 2;

    this.containerNodes.pivot.x = this.width / 2;
    this.containerNodes.pivot.y = this.height / 2;
    this.containerNodes.rotation = Math.PI;

    this.viewport.addChild(this.containerNodes);
  }
  
  // Updating the draw functions on mouse interaction ------------------------------------------------------

  tooltipText(d) {
    return `${d.data.treeLevel === 4? "Activity": "Process"}: ${d.data.name}`;
  }

  showTooltip(d, event) {

    let x = event.screen.x + 20;
    let y = event.screen.y - 10;

    this.tooltip.style("visibility", "visible")
      .style("top", `${y}px`)
      .style("left", `${x}px`)
      .html(this.tooltipText(d));
    }

  pointerOver(node, event, viewVariable) {
    node.gfx.alpha = 1;
    this.showTooltip(node, event);
    this.updateViewHoverValue(Global.applyColorScale(node.data, viewVariable));
  }

  pointerOut(node, event) {
    this.opacityScale(node);
    this.tooltip.style("visibility", "hidden");
    this.updateViewHoverValue(undefined);
  }

  getCenter = (node) => {
    if (this.currentNodeId === this.zoomedNodeId) {
      node.gfx.cursor = "zoom-in"
      if (node.depth === 1 ) {
        return new PIXI.Point(this.viewport.worldWidth / 2, this.viewport.worldHeight / 2);
      } else {
        node.parent.gfx.cursor = "zoom-out"
        return new PIXI.Point(this.width - node.parent.x, this.height - node.parent.y);
      }
    } else {
        return new PIXI.Point(this.width - node.x, this.height - node.y)
    }
  }

  getZoomWidth = (node) => {
    const scale =  d3.scaleLinear()
      .range([1, 20])
      .domain([0, 4]);

    if (this.currentNodeId === this.zoomedNodeId && node.depth !== 0) {
      return scale(node.depth - 1);
    }

    return scale(node.depth);
  }

  onClick(node) {
    this.currentNodeId = node.depth !== 0 ? node.data.id : 0;

    node.gfx.cursor = "zoom-out"

    const zoomScale = this.getZoomWidth(node);
    const centerPoint = this.getCenter(node);

    this.viewport.animate({
      position: centerPoint,
      scale: zoomScale,
    })

    this.zoomedNodeId = this.currentNodeId;
  }

  // Destroys the nodes on data update
  destroyNodes() {
    if (this.containerNodes) {
      this.containerNodes.destroy();
    }
  }

  updateDraw(viewVariable, selectedActivities, selectedLevel) {
    this.selectedActivities = activityTypeValues.filter(x => !selectedActivities.includes(x));

    if (this.selectedLevel !== undefined) {
      this.selectedLevels = [selectedLevel];
    }

    console.log(this.selectedLevels)
    this.destroyNodes();
    this.drawNodes(viewVariable);
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
        this.viewport.moveCenter(this.width / 2, this.height / 2)
      }
    }
  }
}
