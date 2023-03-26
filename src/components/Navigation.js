import { LayoutHeader } from "cfd-react-components";
import { NavLink } from "react-router-dom";

/**
 * Menu Navigation bar to navigate to different parts of the project
 * @returns 
 */
export default function Navigation() {
    return (
        <LayoutHeader>
            <div className="Navigation_branding">
                <h2><NavLink to="/">Banca Intesa Processes</NavLink></h2>
            </div>
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