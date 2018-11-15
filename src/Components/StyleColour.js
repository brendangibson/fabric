import React from "react";
import {  Query } from "react-apollo";

import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";



const StyleColour = ({match})=> (


    <Query query={QueryGetStyleColour} variables={{ id: match.params.id }}>    
        {({ loading, error, data }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            const styleColour = data.getStyleColourPage;
           return ( <div>
                <div>{styleColour.style.name} {styleColour.colour.name}</div>
                <img src={styleColour.swatchUrl} />
                {styleColour.rolls.map((roll) => {
                    return (<div>{roll.glenRavenId}</div>)
                })}
            </div>);
        }}
            </Query>
    

    )

export default StyleColour;

