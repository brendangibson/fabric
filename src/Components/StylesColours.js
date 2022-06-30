import React from "react";

import { Query } from "react-apollo";
import QueryHome from "../GraphQL/QueryHome";
import { Link } from "react-router-dom";
import Loading from "./Loading";
import Swatch from "./Swatch";

const wrapperStyle = {
  display: "grid",
  gridTemplateColumns: "42vw 42vw",
  gridColumnGap: "6vw",
  gridRowGap: "6vw",
  justifyItems: "center",
  padding: "5vw 0",
};

const cardStyle = {
  textAlign: "center",
  width: "100%",
};

const renderStyleColour = (stylecolour) => {
  const label = stylecolour.name;

  return (
    <Link
      to={`/stylecolour/${stylecolour.id}`}
      style={cardStyle}
      key={stylecolour.id}
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
