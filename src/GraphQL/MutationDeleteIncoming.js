import gql from "graphql-tag";

export default gql(`
mutation DeleteIncoming($id: ID!) {
  deleteIncoming(id: $id) {
    id
  }
}`);
