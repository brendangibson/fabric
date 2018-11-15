import gql from "graphql-tag";

export default gql(`
mutation CreateStyle($name: String!, $weight: Float, $thickness: Float, $patternWidth: Float, $patternHeight: Float) {
  createStyle(
    name: $name
  ) {
    id
    name
    weight
    thickness
    patternWidth
    patternHeight
  }
}`);
