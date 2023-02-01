import { Accordion, AccordionSummary, AccordionDetails, IconButton } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { FormControlLabel } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import { useStyles } from '../utils/ComponentStyles';
import Checkbox from '@material-ui/core/Checkbox';
import { useState } from "react";

const id = "Filter-Type";

export default function FilterType({}) {

    const Styles = useStyles();
    const [typesChecks, updateChecks] = useState([])

    const handleChange = (event) => {
        // let level1 = event.target.value;
        // updateLevel1(level1)
    };

    const values = ["Process activity", "Control activity", "Common process activity", "System activity"]
    const all = "";

    const updateSelectedRange = (selected) => {
        // Update the selected age ranges, so the selected boxes are checked
        let newSelectedTypes = [];
        if (typesChecks.includes(selected)) {
            newSelectedTypes = typesChecks.filter((obj) => obj.id !== selected.id);
        } else {
            typesChecks.push(selected)
            newSelectedTypes = [...typesChecks];
        }
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
                                {
                                    values.map((value, index) => {
                                        return (
                                            <li key={index}>
                                                 <FormControlLabel
                                                    control={<Checkbox color="primary" checked={typesChecks.includes(value)} name={value} onChange={() => updateSelectedRange(value)} />}
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