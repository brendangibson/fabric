import React, { Component } from "react";

import { graphql, compose, withApollo } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import { Link } from "react-router-dom";


class StylesColours extends Component {

    state = {
        busy: false
    }

    static defaultProps = {
        stylesColours: [],
    }


    renderStyleColour = (stylecolour) => {

        const label = stylecolour.style.name + ' ' + stylecolour.colour.name

        return (
            <Link to={`/stylecolour/${stylecolour.id}`} className="card" key={stylecolour.id}>

                <div key={stylecolour.id}>
                    <img src={stylecolour.swatchUrl} alt={label}/>
                    <span>{label}</span></div>
            </Link>);
    };

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
