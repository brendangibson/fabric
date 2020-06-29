import React from "react";

import { Query } from "react-apollo";
import QueryGetStyleColourPages from "../GraphQL/QueryGetStyleColourPages";
import Loading from "./Loading";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";
import { CSVLink } from "react-csv";
import moment from "moment";

const swatchStyle = {
  height: "10vw",
  width: "10vw",
};

const reasonMap = {
  samples: "Samples",
  otherOrder: "Yardage",
  product: "Product",
  shipment: "Shipment",
  defect: "Defect",
  personal: "Personal",
  shopifyOrder: "Yardage",
};

const getStyleColourName = (styleColourPage) =>
  styleColourPage.styleColour.style.name +
  " " +
  styleColourPage.styleColour.colour.name;

const getCSVData = (data) => {
  const events = [];

  data.styleColourPages.forEach((styleColourPage) => {
    const name = getStyleColourName(styleColourPage);
    const scEvents = [];

    styleColourPage.rolls.forEach((roll) => {
      scEvents.push([
        name,
        roll.shipment.dateReceived,
        roll.originalLength,
        "shipment",
      ]);
      roll.cuts.forEach((cut) => {
        scEvents.push([name, cut.timestamp, -1 * cut.length, cut.reason]);
      });
    });
    scEvents.sort((a, b) => a[1] > b[1]);
    events.push(...scEvents);
  });
  return events;
};

const renderStyleColour = (styleColourPage) => {
  const name = getStyleColourName(styleColourPage);

  const events = [];
  styleColourPage.rolls.forEach((roll) => {
    events.push([
      roll.id,
      roll.shipment.dateReceived,
      roll.originalLength,
      "shipment",
    ]);
    roll.cuts.forEach((cut) => {
      events.push([cut.id, cut.timestamp, -1 * cut.length, cut.reason]);
    });
  });

  events.sort((a, b) => a[1] > b[1]);

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

        <span style={{ verticalAlign: "bottom", marginLeft: "2vw" }}>
          {name}
        </span>
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
              <tr key={event[0]}>
                <td>{moment(event[1]).format("MMMM Do YYYY")}</td>
                <td>{event[2].toFixed(2)}</td>
                <td>{reasonMap[event[3]]}</td>
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
            style={{
              width: "100%",
              display: "block",
              textAlign: "right",
              color: "#5a8eaf",
            }}
          >
            Download ↓
          </CSVLink>
          {data && data.styleColourPages.map(renderStyleColour)}
        </div>
      );
    }}
  </Query>
);

export default Timeline;
