import styled from 'styled-components';

export const LayoutGroup = styled('div')`
    padding-top: 0%;
    padding-right: ${props => props.theme.padding};
    padding-bottom: ${props => props.theme.padding};
    padding-left: ${props => props.theme.padding};
    width: 100%;
    
    &.inline {
        width: 100%;
        .layout_row {
            display: block;
            .layout_item {
            display: inline;
            }
        }
    }
`;

export const LayoutRow = styled('div')`
    display: flex;
    gap: ${props => props.theme.padding};
    flex-direction: row;
    align-items: center;
    width: 100%;
`;

export const LayoutItem = styled('div')`
    flex: 1;
    display: inline-block;

    &.label {
        flex: 0;
        min-width: 2.5rem;
    }

    &.icon {
        flex: 0;
        min-width: 2rem;
    }
    
    &.push {
        // margin-left: 3.125rem;
    }
`;

export const FilterList = styled('ul')`
    list-style: none;
`;
