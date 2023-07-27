// Libraries
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import { AccordionHeaderStyled } from '../../features/menu';

// Styles
import { Accordion, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../../layout/index';

// Prop types
FilterActivityType.propTypes = {
  typesChecks: PropTypes.array,
  updateSelection: PropTypes.func,
  label: PropTypes.string
};

export function FilterActivityType ({ typesChecks, updateSelection, label }) {
  const typeValues = ['Process activity', 'Control activity', 'Common process activity', 'System activity'];

  let newSelectedTypes = [];
  const [filteredTypes, updateFilter] = useState([]);

  const updateSelectedRange = (selected) => {
    if (typesChecks.includes(selected)) {
      newSelectedTypes = typesChecks.filter((obj) => obj !== selected);
      filteredTypes.push(selected);
      updateFilter([...filteredTypes]);
    } else {
      typesChecks.push(selected);
      updateFilter(filteredTypes.filter((obj) => obj !== selected));
      newSelectedTypes = [...typesChecks];
    }
    updateSelection(newSelectedTypes);
  };

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label={label} filteredTypes={filteredTypes}/>
      <AccordionDetails>
        <LayoutGroup>
          <LayoutRow>
            <LayoutItem className="push">
              <FilterList>
                {typeValues.map((value, index) => {
                  return (
                    <li key={index}>
                      <FormLabel
                        control={<Checkbox color="primary"
                          checked={typesChecks.includes(value)}
                          name={value}
                          onChange={() => updateSelectedRange(value)}
                          label={value}
                        />}
                      />
                    </li>
                  );
                })
                }
              </FilterList>
            </LayoutItem>
          </LayoutRow>
        </LayoutGroup>
      </AccordionDetails>
    </Accordion>
  );
}
