import * as d3 from 'd3';
import cytoscape from 'cytoscape';
import jsonUrl from './data/network2.json';

import cola from 'cytoscape-cola';
cytoscape.use( cola );

import dagre from 'cytoscape-dagre';
cytoscape.use( dagre );

// import elk from 'cytoscape-elk';
// cytoscape.use( elk );

import euler from 'cytoscape-euler';
cytoscape.use( euler );

import klay from 'cytoscape-klay';
cytoscape.use( klay );

// var spread = require('cytoscape-spread');
// spread( cytoscape ); // register extension

// let avsdf = require('cytoscape-avsdf');

// import avsdf from 'cytoscape-avsdf';
// cytoscape.use( avsdf );

// import cise from 'cytoscape-cise';
// cytoscape.use( cise );

import fcose from 'cytoscape-fcose';
cytoscape.use( fcose );




const layoutMenu = document.getElementById("layout");
const resetBtn = document.getElementById("reset");
const legend = document.getElementById("legend");

const shapes = [
    {"name":"Actor", "shape":"ellipse", "ascii":"●"},
    {"name":"Process activity", "shape":"rectangle", "ascii":"■"},
    {"name":"Control activity", "shape":"star", "ascii":"★"},
    {"name":"Common process activity", "shape":"triangle", "ascii":"▲"},
    {"name":"System activity", "shape":"diamond", "ascii":"♦"},
    {"name":"Position", "shape":"pentagon", "ascii":"⬟"},
    {"name":"Organizational unit", "shape":"hexagon", "ascii":"⬢"}
];

let legendStr = "";
shapes.forEach(d=>{
    legendStr += `<p><span>${d.ascii}</span> ${d.name}</p>`;
})
legend.innerHTML = legendStr;


console.log(
    "init",
    layoutMenu.value
)

async function fetchDataJSON() {
  const response = await fetch(jsonUrl);
  const data = await response.json();  return data;
}

fetchDataJSON().then(data => {
    // first id = 247
    const n = data.find(d=>d.id == "247")
    const nodes = processNodes(n.nodes);
    const links = processLinks(n.links);
    const elems = [...nodes, ...links];

    const viewVariable = "controlTypeMode";

    colorScale = createColorScale(viewVariable, riskVariables);

    console.log(
        elems[10]
    )

    var cy = cytoscape({
        container: document.getElementById("cy"),
        elements: elems,
        style: [{
            selector: "node",
            style: {
                "background-color": "#3b75af",
                "background-color": d=>{
                    return colorScale(
                            d.data('riskStatus')[`${viewVariable}`]
                        );
                },
                "font-size": "9px",
                "color": "#ffffff", // nActivities, colorScale(d.value)
                "label": "data(id)",
                "width": "30%",
                "height": "30%",
                "shape": d=>{
                    let shp = shapes.find(j=>j.name === d.data('type'));
                    if (shp === undefined) {return "ellipse";}
                    else {return shp.shape;}
                }

            }},
            {
            selector: "edge",
            style: {
                "width": 1,
                "line-color": "#64666a",
                "curve-style": "bezier",
            }},
        ],
        layout: {
            name: `${layoutMenu.value}`
        }
    });    

    layoutMenu.addEventListener("change",function(e){
        cy.layout({ 
            name: `${this.value}`, 
            animate: true, 
            padding: 60, 
            avoidOverlapPadding: 50
        }).run();
        console.log("layout: ", this.value);
    })
    resetBtn.addEventListener("click",function(e){
        cy.fit();
    });

});

function processNodes(nodesRaw){
    const nodesProcessed = [];
    nodesRaw.forEach(d=>{
        nodesProcessed.push({
            "data":d
        });
    });
    return nodesProcessed;
}

function processLinks(linksRaw){
    const linksProcessed = [];
    linksRaw.forEach(d=>{
        d.id = `${d.source}+${d.target}`;
        linksProcessed.push({
            "data":d
        })
    })
    return linksProcessed;
}

// Joli's functions ---------------------------------------

// colorScale = createColorScale(viewVariable, riskVariables);
// colorScale(d.value)

const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'];
const naColor = "#ADADAD";
const missingColor = "#4B4B4B";

const viewVariable = {
    "controlTypeMode": {
        label: "Control type mode",
        values: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
        id: [1, 2, 3, 4, 5],
        labels: ["Manual", "Semi-automatic", "Automatic", "Missing", "NA"],
        colors: ["#FF0000", "#FFC41F", "#0071BC", missingColor, naColor]
    },
    "financialDisclosureRiskAny": {
        label: "Financial disclosure risk",
        labels: ["Yes", "No", "Missing", "NA"],
        id: [6, 7, 8, 9],
        values: [true, false, "Missing", "NA"],
        colors: ["#FF0000", "#0071BC", missingColor, naColor]
    },
    "controlPeriodocityMode": {
        label: "Periodicity",
        values: [3650, 365, 182, 91, 30, 7, 1, .1, 'Missing', 'NA'],
        id: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        labels: ['Decadal', 'Annually', 'Half yearly', 'Quarterly', 'Monthly', 'Weekly', 'Daily', 'Per event', 'Missing', 'NA']
    }
}

function createColorScale(variable, variableLookup) {
    let t = variableLookup[variable]
    if (variable === "controlPeriodocityMode") {
        var scale = d3.scaleSequentialLog(d3.interpolate("orange", "purple"))
            .domain(d3.extent(t.values));
        let interp = [3650, 365, 182, 91, 30, 7, 1, .1].map(d => scale(d))
        interp.push(missingColor)
        var s = d3.scaleOrdinal()
            .domain(t.values)
            .range(interp)
        return s;
    } else {
        const scale = d3.scaleOrdinal()
            .domain(t.values)
            .range(t.colors);
        return scale;
    }
}