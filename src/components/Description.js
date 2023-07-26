// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Styles
import { StyledDescription } from '../component-styles/description';

// Prop types
Description.propTypes = {
  props: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired
};

export default function Description (props) {
  return (
    <StyledDescription>{ props.children }</StyledDescription>
  );
}
