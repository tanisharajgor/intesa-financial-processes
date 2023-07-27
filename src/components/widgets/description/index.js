// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Styles
import { StyledDescription } from '../component-styles/description';

// Prop types
Description.propTypes = {
  children: PropTypes.string
};

export default function Description ({children}) {
  return (
    <StyledDescription>
      <p>{ children }</p>
    </StyledDescription>
  );
}
