// Libraries
import { useState } from 'react';

// Components
import { AccordionHeaderStyled } from '../../features/menu';

// Styles
import { Accordion, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../../../component-styles/query-layout';


export default function FilterType({typesChecked, updateSelection, typeValues, label}) {

    let newSelectedTypes = [];
    const [filteredTypes, updateFilter] = useState([]);

    const updateSelectedRange = (selected) => {
        if (typesChecked.includes(selected)) {
            newSelectedTypes = typesChecked.filter((obj) => obj !== selected);
            filteredTypes.push(selected)
            updateFilter([...filteredTypes])
        } else {
            typesChecked.push(selected)
            updateFilter(filteredTypes.filter((obj) => obj !== selected));
            newSelectedTypes = [...typesChecked];
        }
        updateSelection(newSelectedTypes);
    }

    return(
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
                                                checked={typesChecked.includes(value)} 
                                                name={value} 
                                                onChange={() => updateSelectedRange(value)}
                                                label={value}
                                                />}                                     
                                            />
                                        </li>
                                        )
                                    })
                                }
                            </FilterList>
                        </LayoutItem>
                    </LayoutRow>
                </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}
