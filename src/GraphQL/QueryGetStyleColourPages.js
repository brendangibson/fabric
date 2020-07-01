import gql from "graphql-tag";

export default gql(`
query {
    styleColourPages{
          styleColour {
            id
            swatchUrl
            colour{
              name
            }
            style{
              name
            }
          }
          rolls {
            id
            originalLength
            returned
            cuts {
              id
              length
              reason
              timestamp
            }
            shipment {
              dateReceived
            }
          }
          holds {
            length
          }
      }
}`);
