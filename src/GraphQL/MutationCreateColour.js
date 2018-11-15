import gql from "graphql-tag";

export default gql(`
mutation CreateColour($name: String!) {
  createColour(
    name: $name
  ) {
    id
    name
  }
}`);
