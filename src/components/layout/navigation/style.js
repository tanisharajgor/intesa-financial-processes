import { LayoutHeader } from 'cfd-react-components';
import styled from 'styled-components';
import * as Theme from '../../../utils/theme';

export const NavigationBranding = styled('div')`
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    padding: 0.625rem;

    a {
        color: ${props => props.theme.color.focus};
        font-family: ${props => props.theme.font.family};
        font-size: 1.25rem;
        text-decoration: none;
    }
`;

export const StyledLayoutHeader = styled(LayoutHeader)`
    border-bottom: 1px solid ${Theme.extraDarkGreyHex};
    height: 4rem;
    position: absolute;
    z-index: +10;
    top: ${props => props.isFullscreen ? '-15vh;' : '0vh;'};
    transition: top 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    background-color: ${props => props.theme.backgroundColor.main};
`;

export const NavigationLinks = styled('div')`
    flex: 1;
    
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;

    padding: 0.625rem;
`;

export const LinkList = styled('ul')`
    list-style: none;
`;

export const Link = styled('li')`
    display: inline-block;
    flex-grow: 0;
    flex: 0;
    color: ${props => props.theme.color.secondary};
    padding: 0.625rem;
    border-radius: 0.375rem;
    font-size: ${props => props.theme.font.text};

    &:hover {
        background-color: ${props => props.theme.color.secondary};
        cursor: pointer;
    }

    &:hover > a {
        color: ${props => props.theme.color.main};
    }

    a {
        color: ${props => props.theme.color.secondary};
        text-decoration: none;
    }
    
    a.active {
        color: ${props => props.theme.color.main};
    }  
`;
