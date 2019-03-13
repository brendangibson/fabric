import gql from "graphql-tag";

export default gql(`
mutation CutHold($id: ID!) {
  cutHold(
    id: $id
  ) {
    id
  }
}`);
