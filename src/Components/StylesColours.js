import React, { Component } from "react";

import { graphql, compose, withApollo } from "react-apollo";
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours";
import { Link } from "react-router-dom";


const wrapperStyle = {
    display: "grid",
    gridTemplateColumns: "40vw 40vw",
    gridColumnGap: "5vw",
    gridRowGap: "5vw",
    justifyItems: "center"
}

const swatchStyle = {
    width: "100%"
}

const cardStyle = {
    textAlign: "center"
}

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
            <Link to={`/stylecolour/${stylecolour.id}`} style={cardStyle} key={stylecolour.id}>
                <div key={stylecolour.id}>
                    <img src={stylecolour.swatchUrl} alt={label} style={swatchStyle} />
                    <span>{label}</span>
                </div>
            </Link>);
    };

    render() {
        const { stylesColours } = this.props;

        return (
            <div style={wrapperStyle}>
                {stylesColours.map(this.renderStyleColour)}
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
