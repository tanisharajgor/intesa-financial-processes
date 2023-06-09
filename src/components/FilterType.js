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

export default function FilterType({typesChecked, updateSelection, typeValues, filteredTypes, updateFilter, label}) {

    let newSelectedTypes = [];
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

    const updateSelectedRange = (selected) => {

        newSelectedTypes.push(selected);

        let typesUnchecked = typeValues.filter(x => !newSelectedTypes.includes(x));

        // if (newSelectedTypes.includes(selected)) {
        //     const index = newSelectedTypes.indexOf(selected);
        //     if (index > -1) { // only splice array when item is found
        //         newSelectedTypes.splice(index, 1); // 2nd parameter means remove one item only
        //     }
        // }


        console.log(typesUnchecked)
        // console.log(typesUnchecked)
        console.log(newSelectedTypes)

        // if (typesUnchecked.includes(selected)) {
        //     newSelectedTypes = typesUnchecked.filter((obj) => obj !== selected);
        //     filteredTypes.push(selected);
        // } else {
        //     typesUnchecked.push(selected)
        //     newSelectedTypes = [...typesUnchecked];
        // }
        updateFilter([...newSelectedTypes]);
        updateSelection(typesUnchecked);
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