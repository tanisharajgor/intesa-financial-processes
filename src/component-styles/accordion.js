import styled from 'styled-components';
import * as Theme from "../component-styles/theme";

export const StyledFilteredData = styled('p')`
    padding-top: 0; 
    padding-right: ${props =>  props.theme.padding };
    padding-bottom: ${props =>  props.theme.padding };
    padding-left: ${props =>  props.theme.padding };
    font-size: 14px;
    text-color: ${props => props.theme.color.secondary};
`

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

export const StyledHeader = styled('div')`
    display: flex;
    padding: ${props =>  props.theme.padding };
`

export const StyledLabel = styled('span')`
    color: ${Theme.labelStyles.fontColor};
    font-family: ${Theme.labelStyles.fontFamily};
    font-size: ${Theme.labelStyles.fontSize};
    margin-bottom: 5px;
    margin-left: 3px;
`
