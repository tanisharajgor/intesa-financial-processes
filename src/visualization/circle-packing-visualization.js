// Libraries
import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

// Components
import { activityTypeValues } from "../utils/global";

//Styles
import * as Theme from "../component-styles/theme";

const labelZAxisDefault = 100;

const labelStylePrimary = {
  align: "center",
  fill: Theme.primaryLabelColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 13,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 120,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}

const labelStyleSecondary = {
  align: "center",
  fill: Theme.lightGreyColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 9,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 120,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}

const labelStyleTertiary = {
  align: "center",
  fill: Theme.primaryLabelColor,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 4,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 120,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}

const nonHighlightOpacity = .15;

export class CirclePackingDiagram {
  app;
  containerNodes;
  data;
  height;
  inspect;
  labels;
  levelIDs;
  nodes;
  rootDOM;
  selector;
  selectedActivities;
  selectedLevels;
  tooltip;
  width;
  viewport;
  viewVariable;
  zoomedNodeId;
  dataMap;
  containerLabelLevel1;
  containerLabelLevel2;
  containerLabelLevel3;

  constructor(data, selector, updateViewHoverValue) {
    this.data = data;
    this.levelIDs = [];
    this.dataMap = {};
    this.data.forEach(d => {
      this.levelIDs.push(d.data.id);
      this.dataMap[`${d.data.id}`] = d;
    })
    this.zoomedNodeId = 0;
    this.currentNodeId = 0;
    this.updateViewHoverValue = updateViewHoverValue;
    this.selectedActivities = [];
    this.selector = selector;
    this.selectedLevel1 = [];
    this.selectedLevel2 = [];
    this.selectedLevel3 = [];
    this.selectedChapter = [];
    this.alphaScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 5])
      .range([.05, .3, .4, .5, .6]); 
  }

  // Initializes the application
  init() {
    this.rootDOM = document.getElementById(this.selector);
    this.width = this.rootDOM.clientWidth;
    this.height = this.rootDOM.clientHeight;
    this.tooltip = Global.initTooltip(this.selector);
  
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

  // Set diagram to fill the vizualization frame
  centerVisualization(zoom, xPos, yPos) {
    if (xPos && yPos) {
      this.viewport.moveCenter(xPos, yPos)
    }
    this.viewport.zoomPercent(zoom, true)
  }

  // Aesthetic functions for drawing ------------------------------------------------------

  selectedActivitiesOpacity(node) {
    if (node.data.level < 4) {
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
      node.gfx.alpha = this.alphaScale(node.data.level);
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  selectedLevelAndActivitiesOpacity(node) {
    if (this.levelIDs.includes(node.data.id) && this.selectedActivities.includes(node.data.activityType)) {
      node.gfx.alpha = 1;
    } else {
      node.gfx.alpha = nonHighlightOpacity;
    }
  }

  opacityScale(node) {
    if (this.selectedActivities.length > 0 && this.selectedLevel1.id !== -1) {
      this.selectedLevelAndActivitiesOpacity(node);
    } else if(this.selectedActivities.length > 0) {
      this.selectedActivitiesOpacity(node);
    } else if(this.selectedLevel1.id !== -1) {
      this.selectedLevelOpacity(node);
    } else {
      node.gfx.alpha = this.alphaScale(node.data.level);
    }
  }

  updateOpacity(selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter) {
    this.selectedActivities = activityTypeValues.filter(activity => !selectedActivities.includes(activity));
    
    this.selectedLevel1 = selectedLevel1;
    this.selectedLevel2 = selectedLevel2;
    this.selectedLevel3 = selectedLevel3;
    this.selectedChapter = selectedChapter;

    if (this.selectedLevel1.id !== -1) {
      if (this.selectedLevel2.id !== -1) {
        if (this.selectedLevel3.id !== -1) {
          if (this.selectedChapter.id !== -1) {
            let foundChapter = this.dataMap[`${valuesChapter.find(d => d.id === selectedChapter.id).id}`]
            if (foundChapter !== undefined) {
              this.levelIDs = [foundChapter.data.id]
            } else {
              this.levelIDs = []
            }
          } else {
            this.levelIDs = [this.dataMap[`${this.selectedLevel3.id}`]].map(d => d.data.childrenIDs)
            .reduce((a, b) => a.concat(b))
            .concat([this.selectedLevel3]);          }
        } else {
          this.levelIDs = [this.dataMap[`${this.selectedLevel2.id}`]].map(d => d.data.childrenIDs)
          .reduce((a, b) => a.concat(b))
          .concat([this.selectedLevel2]);
        }
      } else {
        this.levelIDs = [this.dataMap[`${this.selectedLevel1.id}`]].map(d => d.data.childrenIDs)
          .reduce((a, b) => a.concat(b))
          .concat([this.selectedLevel1]);
      }
    }

    this.data.forEach(n => this.opacityScale(n));
  }

  // Drawing functions ------------------------------------------------------

  draw(viewVariable) {
    this.viewVariable = viewVariable;
    this.drawNodes();
    this.initLabels();
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
      node.gfx.lineStyle(lineWidth(node.data.level), 0xFFFFFF, 1);
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
      node.gfx.on("click", (e) => this.centerOnNode(node, e));

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

  // Wraps the text according to the label style
  labelMetrics(d) {
    const textMetrics = PIXI.TextMetrics.measureText(d.data.descr, this.labelStylePrimary);
    d.width = textMetrics.maxLineWidth + 15;
    d.height = textMetrics.lineHeight * textMetrics.lines.length + 15;
  }
  
  // Adds the rest of the label styles
  label(d, labelStyles) {
    const label = new PIXI.Text(d.data.descr, labelStyles);
      label.zIndex = labelZAxisDefault;
      label.x = this.width - d.gfx.x;
      label.y = this.height - d.gfx.y;
      label.anchor.set(.5, .5);
      label.resolution = 2;
      this.containerLabelLevel1.addChild(label);
  }

  initLabels() {
    //Initialize containers
    this.containerLabelLevel1 = new PIXI.Container();
    this.containerLabelLevel2 = new PIXI.Container();
    this.containerLabelLevel3 = new PIXI.Container();

    // Initialize styles
    this.labelStylePrimary = new PIXI.TextStyle(labelStylePrimary);
    this.labelStyleSecondary = new PIXI.TextStyle(labelStyleSecondary);
    this.labelStyleTertiary = new PIXI.TextStyle(labelStyleTertiary);

    // Initialized first level of labels
    this.level1Labels = this.data.filter(d => d.data.level === 1)
      .forEach(d => {
        this.labelMetrics(d);
        this.label(d, this.labelStylePrimary);
    });

    // add labels to viewport
    this.viewport.addChild(this.containerLabelLevel1);
  }

  // Tooltip interaction ------------------------------------------------------

  tooltipText(d) {
    return `${d.data.level === 4? "Activity": "Process"} <br><b>${d.data.descr}</b>`;
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

  // Panning and zooming ------------------------------------------------------
  getCenter = (node) => {
    if (this.currentNodeId === this.zoomedNodeId) {
      node.gfx.cursor = "zoom-in";
      if (node.depth === 1 ) {
        return new PIXI.Point(this.viewport.worldWidth / 2, this.viewport.worldHeight / 2);
      } else {
        node.parent.gfx.cursor = "zoom-out";
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

  updateLabels(node) {

    console.log(node)

    if (node.depth > 0) {

      // this.level2Labels = node.children
      //   .forEach(d => {
      //     this.labelMetrics(d);
      //     this.label(d, this.labelStyleTertiary);
      //   });

      // this.viewport.addChild(this.containerLabelLevel2);

      // if (node.depth > 1) {

      //   this.level3Labels = this.data
      //   .filter(d => d.data.level === 3)
      //   .forEach(d => {
      //     this.labelMetrics(d);
      //     this.label(d, this.labelStylePrimary);
      //   });

      //   this.viewport.addChild(this.containerLabelLevel3);
      // }

      this.containerLabelLevel1.children.forEach(label => {
        label.resolution = 10;
        label.style = labelStyleSecondary;
      });

    } else {
      this.containerLabelLevel1.children.forEach(label => {
        label.resolution = 2;
        label.style = labelStylePrimary;
      });

      if (this.containerLabelLevel2) {
        this.containerLabelLevel2.destroy();
      }

      if (this.containerLabelLevel3) {
        this.containerLabelLevel3.destroy();
      }
    }
  }

  centerOnNode(node) {

    node.gfx.cursor = "zoom-out";
    this.currentNodeId = node.depth !== 0 ? node.data.id : 0;

    const zoomScale = this.getZoomWidth(node);
    const centerPoint = this.getCenter(node);
    this.updateLabels(node);

    this.viewport.animate({
      position: centerPoint,
      scale: zoomScale,
    })

    this.zoomedNodeId = this.currentNodeId;
  }

  // Updating the draw functions  ------------------------------------------------------

  // Destroys the nodes on data update
  destroyNodes() {
    if (this.containerNodes) {
      this.containerNodes.destroy();
    }
  }

  updateDraw(viewVariable) {
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
