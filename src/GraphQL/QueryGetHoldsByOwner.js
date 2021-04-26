import gql from "graphql-tag";

export default gql(`
query($owner: String!) {
  getHoldsByOwner(owner: $owner) {
    id
    length
    owner
    expires
    notes
  }
}`);
