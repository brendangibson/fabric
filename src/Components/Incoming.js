import React, { useState } from "react";
import MutationDeleteIncoming from "../GraphQL/MutationDeleteIncoming";
import Table from "react-bootstrap/Table";
import { Mutation } from "react-apollo";
import { humanize } from "../DataFunctions/Cuts";
import moment from "moment";
import UpdateIncoming from "./UpdateIncoming";

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

const Incoming = ({ incoming, styleColourId, refetchQueries }) => {
  const [editMode, setEditMode] = useState(false);

  const deleteIncomingMutation = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleUpdateIncomingComplete = () => {
    setEditMode(false);
  };

  return editMode ? (
    <UpdateIncoming
      incoming={incoming}
      colourStyleId={styleColourId}
      refetchQueries={refetchQueries}
      onComplete={handleUpdateIncomingComplete}
    />
  ) : (
    <Table key={incoming.id}>
      <tbody>
        <tr>
          <td style={cellStyle}>Length</td>
          <td style={cellStyle}>
            {humanize(incoming.length)} yard
            {incoming.length === 1 ? "" : "s"}
            <span
              role="img"
              aria-label="Edit"
              onClick={handleEditClick}
              style={editStyle}
            >
              ✏️
            </span>
            <Mutation
              mutation={MutationDeleteIncoming}
              refetchQueries={refetchQueries}
            >
              {(deleteIncoming, { loading, error }) => (
                <span
                  onClick={deleteIncomingMutation(deleteIncoming, incoming.id)}
                  style={deleteStyle}
                >
                  ⊗
                </span>
              )}
            </Mutation>
          </td>
        </tr>
        {incoming.notes && (
          <tr>
            <td style={cellStyle}>Notes</td>
            <td style={cellStyle}>{incoming.notes}</td>
          </tr>
        )}
        {incoming.orderId && (
          <tr>
            <td style={cellStyle}>Order Id</td>
            <td style={cellStyle}>{incoming.orderId}</td>
          </tr>
        )}
        {incoming.expected && (
          <tr>
            <td style={cellStyle}>Date expected</td>
            <td style={cellStyle}>
              {moment(incoming.expected).format("MMMM Do, YYYY")}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default Incoming;
