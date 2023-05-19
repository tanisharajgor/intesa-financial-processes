import { Accordion, AccordionHeader, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'
import { useState } from 'react';
import styled from 'styled-components';

const ID = "Filter-Activity-Type";

const StyledFilteredData = styled('span')`
    font-style: italic;
    text-color: ${props =>  props.theme.color.secondary };
    opacity: 75%;
    height: 1.5rem;
    display: block;
`

const StyledHeader = styled('h4')`
    margin-top: 1.3rem;
    margin-bottom: 0.5rem;
`

export default function FilterType({typesChecks, updateTypeChecks, typeValues, label}) {

    let newSelectedTypes = [];
    const [filteredTypes, updateFilter] = useState([])

    const updateSelectedRange = (selected) => {
        if (typesChecks.includes(selected)) {
            newSelectedTypes = typesChecks.filter((obj) => obj !== selected);
            filteredTypes.push(selected)
            updateFilter([...filteredTypes])
        } else {
            typesChecks.push(selected)
            updateFilter(filteredTypes.filter((obj) => obj !== selected));
            newSelectedTypes = [...typesChecks];
        }
        updateTypeChecks(newSelectedTypes);
    }

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
            >
                <StyledHeader>
                    <Key>
                        {
                            filteredTypes.length <= 0 ? label :
                            `${label}:`
                        }
                    </Key>
                </StyledHeader>
                <StyledFilteredData>
                    {
                        filteredTypes.length > 0 && (
                            filteredTypes.map((type, i, arr) => {

                                let str = type;

                                if (i < arr.length - 1) {
                                    str += ', '
                                }

                                return (
                                    <span>{str}</span>
                                )
                            })
                        )  
                    }
                </StyledFilteredData>
            </AccordionHeader>
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
                                            )
                                        })
                                    }
                                </FilterList>
                            </LayoutItem>
                        </LayoutRow>
                        <LayoutRow>
                            <div id={ID}></div>
                        </LayoutRow>
                    </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}