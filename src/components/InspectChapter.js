// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import { DrillDown } from './DrillDown';
import { AccordionHeaderStyled } from './Menu';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';

// Prop types
InspectChapter.propTypes = {
  selectedChapter: PropTypes.node.isRequired,
  updateSelectedChapter: PropTypes.node.isRequired,
  valuesChapter: PropTypes.node.isRequired
};

export default function InspectChapter ({ selectedChapter, updateSelectedChapter, valuesChapter }) {
  const handleChangeChapter = (event) => {
    const chapter = parseInt(event.target.value);
    updateSelectedChapter(chapter);
  };

  const chapterDescr = valuesChapter.find((d) => d.id === selectedChapter).descr;

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Inspect by Chapter" filteredTypes={[chapterDescr]}/>
      <AccordionDetails>
        <DrillDown values={valuesChapter} selected={selectedChapter} handleChange={handleChangeChapter} label="Chapter" id="chapter" />
      </AccordionDetails>
    </Accordion>
  );
}
