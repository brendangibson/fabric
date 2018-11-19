import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
    styleColourPage(id: $id){
        styleColour{
            id
            colour {
                name
            }
            style {
                name
            }
            swatchUrl
        }
        rolls{
            id
            glenRavenId
            originalLength
            cuts {
                length
            }
        }
        shipments {
            id
            name
            dateSent
            dateReceived
        }
      }
}`);
