import gql from "graphql-tag";

export default gql(`
query {
    stylesColours{
        id
        name
        swatchUrl
        remaining
        rate
        holdsLength
        incomingLength
        incoming {
          id
          length
          expected
        }
        standbyLength
        standby {
          id
          length
        }
      }
}`);
