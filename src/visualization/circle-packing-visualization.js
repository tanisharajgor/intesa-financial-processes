import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';
import { activityTypeValues } from "../utils/global";
import lu from "../data/processed/nested/lu";

const nonHighlightOpacity = .15;

export class CirclePackingDiagram {
  app;
  containerNodes;
  data;
  height;
  inspect;
  levelIDs;
  nodes;
  rootDOM;
  selectedActivities;
  selectedLevels;
  tooltip;
  width;
  viewport;
  viewVariable;
  zoomedNodeId;

  constructor(data, updateViewHoverValue) {
    this.data = data;
    this.levelIDs = this.data.map(d => d.data.id);
    this.zoomedNodeId = 0;
    this.currentNodeId = 0;
    this.updateViewHoverValue = updateViewHoverValue;
    this.selectedActivities = [];
    this.selectedLevel1 = [];
    this.selectedLevel2 = [];
    this.selectedLevel3 = [];
    this.selectedChapter = [];
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
      node.gfx.alpha = nonHighlightOpacity;
    } else {
      if (this.selectedActivities.includes(node.data.activityType)) {
        node.gfx.alpha = 1;
      } else {
        node.gfx.alpha = nonHighlightOpacity;
      }
    }
  }

  selectedLevelOpacity(node) {

    if (this.levelIDs.includes(node.data.id)) {
      node.gfx.alpha = this.alphaScale(node.data.treeLevel);
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  selectedLevelAndActivitiesOpacity(node) {
    if (this.levelIDs.includes(node.data.id) && this.selectedActivities.includes(node.data.activityType)) {
      node.gfx.alpha = this.alphaScale(node.data.treeLevel);
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  opacityScale(node) {

    this.alphaScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range([.05, .3, .4, .5, .6]);

    if (this.selectedActivities.length > 0 && this.selectedLevel1 !== -1) {
      this.selectedLevelAndActivitiesOpacity(node);
    } else if(this.selectedActivities.length > 0) {
      this.selectedActivitiesOpacity(node);
    } else if(this.selectedLevel1 !== -1) {
      this.selectedLevelOpacity(node);
    } else {
      node.gfx.alpha = this.alphaScale(node.data.treeLevel);
    }
  }

  draw(viewVariable) {
    this.viewVariable = viewVariable;
    this.drawNodes();
  }

  // Initializes the nodes
  drawNodes() {

    this.containerNodes = new PIXI.Container();
    this.nodes = [];

    const lineWidth = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range([.4, .5, .5, .5, .1]);

    this.data.forEach((node) => {
      node.viewId = node.data.viewId;
      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(lineWidth(node.data.treeLevel), 0xFFFFFF, 1);
      node.gfx.beginFill(Global.applyColorScale(node.data, this.viewVariable));

      this.opacityScale(node);

      Global.symbolScalePixi(node, node.r);
      node.gfx.endFill();

      node.gfx.x = node.x;
      node.gfx.y = node.y;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.cursor = 'zoom-in';
      node.gfx.on("pointerover", (e) => this.pointerOver(node, e));
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
    return `${d.data.treeLevel === 4? "Activity": "Process"} <br><b>${d.data.descr}</b>`;
  }

  showTooltip(d, event) {

    let x = event.screen.x + 20;
    let y = event.screen.y - 10;

    this.tooltip.style("visibility", "visible")
      .style("top", `${y}px`)
      .style("left", `${x}px`)
      .html(this.tooltipText(d));
    }

  pointerOver(node, event) {
    node.gfx.alpha = 1;
    this.showTooltip(node, event);
    this.updateViewHoverValue(Global.applyColorScale(node.data, this.viewVariable));
  }

  pointerOut(node) {
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

  updateDraw(viewVariable, selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter) {

    this.selectedActivities = activityTypeValues.filter(x => !selectedActivities.includes(x));
    this.selectedLevel1 = selectedLevel1;
    this.selectedLevel2 = selectedLevel2;
    this.selectedLevel3 = selectedLevel3;
    this.selectedChapter = selectedChapter;

    if (this.selectedLevel1 !== -1) {

      this.levelIDs = this.data.filter(d => [this.selectedLevel1].includes(d.data.id))
                                .map(d => d.data.childrenIDs)
                                .reduce((a, b) => a.concat(b));
      this.levelIDs = this.levelIDs.concat([this.selectedLevel1]);

    } else if (this.selectedLevel2 !== -1) {

      this.levelIDs = this.data.filter(d => [this.selectedLevel2].includes(d.data.id))
                                .map(d => d.data.childrenIDs)
                                .reduce((a, b) => a.concat(b));
      this.levelIDs = this.levelIDs.concat([this.selectedLevel2]);

    } else if (this.selectedLevel3 !== -1) {

      this.levelIDs = this.data.filter(d => [this.selectedLevel3].includes(d.data.id))
                                .map(d => d.data.childrenIDs)
                                .reduce((a, b) => a.concat(b));
      this.levelIDs = this.levelIDs.concat([this.selectedLevel3]);

    } else if (this.selectedChapter !== -1) {
      this.levelIDs = this.data.filter(d => [this.selectedChapter].includes(d.data.id))
                                .map(d => d.data.childrenIDs)
                                .reduce((a, b) => a.concat(b));
      this.levelIDs = this.levelIDs.concat([this.selectedChapter]);
    }

    console.log(this.levelIDs)

    this.viewVariable = viewVariable;
    this.destroyNodes();
    this.drawNodes();
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
