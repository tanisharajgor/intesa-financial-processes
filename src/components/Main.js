// Libraries
import React from 'react';
import PropTypes from 'prop-types';

// Components
import Status from '../components/Status';
import Control from './Controls';

// Styles
import { StyledMain, Visualization } from '../component-styles/main';

// Prop types
Main.propTypes = {
  viewVariable: PropTypes.node.isRequired,
  updateViewVariable: PropTypes.func,
  viewHoverValue: PropTypes.number,
  symbolHoverValue: PropTypes.number,
  selector: PropTypes.string,
  controls: PropTypes.object,
  handleFullscreen: PropTypes.func,
  isFullscreen: PropTypes.node.isRequired
};


export default function Main ({
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
