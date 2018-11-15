import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  getFriendlyRoll(id: $id) {
    id
    originalLength
    styleColour{colour {
      name
    }
    style {
      name
    }
    swatchUrl}
    glenRavenId
  }
}`);
