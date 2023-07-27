// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Status, Control } from '../index';

// Styles
import { StyledMain, Visualization } from './style';

// Prop types
Main.propTypes = {
  viewVariable: PropTypes.node.isRequired,
  updateViewVariable: PropTypes.func,
  viewHoverValue: PropTypes.string,
  symbolHoverValue: PropTypes.string,
  selector: PropTypes.string,
  controls: PropTypes.object,
  handleFullscreen: PropTypes.func,
  isFullscreen: PropTypes.node.isRequired
};


export function Main ({
  viewVariable,
  updateViewVariable,
  viewHoverValue,
  symbolHoverValue,
  selector,
  controls,
  handleFullscreen,
  isFullscreen
}) {
  return (
    <StyledMain>
      <Visualization id={selector} className="Visualization"></Visualization>
      <Status
        selector={selector}
        viewVariable={viewVariable}
        updateViewVariable={updateViewVariable}
        viewHoverValue={viewHoverValue}
        symbolHoverValue={symbolHoverValue}
        controls={controls}
        handleFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
      />
      <Control controls={controls} handleFullscreen={handleFullscreen}/>
    </StyledMain>
  );
}
