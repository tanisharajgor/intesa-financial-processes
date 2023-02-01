import { Accordion, AccordionSummary, AccordionDetails, IconButton } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import lu from '../data/processed/nested/lu.json';
import { palette } from '../utils/global';
import { useStyles } from '../utils/ComponentStyles';

// contants
const width = 345,
    height = 600;

const id = "Filter-Process";

const level1 = lu["level1"];

const rScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([6, 5, 4, 3]);

const opacityScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range([.4, .4, .4, 1]);

// Data management steps
const cluster = d3.cluster()
    .size([height, width - 100]);  // 100 is the margin I will have on the right side


// Tooltip
function renderTooltip(node) {

    let tooltip = d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip")
        .attr("z-index", 500);

    node.on("mouseover", function(e, d) {

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
            // .attr("stroke", "white")
            // .attr("stroke-width", 1)
            .attr("fill", "#03afbf");

        d3.select(this).attr("opacity", 1).raise();

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");
        node.attr("opacity", 1);

        d3.selectAll('.Process-Node')
            .attr("stroke", "none"); 
    });
}

function clickProcess(updateLevel3ID) {

    d3.selectAll('.Process-Node').each(function (d, i) {
        d3.select(this)
            .on('click', (e, datum) => {
                updateLevel3ID(datum.data.data.id)

                var tooltip = d3.select(`#${id} .tooltip`);
                d3.select(`#${id} .tooltip`).remove();
                tooltip = tooltip.append("div").attr("class", "tooltip");
            })
    })
}

export default function FilterProcess({level3ID, updateLevel3ID}) {
    const Styles = useStyles();
    const level3Descr = lu["level3"].find((d) => d.id === level3ID).descr;
    const [selectedLevel1, updateLevel1] = useState(level1[0].id);

    console.log(lu["processes"].children.find((d) => d.id === selectedLevel1))

    const levelsFiltered = lu["processes"].children.find((d) => d.id === selectedLevel1);

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
        d3.select(`#${id}`)
            .append("svg")
            .attr("width", width)
            .attr("height", height);
    }, [])

    // Initialize SVG Visualization
    useEffect(() => {
        const svg = d3.select(`#${id} svg`);

        // Add the links between nodes:
        svg.selectAll('path')
            .data( root.descendants().slice(1) )
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
                .style("fill", d=> d.data.data.treeLevel === 3 ? "white": "#4e5155  ")
                .style("stroke-width", 1)
                .attr("class", "Process-Node")
                // .attr("visibility", d => d.data.data.treeLevel == 0 ? "hidden" : "visible")
    }, [selectedLevel1])

    // Update SVG Visualization
    useEffect(() => {
        const node = d3.selectAll(".Process-Node");
        clickProcess(updateLevel3ID);
        renderTooltip(node);
    }, [selectedLevel1])

    return(
        <Accordion className={Styles.card}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="age-filter-content"
                id="age-filter-header"
            >
            <div>
                <h4><span className='key'>Filter by Process:</span>
                    <span className='spec'> {level3Descr}</span>
                </h4>
            </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className="layout_group">
                        <div className="layout_row">
                            <div className="layout_item push">
                                <FormControl variant="outlined" size="small">
                                    <Select
                                        labelId="process1-select-label"
                                        id="process1-select"
                                        displayEmpty
                                        value={selectedLevel1}
                                        onChange={handleChange}
                                    >
                                        {level1.map((level, index) => {
                                            return(
                                                <MenuItem key={index} value={level.id}>{level.descr}</MenuItem>
                                            )
                                        })}
                                    </Select>
                                </FormControl>
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