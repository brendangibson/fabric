import React from "react"

import {Query} from 'react-apollo'
import QueryGetStylesColours from "../GraphQL/QueryGetStylesColours"
import { Link } from "react-router-dom"
import Loading from './Loading'

const wrapperStyle = {
    display: "grid",
    gridTemplateColumns: "40vw 40vw",
    gridColumnGap: "5vw",
    gridRowGap: "5vw",
    justifyItems: "center",
    padding: "5vw 0"
}

const swatchStyle = {
    width: "100%"
}

const cardStyle = {
    textAlign: "center"
}

 const   renderStyleColour = (stylecolour) => {

        const label = stylecolour.style.name + ' ' + stylecolour.colour.name

        return (
            <Link to={`/stylecolour/${stylecolour.id}`} style={cardStyle} key={stylecolour.id}>
                <div key={stylecolour.id}>
                    <img src={stylecolour.swatchUrl} alt={label} style={swatchStyle} />
                    <span>{label}</span>
                </div>
            </Link>);
    };

const StylesColours = () => (
    <Query query={QueryGetStylesColours}>
      {({ loading, error, data }) => {
        if (loading) return <Loading/>;
        if (error) return `Error! ${error.message}`;
  
        return (
            <div style={wrapperStyle}>
                {data.stylesColours.map(renderStyleColour)}
            </div>
        );
      }}
    </Query>
  );

  export default StylesColours
