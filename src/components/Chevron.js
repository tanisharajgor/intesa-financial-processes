// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import Ripple from './Ripple';

// Styles
import { ChevronButton } from '../component-styles/chevron-button';

// Prop types
ChevronButtonStyled.propTypes = {
  shouldRotate: PropTypes.bool,
  handleRotate: PropTypes.func
};

// Component to style the Chevron Button
export function ChevronButtonStyled ({ shouldRotate, handleRotate }) {
  return (
    <ChevronButton shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: '2%', paddingRight: '2%' }}>
      <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + '/assets/chevron.svg'} />
      <Ripple color={'#FFFFFF'} duration={1000} />
    </ChevronButton>
  );
}
