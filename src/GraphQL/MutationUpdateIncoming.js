import gql from "graphql-tag";

export default gql(`
mutation UpdateIncoming($id: ID!, $length: Float!, $expected: String!) {
  updateIncoming(
    id: $id, length: $length, expected: $expected
  ) {
    id
    length
    expected
  }
}`);
