import * as d3 from "d3";
import * as PIXI from "pixi.js";
import * as Global from "../utils/global";
import graph from "../data/processed/nested/network2.json";
import { Viewport } from 'pixi-viewport'
import '@pixi/graphics-extras';

export class CirclePackingDiagram {
    app;
    containerNodes;
    data;
    height;
    inspect;
    nodes;
    rootDOM;
    width;
    viewport;
    yScale;
    rScale = d3.scaleLinear()
      .range([5, 13])
  
    constructor(data = graph) {
      this.data = data
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
        .range([this.height]);
  
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
    
    // Initializes the nodes
    draw(viewVariable) {
        this.containerNodes = new PIXI.Container();
        this.nodes = []

        this.data.forEach((node) => {
            node.gfx = new PIXI.Graphics();
            node.gfx.lineStyle(1, 0xFFFFFF, 1);
            node.gfx.beginFill(Global.applyColorScaleMode(node.data, viewVariable, Global.createColorScale(viewVariable)));
            node.gfx.lineWidth = 5;
            node.gfx.drawCircle(0, 0, node.r); //node.radius?
            node.gfx.x = node.x;
            node.gfx.y = node.y;
            node.gfx.alpha = 0.1
            node.gfx.interactive = true;
            node.gfx.buttonMode = true;
            node.gfx.on("pointerover", (e) => this.pointerOver(node, e));
            node.gfx.on("pointerout", (e) => this.pointerOut(node, e));

            this.nodes.push(node);
            this.containerNodes.addChild(node.gfx);            
        })

        // this.app.stage.addChild(this.containerNodes)
        this.viewport.addChild(this.containerNodes);
    }
  
    // Updating the draw functions on mouse interaction ------------------------------------------------------

    pointerOver(node, e) {
        node.gfx.alpha = 0.5
    }

    pointerOut(node, e) {
        node.gfx.alpha = 0.1
    }
  
    // Destroys the nodes on data update
    destroyNodes() {
      if (this.containerNodes) {
        this.containerNodes.destroy();
      }
    }

    updateDraw(viewVariable) {
      this.destroyNodes();
      this.draw(viewVariable);
    }
}