import React, { useState, useContext } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationCreateHold from "../GraphQL/MutationCreateHold";
import { UsernameContext } from "../WebApp";
import moment from "moment";
import AccessControl from "./AccessControl";

const closeButtonStyle = {
  position: "absolute",
  right: "1vw",
  top: "1vw",
  border: "none",
  background: "transparent",
};

const AddHold = ({
  colourStyleId,
  refetchQueries,
  onComplete = () => {},
  onClose,
}) => {
  const username = useContext(UsernameContext);

  const [length, setLength] = useState(0);
  const [notes, setNotes] = useState(null);
  const [owner, setOwner] = useState(username);
  const [expires, setExpires] = useState(
    moment().add(2, "weeks").format("YYYY-MM-DD")
  );
  const [errors, setErrors] = useState({});

  const onChange = (index) => {
    return ({ target: { value } }) => {
      switch (index) {
        case "length":
          setLength(value);
          break;
        case "notes":
          setNotes(value);
          break;
        case "owner":
          setOwner(value);
          break;
        case "expires":
          setExpires(value);
          break;
        default:
      }
      checkErrors(index, value);
    };
  };

  const submit = (mutator) => {
    return () => {
      const totalLength = parseInt(length, 10);
      mutator({
        variables: {
          colourStyleId,
          length: totalLength,
          notes,
          owner,
          expires: moment(expires).utc().format(),
        },
        optimisticResponse: {
          __typename: "Mutation",
          createHold: {
            __typename: "ColourStyle",
            id: "12345",
            colourStyleId,
            length: totalLength,
            notes,
            owner,
            expires,
          },
        },
      });
      onComplete();
    };
  };

  const checkErrors = (index, value) => {
    switch (index) {
      case "length":
        if (isNaN(value)) {
          errors[index] = "Enter the number of yards";
        } else {
          if (value <= 0) {
            errors[index] = "Too short";
          } else {
            errors[index] = null;
          }
        }
        break;
      default:
    }
    setErrors(errors);
  };

  const isDisabled =
    !length ||
    Object.keys(errors).some((error) => {
      return errors[error] !== null;
    });

  const selectAll = (e) => {
    const el = e.target;
    el.select();
  };

  return (
    <Mutation mutation={MutationCreateHold} refetchQueries={refetchQueries}>
      {(addHold, { loading, error }) => (
        <div>
          {onClose ? (
            <button onClick={onClose} style={closeButtonStyle}>
              X
            </button>
          ) : null}
          <h1>Add Hold</h1>
          {loading && <Loading />}
          {error && <p>Error :( Please try again</p>}
          <Form.Group>
            <Form.Label>Length</Form.Label>
            <Form.Row>
              <Col>
                <Form.Control
                  onClick={selectAll}
                  value={length}
                  type="number"
                  id="length"
                  name="length"
                  onChange={onChange("length")}
                  placeholder="yards"
                />
              </Col>
              <Col style={{ lineHeight: "calc(2.25rem + 2px)" }}>yards</Col>
            </Form.Row>
            <FormError errorMsg={errors.length} />
          </Form.Group>

          <AccessControl>
            <Form.Group>
              <Form.Label>Owner</Form.Label>
              <Form.Control
                value={owner || username}
                type="textarea"
                id="owner"
                name="owner"
                onChange={onChange("owner")}
                placeholder="Owner"
              />
            </Form.Group>
          </AccessControl>

          <Form.Group>
            <Form.Label>Expires</Form.Label>
            <Form.Control
              type="date"
              id="expires"
              name="expires"
              onChange={onChange("expires")}
              value={expires || ""}
            />
            <FormError errorMsg={errors.expires} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Sidemark</Form.Label>
            <Form.Control
              value={notes || ""}
              type="textarea"
              id="notes"
              name="notes"
              onChange={onChange("notes")}
            />
          </Form.Group>
          <Button
            disabled={loading || isDisabled}
            variant="dark"
            size="lg"
            onClick={submit(addHold)}
          >
            Add Hold
          </Button>
        </div>
      )}
    </Mutation>
  );
};

export default AddHold;
