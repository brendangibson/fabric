import React from "react";
import { Query } from "react-apollo";

import QueryGetRoll from "../GraphQL/QueryGetRoll";



const Roll = ({ match }) => (


    <Query query={QueryGetRoll} variables={{ id: match.params.id }}>
        {({ loading, error, data }) => {
            if (loading) return "Loading...";
            if (error) return `Error! ${error.message}`;
            const roll = data.getFriendlyRoll;
            const label = roll.styleColour.style.name + ' ' + roll.styleColour.colour.name
            return (<div>
                <div>label</div>
                <img src={roll.styleColour.swatchUrl} alt={label} />
                <div>{roll.glenRavenId}</div>
            </div>);
        }}
    </Query>


)

export default Roll;

