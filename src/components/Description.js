// Styles
import { StyledDescription } from '../component-styles/description';

export default function Description (props) {
  return (
    <StyledDescription>{ props.children }</StyledDescription>
  );
}
