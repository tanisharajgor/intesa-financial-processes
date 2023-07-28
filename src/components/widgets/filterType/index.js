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
    if (selectedValues.includes(selected)) {
      newSelectedTypes = selectedValues.filter((obj) => obj !== selected);
      filteredTypes.push(selected);
      updateFilter([...filteredTypes]);
    } else {
      selectedValues.push(selected);
      updateFilter(filteredTypes.filter((obj) => obj !== selected));
      newSelectedTypes = [...selectedValues];
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
                {checkedValues.map((value, index) => {
                  return (
                    <li key={index}>
                      <FormLabel
                        control={<Checkbox color="primary"
                          checked={!selectedValues.includes(value)}
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
