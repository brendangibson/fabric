import gql from "graphql-tag";

export default gql(`
query {
    stylesColours{
        id
        colour {
            name
        }
        style {
            name
        }
        swatchUrl
      }
}`);
