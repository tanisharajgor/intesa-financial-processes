import * as d3 from "d3";
import * as PIXI from "pixi.js";
import { GlowFilter } from "@pixi/filter-glow";
import * as Global from "../utils/global";
import lookUp from "../data/processed/lu.json";
import graph from "../data/processed/network.json";
import { Viewport } from 'pixi-viewport'

const labelZAxisDefault = 100;

const labelStyle = {
  align: "center",
  fill: 0xffffff,
  fontFamily: ["ibmplexsans-regular-webfont", "Plex", "Arial"],
  fontSize: 11,
  padding: 5,
  textBaseline: "middle",
  wordWrap: true,
  wordWrapWidth: 90,
  leading: -2,
  dropShadow: true, // add text drop shadow to labels
  dropShadowAngle: 90,
  dropShadowBlur: 5,
  dropShadowDistance: 2,
  dropShadowColor: 0x21252b
}

export default class DiagramClass {

  activeLinks;
  activeLink;
  app;
  average;
  containerLabels;
  containerNodes;
  containerLinks;
  clicked;
  cluster;
  clusterBy;
  data;
  deviation;
  height;
  labelBy;
  inspect;
  group;
  labels;
  labelStyle;
  links;
  maxRadius;
  nodeRadius;
  nodes;
  rootDOM;
  scores;
  simulation;
  width;
  value;
  values;
  viewport;
  viewBy;
  yScale;
  employeeRecord;

  constructor(data = graph) {
    this.data = data;
    this.clicked = false;
    this.cluster = false;
    this.clusterBy = "group";
    this.group = Array.from(new Set(this.data.nodes.map((d) => d.group)));
    this.labelBy = "id";
    this.labelStyle = new PIXI.TextStyle(labelStyle);
    this.maxRadius = 25;
    this.nodeRadius = [1, d3.max(this.data.nodes, (d) => d.radius)];
    this.scores = lookUp.domain;
    this.simulation = d3.forceSimulation()
      .nodes(this.data.nodes);
    this.value = "score";
    this.viewBy = "group";
    this.summarizeScores();
  }

  // Initializes the application
  initApp(selector) {
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
      .range([this.height - Global.margin.bottom, Global.margin.top]);

    this.viewport = new Viewport({
      screenWidth: this.width,
      screenHeight: this.height,
      worldWidth: this.width,
      worldHeight: this.height,
      passiveWheel: false,
      interaction: this.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })

    this.app.stage.addChild(this.viewport)

    this.viewport
      .pinch({ percent: 1 })
      .wheel({ percent: 0.1 })
      .drag()

    return { "app": this.app, "width": this.width, "height": this.height };
  }

  // Drawing functions ------------------------------------------------------

  // Initializes the links
  drawLinks() {

    this.containerLinks = new PIXI.Container();

    // Links
    this.links = new PIXI.Graphics();
    this.links.alpha = 0.1;
    this.containerLinks.addChild(this.links);

    // Active Links
    this.activeLinks = new PIXI.Graphics();
    this.activeLinks.alpha = 0.8;
    this.containerLinks.addChild(this.activeLinks);
    this.viewport.addChild(this.containerLinks);
  }

  // Initializes the nodes
  drawNodes(updateClickOn = null, clickOn = 0, updateClick = null, click = false, 
    updateViewBy = null, viewCategories= [], cluster = false, updateCluster = null, 
    clusterBy = "", updateClusterBy = null) {

    this.containerNodes = new PIXI.Container();

    this.nodes = [];
    this.data.nodes.forEach((node) => {
      node.gfx = new PIXI.Graphics();
      node.gfx.lineStyle(this.strokeScale(node), 0xFFFFFF);
      node.gfx.beginFill(this.colorScale(node[this.viewBy]));
      node.gfx.drawCircle(0, 0, this.radiusScale(node));
      node.gfx.x = this.width * 0.5;
      node.gfx.y = this.height * 0.5;
      node.gfx.zIndex = -1000;
      node.gfx.interactive = true;
      node.gfx.buttonMode = true;
      node.gfx.on("pointerover", () => this.pointerOver(node));
      node.gfx.on("pointerout", () => this.pointerOut(node));
      node.gfx.on('click', () => this.click(node, updateClickOn, clickOn, updateClick, click, updateViewBy, viewCategories, cluster, updateCluster, clusterBy, updateClusterBy));
      this.nodes.push(node);
      this.containerNodes.addChild(node.gfx);
    });

    this.viewport.addChild(this.containerNodes);
  }

