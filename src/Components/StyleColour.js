import React, { Component } from "react";
import { Query, Mutation } from "react-apollo";
import { Link } from "react-router-dom";
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import MutationCreateRoll from "../GraphQL/MutationCreateRoll";
import RollIcon from './RollIcon'

const topStyle = {
    padding: "5vw 0 5vw 0"
}

const swatchStyle = {
    width: "40vw",
    marginRight: "5vw"
}

const labelStyle = {
    fontSize: "6vw",
    display: "inline-block",
    verticalAlign: "top"
}

const rollStyle = {
    display: "block"
}

class StyleColour extends Component {


    state = {
        originalLength: '',
        glenRavenId: ''
    }

    onChange = (index) => {

        return ({ target: { value } }) => {
            this.setState({ [index]: value });
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
                        <div style={topStyle}>
                            <img src={styleColour.swatchUrl} alt={label} style={swatchStyle} />
                            <div style={labelStyle}>{label}</div>
                        </div>
                        {styleColour.rolls.map((roll) => {
                            return (<Link to={`/roll/${roll.id}`} key={roll.id} style={rollStyle}>
                                <RollIcon originalLength={roll.originalLength} swatchUrl={styleColour.swatchUrl} glenRavenId={roll.glenRavenId} /></Link>)
                        })}

                        <Mutation mutation={MutationCreateRoll} update={(cache, { data: { createRoll } }) => {
                            if (createRoll) {
                                const { getStyleColourPage } = cache.readQuery({ query: QueryGetStyleColour, variables: { id: match.params.id } });
                                getStyleColourPage.rolls = getStyleColourPage.rolls.concat(createRoll);
                                cache.writeQuery({
                                    query: QueryGetStyleColour,
                                    data: { getStyleColourPage: getStyleColourPage }
                                });
                            }
                        }}>
                            {addRoll => (
                                <Form>
                                    <Form.Group>
                                        <Form.Label>Length</Form.Label>
                                        <Form.Control type="text" id='originalLength' name='originalLength' onChange={this.onChange('originalLength')} placeholder="Length in yards" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Glen Raven Id</Form.Label>
                                        <Form.Control type="text" id='glenRavenId' name='glenRavenId' onChange={this.onChange('glenRavenId')} placeholder="From sticker on bag" />
                                    </Form.Group>

                                    <Button variant="primary" size="lg" onClick={this.addRoll(addRoll)}>Add Roll</Button>
                                </Form>)}
                        </Mutation>
                    </div>);
                }}
            </Query>)
    }


}

export default StyleColour;

