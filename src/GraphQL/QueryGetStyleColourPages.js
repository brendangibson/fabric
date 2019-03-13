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
            cuts {
              length
            }
            holds {
              length
            }
          }
      }
}`);
