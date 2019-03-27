import gql from "graphql-tag";

export default gql(`
mutation ReturnRoll($id: ID!) {
  returnRoll(
    id: $id
  ) {
    id
    originalLength
    glenRavenId
    notes
    returned
  }
}`);
