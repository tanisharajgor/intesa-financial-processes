// Libraries
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import { AccordionHeaderStyled } from './Menu';

// Data
import lu from '../data/processed/nested/lu.json';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';
import { DrillDown } from './DrillDown';

// Prop types
InspectTaxonomy.propTypes = {
  handleTaxonomyChange: PropTypes.func,
  selectedLevel1: PropTypes.object,
  updateSelectedLevel1: PropTypes.func,
  selectedLevel2: PropTypes.object,
  updateSelectedLevel2: PropTypes.func,
  selectedLevel3: PropTypes.object,
  updateSelectedLevel3: PropTypes.func,
  selectedChapter: PropTypes.object,
  updateSelectedChapter: PropTypes.func,
  valuesChapter: PropTypes.array,
  updateValuesChapter: PropTypes.func
};

export default function InspectTaxonomy ({
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
  updateValuesChapter
}) {
  const processes = lu.processes;

  const valuesLevel1 = [{ id: -1, descr: 'All' }].concat(processes.children);
  const [valuesLevel2, updateValuesLevel2] = useState({ id: -1, descr: 'All' });
  const [valuesLevel3, updateValuesLevel3] = useState({ id: -1, descr: 'All' });

  const handleChangeLevel1 = (event) => {
    const selectedLevelId = parseInt(event.target.value);
    if (selectedLevelId !== -1) {
      const l2 = processes.children.find(d => d.id === selectedLevelId);
      updateValuesLevel2([{ id: -1, descr: 'All' }].concat(l2.children));
      handleTaxonomyChange(l2, updateSelectedLevel1, 1);
    } else {
      updateSelectedLevel2({ id: -1, descr: 'All' });
      updateSelectedLevel3({ id: -1, descr: 'All' });
      handleTaxonomyChange({ id: -1, descr: 'All' }, updateSelectedLevel1, 1);
    }
  };

  const handleChangeLevel2 = (event) => {
    const selectedLevelId = parseInt(event.target.value);
    if (selectedLevelId !== -1) {
      const l3 = valuesLevel2.find(d => d.id === selectedLevelId);
      updateValuesLevel3([{ id: -1, descr: 'All' }].concat(l3.children));
      handleTaxonomyChange(l3, updateSelectedLevel2, 2);
    } else {
      updateSelectedLevel3({ id: -1, descr: 'All' });
      handleTaxonomyChange({ id: -1, descr: 'All' }, updateSelectedLevel2, 2);
    }
  };

  const handleChangeLevel3 = (event) => {
    const selectedLevelId = parseInt(event.target.value);
    if (selectedLevelId !== -1) {
      const chapter = valuesLevel3.find(d => d.id === selectedLevelId);
      updateValuesChapter([{ id: -1, descr: 'All' }].concat(chapter.children));
      handleTaxonomyChange(chapter, updateSelectedLevel3, 3);
    } else {
      updateSelectedChapter({ id: -1, descr: 'All' });
      handleTaxonomyChange({ id: -1, descr: 'All' }, updateSelectedLevel3, 3);
    }
  };

  const handleChangeChapter = (event) => {
    const chapterId = parseInt(event.target.value);
    const updatedChapter = valuesChapter.find(ch => ch.id === chapterId);
    handleTaxonomyChange(updatedChapter, updateSelectedChapter, 4);
  };

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Inspect by Taxonomy" filteredTypes={[]}/>
      <AccordionDetails>
        <DrillDown values={valuesLevel1} selected={selectedLevel1} handleChange={handleChangeLevel1} label="Level 1" id="1" />
        {selectedLevel1.id !== -1 ? <DrillDown values={valuesLevel2} selected={selectedLevel2} handleChange={handleChangeLevel2} label="Level 2" id="2" /> : <></>}
        {selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? <DrillDown values={valuesLevel3} selected={selectedLevel3} handleChange={handleChangeLevel3} label="Level 3" id="3" /> : <></>}
        {selectedLevel3.id !== -1 && selectedLevel2.id !== -1 && selectedLevel1.id !== -1 ? <DrillDown values={valuesChapter} selected={selectedChapter} handleChange={handleChangeChapter} label="Chapter" id="chapter" /> : <></>}
      </AccordionDetails>
    </Accordion>
  );
}
