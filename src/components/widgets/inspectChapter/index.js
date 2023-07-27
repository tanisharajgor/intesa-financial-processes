// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import { DrillDown } from '../../features/index';
import { AccordionHeaderStyled } from '../../features/index';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';

// Prop types
InspectChapter.propTypes = {
  selectedChapter: PropTypes.object,
  updateSelectedChapter: PropTypes.func,
  valuesChapter: PropTypes.array
};

export function InspectChapter ({ selectedChapter, updateSelectedChapter, valuesChapter }) {
  const handleChangeChapter = (event) => {
    const chapter = parseInt(event.target.value);
    const updatedChapter = valuesChapter.find(ch => ch.id === chapter);
    updateSelectedChapter(updatedChapter);
  };

  const chapterDescr = valuesChapter.find((d) => d.id === selectedChapter.id).descr;

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Inspect by Chapter" filteredTypes={[chapterDescr]}/>
      <AccordionDetails>
        <DrillDown values={valuesChapter} selected={selectedChapter} handleChange={handleChangeChapter} label="Chapter" id="chapter" />
      </AccordionDetails>
    </Accordion>
  );
}
