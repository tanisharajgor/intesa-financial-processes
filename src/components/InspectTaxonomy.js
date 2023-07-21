// Libraries
import { useState } from 'react';

//Components
import { AccordionHeaderStyled } from './Menu';

//Data
import lu from '../data/processed/nested/lu.json';

//Styles

import { Accordion, AccordionDetails, MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem } from '../component-styles/query-layout';
import { StyledSelect } from '../component-styles/select';
import { StyledLabel } from "../component-styles/menu";


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
            <AccordionHeaderStyled label="Inspect by Taxonomy" filteredTypes={[]}/>
            <AccordionDetails>
                {taxonomyLevel(valuesLevel1, selectedLevel1, handleChangeLevel1, "Level 1", "1")}
                {selectedLevel1.id !== -1 ? taxonomyLevel(valuesLevel2, selectedLevel2, handleChangeLevel2, "Level 2", "2"): <></>}
                {selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? taxonomyLevel(valuesLevel3, selectedLevel3, handleChangeLevel3, "Level 3", "3"): <></>}
                {selectedLevel3.id !== -1 && selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? taxonomyLevel(valuesChapter, selectedChapter, handleChangeChapter, "Chapter", "chapter"): <></>}
            </AccordionDetails>
        </Accordion>
    )
}
