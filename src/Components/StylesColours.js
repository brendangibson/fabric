import React, { Component } from "react";

import { graphql, compose, withApollo } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import { v4 as uuid } from "uuid";


class StylesColours extends Component {

    state = {
        busy: false
    }

    static defaultProps = {
        stylesColours: [],
    }


    renderStyleColour = (stylecolour) => (
        <div key={stylecolour.id}>
            <img src={stylecolour.swatchUrl} />
            <span>{stylecolour.style.name} {stylecolour.colour.name}</span></div>
    );

    render() {
        const { stylesColours } = this.props;

        return (
            <div>
                <div className="giraffe">
                    {stylesColours.map(this.renderStyleColour)}
                </div>
            </div>
        );
    }

}

export default withApollo(compose(
    graphql(
        QueryGetStylesColours,
        {
            options: {
                fetchPolicy: 'network-only',
            },
            props: ({ data: { getFriendlyStylesColours = [] } }) => ({
                stylesColours: getFriendlyStylesColours
            })
        }
    )
    
    
)(StylesColours));
