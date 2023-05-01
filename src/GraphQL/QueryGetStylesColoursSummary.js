import gql from "graphql-tag";

export default gql(`
query {
    stylesColours{
        id
        name
        remaining
        holdsLength
        swatchUrl
        incoming {
          length
          expected
        }
        incomingLength
        standby {
          length
        }
        standbyLength
      }
}`);
