import gql from "graphql-tag";

export default gql(`
mutation UnReturnRoll($id: ID!) {
  unReturnRoll(
    id: $id
  ) {
    id
    originalLength
    glenRavenId
    notes
    returned
  }
}`);
