// Libraries
import { useState } from 'react';

// Components
import { AccordionHeaderStyled } from '../../features/index';
import { DrillDown } from '../../features/drillDown';

// Data
import lu from '../../../data/processed/nested/lu.json';

// Styles
import { Accordion, AccordionDetails } from 'cfd-react-components';

export function InspectOrgStructure({selectedOrg1, updateSelectedOrg1, selectedOrg2, updateSelectedOrg2, orgStructure}) {

    // const orgStructure = lu["org_structure"];
    const orgsLevel1 = [{"id": -1, "descr": "All"}].concat(orgStructure);
    const [orgsLevel2, updateOrgs2] = useState({"id": -1, "descr": "All"});

    const handleChangeOrg1 = (event) => {
        let selectedOrg1 = parseInt(event.target.value);
        if (selectedOrg1 !== -1) {
            let l2 = orgStructure.find(d => d.id === selectedOrg1);
            updateOrgs2([{"id": -1, "descr": "All"}].concat(l2.children));
            updateSelectedOrg1(l2);
        } else {
            updateSelectedOrg1({"id": -1, "descr": "All"});
            updateSelectedOrg2({"id": -1, "descr": "All"});
        }
    };

    const handleChangeOrg2 = (event) => {
        let selectedOrg2 = parseInt(event.target.value);
        let selected = orgsLevel2.find(d => d.id === selectedOrg2);
        updateSelectedOrg2(selected);
    };

    const types = selectedOrg2.id !== -1? `${selectedOrg1.descr} - ${selectedOrg2.descr}` : selectedOrg1.descr

    return(
        <Accordion className={'Card'}>
            <AccordionHeaderStyled label="Inspect by Organizational Structure" filteredTypes={[types]}/>
            <AccordionDetails>
                <DrillDown values={orgsLevel1} selected={selectedOrg1} handleChange={handleChangeOrg1} label="Organizational Structure 1" id="1" />
                {selectedOrg1.id !== -1 ? <DrillDown values={orgsLevel2} selected={selectedOrg2} handleChange={handleChangeOrg2} label="Organizational Structure 2" id="2" />: <></>}
            </AccordionDetails>
        </Accordion>
    )
}
