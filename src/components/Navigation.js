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

    h2 {
        color: ${props =>  props.theme.colorFocus };
        font-family: ${props => props.theme.font.family };
        font-size: 1.25rem;
    }
`

/**
 * Menu Navigation bar to navigate to different parts of the project
 * @returns 
 */
export default function Navigation() {
    return (
        <LayoutHeader>
            <NavigationBranding className="Navigation_branding">
                <h2>
                    <NavLink to="/">Banca Intesa Processes</NavLink>
                </h2>
            </NavigationBranding>
            <div className="Navigation_links">
                <ul id="Navigation_list">
                    <li className="Navigation_link">
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Circle Packing</NavLink>
                    </li>
                    <li className="Navigation_link">
                        <NavLink to="/Network" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Network</NavLink>
                    </li>
                    {/* <li className="Navigation_link">
                        <NavLink to="/Help" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Help</NavLink>
                    </li> */}
                </ul>
            </div>
        </LayoutHeader>
    )
}
