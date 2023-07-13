import { Accordion, AccordionHeader, AccordionDetails } from 'cfd-react-components';
import { InnerHeader } from '../component-styles/inner-header';
import { Key } from '../component-styles/key'
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import { useState } from 'react';
import { taxonomyLevel } from "./InspectTaxonomy";
import {StyledFilteredData, StyledHeader, StyledFilter} from "../component-styles/accordion";

export default function InspectChapter({selectedChapter, updateSelectedChapter, valuesChapter}) {

    const [shouldRotate, setRotate] = useState(false);
    const handleRotate = () => setRotate(!shouldRotate);

    const handleChangeChapter = (event) => {
        let chapter = parseInt(event.target.value);
        updateSelectedChapter(chapter);
    }

    const chapterDescr = valuesChapter.find((d) => d.id === selectedChapter).descr;

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
                onClick={handleRotate}
            >
            <StyledFilter>
                <StyledHeader>
                    <Key>Inspect by Chapter</Key>
                    <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                        <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                        <Ripple color={"#FFFFFF"} duration={1000}/>
                    </ChevronButton>
                </StyledHeader>
                <StyledFilteredData>
                    {chapterDescr}
                </StyledFilteredData>
            </StyledFilter>
            </AccordionHeader>
            <AccordionDetails>
                {taxonomyLevel(valuesChapter, selectedChapter, handleChangeChapter, "Chapter", "chapter")}
            </AccordionDetails>
        </Accordion>
    )
}
