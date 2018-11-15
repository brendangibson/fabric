import gql from "graphql-tag";

export default gql(`
query {
  getStyles {
      id
      name
      weight
      thickness
      patternWidth
      patternHeight
  }
}`);
