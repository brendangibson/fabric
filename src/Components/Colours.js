import React, { Component } from "react";

import { graphql, compose, withApollo } from "react-apollo";
import QueryGetColours from "../GraphQL/QueryGetColours";
import MutationCreateColour from "../GraphQL/MutationCreateColour";
import { v4 as uuid } from "uuid";


class Colours extends Component {

    state = {
        busy: false,
        colour: {
            name: ''
        }
    }

    static defaultProps = {
        colours: [],
        createColour: () => null,
    }

    handleSave = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const { createColour, history } = this.props;
        const { colour } = this.state;

        await createColour({ ...colour });

        history.push('/');
    }

    handleChange(field, { target: { value } }) {
        const { colour } = this.state;

        colour[field] = value;

        this.setState({ colour });
    }


    renderColour = (colour) => (
        <div key={colour.id}>{colour.name}</div>
    );

    render() {
        const { busy } = this.state;
        const { colours } = this.props;
        const {colour} = this.state;

        return (
            <div>
                <div>
                    {colours.map(this.renderColour)}
                </div>
                <input type="text" id="name" value={colour.name} onChange={this.handleChange.bind(this, 'name')}/><button onClick={this.handleSave}>Add</button>
            </div>
        );
    }

}

export default withApollo(compose(
    graphql(
        QueryGetColours,
        {
            options: {
                fetchPolicy: 'network-only',
            },
            props: ({ data: { getColours = [] } }) => ({
                colours: getColours
            })
        }
    ),
    graphql(
        MutationCreateColour,
    {
        props: (props) => ({
            createColour: (colour) => {
                return props.mutate({
                    update: (proxy, { data: { createColour } }) => {
                        const query = QueryGetColours;
                        const data = proxy.readQuery({ query });

                        // data.getColours.items = [...data.listEvents.items.filter(e => e.id !== createEvent.id), createEvent];

                        proxy.writeQuery({ query, data });
                    },
                    variables: colour,
                    refetchQueries: [QueryGetColours]
                })
            }
        })
    }
    )
)(Colours));
