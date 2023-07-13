import styled from 'styled-components';

export const StyledFilteredData = styled('p')`
    text-color: ${props => props.theme.color.secondary};
    opacity: 75%;
    margin-bottom: 0.5rem;
    font-size: 14px;
`

export const StyledFilter = styled('div')`
    display: flex;
    flex-direction: column;
`

export const StyledHeader = styled('div')`
    display: flex;
`
