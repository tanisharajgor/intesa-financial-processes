//Styles

import { MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem } from '../component-styles/query-layout';
import { StyledSelect } from '../component-styles/select';
import { StyledLabel } from "../component-styles/menu";

export function DrillDown({values, selected, handleChange, label, id}) {

    return(
        <LayoutGroup>
            <StyledLabel>{label}</StyledLabel>
            <LayoutRow>
                <LayoutItem className="push">
                    <Form variant="outlined" size="small">
                        <StyledSelect
                            labelId={"process-" + id + "-select-label"}
                            id={"process-" + id + "-select"}
                            displayEmpty
                            value={selected.id}
                            onChange={handleChange}
                        >
                            {values.map((level) => {
                                return(
                                    <MenuItem key={`menu-item-${level.id}`} value={level.id}>{level.descr}</MenuItem>
                                )
                            })}
                        </StyledSelect>
                    </Form>
                </LayoutItem>
            </LayoutRow>
        </LayoutGroup>
    )
}
