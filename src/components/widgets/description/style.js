import styled from "styled-components";

export const StyledDescription = styled.div`
    border-bottom: 1px solid #4e5155;
    padding: ${props =>  props.theme.padding };

    h4 {
        margin-bottom: 1.2rem;
        padding: 0;
        color: #919295;
    }
`;
