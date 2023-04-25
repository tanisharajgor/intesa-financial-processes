import styled from 'styled-components'

export const Tooltip = styled('div')`
    position: absolute;
    left: 0px;
    right: 0px;
    visibility: hidden;
    padding: 10px 20px;
    pointer-events: none;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.8);
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: normal;
    font-size: 16px;
`