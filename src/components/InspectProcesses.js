import { Accordion, AccordionHeader, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import * as d3 from 'd3';
import { useEffect, useState } from "react";
import lu from '../data/processed/nested/lu.json';
import { Key } from '../component-styles/key';
import { LayoutGroup, LayoutRow, LayoutItem } from '../component-styles/query-layout';
import styled from 'styled-components';
import { InnerHeader } from '../component-styles/inner-header';
import Ripple from './Ripple';
import { ChevronButton } from '../component-styles/chevron-button';
import { StyledSelect } from '../component-styles/select';


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

export default function InspectProcesses() {

    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

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
                    <LayoutRow>
                        <StyledFilter id={id}></StyledFilter>
                    </LayoutRow>
                </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}