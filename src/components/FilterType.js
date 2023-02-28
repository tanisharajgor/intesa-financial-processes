import { Accordion, AccordionSummary, AccordionDetails, } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FormControlLabel } from '@material-ui/core';
import { useStyles } from '../utils/ComponentStyles';
import Checkbox from '@material-ui/core/Checkbox';

const id = "Filter-Activity-Type";

export default function FilterType({typesChecks, updateTypeChecks, typeValues, label}) {

    const Styles = useStyles();
    let newSelectedTypes = [];

    const updateSelectedRange = (selected) => {
        if (typesChecks.includes(selected)) {
            newSelectedTypes = typesChecks.filter((obj) => obj !== selected);
        } else {
            typesChecks.push(selected)
            newSelectedTypes = [...typesChecks];
        }
        updateTypeChecks(newSelectedTypes)
    }

    return(
        <Accordion className={Styles.card}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="activity-type-filter-content"
                id="activity-type-filter-header"
            >
            <div>
                <h4><span className='key'>{label}</span>
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
                                                checked={typesChecks.includes(value)} 
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