import styled from 'styled-components';

export const StyledControlsPanel = styled.div`
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem; 
    .inner {
        display: flex;
    }
`;

export const StyledControlButton = styled('button')`
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    position: relative;

    &:hover {
        border-color: ${props => props.theme.color.secondary};
        border-radius: 15%;
    }
`;

export const FullscreenIcon = styled('img')`
    padding: 4px;
`;

export const FullscreenButton = styled(StyledControlButton)`
    width: 22px;
`;
