// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Ripple } from '../../features/index';

// Styles
import { ChevronButtonStyled } from './style';

// Prop types
ChevronButton.propTypes = {
  shouldRotate: PropTypes.bool,
  handleRotate: PropTypes.func
};

// Component to style the Chevron Button
export function ChevronButton ({ shouldRotate, handleRotate }) {
  return (
    <ChevronButtonStyled shouldRotate={shouldRotate} onClick={handleRotate} style={{ paddingLeft: '2%', paddingRight: '2%' }}>
      <img alt="Button to zoom further into the visualization" src={process.env.PUBLIC_URL + '/assets/chevron.svg'} />
      <Ripple color={'#FFFFFF'} duration={1000} />
    </ChevronButtonStyled>
  );
}
