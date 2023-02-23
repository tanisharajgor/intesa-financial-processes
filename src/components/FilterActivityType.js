import { Accordion, AccordionSummary, AccordionDetails, } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FormControlLabel } from '@material-ui/core';
import { useStyles } from '../utils/ComponentStyles';
import Checkbox from '@material-ui/core/Checkbox';

const id = "Filter-Type";

export default function FilterActivityType({activityTypesChecks, updateActivityTypeChecks, typeValues}) {

    const Styles = useStyles();
    let newSelectedTypes = [];

    const updateSelectedRange = (selected) => {
        if (activityTypesChecks.includes(selected)) {
            newSelectedTypes = activityTypesChecks.filter((obj) => obj !== selected);
        } else {
            activityTypesChecks.push(selected)
            newSelectedTypes = [...activityTypesChecks];
        }
        updateActivityTypeChecks(newSelectedTypes)
    }

    return(
        <Accordion className={Styles.card}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="type-filter-content"
                id="type-filter-header"
            >
            <div>
                <h4><span className='key'>Filter by Activity Type:</span>
                    <span className='spec'></span>
                </h4>
            </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className="layout_group">
                        <div className="layout_row">
                            <div className="layout_item push">
                            <ul>
                                {typeValues.map((value, index) => {
                                    return (
                                        <li key={index}>
                                                <FormControlLabel
                                                control={<Checkbox color="primary" 
                                                checked={activityTypesChecks.includes(value)} 
                                                name={value} 
                                                onChange={() => updateSelectedRange(value)} />}
                                                label={value}
                                            />
                                        </li>
                                        )
                                    })
                                }
                                </ul>
                            </div>
                        </div>
                        <div className="layout_row">
                            <div id={id}></div>
                        </div>
                    </div>
            </AccordionDetails>
        </Accordion>
    )
}