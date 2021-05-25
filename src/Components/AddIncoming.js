import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationCreateIncoming from "../GraphQL/MutationCreateIncoming";

class AddIncoming extends Component {
  state = {
    length: 0,
    inches: 0,
    notes: null,
    orderId: null,
    errors: {},
    expected: "",
  };

  onChange = (index) => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  addIncoming = (mutator) => {
    return () => {
      const { length, inches, notes, orderId, expected } = this.state;
      const { colourStyleId } = this.props;

      const totalLength = parseInt(length, 10) + parseInt(inches, 10) / 36;
      mutator({
        variables: {
          colourStyleId,
          length: totalLength,
          notes,
          orderId,
          expected,
        },
        optimisticResponse: {
          __typename: "Mutation",
          createIncoming: {
            __typename: "ColourStyle",
            id: "12345",
            colourStyleId,
            length: totalLength,
            notes,
            orderId,
            expected,
          },
        },
      });
      this.setState({
        length: 0,
        inches: 0,
        notes: null,
        orderId: null,
        errors: {},
      });
    };
  };

  setErrors = (index, value) => {
    let { errors } = this.state;
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
    this.setState({ errors });
  };

  isDisabled = () => {
    const { errors, length, inches } = this.state;

    return (
      !(length + inches) ||
      Object.keys(errors).some((error) => {
        return errors[error] !== null;
      })
    );
  };

  selectAll = (e) => {
    const el = e.target;
    el.select();
  };

  render() {
    const { errors } = this.state;

    return (
      <Mutation
        mutation={MutationCreateIncoming}
        refetchQueries={this.props.refetchQueries}
      >
        {(addIncoming, { loading, error }) => (
          <div>
            <h1>Add Incoming Fabric</h1>
            {loading && <Loading />}
            {error && <p>Error :( Please try again</p>}
            <Form.Group>
              <Form.Label>Length</Form.Label>
              <Form.Row>
                <Col>
                  <Form.Control
                    onClick={this.selectAll}
                    value={this.state.length}
                    type="number"
                    id="length"
                    name="length"
                    onChange={this.onChange("length")}
                    placeholder="yards"
                  />
                </Col>
                <Col style={{ lineHeight: "calc(2.25rem + 2px)" }}>yards</Col>
              </Form.Row>
              <FormError errorMsg={errors.length} />
            </Form.Group>

            {/* <Form.Group>
              <Form.Label>Order Id</Form.Label>
              <Form.Control
                value={this.state.orderId || ""}
                type="text"
                id="orderId"
                name="orderId"
                onChange={this.onChange("orderId")}
                placeholder="Shopify order id"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                value={this.state.notes || ""}
                type="textarea"
                id="notes"
                name="notes"
                onChange={this.onChange("notes")}
                placeholder="Notes"
              />
            </Form.Group> */}
            <Form.Group>
              <Form.Label>Expected</Form.Label>
              <Form.Control
                type="date"
                id="expected"
                name="expected"
                onChange={this.onChange("expected")}
                value={this.state.expected || ""}
              />
              <FormError errorMsg={errors.expected} />
            </Form.Group>
            <Button
              disabled={loading || this.isDisabled()}
              variant="dark"
              size="lg"
              onClick={this.addIncoming(addIncoming)}
            >
              Add Incoming
            </Button>
          </div>
        )}
      </Mutation>
    );
  }
}

export default AddIncoming;
