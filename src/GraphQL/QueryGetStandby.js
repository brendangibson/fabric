import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getStandby(id: $id) {
    id
    length
  }
}`);
