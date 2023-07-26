// Components
import Status from '../components/Status';
import Control from './Controls';

// Styles
import { StyledMain, Visualization } from '../component-styles/main';

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
