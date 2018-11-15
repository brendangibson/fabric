import gql from "graphql-tag";

export default gql(`
query {
    getFriendlyStylesColours{
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
