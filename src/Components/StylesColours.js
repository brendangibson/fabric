import React from "react";

import { Query } from "react-apollo";
import QueryHome from "../GraphQL/QueryHome";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import Swatch from "./Swatch";
import "./stylesColours.css";

const wrapperStyle = {
  display: "flex",
  gap: "6vw",
  padding: "5vw 0",
  flexWrap: "wrap",
};

const renderStyleColour = (stylecolour) => {
  const label = stylecolour.name;

  return (
    <Link
      to={`/stylecolour/${stylecolour.id}`}
      key={stylecolour.id}
      className="colourStyleCard"
    >
      <Swatch src={stylecolour.swatchUrl} />
      <span>{label}</span>
    </Link>
  );
};

const StylesColours = () => (
  <Query query={QueryHome} fetchPolicy="network-only">
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      return (
        <div style={wrapperStyle}>
          {data.stylesColours.map(renderStyleColour)}
        </div>
      );
    }}
  </Query>
);

export default StylesColours;
