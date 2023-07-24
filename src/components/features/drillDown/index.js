//Styles

import { MenuItem, Form } from 'cfd-react-components';
import { LayoutGroup, LayoutRow, LayoutItem } from '../../layout/queryMenu/style';
import { StyledSelect } from "../../../utils/global-styles";
import { StyledLabel } from "../menu/style";

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
