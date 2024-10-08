// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Libraries
import { NavLink } from 'react-router-dom';

// Styles
import { NavigationBranding, StyledLayoutHeader, NavigationLinks, LinkList, Link } from './style';

// Prop types
Navigation.propTypes = {
  isFullscreen: PropTypes.node.isRequired
};

/**
 * Menu Navigation bar to navigate to different parts of the project
 * @returns
 */
export function Navigation ({ isFullscreen }) {
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
          <Link className="Navigation_link">
            <NavLink to="/Help" className={({ isActive }) => (isActive ? 'active' : 'inactive')}>Help</NavLink>
          </Link>
        </LinkList>
      </NavigationLinks>
    </StyledLayoutHeader>
  );
}
