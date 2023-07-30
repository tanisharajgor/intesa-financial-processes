// Libraries
import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { Viewport } from 'pixi-viewport';
import '@pixi/graphics-extras';

// Components
import * as Global from '../utils/global';

//Styles
import * as Theme from '../utils/theme';

export default class NetworkVisualization {
  hoverLink;
  hoverNodes;
  app;
  clickNode;
  clickViewport;
  clickCount;
  containerNodes;
  containerLinks;
  data;
  height;
  identifyNodes;
  identifyLinks;
  links;
  nodes;
  rootDOM;
  selectedChapter;
  simulation;
  tooltip;
  width;
  viewport;
  viewVariable;

  constructor (data, selector, updateSymbolHoverValue, updateViewHoverValue) {
    this.updateSymbolHoverValue = updateSymbolHoverValue;
    this.updateViewHoverValue = updateViewHoverValue;
    this.data = data;
    this.hoverLink = [];
    this.hoverNode = [];
    this.clickNode = false;
    this.clickViewport = false;
    this.clickCount = 0;
    this.identifyNode = [];
    this.identifyLink = [];
    this.selector = selector;
  }

  initSimulation () {
    const adjustmentFactor = 0.161;

    this.simulation = d3.forceSimulation()
      .nodes(this.data.nodes)
      .force('link', d3.forceLink().id(function (d) { return d.id; }))
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2).strength(1))
      .force('collide', d3.forceCollide().strength(2).radius(8))
      .force('x', d3.forceX().strength(0.1))
      .force('y', d3.forceY().strength((adjustmentFactor * this.width) / this.height));

    this.simulation.force('link')
      .links(this.data.links);
  }

  // Initializes the application
  init () {
    this.rootDOM = document.getElementById(this.selector);
    this.width = this.rootDOM.clientWidth * .75; //fraction of the width until with view becomes moveable and collapseable
    this.height = this.rootDOM.clientHeight;

    this.initSimulation();
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

    this.app.stage.addChild(this.viewport);

    this.viewport
      .pinch({ percent: 1 })
      .wheel({ percent: 0.1 })
      .drag();

    this.viewport.on('click', () => this.clickOff());
  }

  // Main functions ------------------------------------------------------

  run () {
    return this.simulation;
  }

  draw (viewVariable) {
    this.viewVariable = viewVariable;
    this.drawLinks();
    this.drawNodes();
    this.simulation.alpha(1).restart();
  }

  updateDraw (viewVariable) {
    this.hoverLink = [];
    this.hoverNode = [];
    this.hoverNodes = [];
    this.destroyLinks();
    this.destroyNodes();
    this.draw(viewVariable);
    this.animate();
  }

  animate () {
    this.app.ticker.add(() => {
      this.updateLinkPosition();
      this.updateNodePosition();
    });
  }

  // Initialize forms ------------------------------------------------------

  // Initializes the links
  drawLinks () {
    this.containerLinks = new PIXI.Container();

    // Links
    this.links = new PIXI.Graphics();
    this.containerLinks.addChild(this.links);

    // Identify Links
    this.identifyLinks = new PIXI.Graphics();
    this.containerLinks.addChild(this.identifyLinks);

    this.viewport.addChild(this.containerLinks);
  }

  // Initializes the nodes
  drawNodes () {
    this.containerNodes = new PIXI.Container();
    this.nodes = [];

    this.data.nodes.forEach((node) => {
      const rSize = node.viewId === 'Actor' ? Global.rScale(node.viewType.nActivity) : 5;

      node.gfx = new PIXI.Graphics();

      if (node.viewId === 'Actor') {
        node.gfx.beginFill(0xcbcbcb);
      } else {
        node.gfx.beginFill(Global.applyColorScale(node, this.viewVariable));
      }

      Global.symbolScalePixi(node, rSize);

      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.cursor = 'pointer';
      node.gfx.on('pointerover', () => this.pointerOver(node));
      node.gfx.on('pointerout', () => this.pointerOut());
      node.gfx.on('click', () => this.clickOn(node));

      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }

  // Update notes and links during animation ------------------------------------------------------

  // Update the links position
  updateLinkPosition () {
    // Links
    this.links.clear();
    this.data.links.forEach(link => {
      const { source, target, connect_actor_activity } = link;

      // Hover on links
      this.hoverNetworkLinks(this.links, source, target);

      // Line type
      this.lineType(this.links, source, target, connect_actor_activity);

      if (this.selectedChapter === -1 && this.selectedOrg === -1) {
        this.links.alpha = 1;
      } else {
        this.links.alpha = Theme.nonHighlightOpacity;
      }
    });

    this.identifyLinks.clear();
    this.data.links
      .filter(d => (this.identifyLink.includes(d.source.id) && this.identifyLink.includes(d.target.id)))
      .forEach(link => {
        const { source, target, connect_actor_activity } = link;
        this.identifyLinks.alpha = 1;

        // Hover on links
        this.hoverNetworkLinks(this.identifyLinks, source, target);

        // Line type
        this.lineType(this.identifyLinks, source, target, connect_actor_activity);
      });
  }

  // Update the nodes position
  updateNodePosition () {
    this.nodes.forEach((node) => {
      const { x, y, gfx } = node;
      gfx.x = x;
      gfx.y = y;
    });
  }

  // Updating the draw functions during the animation ------------------------------------------------------

  defaultLine (links) {
    links.lineStyle(1, 0x686868);
  }

  highlightLine (links) {
    links.lineStyle(1, 0xffffff);
  }

  solidLine (links, source, target) {
    links.moveTo(source.x, source.y);
    links.lineTo(target.x, target.y);
  }

  distance (p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  }

  // Adapated from https://codepen.io/shepelevstas/pen/WKbYyw
  dashedLine (links, source, target) {
    const dash = 5;
    const gap = 5;
    const p1 = { x: target.x, y: target.y };
    const p2 = { x: source.x, y: source.y };
    const len = this.distance(p1, p2);
    const norm = { x: (p2.x - p1.x) / len, y: (p2.y - p1.y) / len };
    links.moveTo(p1.x, p1.y).lineTo(p1.x + dash * norm.x, p1.y + dash * norm.y);
    let progress = dash + gap;

    while (progress < len) {
      links.moveTo(p1.x + progress * norm.x, p1.y + progress * norm.y);
      progress += dash;
      links.lineTo(p1.x + progress * norm.x, p1.y + progress * norm.y);
      progress += gap;
    }
  }

  lineType (links, source, target, connect_actor_activity) {
    if (connect_actor_activity) {
      this.solidLine(links, source, target);
    } else {
      this.dashedLine(links, source, target);
    }
  }

  // Identify nodes and links to highlight
  identifyNodesLinks (node) {
    const links = this.listNetworkNodes(node);
    const nodes = this.data.nodes.filter(z => links.includes(z.id)).map(d => d.id);
    this.identifyLink = this.reduceNestedList(this.identifyLink, links);
    this.identifyNode = this.reduceNestedList(this.identifyNode, nodes);
    node.gfx.alpha = 1;
  }

  // Apply ifelse logic to identified nodes
  // nodeEvaluation is an operation that takes the value of true or false
  // node is the node object
  highlightIdentifiedNodes (nodeEvaluation, node) {
    if (nodeEvaluation) {
      this.identifyNodesLinks(node);
    } else {
      node.gfx.alpha = Theme.nonHighlightOpacity;
    }
  }

  // Highlights the non actor nodes according the identify node list
  highlightNonActorNodes (node) {
    if (this.identifyNode.includes(node.id)) {
      node.gfx.alpha = 1;
    } else {
      node.gfx.alpha = Theme.nonHighlightOpacity;
    }
  }

  // Identify identified nodes by chapter and assign them an alpha level
  selectedChapterAlpha (node) {
    if (node.viewId === 'Actor') {
      this.highlightIdentifiedNodes(node.levels.modelID.includes(this.selectedChapter), node);
    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Identify identified nodes by organizational structure and assign them an alpha level
  selectedOrgAlpha (node) {
    if (node.viewId === 'Actor') {
      this.highlightIdentifiedNodes(node.levels.orgStructureID.includes(this.selectedOrg), node);
    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Logic to define the intersection of the chapter and organizational structure
  selectedChapterAndOrgStructureAlpha (node) {
    if (node.viewId === 'Actor') {
      this.highlightIdentifiedNodes(node.levels.orgStructureID.includes(this.selectedOrg) && node.levels.modelID.includes(this.selectedChapter), node);
    } else {
      this.highlightNonActorNodes(node);
    }
  }

  // Change the opacity of the actor nodes and their linked attributes when identified
  updateNodeAlpha (selectedChapter, selectedOrg) {
    this.selectedChapter = selectedChapter.id;
    this.selectedOrg = selectedOrg.id;


    console.log(this.selectedChapter, this.selectedOrg)
    this.identifyLink = [];
    this.identifyNode = [];

    this.nodes.forEach((node) => {
      if (this.selectedChapter !== -1 && this.selectedChapter !== undefined && this.selectedOrg !== -1) {
        this.selectedChapterAndOrgStructureAlpha(node);
      } else if (this.selectedChapter !== -1 && this.selectedChapter !== undefined) {
        this.selectedChapterAlpha(node);
      } else if (this.selectedOrg !== -1) {
        this.selectedOrgAlpha(node);
      } else {
        node.gfx.alpha = 1;
      }
    });
  }

  // Destroy the links on update ------------------------------------------------------

  // Destroys the links on data update
  destroyLinks () {
    if (this.containerLinks) {
      this.containerLinks.destroy();
    }
    if (this.links !== undefined) {
      this.links.destroy();
    }
    if (this.identifyLinks !== undefined) {
      this.identifyLinks.destroy();
    }
  }

  // Destroys the nodes on data update
  destroyNodes () {
    if (this.containerNodes) {
      this.containerNodes.destroy();
    }
  }

  // Dragging functions ------------------------------------------------------

  drag () {
    // d3 drag
    d3.select(this.app.view).call(() => {
      d3.drag()
        .container(this.app.view)
        // Returns the node closest to the position with the given search radius
        .subject((d) => this.simulation.find(d.x, d.y, 10))
        .on('start', (d, e) => {
          this.dragStarted(d, e);
        })
        .on('drag', (e) => {
          this.dragged(e);
        })
        .on('end', (e) => {
          this.dragEnded(e);
        });
    });
  }

  dragStarted (d, e) {
    if (!e.active) {
      this.simulation.alphaTarget(0.1).restart();
    }
    e.subject.fx = e.subject.x;
    e.subject.fy = e.subject.y;
  }

  dragged (e) {
    e.subject.fx = e.x;
    e.subject.fy = e.y;
  }

  dragEnded (e) {
    if (!e.active) {
      this.simulation.alphaTarget(0);
    }
    e.subject.fx = null;
    e.subject.fy = null;
  }

  // Controls (panning, zooming, centering) ------------------------------------------------------

  // Set diagram to fill the vizualization frame
  centerVisualization (zoom, xPos, yPos) {
    if (xPos && yPos) {
      this.viewport.moveCenter(xPos, yPos);
    }
    this.viewport.zoomPercent(zoom, true);
  }

  getControls () {
    return {
      zoomIn: () => {
        this.viewport.zoomPercent(0.15, true);
      },
      zoomOut: () => {
        this.viewport.zoomPercent(-0.15, true);
      },
      reset: () => {
        const width = (document.getElementById(this.selector).clientWidth / 2) - document.getElementsByClassName('Query')[0].clientWidth;
        const height = (document.getElementById(this.selector).clientHeight / 2) - document.getElementsByClassName('Navigation')[0].clientHeight;
    
        this.viewport.fit();
        this.centerVisualization(-0.3,  width - 200, height)
      }
    };
  }

  // Freeze functions ------------------------------------------------------

  // Turn on the freeze network
  // Click highlights a portion of the network
  clickOn (node) {
    this.clickNode = true;
    this.clickCount++;
    if (this.clickCount > 3) {
      this.clickNode = false;
      this.clickCount = 0;
    }

    this.hoverNodes
      .forEach(node => {
        const { gfx } = node;
        gfx.filters.pop();
        gfx.zIndex = 0;
      });
    this.hoverNetworkNodes(node);
  }

  // Turn off the freeze
  // Click unhighlights the portion of the network
  clickOff () {
    this.clickCount++;
    if (this.clickCount > 2) {
      this.clickNode = false;
      this.clickCount = 0;
      this.hoverNodes
        .forEach(node => {
          const { gfx } = node;
          gfx.filters.pop();
          gfx.zIndex = 0;
        });

      this.hoverLink = [];
      this.hoverNode = [];
    }
  }

  // Tooltip functions ------------------------------------------------------

  // Makes lines white when hovered over
  hoverNetworkLinks (links, source, target) {
    if (this.hoverLink.includes(source.id) && this.hoverLink.includes(target.id)) {
      this.highlightLine(links);
    } else {
      this.defaultLine(links);
    }
  }

  // Adds glow to nodes when hovered over
  hoverNetworkNodes (d) {
    this.hoverLink = this.listNetworkNodes(d);
    this.hoverNodes = this.data.nodes.filter(z => this.hoverLink.includes(z.id));
    this.hoverNodes
      .forEach(node => {
        const { gfx } = node;

        gfx.filters = [
          new GlowFilter({
            distance: 1,
            innerStrength: 0,
            outerStrength: 2,
            color: 0xffffff,
            quality: 1
          })
        ];
        gfx.zIndex = 1;
      });
  }

  // Returns the tooltip text for each type of node
  tooltipText (d) {
    if (d.viewId === 'Actor') {
      return `<b>${d.type}</b>: ${d.descr} <br> <b>Organizational structure</b>: ${d.organizationalStructure[0].descr} <br> <b># activities</b>: ${d.viewType.nActivity} <br> <b># risks</b>: ${d.viewType.nRisk} <br> <b># controls</b>: ${d.viewType.nControl}`;
    } else if (d.viewId === 'Other activity') {
      return `<b>Type</b>: ${d.type} <br> <b>${d.group}</b>: ${d.descr} <br> <b># actors</b>: ${d.viewType.nActor} <br> <b># risks</b>: ${d.viewType.nRisk} <br> <b># controls</b>: ${d.viewType.nControl}`;
    } else if (d.viewId === 'Risk') {
      return `<b>${d.group}</b>: ${d.descr} <br> <b># actors</b>: ${d.viewType.nActor} <br> <b># activity</b>: ${d.viewType.nActivity} <br> <b># control</b>: ${d.viewType.nControl}`;
    } else if (d.viewId === 'Control activity') {
      return `<b>Type</b>: ${d.type} <br> <b>${d.group}</b>: ${d.descr} <br> <b># actors</b>: ${d.viewType.nActor} <br> <b># risks</b>: ${d.viewType.nRisk}`;
    }
  }

  showTooltip (d) {
    const x = d.x + 20;
    const y = d.y - 10;

    this.tooltip.style('visibility', 'visible')
      .style('top', `${y}px`)
      .style('left', `${x}px`)
      .html(this.tooltipText(d));
  }

  pointerOver (d) {
    if (!this.clickNode) {
      this.hoverNetworkNodes(d);
    }
    this.updateSymbolHoverValue(d.viewId);
    this.updateViewHoverValue(Global.applyColorScale(d, this.viewVariable));
    this.showTooltip(d);
  }

  pointerOut () {
    if (!this.clickNode) {
      this.hoverNodes
        .forEach(node => {
          const { gfx } = node;
          gfx.filters.pop();
          gfx.zIndex = 0;
        });

      this.hoverLink = [];
      this.hoverNode = [];
    }

    this.updateViewHoverValue("");
    this.updateSymbolHoverValue("");
    this.tooltip.style('visibility', 'hidden');
    this.app.renderer.events.cursorStyles.default = 'default';
  }

  // Helper functions ------------------------------------------------------

  reduceNestedList (emptyList, list) {
    emptyList.push(list);
    emptyList = emptyList.flat(1);
    const unique = [...new Set(emptyList)];
    return unique;
  }

  // Returns the list of nodes associated with a particular given id
  listNetworkNodes (d) {
    if (d.group === 'Actor') {

      const activityIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
      const riskIds = Global.filterLinksSourceToTarget(this.data.links, activityIds);
      const controlIds = Global.filterLinksSourceToTarget(this.data.links, riskIds);
      const ids = controlIds.concat(riskIds.concat(activityIds.concat(d.id)));
      return ids;

    } else if (d.group === 'Activity') {

      const actorIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
      const riskIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
      const controlIds = Global.filterLinksSourceToTarget(this.data.links, riskIds);
      const ids = controlIds.concat(riskIds.concat(actorIds.concat(d.id)));
      return ids;

    } else if (d.group === 'Risk') {

      const controlIds = Global.filterLinksSourceToTarget(this.data.links, [d.id]);
      const activityIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
      const actorIds = Global.filterLinksTargetToSource(this.data.links, activityIds);
      const ids = actorIds.concat(activityIds.concat(controlIds.concat(d.id)));
      return ids;

    } else if (d.group === 'Control') {

      const riskIds = Global.filterLinksTargetToSource(this.data.links, [d.id]);
      const activityIds = Global.filterLinksTargetToSource(this.data.links, riskIds);
      const actorIds = Global.filterLinksTargetToSource(this.data.links, activityIds);
      const ids = actorIds.concat(activityIds.concat(riskIds.concat(d.id)));
      return ids;

    }
  }
}
