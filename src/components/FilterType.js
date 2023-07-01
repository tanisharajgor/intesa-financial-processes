import { Accordion, AccordionHeader, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'
import { useState } from 'react';
import { ChevronButton } from '../component-styles/chevron-button';
import Ripple from './Ripple';
import {StyledFilteredData, StyledHeader} from "../component-styles/global-styles";

export default function FilterType({typesChecked, updateSelection, typeValues, label}) {

    let newSelectedTypes = [];
    const [filteredTypes, updateFilter] = useState([]);
    const [shouldRotate, setRotate] = useState(false);

    const handleRotate = () => setRotate(!shouldRotate);

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
            <AccordionHeader
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
                onClick={handleRotate}
            >
                <StyledHeader>
                    <Key>
                        {
                            filteredTypes.length <= 0 ? label :
                            `${label}:`
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
                                    <span key={`desc-${str}`}>{str}</span>
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