import styled from "styled-components";

export const StyledControlsPanel = styled.div`
    position: absolute;
    bottom: 0.5rem;
    right: 1rem;
    .inner {
        display: flex;
    }
    background-color: rgba(0,0,0,0.6);
    border-radius: 5px;
    padding: ${props => props.theme.padding};
`

export const StyledControlButton = styled('button')`
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    position: relative;
    &:hover {
        border-color: ${props =>  props.theme.color.secondary };
        border-radius: 15%;
    }
`

export const FullscreenIcon = styled('img')`
    padding: 4px;
`

export const FullscreenButton = styled(StyledControlButton)`
    width: 22px;
`
