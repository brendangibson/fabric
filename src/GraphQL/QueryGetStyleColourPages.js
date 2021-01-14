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
            cuts {
              length
            }

          }
          holds {
            length
          }
          incoming {
            length
          }
      }
}`);
