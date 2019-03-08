import gql from "graphql-tag";

export default gql(`
mutation DeleteHold($id: ID!) {
  deleteHold(id: $id) {
    id
  }
}`);
