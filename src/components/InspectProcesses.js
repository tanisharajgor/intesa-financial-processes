import { Accordion, AccordionHeader, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import * as d3 from 'd3';
import * as Theme from "../component-styles/theme";
import { StyledSelect } from '../component-styles/select';
import lu from '../data/processed/nested/lu.json';
import * as Global from "../utils/global";

const id = "Inspect-Process-TreeMap";
const width = 290, height = 1000;

const StyledHeader = styled('div')`
    display: flex;
`

const StyledLabel = styled('span')`
    color: ${Theme.labelStyles.fontColor};
    font-family: ${Theme.labelStyles.fontFamily};
    font-size: ${Theme.labelStyles.fontSize};
    margin-bottom: 5px;
    margin-left: 3px;
`

const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

// function initTreeMap() {
//     d3.select(`#${id}`)
//         .append("svg")
//         .attr("width", width)
//         .attr("height", height);
// }

// function updateTreeMap(data) {

//     const margin = {top: 25}

//     const root = d3.hierarchy(data)
//         .sum(function(d) { return 1 }) // Here the size of each leave is given in the 'value' field in input data

//     d3.partition()
//        .size([height - margin.top, width])
//         .padding(1)
//         .round(false)
//         (root);

//     const t = root.descendants();
//     const descendants = root.descendants().slice(1);

//     let svg = d3.select(`#${id} svg`);

//     d3.select(`#${id} svg g`).remove();

//     svg = svg.append("g");

//     let labels = ["Level 2", "Level 3", "Chapter"];

//     for (let i in labels) {

//         svg
//             .append("text")
//             .attr("x", 3 + t[0].y1 + t[0].y1*i)
//             .attr("y", -5)
//             .attr("font-size", Theme.labelStyles.fontSize)
//             .attr("fill", Theme.labelStyles.fontColor)
//             .text(labels[i])
//     }

//     svg
//         .attr("transform", `translate(-${t[0].y1}, ${margin.top})`)
//         .selectAll("rect")
//         .data(descendants, d => d.id)
//         .join(
//             enter => enter
//             .append("rect")
//             .attr("transform", d => `translate(${d.y0},${d.x0})`)
//             .attr("width", d => d.y1 - d.y0)
//             .attr("height", d => d.x1 - d.x0)
//             .attr("fill", Theme.labelStyles.fontColor)
//             .attr("font-family", Theme.labelStyles.fontFamily)
//             .attr("class", "Process-Node")
//             .attr("fill-opacity", .7)
//     )
// }

// function onClick(selectedLevels, updateLevels) {

//     d3.selectAll('.Process-Node').on("click", function(e, d) {
//         let thisRect = d3.select(this);

//         thisRect
//             .attr("class", "Process-Node Selected")
//             .attr("fill", Theme.primaryColorHex);

//         // thisRect
//         //     // .attr("stroke", "white")
//         //     .attr("fill", Theme.primaryColorHex);

//         // console.log(selectedLevels)
 
//         if (selectedLevels.includes(d.data.id)) {

//             // const index = selectedLevels.indexOf(d.data.id);
//             //     if (index > -1) {
//             //         selectedLevels.splice(index, 1);
//             // }

//         } else {
//             selectedLevels.push(d.data.id);
//         }

//         updateLevels(selectedLevels);
//     });
// }

// function renderTooltip(selectedLevels) {

//     let tooltip = d3.select(`#${id} .tooltip`);
//     let thisRect;

//     d3.selectAll('.Process-Node').on("mouseover", function(e, d) {

//         thisRect = d3.select(this);

//         let x;

//         let y = d.x0 + width;

//         if (d.data.treeLevel === 4) {
//             x = d.y0 - 210;
//         } else if (d.data.treeLevel === 3) {
//             x = d.y0 - 137;
//         } else {
//             x = d.y0 - 64;
//         }

//         let level = d.data.treeLevel < 4 ? `Level ${d.data.treeLevel}`: `Chapter`;

//         tooltip.style("visibility", "visible")
//             .style("top", `${y}px`)
//             .style("left", `${x}px`)
//             .html(`<b>${level}</b><br>${d.data.name}`);

//         thisRect
//             .attr("stroke", Theme.primaryColorHex)
//             .attr("stroke-width", 1.5)
//             .attr("opacity", 1);

//         d3.selectAll('.Process-Node .Selected')
//             .attr("fill", Theme.primaryColorHex);

//     }).on("mouseout", function() {

//         d3.selectAll('.Process-Node')
//             .attr("stroke", "none")
//             .attr("fill-opacity", .7);

//         tooltip.style("visibility", "hidden");

//         d3.selectAll('.Process-Node .Selected')
//             .attr("fill", Theme.primaryColorHex);
//     });

//     d3.selectAll('.Process-Node .Selected')
//         .attr("fill", Theme.primaryColorHex);
// }

export default function InspectProcesses({selectedLevel1, updateLevel1, typeValues, label}) {

    const processes = lu["processes"];

    console.log(processes)

    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

    const handleChange = (event) => {
        let l1 = parseInt(event.target.value);
        updateLevel1(l1);
    };

    useEffect(() =>{
        Global.initTooltip(id);
        // initTreeMap();
    }, []);

    useEffect(() => {
        if (selectedLevel1 !== -1) {
            // updateTreeMap(processes.children.find(d => d.id === selectedLevel1));
            // onClick(selectedLevels, updateLevels);
            // renderTooltip(selectedLevels)
        } else {
            // removeTree(); //write this function
        }
    }, [selectedLevel1]);

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
                onClick={handleRotate}
            >
            <StyledHeader>
                <Key>
                    {label}
                </Key>
                <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                    <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </ChevronButton>
            </StyledHeader>
            </AccordionHeader>
            <AccordionDetails>
                <LayoutGroup>
                    <StyledLabel>Level 1</StyledLabel>
                        <LayoutRow>
                        <LayoutItem className="push">
                            <Form variant="outlined" size="small">
                                 <StyledSelect
                                     labelId="process1-select-label"
                                     id="process1-select"
                                     displayEmpty
                                     value={selectedLevel1}
                                     onChange={handleChange}
                                 >
                                     {typeValues.map((level, index) => {
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
