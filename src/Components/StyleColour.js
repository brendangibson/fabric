import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import { Link } from "react-router-dom";

import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import MutationCreateRoll from "../GraphQL/MutationCreateRoll";


class StyleColour extends Component {


    state = {
        originalLength: '',
        glenRavenId: ''
    }

    onChange = (index) => {

        return ({ target: { value } }) => {
            this.setState({[index]:value});
        }
    }

    addRoll = (mutator) => {
        return () => {
            const { glenRavenId, originalLength } = this.state
            const { match } = this.props
            mutator({ variables: { colourStyleId: match.params.id, glenRavenId: glenRavenId, originalLength: originalLength } })
        }
    }

    render() {

        const { match } = this.props
        return (
            <Query query={QueryGetStyleColour} variables={{ id: match.params.id }}>
                {({ loading, error, data }) => {
                    if (loading) return "Loading...";
                    if (error) return `Error! ${error.message}`;
                    const styleColour = data.getStyleColourPage;
                    const label = styleColour.style.name + ' ' + styleColour.colour.name
                    return (<div>
                        <div>{label}</div>
                        <img src={styleColour.swatchUrl} alt={label} />
                        {styleColour.rolls.map((roll) => {
                            return (<Link to={`/roll/${roll.id}`} key={roll.id}>
                                {roll.glenRavenId}</Link>)
                        })}

                        <Mutation mutation={MutationCreateRoll}>
                            {(addRoll, { data }) => (
                                <form>
                                    <input type="text" id='originalLength' name='originalLength' onChange={this.onChange('originalLength')} />
                                    <input type="text" id='glenRavenId' name='glenRavenId' onChange={this.onChange('glenRavenId')} />
                                    <button onClick={this.addRoll(addRoll)}>Add</button>
                                </form>)}
                        </Mutation>
                    </div>);
                }}
            </Query>)
    }


}

export default StyleColour;

