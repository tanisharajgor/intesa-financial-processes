import { Accordion, AccordionHeader, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem } from '../component-styles/query-layout';
import { InnerHeader } from '../component-styles/inner-header';
import { ChevronButton } from '../component-styles/chevron-button';
import { Key } from '../component-styles/key';
import { StyledSelect } from '../component-styles/select';
import Ripple from './Ripple';
import lu from '../data/processed/nested/lu.json';
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import styled from 'styled-components';
import * as Global from "../utils/global";

// constants
const width = 300, height = 800;

const id = "Inspect-Process-TreeMap";

const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

const StyledFilteredData = styled('span')`
    font-style: italic;
    text-color: ${props =>  props.theme.color.secondary };
    opacity: 75%;
    display: block;
`

function initTooltip() {
    d3.select(`#${id}`)
        .append("div")
        .attr("class", "tooltip")
        .attr("z-index", 500)
        .style("width", "100%")
        .style("height", "50px")
        .style("font-family", Global.tooltipStyles.fontFamily)
        .style("font-size", Global.tooltipStyles.fontSize)
        .style("color", Global.tooltipStyles.fontColor)
        .style("line-height", Global.tooltipStyles.lineHeight);
}

function renderTooltip() {

    let tooltip = d3.select(`#${id} .tooltip`)

    d3.selectAll('.Process-Node').on("mouseover", function(e, d) {

        let thisRect = d3.select(this);

        var x, y;

        if (d.data.treeLevel === 3) {
            x = e.layerX - 150;
            y = e.layerY - 100;
        } else {
            x = e.layerX + 20;
            y = e.layerY - 10;
        }

        let level = d.data.treeLevel < 4 ? `Level ${d.data.treeLevel}`: `Model`;

        tooltip.style("visibility", "visible")
            .style("top", `${y}px`)
            .style("left", `${x}px`)
            .html(`<b>${level}</b><br>${d.data.name}`);

        thisRect
            .attr("stroke", "white")
            .attr("fill", Global.primaryColorHex)
            .attr("r", 4);

    }).on("mouseout", function() {

        tooltip.style("visibility", "hidden");

        d3.selectAll('.Process-Node')
            .attr("fill", Global.darkGreyColorHex)
            .attr("stroke-width", .5)
            .attr("stroke", Global.lightGreyColorHex)
    });
}

function initTreeMap() {
    d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
}

function updateTreeMap(data) {

    const root = d3.hierarchy(data).sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data
    d3.partition()
       .size([height, width])
        .padding(1)
        .round(false)
        (root);

    const t = root.descendants();
    const descendants = root.descendants().slice(1);

    let svg = d3.select(`#${id} svg`);

    d3.select(`#${id} svg g`).remove();

    svg = svg.append("g");

    svg = svg
        .append("g")
            .attr("transform", `translate(-${t[0].y1}, ${0})`)
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);

    const g = svg
        .selectAll("g")
        .data(descendants, d => d.id)
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    g.append("rect")
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        .attr("fill", Global.darkGreyColorHex)
        .attr("stroke-width", .5)
        .attr("stroke", Global.lightGreyColorHex)
        .attr("class", "Process-Node");
}

export default function InspectProcesses() {

    const processes = lu["processes"];
    const level1 = lu["level1"];

    const [shouldRotate, setRotate] = useState(false);
    const [selectedLevel1ID, updateLevel1] = useState(level1[0].id);

    const handleRotate = () => setRotate(!shouldRotate);
    const handleChange = (event) => {
        let level1 = parseInt(event.target.value);
        updateLevel1(level1);
    };

    useEffect(() =>{
        initTooltip();
        initTreeMap();
    }, []);

    useEffect(() =>{
        updateTreeMap(processes.children.filter(d => d.id === selectedLevel1ID)[0]);
        renderTooltip();
    }, [selectedLevel1ID]);

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="process-filter-content"
                id="process-filter-header"
                onClick={handleRotate}
            >
                <InnerHeader>
                    <Key>
                        Inspect by Process
                    </Key>
                    <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                        <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                        <Ripple color={"#FFFFFF"} duration={1000}/>
                    </ChevronButton>
                </InnerHeader>
                <StyledFilteredData>
                    {/* {level3Descr} */}
                </StyledFilteredData>
            </AccordionHeader>
            <AccordionDetails>
                <LayoutGroup>
                    <LayoutRow className="layout_row">
                        <LayoutItem className="push">
                            <Form variant="outlined" size="small">
                                <StyledSelect
                                    labelId="process1-select-label"
                                    id="process1-select"
                                    displayEmpty
                                    value={selectedLevel1ID}
                                    onChange={handleChange}
                                >
                                    {level1.map((level, index) => {
                                        return(
                                            <MenuItem itemKey={`menu-item-${level.descr}`} value={level.id}>{level.descr}</MenuItem>
                                        )
                                    })}
                                </StyledSelect>
                            </Form>
                        </LayoutItem>
                    </LayoutRow>
                    <LayoutRow>
                        <StyledFilter id={id}></StyledFilter>
                    </LayoutRow>
                </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}