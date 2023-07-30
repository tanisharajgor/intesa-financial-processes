// Libraries
import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import * as Global from '../utils/global';
import { Viewport } from 'pixi-viewport';
import '@pixi/graphics-extras';

// Components
import { activityTypeValues } from '../utils/global';

//Styles
import * as Theme from '../utils/theme';


export class CirclePackingDiagram {
  app;
  containerNodes;
  containerBackground;
  containerLabelLevel1;
  containerLabelLevel2;
  containerLabelLevel3;
  data;
  dataMap;
  focus;
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

  constructor (data, selector, updateViewHoverValue, updateSymbolHoverValue) {
    this.data = data;
    this.levelIDs = [];
    this.dataMap = {};
    this.data.forEach(d => {
      this.levelIDs.push(d.data.id);
      this.dataMap[`${d.data.id}`] = d;
    });
    this.updateViewHoverValue = updateViewHoverValue;
    this.updateSymbolHoverValue = updateSymbolHoverValue;
    this.selectedActivities = [];
    this.selector = selector;
    this.selectedLevel1 = [];
    this.selectedLevel2 = [];
    this.selectedLevel3 = [];
    this.selectedChapter = [];
    this.alphaScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 5])
      .range([0.05, 0.3, 0.4, 0.5, 0.6]);
    this.focus = { depth: 0, id: 0 }; //this.data[0];
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
  centerVisualization (zoom, xPos, yPos) {
    if (xPos && yPos) {
      this.viewport.moveCenter(xPos, yPos);
    }
    this.viewport.zoomPercent(zoom, true);
  }

  // Aesthetic functions for drawing ------------------------------------------------------

  selectedActivitiesOpacity (node) {
    if (node.data.level < 4) {
      node.gfx.alpha = Theme.nonHighlightOpacity;
    } else {
      if (this.selectedActivities.includes(node.data.activityType)) {
        node.gfx.alpha = 1;
      } else {
        node.gfx.alpha = Theme.nonHighlightOpacity;
      }
    }
  }

  selectedLevelOpacity (node) {
    if (this.levelIDs.includes(node.data.id)) {
      node.gfx.alpha = this.alphaScale(node.data.level);
    } else {
      node.gfx.alpha = Theme.nonHighlightOpacity;
    }
  }

  selectedLevelAndActivitiesOpacity (node) {
    if (this.levelIDs.includes(node.data.id) && this.selectedActivities.includes(node.data.activityType)) {
      node.gfx.alpha = 1;
    } else {
      node.gfx.alpha = Theme.nonHighlightOpacity;
    }
  }

  opacityScale (node) {
    if (this.selectedActivities.length < activityTypeValues.length && this.selectedLevel1.id !== -1) {
      this.selectedLevelAndActivitiesOpacity(node);
    } else if (this.selectedActivities.length < activityTypeValues.length) {
      this.selectedActivitiesOpacity(node);
    } else if (this.selectedLevel1.id !== -1) {
      this.selectedLevelOpacity(node);
    } else {
      node.gfx.alpha = this.alphaScale(node.data.level);
    }
  }

  updateOpacity (selectedActivities, selectedLevel1, selectedLevel2, selectedLevel3, selectedChapter, valuesChapter) {
    this.selectedActivities = selectedActivities;
    this.selectedLevel1 = selectedLevel1;
    this.selectedLevel2 = selectedLevel2;
    this.selectedLevel3 = selectedLevel3;
    this.selectedChapter = selectedChapter;

    if (this.selectedLevel1.id !== -1) {
      if (this.selectedLevel2.id !== -1) {
        if (this.selectedLevel3.id !== -1) {
          if (this.selectedChapter.id !== -1) {
            const foundChapter = this.dataMap[`${valuesChapter.find(d => d.id === selectedChapter.id).id}`];
            if (foundChapter !== undefined) {
              this.levelIDs = [foundChapter.data.id];
            } else {
              this.levelIDs = [];
            }
          } else {
            this.levelIDs = [this.dataMap[`${this.selectedLevel3.id}`]].map(d => d.data.childrenIDs)
              .reduce((a, b) => a.concat(b))
              .concat([this.selectedLevel3]);
          }
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
    this.initBackground();
    this.initNodes();
    this.initLabels();
  }

  initBackground() {
    let bg = new PIXI.Sprite(PIXI.Texture.WHITE);
      bg.width = this.width;
      bg.height = this.height;
      bg.tint = 0x000000;
      bg.interactive = true;

      bg.on('pointerover', () => {
        if(this.focus.depth > 1) {
          bg.cursor = "zoom-out";
        } else {
          bg.cursor = "default";
        }
      });
      bg.on('pointerout', () => {
        bg.cursor = "default";
      });
      bg.on('click', () => {
        this.getControls().reset();
      });
    this.viewport.addChild(bg);
  }

  // Initializes the nodes
  initNodes() {
    this.containerNodes = new PIXI.Container();
    this.nodes = [];

    const lineWidth = (level, depth) => {
      const scale = d3.scaleOrdinal()
        .domain([0, 1, 2, 3, 4])
        .range([0.4, 0.5, 0.5, 0.5, 0.1]);

      if (this.focus.depth >= 2 && depth >= 4) {
        return 0.05;
      } else if (this.focus.depth >= 3 && depth >= 4) {
        return 0.03;
      } else {
        return scale(level);
      }
    };

    this.data.forEach(node => {
      node.viewId = node.data.viewId;
      node.zoomed = false;
      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(lineWidth(node.data.level, node.depth), 0xFFFFFF, 1);
      node.gfx.beginFill(Global.applyColorScale(node.data, this.viewVariable));

      this.opacityScale(node);

      Global.symbolScalePixi(node, node.r);
      node.gfx.endFill();

      node.gfx.x = node.x;
      node.gfx.y = node.y;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.on('pointerover', (e) => this.pointerOver(node, e));
      node.gfx.on('pointerout', () => this.pointerOut(node));
      node.gfx.on('click', () => this.clickNode(node));

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

  // Visualization Labels ------------------------------------------------------

  // Wraps the text according to the label style
  labelMetrics(d, labelStyles) {
    const textMetrics = PIXI.TextMetrics.measureText(d.data.descr, labelStyles);
    d.width = textMetrics.maxLineWidth + 15;
    d.height = textMetrics.lineHeight * textMetrics.lines.length + 15;
  }
  
  // Adds the aesthetics, e.g., position, index, centered, resolution
  label(d, labelStyles, resolution) {

    this.labelMetrics(d, labelStyles);
    const label = new PIXI.Text(d.data.descr, labelStyles);
      label.zIndex = Theme.labelZAxisDefault;
      label.x = this.width - d.gfx.x;
      label.y = this.height - d.gfx.y - d.r;
      label.anchor.set(.5, .5);
      label.resolution = resolution;

      return label;
  }

  initLabels() {

    //Initialize containers
    this.containerLabelLevel1 = new PIXI.Container();
    this.containerLabelLevel2 = new PIXI.Container();
    this.containerLabelLevel3 = new PIXI.Container();

    // Initialize styles
    this.labelStylePrimary = new PIXI.TextStyle(Theme.labelStylePrimary);
    this.labelStyleSecondary = new PIXI.TextStyle(Theme.labelStyleSecondary);
    this.labelStyleTertiary = new PIXI.TextStyle(Theme.labelStyleTertiary);
    this.labelStyleQuartiary = new PIXI.TextStyle(Theme.labelStyleQuartiary);

    // Initialized first level of labels
    this.level1Labels = this.data.filter(d => d.data.level === 1)
      .forEach(d => {
        const label = this.label(d, this.labelStylePrimary, 2);
        this.containerLabelLevel1.addChild(label);
    });

    // add labels to viewport
    this.viewport.addChild(this.containerLabelLevel1);
  }

  resetLevel1Labels() {
    this.containerLabelLevel1.children.forEach(label => {
      label.resolution = 2;
      label.style = Theme.labelStylePrimary;
    });
  }

  // Destroys labels and resets level 1 labels to their original styling
  resetLabels() {
    this.destroyObject(this.containerLabelLevel2);
    this.containerLabelLevel2 = new PIXI.Container();
    this.destroyObject(this.containerLabelLevel3);
    this.containerLabelLevel3 = new PIXI.Container();
    this.resetLevel1Labels();
  }

  // Update labels according to the zoom scale
  updateLabels(node) {

    if (node.depth > 0 && node.depth < 3) {

      if (node.depth > 1 && node.depth < 3) {

        // Initialized third level of labels
        this.level3Labels = node.children
          .forEach(d => {
            const label = this.label(d, this.labelStyleQuartiary, 10);
            this.containerLabelLevel3.addChild(label);
        });

        // add labels to viewport
        this.viewport.addChild(this.containerLabelLevel3);

      } else {

        // Initialized second level of labels
        this.level2Labels = node.children
          .forEach(d => {
            const label = this.label(d, this.labelStyleTertiary, 8);
            this.containerLabelLevel2.addChild(label);
        });

        // add labels to viewport
        this.viewport.addChild(this.containerLabelLevel2);
      }

      this.containerLabelLevel1.children.forEach(label => {
        label.resolution = 10;
        label.style = Theme.labelStyleSecondary;
      });

    } else {
      this.resetLabels();
    }
  }

  // Tooltip interaction ------------------------------------------------------

  tooltipText (d) {
    return `${d.depth === 4 ? '<b>Activity</b>' : '<b>Process</b>'} <br>${d.data.descr}`;
  }

  showTooltip (d, event) {
    const x = event.screen.x + 20;
    const y = event.screen.y - 10;

    this.tooltip.style('visibility', 'visible')
      .style('top', `${y}px`)
      .style('left', `${x}px`)
      .html(this.tooltipText(d));
  }

  // Updates the cursor to zoom in or out by comparing the current to the focus
  updateCursor = (node) => {
    if(node.depth < this.focus.depth) {
      node.gfx.cursor = "zoom-out";
    } else if (node.id === this.focus.id) {
      node.gfx.cursor = "cursor";
    } else {
      node.gfx.cursor = "zoom-in";
    }
  };

  pointerOver (node, event) {
    node.gfx.alpha = 1;
    this.updateCursor(node);
    this.showTooltip(node, event);
    this.updateViewHoverValue(Global.applyColorScale(node.data, this.viewVariable));
    this.updateSymbolHoverValue(node.viewId);
  }

  pointerOut (node) {
    this.opacityScale(node);
    this.tooltip.style('visibility', 'hidden');
    this.updateViewHoverValue("");
    this.updateSymbolHoverValue("");
  }

  // Panning and zooming ------------------------------------------------------

  getCenter = (node) => {
    return new PIXI.Point(this.width - node.x, this.height - node.y);
  };

  getZoomWidth(node) {
    const domain = node.depth === 1 ? [110, 80] : [110, 0.4];
    const range = node.depth === 1 ? [1.5, 3] : [2, 23];

    const radiusScale =  d3.scaleSqrt()
      .domain(domain)
      .range(range);
    return radiusScale(node.r);
  }

  // Operations that occur on click
  clickNode(node) {
    if (this.focus.depth >= 2) {
      this.updateDraw(this.viewVariable);
    }

    node.zoomed = !node.zoomed;
    this.focus = node;
    if(!node.zoomed && node.depth === 1) {
      this.getControls().reset();
    } else {
      const zoomScale = this.getZoomWidth(node);
      const centerPoint = this.getCenter(node);
      this.updateLabels(node);
      this.viewport.animate({
        position: centerPoint,
        scale: zoomScale
      });
    }
  }

  // Updating the draw functions  ------------------------------------------------------

  // Destroys object and recreates empty container
  destroyObject (pixiObject) {
    if (pixiObject) {
      pixiObject.destroy();
    }
  }

  // Destroys the nodes on data update
  destroyNodes() {
    this.destroyObject(this.containerNodes);
  }

  updateDraw(viewVariable) {
    this.viewVariable = viewVariable;
    this.destroyNodes();
    this.initNodes();
  }

  // Controls ------------------------------------------------------
  getControls () {
    return {
      zoomIn: () => {
        this.viewport.zoomPercent(0.15, true);
      },
      zoomOut: () => {
        this.viewport.zoomPercent(-0.15, true);
      },
      reset: () => {
        this.focus = { depth: 0, id: 0 };
        this.viewport.fit();
        this.centerVisualization(-0.10, this.width / 2, (this.height / 2) - 75);
        this.resetLabels();
      }
    };
  }
}
