import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";

import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationCreateCut from "../GraphQL/MutationCreateCut";
import { reasons } from "../DataFunctions/Cuts";

class AddCut extends Component {
  state = {
    length: 0,
    inches: 0,
    reason: reasons[0][0],
    notes: null,
    orderId: null,
    errors: {},
  };

  onChange = (index) => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  addCut = (mutator) => {
    return () => {
      const { length, inches, reason, notes, orderId } = this.state;
      const { rollId } = this.props;

      const totalLength = parseFloat(length) + parseInt(inches, 10) / 36;
      mutator({
        variables: { rollId, length: totalLength, reason, notes, orderId },
        optimisticResponse: {
          __typename: "Mutation",
          createCut: {
            __typename: "Roll",
            id: "12345",
            rollId: rollId,
            length: totalLength,
            reason: reason,
            notes: notes,
            orderId: orderId,
          },
        },
      });
      this.setState({
        length: 0,
        inches: 0,
        reason: reasons[0][0],
        notes: null,
        orderId: null,
        errors: {},
      });
    };
  };

  getCurrentReasonName = () => {
    return reasons.find((reason) => {
      return this.state.reason === reason[0];
    })[1];
  };

  setErrors = (index, value) => {
    let { errors } = this.state;
    const { remaining } = this.props;
    switch (index) {
      case "length":
        if (isNaN(value)) {
          errors[index] = "Enter the number of yards";
        } else {
          if (value <= 0) {
            errors[index] = "Too short";
          } else {
            if (value > 100 || value > remaining + 0.1) {
              errors[index] = "Too long";
            } else {
              errors[index] = null;
            }
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
        mutation={MutationCreateCut}
        refetchQueries={this.props.refetchQueries}
      >
        {(addCut, { loading, error }) => (
          <div>
            <h1>Add Cut</h1>
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
                <Col>
                  <Form.Control
                    onClick={this.selectAll}
                    value={this.state.inches}
                    type="number"
                    id="inches"
                    name="inches"
                    onChange={this.onChange("inches")}
                    placeholder="inches"
                  />
                </Col>
                <Col style={{ lineHeight: "calc(2.25rem + 2px)" }}>inches</Col>
              </Form.Row>
              <FormError errorMsg={errors.length} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <DropdownButton
                variant="dark"
                id="dropdown-basic-button"
                title={this.getCurrentReasonName()}
              >
                {reasons.map((reason) => (
                  <Dropdown.Item
                    as="button"
                    onClick={this.onChange("reason")}
                    value={reason[0]}
                    key={reason[0]}
                  >
                    {reason[1]}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Form.Group>
            <Form.Group>
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
            </Form.Group>
            <Button
              disabled={loading || this.isDisabled()}
              variant="dark"
              size="lg"
              onClick={this.addCut(addCut)}
            >
              Add Cut
            </Button>
          </div>
        )}
      </Mutation>
    );
  }
}

export default AddCut;
