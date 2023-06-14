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

// constants
const width = 345, height = 600;

const id = "Inspect-Process-TreeMap";

const StyledFilter = styled('div')`
    display: flex;
`

const StyledFilteredData = styled('span')`
    font-style: italic;
    text-color: ${props =>  props.theme.color.secondary };
    opacity: 75%;
    display: block;
`

function drawTreeMap(data) {

    const root = d3.hierarchy(data).sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data
    d3.partition()
        .size([height, width])
        .padding(1)
        .round(false)
        (root);

    const t = root.descendants();
    const descendants = root.descendants().slice(1);

    const svg = d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(-${t[0].y1}, ${0})`)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

    const g = svg
        .selectAll("g")
        .data(descendants)
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    g.append("rect")
        .attr("width", d => d.y1 - d.y0)
        .attr("height", d => d.x1 - d.x0)
        // .attr("fill", d => d.data.riskStatus[riskVariable] === undefined ? "#fff" : colorScale(d.data.riskStatus[riskVariable]))
        // .attr("fill-opacity", d => opacityScale(d.data.treeLevel))
        // .attr("visibility", d => d.data.treeLevel === 0 ? "hidden": "visible")
        .attr("stroke-width", .5)
        .attr("stroke", "#D7D7D7");
}

export default function InspectProcesses() {

    const processes = lu["processes"];
    const level1 = lu["level1"];

    const [shouldRotate, setRotate] = useState(false);
    const [selectedLevel1ID, updateLevel1] = useState(level1[0].id);

    const handleRotate = () => setRotate(!shouldRotate);
    const handleChange = (event) => {
        let level1 = parseInt(event.target.value);
        updateLevel1(level1)
    };

    useEffect(() =>{
        drawTreeMap(processes.children.filter(d => d.id === selectedLevel1ID)[0]);
    }, []);

    // useEffect(() =>{
    //     drawTreeMap(processes)
    // }, [selectedLevel1ID]);

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