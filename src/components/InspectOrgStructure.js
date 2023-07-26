// Libraries
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import { AccordionHeaderStyled } from './Menu';
import { DrillDown } from './DrillDown';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';

// Prop types
InspectOrgStructure.propTypes = {
  selectedOrg1: PropTypes.object,
  updateSelectedOrg1: PropTypes.func,
  selectedOrg2: PropTypes.object,
  updateSelectedOrg2: PropTypes.func,
  orgStructure: PropTypes.array
};

export default function InspectOrgStructure ({ selectedOrg1, updateSelectedOrg1, selectedOrg2, updateSelectedOrg2, orgStructure }) {
  // const orgStructure = lu["org_structure"];
  const orgsLevel1 = [{ id: -1, descr: 'All' }].concat(orgStructure);
  const [orgsLevel2, updateOrgs2] = useState({ id: -1, descr: 'All' });

  const handleChangeOrg1 = (event) => {
    const selectedOrg1 = parseInt(event.target.value);
    if (selectedOrg1 !== -1) {
      const l2 = orgStructure.find(d => d.id === selectedOrg1);
      updateOrgs2([{ id: -1, descr: 'All' }].concat(l2.children));
      updateSelectedOrg1(l2);
    } else {
      updateSelectedOrg1({ id: -1, descr: 'All' });
      updateSelectedOrg2({ id: -1, descr: 'All' });
    }
  };

  const handleChangeOrg2 = (event) => {
    const selectedOrg2 = parseInt(event.target.value);
    const selected = orgsLevel2.find(d => d.id === selectedOrg2);
    updateSelectedOrg2(selected);
  };

  const types = selectedOrg2.id !== -1 ? `${selectedOrg1.descr} - ${selectedOrg2.descr}` : selectedOrg1.descr;

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Inspect by Organizational Structure" filteredTypes={[types]}/>
      <AccordionDetails>
        <DrillDown values={orgsLevel1} selected={selectedOrg1} handleChange={handleChangeOrg1} label="Organizational Structure 1" id="1" />
        {selectedOrg1.id !== -1 ? <DrillDown values={orgsLevel2} selected={selectedOrg2} handleChange={handleChangeOrg2} label="Organizational Structure 2" id="2" /> : <></>}
      </AccordionDetails>
    </Accordion>
  );
}
