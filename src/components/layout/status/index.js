// Libraries
import React, { useState } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';

// Components
import { View, MenuBody, MenuCollapsableHeader } from '../../features/index';

// Styles
import { StatusMenu } from '../../features/menu/style';
import { LayoutGroup } from '../queryMenu/style';


// Prop types
Status.propTypes = {
  selector: PropTypes.string,
  viewVariable: PropTypes.node.isRequired,
  updateViewVariable: PropTypes.func,
  viewHoverValue: PropTypes.string,
  symbolHoverValue: PropTypes.string,
  isFullscreen: PropTypes.node.isRequired
};

export function Status ({
  selector,
  viewVariable,
  updateViewVariable,
  viewHoverValue,
  symbolHoverValue,
  isFullscreen
}) {
  const [shouldRotate, setRotate] = useState(true);
  const handleRotate = () => setRotate(!shouldRotate);

  return (
    <Draggable bounds="body">
      <StatusMenu isFullscreen={isFullscreen} style={{
        maxHeight: !shouldRotate ? '10vh' : 'calc(100vh - 8rem)',
        overflowY: !shouldRotate ? 'hidden' : 'scroll',
        visibility: isFullscreen ? 'hidden' : 'visible'
      }}>
        <MenuCollapsableHeader label="Legend" shouldRotate={shouldRotate} handleRotate={handleRotate}/>
        <MenuBody>
          <LayoutGroup style={{ visibility: !shouldRotate || isFullscreen ? 'hidden' : 'visible' }}>
            <View selector={selector} viewVariable={viewVariable} updateViewVariable={updateViewVariable} viewHoverValue={viewHoverValue} symbolHoverValue={symbolHoverValue} isFullscreen={isFullscreen} />
          </LayoutGroup>
        </MenuBody>
      </StatusMenu>
    </Draggable>
  );
}
