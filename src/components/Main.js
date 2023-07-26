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
  updateViewVariable: PropTypes.node.isRequired,
  viewHoverValue: PropTypes.node.isRequired,
  symbolHoverValue: PropTypes.node.isRequired,
  selector: PropTypes.node.isRequired,
  controls: PropTypes.node.isRequired,
  handleFullscreen: PropTypes.node.isRequired,
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
        id={selector}
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
