import React, { useState } from "react";
import MutationDeleteStandby from "../GraphQL/MutationDeleteStandby";
import Table from "react-bootstrap/Table";
import { Mutation } from "react-apollo";
import { humanize } from "../DataFunctions/Cuts";
import UpdateStandby from "./UpdateStandby";

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

const Standby = ({ standby, styleColourId, refetchQueries }) => {
  const [editMode, setEditMode] = useState(false);

  const deleteStandbyMutation = (mutator, id) => {
    return () => {
      mutator({
        variables: { id },
      });
    };
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleUpdateStandbyComplete = () => {
    setEditMode(false);
  };

  return editMode ? (
    <UpdateStandby
      standby={standby}
      colourStyleId={styleColourId}
      refetchQueries={refetchQueries}
      onComplete={handleUpdateStandbyComplete}
    />
  ) : (
    <Table key={standby.id}>
      <tbody>
        <tr>
          <td style={cellStyle}>Length</td>
          <td style={cellStyle}>
            {humanize(standby.length)} yard
            {standby.length === 1 ? "" : "s"}
            <span
              role="img"
              aria-label="Edit"
              onClick={handleEditClick}
              style={editStyle}
            >
              ✏️
            </span>
            <Mutation
              mutation={MutationDeleteStandby}
              refetchQueries={refetchQueries}
            >
              {(deleteStandby, { loading, error }) => (
                <span
                  onClick={deleteStandbyMutation(deleteStandby, standby.id)}
                  style={deleteStyle}
                >
                  ⊗
                </span>
              )}
            </Mutation>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default Standby;
