import gql from "graphql-tag";

export default gql(`
query {
    stylesColours{
        id
        name
        swatchUrl
      }
}`);
