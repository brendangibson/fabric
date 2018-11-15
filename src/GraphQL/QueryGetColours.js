import gql from "graphql-tag";

export default gql(`
query {
  getColours {
      id
      name
  }
}`);
