// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import { AccordionHeaderStyled } from '../../features/index';
import { DrillDown } from '../../features/drillDown';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';

// Prop types
IdentifyOrgStructure.propTypes = {
  selectedOrg: PropTypes.object,
  updateSelectedOrg: PropTypes.func,
  orgStructure: PropTypes.array
};

export function IdentifyOrgStructure({ selectedOrg, updateSelectedOrg, orgStructure }) {

  const orgsLevel = [{ id: -1, descr: 'All' }].concat(orgStructure);

  const handleChangeOrg = (event) => {
    const selectedOrg = parseInt(event.target.value);
    if (selectedOrg !== -1) {
      const l2 = orgStructure.find(d => d.id === selectedOrg);
      updateSelectedOrg(l2);
    } else {
      updateSelectedOrg({ id: -1, descr: 'All' });
    }
  };

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label="Identify by Organizational Structure" filteredTypes={[selectedOrg.descr]}/>
      <AccordionDetails>
        <DrillDown values={orgsLevel} selected={selectedOrg} handleChange={handleChangeOrg} label="Organizational Structure 1" id="1" />
      </AccordionDetails>
    </Accordion>
  );
}
