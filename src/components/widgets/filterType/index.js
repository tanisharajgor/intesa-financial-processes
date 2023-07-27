// Libraries
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import { AccordionHeaderStyled } from '../../features/menu';

// Styles
import { Accordion, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../../layout/index';

// Prop types
FilterType.propTypes = {
  checkedValues: PropTypes.array,
  updateSelectedValues: PropTypes.func,
  selectedValues: PropTypes.array,
  label: PropTypes.string
};

export function FilterType ({ checkedValues, updateSelectedValues, selectedValues, label }) {
  let newSelectedTypes = [];
  const [filteredTypes, updateFilter] = useState([]);

  const updateSelectedRange = (selected) => {
    if (checkedValues.includes(selected)) {
      newSelectedTypes = checkedValues.filter((obj) => obj !== selected);
      filteredTypes.push(selected);
      updateFilter([...filteredTypes]);
    } else {
      checkedValues.push(selected);
      updateFilter(filteredTypes.filter((obj) => obj !== selected));
      newSelectedTypes = [...checkedValues];
    }
    updateSelectedValues(newSelectedTypes);
  };

  return (
    <Accordion className={'Card'}>
      <AccordionHeaderStyled label={label} filteredTypes={filteredTypes}/>
      <AccordionDetails>
        <LayoutGroup>
          <LayoutRow>
            <LayoutItem className="push">
              <FilterList>
                {selectedValues.map((value, index) => {
                  return (
                    <li key={index}>
                      <FormLabel
                        control={<Checkbox color="primary"
                          checked={checkedValues.includes(value)}
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