  // Initializes the labels
  drawLabels() {

    this.group = Array.from(new Set(this.data.nodes.map((d) => d.group)));

    if (this.group.includes("area")) {
      this.labels = lookUp["area"];
      if (this.clusterBy === "area") {
        this.labelBy = "area";
        this.maxRadius = 50;
      } else {
        this.labelBy = "id";
        this.maxRadius = 25;
      }
      this.labels.sort((a, b) => a.angle - b.angle);
    } else {
      this.labels = lookUp[this.clusterBy];
      this.labelBy = this.clusterBy;
      this.labels.sort((a, b) => a.id - b.id);
    }

    let uniqueGroups = Array.from(new Set(this.data.nodes.map((d) => d[this.labelBy])));
    this.labels = this.labels.filter((d) => uniqueGroups.includes(d.id));

    this.containerLabels = new PIXI.Container();

    for (let l of this.labels) {

      if (this.group.includes("area")) {
        let z = this.data.nodes.find((d) => d[this.labelBy] === l.id);
        l.angle = z.angle;
        l.radius = this.radiusScale(z);
        l.radialLayout = true;
      } else {
        l.radialLayout = false;
      }

      const textMetrics = PIXI.TextMetrics.measureText(l.descr, this.labelStyle);
      l.width = textMetrics.maxLineWidth + 15;
      l.height = textMetrics.lineHeight * textMetrics.lines.length + 15;

      const text = new PIXI.Text(l.descr, this.labelStyle);
        text.zIndex = labelZAxisDefault;
        text.x = l.width/2;
        text.y = l.height/2;
        text.anchor.set(.5, .5);

      l.label = new PIXI.Container();
      l.label.addChild(text);
      this.containerLabels.addChild(l.label);
    }

    this.viewport.addChild(this.containerLabels);
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
        this.links.lineStyle(1, 0x444444);
      }
      this.links.moveTo(source.x, source.y);
      this.links.lineTo(target.x, target.y);
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
        gfx.tint = 0x444444;
        gfx.zIndex = 0;
      }
    });
  }

  // Updates the label position
  updateLabelPosition() {

    for (let l of this.labels) {

      let z = this.data.nodes.filter((d) => d[this.labelBy] === l.id);
      let x = d3.mean(z, ((d) => d.x));
      let y = d3.min(z, ((d) => d.y)) - 20;

      if (l.radialLayout) {

        y = z[0].y;

        if (this.group.includes("employee")) {
          if (l.angle < 1.2) {
            l.label.position.set(x + l.radius, y);
          } else if(l.angle > 1.2 && l.angle < 1.8) {
            l.label.position.set(x - l.width/2, y + l.radius);
          } else if (l.angle >= 1.8 && l.angle < 3.3) {
            l.label.position.set(x - l.radius - l.width, y);
          } else if (l.angle >= 3.3 && l.angle < 4.5) {
            l.label.position.set(x - l.radius - l.width, y - l.height);
          } else if(l.angle >= 4.5 && l.angle < 5) {
            l.label.position.set(x - l.width/2, y - l.height*1.5);
          } else {
            l.label.position.set(x + l.radius, y - l.height);
          }
        } else {
          l.label.position.set(x - l.width/2, y - l.radius - l.height);
        }

      } else {
        l.label.position.set(x - l.width/2, y - l.height/2);
      }
    }
  }

  // Destroy the links on update ------------------------------------------------------

  // Destroys the links on data update
  destroyLinks() {

    this.containerLinks.destroy();

    // if (this.links !== undefined) {
    //   this.links.destroy();
    // }
    // if (this.activeLinks !== undefined) {
    //   this.activeLinks.destroy();
    // }
  }

  // Destroys the nodes on data update
  destroyNodes() {
    this.containerNodes.destroy();
  }

  // Destroys the labels on data or cluster update
  destroyLabels() {
    this.containerLabels.destroy();
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

  getControls() {
    return {
      zoomIn: () => {
        this.viewport.zoomPercent(0.15, true)
        Object.keys(this).forEach((k) => {
          if (k.includes("labelContainer")) {
            let child = this[k];
            let scale = 0.1
              if (child.scale.x >= 0.2) child.scale.set(child.scale.x - scale, child.scale.y - scale)
          }
        })
      },
      zoomOut: () => {
        this.viewport.zoomPercent(-0.15, true)
        Object.keys(this).forEach((k) => {
          if (k.includes("labelContainer")) {
            let child = this[k];
            let scale = 0.1
            child.scale.set(child.scale.x + scale, child.scale.y + scale)
          }
        })
      },
      reset: () => {
        this.viewport.fit();
        this.viewport.moveCenter(this.width / 2, this.height / 2)
        Object.keys(this).forEach((k) => {
          if (k.includes("labelContainer")) {
            let child = this[k];
            child.scale.set(1, 1)
          }
        })
      }
    }
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

  summarizeScores() {

    for (let s of this.scores) {
      s.score = [];
    }

    const empNodes = this.data.nodes.filter((d) => d.group === "employee");
    for (let n of empNodes) {
      for (let a of n.area) {
        for (let d of a.domain) {
          let x = this.scores.find((s) => s.id === d.id);
          x.score.push(d.score);
        }
      }
    }

    for (let s of this.scores) {
      s.mean = d3.mean(s.score);
      s.sd = d3.deviation(s.score);
    }
  }

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

    return node.simulated === undefined ? "0" : scale(node.simulated);
  }

  // Inspect functions ------------------------------------------------------

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

  click(d, updateClickOn, clickOn, updateClick, click, updateViewBy, viewCategories, 
    cluster, updateCluster, clusterBy, updateClusterBy) {

    if (d.group === "employee") {

      this.employeeRecord = d3.select(".EmployeeRecord");
      this.employeeRecord.select(".id .value").text(" " + d.id);
      document.querySelector('#EmployeeDomain .value').innerHTML = '';
      this.styleTTElement("region", d.region, this.employeeRecord);
      this.styleTTElement("position", d.position, this.employeeRecord);
      this.styleTTElement("gender", d.gender, this.employeeRecord);
      this.styleTTElement("age_group", d.age_group, this.employeeRecord);
      this.performanceDomainTT(d, "EmployeeDomain");
      this.employeeRecord.style("display", "inline-block");

      // Update visualizations
      const DEFAULT_COLOR = "#21252b",
        DEFAULT_STROKE = "#4e5155",
        SELECTED_COLOR = "#03afbf";
      const region = lookUp.region.find((r) => r.id === d.region);
      const position = lookUp.position.find((p) => p.id === d.position);

      d3.select(document.getElementById('EmployeeRegion')).selectAll('.land').each(function (d, i) {
        let rId = this.id;

        d3.select(this)
          .attr("fill", () => region.descr === rId ? SELECTED_COLOR : DEFAULT_COLOR)
          .attr("stroke", DEFAULT_STROKE)
          .attr("stroke-width", 2);
      })

      d3.select(document.getElementById('EmployeePosition')).selectAll('.Position-Node-Record').each(function (d, i) {
        let pId = this.id;
        d3.select(this).attr("fill", () => position.id === parseInt(pId) ? SELECTED_COLOR : DEFAULT_COLOR)
      })

    } else if (d.group === "area") {

      clickOn = d.id;
      click = !click;

      updateClickOn(clickOn);
      updateClick(click);
    } else {
      clickOn = 0;
      click = !click;

      updateClickOn(clickOn);
      updateClick(click);
      updateViewBy(viewCategories[0]);
      updateCluster(false);
      updateClusterBy("area")
    }
  }

  showInspect(d) {

    this.inspect = d3.select(".Inspect");
    this.inspect.style("display", "inline-block");

    if (d.group === "employee") {
      this.inspect.select(".id .value").text(" " + d.id);
      this.inspect.select(".id.layout_row").style("display", "inline-block");

      this.styleTTElement("region", d.region, this.inspect);
      this.inspect.select(".region.layout_row").style("display", "inline-block");

      this.styleTTElement("position", d.position, this.inspect);
      this.inspect.select(".position.layout_row").style("display", "inline-block");

      this.styleTTElement("gender", d.gender, this.inspect);
      this.inspect.select(".gender.layout_row").style("display", "inline-block");

      this.styleTTElement("age_group", d.age_group, this.inspect);
      this.inspect.select(".age_group.layout_row").style("display", "inline-block");

      this.performanceDomainTT(d, "InspectDomain");
      this.inspect.select(".domain.layout_row").style("display", "inline-block");

    } else if (d.group === "area") {

      this.styleTTElement("area", d.id, this.inspect);
      this.inspect.select(".area.layout_row").style("display", "inline-block");

      this.inspect.select(".nEmployee .value").text(" " + d.nEmployee);
      this.inspect.select(".nEmployee.layout_row").style("display", "inline-block");

      this.inspect.select(".area_mean .value").text(" " + Math.round(d.area_mean * 10) / 10);
      this.inspect.select(".area_mean.layout_row").style("display", "inline-block");

    } else {
      this.inspect.select(".id .value").text(" " + d.empId);
      this.inspect.select(".id.layout_row").style("display", "inline-block");

      this.styleTTElement("area", d.area, this.inspect);
      this.inspect.select(".area.layout_row").style("display", "inline-block");

      this.styleTTElement("domain", d.domain, this.inspect);
      this.inspect.select(".domain.layout_row").style("display", "inline-block");

      this.inspect.select(".score .value").text(" " + d.score);
      this.inspect.select(".score.layout_row").style("display", "inline-block");
    }
  }

  hideInspect(d) {
    this.inspect.style("display", "none");

    if (d.group === "employee") {
      this.inspect.select(".id.layout_row").style("display", "none");
      this.inspect.select(".region.layout_row").style("display", "none");
      this.inspect.select(".position.layout_row").style("display", "none");
      this.inspect.select(".gender.layout_row").style("display", "none");
      this.inspect.select(".age_group.layout_row").style("display", "none");
      this.inspect.select('.domain.layout_row').style("display", "none");
      document.querySelector('#InspectDomain .value').innerHTML = '';

    } else if (d.group === "area") {
      this.inspect.select(".area.layout_row").style("display", "none");
      this.inspect.select(".nEmployee.layout_row").style("display", "none");
      this.inspect.select(".area_mean.layout_row").style("display", "none");
      this.inspect.select(".id.layout_row").style("display", "none");
      this.inspect.select(".area.layout_row").style("display", "none");
      this.inspect.select(".domain.layout_row").style("display", "none");
      this.inspect.select(".score.layout_row").style("display", "none");
    } else {
      this.inspect.select(".id.layout_row").style("display", "none");
      this.inspect.select(".area.layout_row").style("display", "none");
      this.inspect.select(".domain.layout_row").style("display", "none");
      this.inspect.select(".score.layout_row").style("display", "none");
      this.inspect.select(".nEmployee.layout_row").style("display", "none");
      this.inspect.select(".area_mean.layout_row").style("display", "none");
    }
  }

  styleTTElement(key, value, el) {
    if (value === undefined) {
      var descr = "undefined";
    } else {
      var descr = Global.lookupDescr(key, value);
    }
    el.select(`.${key} .value`).text(" " + descr);
  }

  performanceDomainTT(node, id) {
    const width = 216;
    const rowHeight = 50;
    let height = 100;
    let scoreData = [];

    let xScale = d3.scaleLinear()
      .domain([1, 5])
      .range([10, width - 10])

    node.area.map((d) => d.domain.map((d) =>
      scoreData.push(
        {
          "id": d.id,
          "descr": Global.lookupDescr("domain", d.id),
          "score": d.score,
          "mean": this.scores.find((s) => s.id === d.id).mean,
          "sd": this.scores.find((s) => s.id === d.id).sd
        }
      )))

    if (scoreData.length > 2) {
      height += (scoreData.length - 2) * rowHeight;
    }

    let svg = d3.select(`#${id} > .value`)
      .append("svg")
      .attr("width", width)
      .attr("height", height)

    svg.selectAll("line")
      .data(scoreData)
      .enter()
      .append("line")
      .style("stroke", "#919295")
      .attr("x1", ((d, i) => xScale(1)))
      .attr("y1", ((d, i) => (30 + 5) + i * rowHeight))
      .attr("x2", ((d, i) => xScale(5)))
      .attr("y2", ((d, i) => (30 + 5) + i * rowHeight));

    svg.selectAll("rect")
      .data(scoreData)
      .enter()
      .append('rect')
      .attr("x", ((d) => xScale(d.mean - d.sd)))
      .attr("y", ((dny, i) => 30 + i * rowHeight))
      .attr("width", ((d) => xScale(d.mean + d.sd)))
      .attr("height", 10)
      .attr('fill', "#919295")
      .attr("opacity", .5);

    svg.selectAll("mean-line")
      .data(scoreData)
      .enter()
      .append("line")
      .style("stroke", "#919295")
      .attr("x1", ((d, i) => xScale(3)))
      .attr("y1", ((d, i) => 30 + i * rowHeight))
      .attr("x2", ((d, i) => xScale(3)))
      .attr("y2", ((d, i) => 40 + i * rowHeight));

    svg.selectAll("circle")
      .data(scoreData)
      .enter()
      .append('circle')
      .attr('cx', ((d) => xScale(d.score)))
      .attr('cy', ((d, i) => 35 + i * rowHeight))
      .attr('r', 5)
      .attr('fill', "#03afbf");

    svg.selectAll("text-descr")
      .data(scoreData)
      .enter()
      .append("text")
      .attr("x", 5)
      .attr("y", ((d, i) => 15 + i * rowHeight))
      .attr('dominant-baseline', 'middle')
      .text(((d) => d.descr))
      .style('fill', "#919295")
      .style("font-size", "10px");
  }

  // Main functions ------------------------------------------------------

  run() {
    return this.simulation;
  }

  draw() {
    this.drawLinks();
    this.drawNodes();
    this.drawLabels();
  }

  updateDraw() {
      this.destroyLinks();
      this.destroyNodes();
      this.destroyLabels();
      this.draw();
  }

  animate(analyzeLineStyle = false) {
    this.run();
    this.drag();
    this.app.ticker.add(() => {
        this.updateLinkPosition(analyzeLineStyle);
        this.updateNodePosition();
        this.updateLabelPosition();
    });
  }
}
