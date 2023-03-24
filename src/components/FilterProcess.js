import { Accordion, AccordionHeader, AccordionDetails, MenuItem, Form, Select } from 'cfd-react-components';
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import lu from '../data/processed/nested/lu.json';

// constants
const width = 345,
    height = 600;

const id = "Filter-Process";

const level1 = lu["level1"];

const rScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([6, 5, 4, 3]);

// Data management steps
const cluster = d3.cluster()
    .size([height, width - 100]);  // 100 is the margin I will have on the right side

function fillScale(d, selectedLevel3ID) {
    if (d.data.data.treeLevel === 3 && d.data.data.id === selectedLevel3ID) {
        return "#03afbf";
    } else if (d.data.data.treeLevel === 3) {
        return "white"
    } else {
        return "#4e5155"
    }
}

function initTooltip() {
    d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip")
        .attr("z-index", 500);
}

// Tooltip
function renderTooltip(selectedLevel3ID) {

    let tooltip = d3.select(`#${id} .tooltip`)

    d3.selectAll('.Process-Node').on("mouseover", function(e, d) {

        let thisCircle = d3.select(this);

        var x, y;

        if (d.data.data.treeLevel === 3) {
            x = e.layerX - 150;
            y = e.layerY - 100;
        } else {
            x = e.layerX + 20;
            y = e.layerY - 10;
        }

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`Level ${d.data.data.treeLevel}<br><b>${d.data.data.name}</b>`);

        thisCircle
            .attr("stroke", "white")
            .attr("stroke-width", d => d.data.data.treeLevel === 3 ? 1.5: 0)
            .attr("fill", d => d.data.data.treeLevel === 3 ? "#03afbf": "#4e5155")
            .attr("r", 4);

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");

        d3.selectAll('.Process-Node')
            .attr("stroke", d => fillScale(d, selectedLevel3ID))
            .attr("fill", d => fillScale(d, selectedLevel3ID))
            .attr("stroke-width", .5)
            .attr("r", d => rScale(d.data.data.treeLevel))
    });
}

function clickProcess(updateLevel3ID) {

    d3.selectAll('.Process-Node').each(function (d, i) {
        d3.select(this)
            .on('click', (e, datum) => {
                if(datum.data.data.treeLevel === 3) {
                    updateLevel3ID(datum.data.data.id);
                }
            })
    })
}

function initFilter() {
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
}

function updateFilter(root, selectedLevel3ID) {

    let svg = d3.select(`#${id} svg`);

    d3.select(`#${id} svg g`).remove();

    svg = svg.append("g")
        .attr("transform", "translate(10, 0)");

    // Add the links between nodes:
    svg.selectAll('path')
        .data(root.descendants().slice(1))
        .join('path')
        .attr("d", function(d) {
            return "M" + d.y + "," + d.x
                    + "C" + (d.parent.y + 50) + "," + d.x
                    + " " + (d.parent.y + 150) + "," + d.parent.x // 50 and 150 are coordinates of inflexion, play with it to change links shape
                    + " " + d.parent.y + "," + d.parent.x;
                })
        .style("fill", 'none')
        .attr("stroke", "#4e5155")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", .5)

    // Add a circle for each node.
    svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", function(d) {
            return `translate(${d.y},${d.x})`
        })
        .append("circle")
            .attr("r", d => rScale(d.data.data.treeLevel))
            .attr("fill", d => fillScale(d, selectedLevel3ID))
            .attr("stroke", d => fillScale(d, selectedLevel3ID))
            .attr("stroke-width", .5)
            .attr("class", "Process-Node");
}

export default function FilterProcess({selectedLevel3ID, updateLevel3ID}) {
    const level3Descr = lu["level3"].find((d) => d.id === selectedLevel3ID).descr;
    const [selectedLevel1ID, updateLevel1] = useState(level1[0].id);
    const levelsFiltered = lu["processes"].children.find((d) => d.id === selectedLevel1ID);

    // Update data
    const hierarchyData = d3.hierarchy(levelsFiltered);
    const root = d3.hierarchy(hierarchyData, function(d) {
        return d.children;
    });

    cluster(root);

    const handleChange = (event) => {
        let level1 = event.target.value;
        updateLevel1(level1)
    };

    useEffect(() => {
        initTooltip();
        initFilter();
    }, []);

    // Initialize SVG Visualization
    useEffect(() => {
        updateFilter(root, selectedLevel3ID);
    }, [selectedLevel1ID]);

    // Update SVG Visualization
    useEffect(() => {
        clickProcess(updateLevel3ID);
        renderTooltip(selectedLevel3ID);
    }, [selectedLevel1ID, selectedLevel3ID]);

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="process-filter-content"
                id="process-filter-header"
            >
            <div>
                <h4><span className='key'>Filter by Process:</span>
                    <span className='spec'> {level3Descr}</span>
                </h4>
            </div>
            </AccordionHeader>
            <AccordionDetails>
                <div className="layout_group">
                        <div className="layout_row">
                            <div className="layout_item push">
                                <Form variant="outlined" size="small">
                                    <Select
                                        labelId="process1-select-label"
                                        id="process1-select"
                                        displayEmpty
                                        value={selectedLevel1ID}
                                        onChange={handleChange}
                                    >
                                        {level1.map((level, index) => {
                                            return(
                                                <MenuItem key={index} value={level.id}>{level.descr}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                </Form>
                            </div>
                        </div>
                        <div className="layout_row">
                            <div id={id}></div>
                        </div>
                    </div>
            </AccordionDetails>
        </Accordion>
    )
}
