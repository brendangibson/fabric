import React, { useState } from "react";
import Dimensions from "./Dimensions";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import MutationDeleteHold from "../GraphQL/MutationDeleteHold";
import Table from "react-bootstrap/Table";
import { Mutation } from "react-apollo";
import { humanize } from "../DataFunctions/Cuts";
import QueryGetStyleColour from "../GraphQL/QueryGetStyleColour";
import moment from "moment";
import UpdateHold from "./UpdateHold";

const deleteStyle = {
  display: "inline-block",
  marginLeft: 16,
  verticalAlign: "top",
  cursor: "pointer",
  color: "sienna",
};
const cellStyle = { width: "50vw" };
const editStyle = {
  cursor: "pointer",
  fontSize: "0.75rem",
  paddingLeft: "16px",
};

const Hold = ({ hold, styleColourId, styleColourPage }) => {
  const [editMode, setEditMode] = useState(false);

  const deleteHoldMutation = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleUpdateHoldComplete = () => {
    setEditMode(false);
  };

  return editMode ? (
    <UpdateHold
      hold={hold}
      colourStyleId={styleColourId}
      refetchQueries={[
        {
          query: QueryGetStyleColour,
          variables: { id: styleColourId },
        },
      ]}
      onComplete={handleUpdateHoldComplete}
    />
  ) : (
    <Table key={hold.id}>
      <tbody>
        <tr>
          <td style={cellStyle}>
            Length
            <OverlayTrigger
              rootClose
              trigger="click"
              placement="bottom"
              overlay={
                <Dimensions
                  weight={styleColourPage.styleColour.style.weight}
                  thickness={styleColourPage.styleColour.style.thickness}
                  length={hold.length}
                />
              }
            >
              <span style={{ position: "relative" }}> ⓘ</span>
            </OverlayTrigger>
          </td>
          <td style={cellStyle}>
            {humanize(hold.length)} yard
            {hold.length === 1 ? "" : "s"}
            <span
              role="img"
              aria-label="Edit"
              onClick={handleEditClick}
              style={editStyle}
            >
              ✏️
            </span>
            <Mutation
              mutation={MutationDeleteHold}
              refetchQueries={[
                {
                  query: QueryGetStyleColour,
                  variables: { id: styleColourId },
                },
              ]}
            >
              {(deleteHold, { loading, error }) => (
                <span
                  onClick={deleteHoldMutation(deleteHold, hold.id)}
                  style={deleteStyle}
                >
                  ⊗
                </span>
              )}
            </Mutation>
          </td>
        </tr>
        {hold.owner && (
          <tr>
            <td style={cellStyle}>Owner</td>
            <td style={cellStyle}>{hold.owner}</td>
          </tr>
        )}
        {hold.notes && (
          <tr>
            <td style={cellStyle}>Notes</td>
            <td style={cellStyle}>{hold.notes}</td>
          </tr>
        )}
        {hold.orderId && (
          <tr>
            <td style={cellStyle}>Order Id</td>
            <td style={cellStyle}>{hold.orderId}</td>
          </tr>
        )}
        {hold.timestamp && (
          <tr>
            <td style={cellStyle}>Date requested</td>
            <td style={cellStyle}>
              {moment(hold.timestamp).format("MMMM Do, YYYY")}
            </td>
          </tr>
        )}
        {hold.expires && (
          <tr>
            <td style={cellStyle}>Expires</td>
            <td style={cellStyle}>
              {moment(hold.expires).format("MMMM Do, YYYY")}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Hold;
