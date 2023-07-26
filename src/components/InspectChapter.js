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
  selectedChapter: PropTypes.object,
  updateSelectedChapter: PropTypes.func,
  valuesChapter: PropTypes.array
};

export default function InspectChapter ({ selectedChapter, updateSelectedChapter, valuesChapter }) {
  const handleChangeChapter = (event) => {
    const chapter = parseInt(event.target.value);
    const updatedChapter = valuesChapter.find(ch => ch.id === chapter);
    updateSelectedChapter(updatedChapter);
  };

  const chapterDescr = valuesChapter.find((d) => d.id === selectedChapter.id).descr;

    return(
        <Accordion className={'Card'}>
            <AccordionHeaderStyled label="Identify by Chapter" filteredTypes={[chapterDescr]}/>
            <AccordionDetails>
                <DrillDown values={valuesChapter} selected={selectedChapter} handleChange={handleChangeChapter} label="Chapter" id="chapter" />
            </AccordionDetails>
        </Accordion>
    )
}
