import { Accordion, AccordionHeader, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import * as Theme from "../component-styles/theme";
import styled from 'styled-components';
import { StyledSelect } from '../component-styles/select';
import { useState } from 'react';
import lu from '../data/processed/nested/lu.json';

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

export function taxonomyLevel(valuesLevel, selectedLevel, handleChange, label, id) {

    return(
        <LayoutGroup>
            <StyledLabel>{label}</StyledLabel>
            <LayoutRow>
                <LayoutItem className="push">
                    <Form variant="outlined" size="small">
                        <StyledSelect
                            labelId={"process-" + id + "-select-label"}
                            id={"process-" + id + "-select"}
                            displayEmpty
                            value={selectedLevel.id}
                            onChange={handleChange}
                        >
                            {valuesLevel.map((level) => {
                                return(
                                    <MenuItem key={`menu-item-${level.id}`} value={level.id}>{level.descr}</MenuItem>
                                )
                            })}
                        </StyledSelect>
                    </Form>
                </LayoutItem>
            </LayoutRow>
        </LayoutGroup>
    )
}

export default function InspectProcesses({
    handleTaxonomyChange,
    selectedLevel1,
    updateSelectedLevel1,
    selectedLevel2,
    updateSelectedLevel2,
    selectedLevel3,
    updateSelectedLevel3,
    selectedChapter,
    updateSelectedChapter,
    valuesChapter,
    updateValuesChapter,
}) {

    const processes = lu["processes"];

    const valuesLevel1 = [{"id": -1, "descr": "All"}].concat(processes.children);
    const [valuesLevel2, updateValuesLevel2] = useState({"id": -1, "descr": "All"});
    const [valuesLevel3, updateValuesLevel3] = useState({"id": -1, "descr": "All"});
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

    const handleChangeLevel1 = (event) => {
        let selectedLevelId = parseInt(event.target.value);
        if (selectedLevelId !== -1) {
            let l2 = processes.children.find(d => d.id === selectedLevelId);
            updateValuesLevel2([{"id": -1, "descr": "All"}].concat(l2.children));
            handleTaxonomyChange(l2, updateSelectedLevel1, 1);
        } else {
            updateSelectedLevel2({"id": -1, "descr": "All"});
            updateSelectedLevel3({"id": -1, "descr": "All"});
            handleTaxonomyChange({"id": -1, "descr": "All"}, updateSelectedLevel1, 1);
        }
    };

    const handleChangeLevel2 = (event) => {
        let selectedLevelId = parseInt(event.target.value);
        if (selectedLevelId !== -1) {
            let l3 = valuesLevel2.find(d => d.id === selectedLevelId);
            updateValuesLevel3([{"id": -1, "descr": "All"}].concat(l3.children));
            handleTaxonomyChange(l3, updateSelectedLevel2, 2);
        } else {
            updateSelectedLevel3({"id": -1, "descr": "All"});
            handleTaxonomyChange({"id": -1, "descr": "All"}, updateSelectedLevel2, 2);
        }
    };

    const handleChangeLevel3 = (event) => {
        let selectedLevelId = parseInt(event.target.value);
        if (selectedLevelId !== -1) {
            let chapter = valuesLevel3.find(d => d.id === selectedLevelId);
            updateValuesChapter([{"id": -1, "descr": "All"}].concat(chapter.children));
            handleTaxonomyChange(chapter, updateSelectedLevel3, 3);
        } else {
            updateSelectedChapter({"id": -1, "descr": "All"});
            handleTaxonomyChange({"id": -1, "descr": "All"}, updateSelectedLevel3, 3);
        }
    };

    const handleChangeChapter = (event) => {
        let chapterId = parseInt(event.target.value);
        let updatedChapter = valuesChapter.find(ch => ch.id === chapterId)
        handleTaxonomyChange(updatedChapter, updateSelectedChapter, 4);
    }

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
                onClick={handleRotate}
            >
            <StyledHeader>
                <Key>Inspect by Taxonomy</Key>
                <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                    <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                    <Ripple color={"#FFFFFF"} duration={1000}/>
                </ChevronButton>
            </StyledHeader>
            </AccordionHeader>
            <AccordionDetails>
                {taxonomyLevel(valuesLevel1, selectedLevel1, handleChangeLevel1, "Level 1", "1")}
                {selectedLevel1.id !== -1 ? taxonomyLevel(valuesLevel2, selectedLevel2, handleChangeLevel2, "Level 2", "2"): <></>}
                {selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? taxonomyLevel(valuesLevel3, selectedLevel3, handleChangeLevel3, "Level 3", "3"): <></>}
                {selectedLevel3.id !== -1 && selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? taxonomyLevel(valuesChapter, selectedChapter, handleChangeChapter, "Chapter", "chapter"): <></>}
            </AccordionDetails>
        </Accordion>
    )
}
