import React from "react"
import { Query } from "react-apollo"

import RollIcon from './RollIcon'
import AddCut from './AddCut'
import Loading from './Loading'
import QueryGetRoll from "../GraphQL/QueryGetRoll";



const Roll = ({ match }) => (


    <Query query={QueryGetRoll} variables={{ id: match.params.id }}>
        {({ loading, error, data }) => {
            if (loading) return <Loading/>
            if (error) return `Error! ${error.message}`
            const roll = data.roll;
            const label = roll.styleColour.style.name + ' ' + roll.styleColour.colour.name
            return (<div>
                <RollIcon originalLength={roll.originalLength} swatchUrl={roll.styleColour.swatchUrl} glenRavenId={roll.glenRavenId} />
                <ul>
                    <li>Style Colour: {label}</li>
                    <li>Original Length: {roll.originalLength} yards</li>
                    <li>Shipment: {roll.shipment && (roll.shipment.name || roll.shipment.dateRecieved || roll.shipment.dateSent)}</li>
                    <li>Notes: {roll.notes}</li>
                </ul>
                <h1>Cuts</h1>
                {roll.cuts.map((cut)=>(
                    <ul>
                        <li>Length: {cut.length}</li>
                        <li>Reason: {cut.reason}</li>
                        <li>Notes: {cut.notes}</li>
                        <li>Order Id: {cut.orderId}</li>
                    </ul>
                ))}
                <AddCut rollId={match.params.id} refetchQueries={[{query: QueryGetRoll, variables: {id: match.params.id}}]}/>
            </div>);
        }}
    </Query>


)

export default Roll;

