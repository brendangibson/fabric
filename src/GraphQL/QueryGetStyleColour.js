import gql from "graphql-tag";

export default gql(`
query($id: ID!) {
    getStyleColourPage(id: $id){
        
        id
        colour {
            name
        }
        style {
            name
        }
        swatchUrl
        rolls{
            id
            glenRavenId
        }
      }
}`);
