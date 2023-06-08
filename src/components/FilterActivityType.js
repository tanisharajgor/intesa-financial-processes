import { Accordion, AccordionHeader, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'
import { useState } from 'react';
import styled from 'styled-components';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';

// const ID = "Filter-Activity-Type";

const StyledFilteredData = styled('span')`
    font-style: italic;
    text-color: ${props =>  props.theme.color.secondary };
    opacity: 75%;
    height: 1.5rem;
    display: block;
`

const StyledHeader = styled('div')`
    display: flex;
`

export default function FilterActivityType({typesChecks, updateSelection, typeValues, label}) {

    let newSelectedTypes = [];
    const [filteredTypes, updateFilter] = useState([])
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

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
        updateSelection(newSelectedTypes);
    }

    return(
        <Accordion className={'Card'}>
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
                onClick={handleRotate}
            >
                <StyledHeader>
                    <Key>
                        {
                            filteredTypes.length <= 0 ? label : `${label}:`
                        }
                    </Key>
                    <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate}>
                        <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + "/assets/chevron.svg"}/>
                        <Ripple color={"#FFFFFF"} duration={1000}/>
                    </ChevronButton>
                </StyledHeader>
                { filteredTypes.length <= 0 ? <></> : 
                    <StyledFilteredData>
                        {
                            filteredTypes.map((type, i, arr) => {

                                let str = type;

                                if (i < arr.length - 1) {
                                    str += ', '
                                }

                                return (
                                    <span>{str}</span>
                                )
                            }) 
                        }
                    </StyledFilteredData>
                }
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
                    </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}