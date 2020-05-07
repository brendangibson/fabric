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
                weight
                thickness
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
                reason
                timestamp
            }
            returned
        }
        shipments {
            id
            name
            dateSent
            dateReceived
        }
        holds {
            id
            length
            reason
            orderId
            notes
            timestamp
        }
      }
}`);
