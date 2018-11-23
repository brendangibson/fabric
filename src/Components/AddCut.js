import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/lib/Form";
import Button from "react-bootstrap/lib/Button";
import DropdownButton from "react-bootstrap/lib/DropdownButton";
import Dropdown from "react-bootstrap/lib/Dropdown";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationCreateCut from "../GraphQL/MutationCreateCut";
import { reasons } from "../DataFunctions/Cuts";

class AddCut extends Component {
  state = {
    length: 0,
    reason: reasons[0][0],
    notes: null,
    orderId: null,
    errors: {}
  };

  onChange = index => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  addCut = mutator => {
    return () => {
      const { length, reason, notes, orderId } = this.state;
      const { rollId } = this.props;
      mutator({
        variables: { rollId, length, reason, notes, orderId },
        optimisticResponse: {
          __typename: "Mutation",
          createCut: {
            __typename: "Roll",
            id: "12345",
            rollId: rollId,
            length: length,
            reason: reason,
            notes: notes,
            orderId: orderId
          }
        }
      });
      this.setState({
        length: 0,
        reason: reasons[0][0],
        notes: null,
        orderId: null,
        errors: {}
      });
    };
  };

  getCurrentReasonName = () => {
    return reasons.find(reason => {
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
            if (value > 100 || value > remaining) {
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
    const { errors, length } = this.state;

    return (
      !length ||
      Object.keys(errors).some(error => {
        return errors[error] !== null;
      })
    );
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
              <Form.Control
                value={this.state.length || ""}
                type="number"
                id="length"
                name="length"
                onChange={this.onChange("length")}
                placeholder="Length in yards"
              />
              <FormError errorMsg={errors.length} />
            </Form.Group>

            <Form.Group>
              <Form.Label>Reason</Form.Label>
              <DropdownButton
                variant="dark"
                id="dropdown-basic-button"
                title={this.getCurrentReasonName()}
              >
                {reasons.map(reason => (
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
