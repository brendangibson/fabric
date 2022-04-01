import gql from "graphql-tag";

export default gql(`
mutation DeleteStandby($id: ID!) {
  deleteStandby(id: $id) {
    id
  }
}`);
