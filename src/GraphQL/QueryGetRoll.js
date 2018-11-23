import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
  roll(id: $id) {
    id
    originalLength
    styleColour{
      colour {
        name
      }
      style {
        name
      }
      swatchUrl
    }
    glenRavenId
    notes
    
    cuts {
      id
      length
      reason
      orderId
      notes
    }
  }
}`);
