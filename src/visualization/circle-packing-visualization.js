// Libraries
import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

// Components
import { activityTypeValues } from "../utils/global";

// Styles
import * as Theme from "../component-styles/theme";

const nonHighlightOpacity = .15;

export class CirclePackingDiagram {
  app;
  containerNodes;
  data;
  height;
  inspect;
  label;
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

  // Drawing functions ------------------------------------------------------

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
    this.alphaScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4])
      .range([.05, .3, .4, .5, .6]);

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

  draw(viewVariable) {
    this.viewVariable = viewVariable;
    this.drawNodes();
    this.drawLabels();
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
      node.gfx.on("click", (e) => this.centerOnNode(node, e))

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
  
  drawLabels() {

    // this.label = d3.select(`#${this.selector}`)
    //   // .append("g")
    //     .style("font", "10px sans-serif")
    //     // .attr("pointer-events", "none")
    //     // .attr("text-anchor", "middle")
    //   .selectAll("text")
    //   .data(this.data.filter(node => node.data.treeLevel < 4))
    //   .join("text")
    //     // .style("fill-opacity", d => d.data.treeLevel === 1 ? 1 : 0)
    //     // .style("display", d => d.data.treeLevel === 1 ? "inline" : "none")
    //     .attr("class", "label")
    //     // .attr("transform", d => `translate(${d.gfx.x},${d.gfx.y})`)
    //     .style("top", d => `${this.width - d.gfx.x}px`)
    //     .style("left", d => `${this.height - d.gfx.y}px`)
    //     .text(d => d.data.name)
    //     .style("fill", "white");

      this.label = this.data.filter(node => node.data.treeLevel === 1)
        .forEach(node => {

          let x = this.width - node.gfx.x - node.r;
          let y = this.height - node.gfx.y;

          d3.select(`#${this.selector}`)
            .append("div")
            .attr("class", "label")
            // .attr("text-anchor", "middle")
            .attr("pointer-events", "none")
            .style("position", "absolute")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            // .style("text-align", "center")
            // .style("vertical-align", "middle")
            .style("font-family", Theme.labelStyles.fontFamily)
            .style("color", Theme.lightGreyColorHex)
            .style("font-size", Theme.labelStyles.fontSize)
            // .style("fill-opacity", node.data.treeLevel === 1 ? 1 : 0)
            .text(node.data.name);
        });
  }

  // Updating the draw functions on mouse interaction ------------------------------------------------------

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

  getCenter = (node) => {
    if (this.currentNodeId === this.zoomedNodeId) {
      node.gfx.cursor = "zoom-in";

      // if (node.depth === 1 ) {
        
      //   this.label.attr("transform", d => `translate(${this.viewport.worldWidth / 2},${  this.viewport.worldHeight / 2})`)
      //   return new PIXI.Point(this.viewport.worldWidth / 2, this.viewport.worldHeight / 2);
      // } else {
      //   node.parent.gfx.cursor = "zoom-out";
      //   this.label.attr("transform", d => `translate(${this.width - node.parent.x},${ this.height - node.parent.y})`)
      //   return new PIXI.Point(this.width - node.parent.x, this.height - node.parent.y);
      // }

    } else {
        // this.label.attr("transform", d => `translate(${this.width - node.x},${this.height - node.y})`)
        // return new PIXI.Point(this.width - node.x, this.height - node.y);
    }
  }

  // label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  //   node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  //   node.attr("r", d => d.r * k);

  // this.label
  //     .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
  //       .style("fill-opacity", d => d.parent === focus ? 1 : 0)
  //       .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
  //       .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });

  getZoomWidth = (node) => {
    const scale =  d3.scaleLinear()
      .range([1, 20])
      .domain([0, 4]);

    if (this.currentNodeId === this.zoomedNodeId && node.depth !== 0) {
      return scale(node.depth - 1);
    }

    return scale(node.depth);
  }

  centerOnNode(node) {
    this.currentNodeId = node.depth !== 0 ? node.data.id : 0;

    node.gfx.cursor = "zoom-out";

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