import React from "react";

import { Query } from "react-apollo";
import QueryGetStyleColourPages from "../GraphQL/QueryGetStyleColourPages";
import Loading from "./Loading";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
import moment from "moment";

const swatchStyle = {
  height: "20vw",
  width: "20vw",
};

const getStyleColourName = (styleColourPage) =>
  styleColourPage.styleColour.style.name +
  " " +
  styleColourPage.styleColour.colour.name;

const getCSVData = (data) => {
  const events = [];

  data.styleColourPages.forEach((styleColourPage) => {
    const name = getStyleColourName(styleColourPage);

    styleColourPage.rolls.forEach((roll) => {
      events.push([
        name,
        roll.shipment.dateReceived,
        roll.originalLength,
        "shipment",
      ]);
      roll.cuts.forEach((cut) => {
        events.push([name, cut.timestamp, -1 * cut.length, cut.reason]);
      });
    });
  });
  return events;
};

const renderStyleColour = (styleColourPage) => {
  const name = getStyleColourName(styleColourPage);

  const events = [];
  styleColourPage.rolls.forEach((roll) => {
    events.push([roll.shipment.dateReceived, roll.originalLength, "shipment"]);
    roll.cuts.forEach((cut) => {
      events.push([cut.timestamp, cut.length, cut.reason]);
    });
  });

  events.sort((a, b) => a[0] - b[0]);

  return (
    <div key={styleColourPage.styleColour.id}>
      <div>
        <Link to={`/stylecolour/${styleColourPage.styleColour.id}`}>
          <img
            style={swatchStyle}
            src={styleColourPage.styleColour.swatchUrl}
            alt={name}
          />
        </Link>

        <span>{name}</span>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Change (yards)</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            return (
              <tr key={JSON.stringify(event)}>
                <td>{moment(event[0]).format("MMMM Do YYYY")}</td>
                <td>{event[1].toFixed(2)}</td>
                <td>{event[2]}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const Timeline = () => (
  <Query query={QueryGetStyleColourPages} fetchPolicy="no-cache">
    {({ loading, error, data }) => {
      if (loading) return <Loading />;
      if (error) return `Error! ${error.message}`;

      return (
        <div>
          <CSVLink
            filename="SienCo.csv"
            data={getCSVData(data)}
            headers={["Style Colour", "Date", "Change", "Reason"]}
          >
            Download
          </CSVLink>
          {data && data.styleColourPages.map(renderStyleColour)}
        </div>
      );
    }}
  </Query>
);

export default Timeline;
