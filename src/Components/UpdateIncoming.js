import React, { useState } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationUpdateIncoming from "../GraphQL/MutationUpdateIncoming";
import moment from "moment";

const UpdateIncoming = ({
  incoming,
  colourStyleId,
  refetchQueries,
  onComplete,
}) => {
  const [length, setLength] = useState(incoming.length);
  const [expected, setExpected] = useState(
    moment(incoming.expected).format("YYYY-MM-DD")
  );
  const [errors, setErrors] = useState({});

  const onChange = (index) => {
    return ({ target: { value } }) => {
      switch (index) {
        case "length":
          setLength(value);
          break;
        case "expected":
          setExpected(value);
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
          id: incoming.id,
          length: totalLength,
          expected: moment(expected).utc().format(),
        },
        optimisticResponse: {
          __typename: "Mutation",
          updateIncoming: {
            __typename: "ColourStyle",
            id: "12345",
            colourStyleId,
            length: totalLength,
            expected,
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
    <Mutation mutation={MutationUpdateIncoming} refetchQueries={refetchQueries}>
      {(updateIncoming, { loading, error }) => (
        <div>
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

          <Form.Group>
            <Form.Label>Expected</Form.Label>
            <Form.Control
              type="date"
              id="expected"
              name="expected"
              onChange={onChange("expected")}
              value={expected || ""}
            />
            <FormError errorMsg={errors.expected} />
          </Form.Group>

          <Button
            disabled={loading || isDisabled}
            variant="dark"
            size="lg"
            onClick={submit(updateIncoming)}
          >
            Update Incoming
          </Button>
        </div>
      )}
    </Mutation>
  );
};

export default UpdateIncoming;
