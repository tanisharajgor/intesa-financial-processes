// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Styles
import { StyledDescription } from './style';

// Prop types
Description.propTypes = {
  children: PropTypes.string
};

export function Description ({children}) {
  return (
    <StyledDescription>
      <p>{ children }</p>
    </StyledDescription>
  );
}
