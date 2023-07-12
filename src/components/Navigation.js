import { LayoutHeader } from "cfd-react-components";
import { NavLink } from "react-router-dom";
import styled from 'styled-components'

const NavigationBranding = styled('div')`
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    padding: 0.625rem;

    a {
        color: ${props =>  props.theme.color.focus };
        font-family: ${props => props.theme.font.family };
        font-size: 1.25rem;
        text-decoration: none;
    }
`

const StyledLayoutHeader = styled(LayoutHeader)`
    border-bottom: 1px solid #4e5155;
    height: 10vh;
    position: absolute;
    z-index: +10;
    top: ${props => props.isFullscreen ? "-15vh;" : "0vh;"};
    transition: top 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    background-color: ${props =>  props.theme.backgroundColor.main };
`

const NavigationLinks = styled('div')`
    flex: 1;
    
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;

    padding: 0.625rem;
`

const LinkList = styled('ul')`
    list-style: none;
`

const Link = styled(`li`)`
    display: inline-block;
    flex-grow: 0;
    flex: 0;
    color: ${props =>  props.theme.color.secondary };
    padding: 0.625rem;
    border-radius: 0.375rem;
    font-size: ${props =>  props.theme.font.text };

    &:hover {
        background-color: ${props =>  props.theme.color.secondary };
        cursor: pointer;
    }

    &:hover > a {
        color: ${props =>  props.theme.color.main };
    }

    a {
        color: ${props =>  props.theme.color.secondary };
        text-decoration: none;
    }
    
    a.active {
        color: ${props =>  props.theme.color.main };
    }  

    a:hover {
        color: ${props =>  props.theme.color.main };
        background-color: ${props =>  props.theme.color.border };
    }
`

/**
 * Menu Navigation bar to navigate to different parts of the project
 * @returns 
 */
export default function Navigation({isFullscreen}) {
    return (
        <StyledLayoutHeader className="Navigation" isFullscreen={isFullscreen}>
            <NavigationBranding className="Navigation_branding">
                <h2>
                    <NavLink to="/">Banca Intesa Processes</NavLink>
                </h2>
            </NavigationBranding>
            <NavigationLinks>
                <LinkList>
                    <Link>
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Ecosystem</NavLink>
                    </Link>
                    <Link>
                        <NavLink to="/Network" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Network</NavLink>
                    </Link>
                    {/* <Link className="Navigation_link">
                        <NavLink to="/Help" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Help</NavLink>
                    </Link> */}
                </LinkList>
            </NavigationLinks>
        </StyledLayoutHeader>
    )
}
