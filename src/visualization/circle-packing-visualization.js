import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import graph from "../data/processed/nested/network2.json";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

export class CirclePackingDiagram {
    app;
    colorScale;
    containerNodes;
    data;
    height;
    inspect;
    labelStyle;
    nodes;
    rootDOM;
    tooltip;
    width;
    viewport;
    zoomedNodeId
  
    constructor(data = graph, updateViewHoverValue) {
      this.data = data;
      this.zoomedNodeId = 0;
      this.labelStyle = new PIXI.TextStyle(Global.labelStyle);
      this.updateViewHoverValue = updateViewHoverValue;
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
  
    // Drawing functions ------------------------------------------------------
    
    draw(viewVariable) {
        this.drawBackground();
        this.drawNodes(viewVariable);
        this.viewport.animate({position: new PIXI.Point(466, 566)});
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
        this.colorScale = Global.createColorScale(viewVariable);

        this.data.forEach((node) => {
            node.gfx = new PIXI.Graphics();
            node.gfx.lineStyle(1, 0xFFFFFF, 1);
            node.gfx.beginFill(Global.applyColorScaleMode(node.data, viewVariable, this.colorScale));
            node.gfx.lineWidth = 5;
            node.gfx.drawCircle(0, 0, node.r);
            node.gfx.x = node.x;
            node.gfx.y = node.y;
            node.gfx.alpha = 0.1
            node.gfx.interactive = true;
            node.gfx.buttonMode = true;
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

    showTooltip(d) {
      this.tooltip = new PIXI.Container();
  
      const textMetrics = PIXI.TextMetrics.measureText(this.tooltipText(d), this.labelStyle);
      const width = textMetrics.maxLineWidth + 15;
      const height = textMetrics.lineHeight * textMetrics.lines.length + 15;
  
      // label
      const rect = new PIXI.Graphics();
      rect.lineStyle(1, 0x4e5155);
      rect.beginFill(0x000000)
          .drawFilletRect(
          d.x + 20,
          d.y - 10,
          width, 
          height,
          5);
      rect.endFill();
      rect.alpha = 0.8;
      this.tooltip.addChild(rect);
  
      // text
      const text = new PIXI.Text(this.tooltipText(d), this.labelStyle);
        text.zIndex = 100;
        text.x = (d.x + width/2) + 20;
        text.y = (d.y + height/2) -10;
        text.anchor.set(.5, .5);
  
      this.tooltip.addChild(text);
      this.viewport.addChild(this.tooltip);
    }

    pointerOver(node, e, viewVariable) {
        node.gfx.alpha = 0.5;
        this.showTooltip(node);
        this.updateViewHoverValue(Global.applyColorScaleMode(node.data, viewVariable, this.colorScale));
    }

    pointerOut(node, e) {
        node.gfx.alpha = 0.1;
        this.viewport.removeChild(this.tooltip);
        this.updateViewHoverValue(undefined);
    }

    onClick(node) {
        const currentNodeId = node.depth !== 0 ? node.data.id : 0

        // console.log(currentNodeId, this.zoomedNodeId)
        const getCenter = () => {
            if (node.depth === 0) {
                return new PIXI.Point(this.width / 2, this.height / 2)
            } else if (currentNodeId === this.zoomedNodeId) {
                return new PIXI.Point(node.parent.x, node.parent.y)
            } else {
                return new PIXI.Point(node.x, node.y)
            }
        }

        const getZoomWidth = (depth) => {
          const scale = d3.scaleLinear()
          .range([1, 20])
          .domain([0, 4]);

          // console.log(currentNodeId === this.zoomedNodeId && depth !== 0, depth)
          if (currentNodeId === this.zoomedNodeId && depth !== 0) {
            return scale(node.depth - 1)
          }
            
          return scale(node.depth)
        }

        this.viewport.animate({
            position: getCenter(),
            scale: getZoomWidth(node.depth),
        })

        this.zoomedNodeId = currentNodeId
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
