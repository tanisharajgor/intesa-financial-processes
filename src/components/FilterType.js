import { Accordion, AccordionHeader, AccordionDetails, FormLabel, Checkbox } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem, FilterList } from '../component-styles/query-layout';
import { Key } from '../component-styles/key'

const id = "Filter-Activity-Type";

export default function FilterType({typesChecks, updateTypeChecks, typeValues, label}) {

    let newSelectedTypes = [];

    const updateSelectedRange = (selected) => {
        if (typesChecks.includes(selected)) {
            newSelectedTypes = typesChecks.filter((obj) => obj !== selected);
        } else {
            typesChecks.push(selected)
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
                <h4>
                    <Key>{label}</Key>
                    <span className='spec'></span>
                </h4>
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
                            <div id={id}></div>
                        </LayoutRow>
                    </LayoutGroup>
            </AccordionDetails>
        </Accordion>
    )
}