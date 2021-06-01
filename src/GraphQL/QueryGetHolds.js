import gql from "graphql-tag";

export default gql(`
query {
  getHolds {
    id
    length
    owner
    expires
    notes
    pending
  }
}`);
