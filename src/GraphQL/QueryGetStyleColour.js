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
            glenRavenName
        }
        rolls{
            id
            glenRavenId
            originalLength
            cuts {
                length
            }
            returned
        }
        shipments {
            id
            name
            dateSent
            dateReceived
        }
      }
}`);
