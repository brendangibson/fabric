import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import FormError from "./FormError";
import Button from "react-bootstrap/Button";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Loading from "./Loading";
import MutationCreateRoll from "../GraphQL/MutationCreateRoll";

const getShipmentName = shipment =>
  shipment.name || shipment.dateReceived || shipment.dateSent;

class AddRoll extends Component {
  state = {
    originalLength: 0,
    glenRavenId: null,
    notes: null,
    shipmentId: this.props.shipments[0].id,
    errors: {}
  };

  onChange = index => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  setErrors = (index, value) => {
    let { errors } = this.state;
    switch (index) {
      case "originalLength":
        if (isNaN(value)) {
          errors[index] = "Enter the number of yards";
        } else {
          if (value <= 0) {
            errors[index] = "Too short";
          } else {
            if (value > 100) {
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

  addRoll = mutator => {
    return () => {
      const { glenRavenId, originalLength, notes, shipmentId } = this.state;
      const { styleColourId } = this.props;
      mutator({
        variables: {
          colourStyleId: styleColourId,
          glenRavenId: glenRavenId,
          originalLength: originalLength,
          notes: notes,
          shipmentId: shipmentId
        },
        optimisticResponse: {
          __typename: "Mutation",
          createRoll: {
            __typename: "Roll",
            id: "12345",
            colourStyleId: styleColourId,
            glenRavenId: glenRavenId,
            originalLength: originalLength,
            notes: notes,
            shipmentId: shipmentId
          }
        }
      });
      this.setState({
        originalLength: 0,
        glenRavenId: null,
        notes: null,
        shipmentId: this.props.shipments[0].id,
        errors: {},
        realMutationLoading: false
      });
    };
  };

  getCurrentShipment = () =>
    this.props.shipments.find(shipment => {
      return shipment.id === this.state.shipmentId;
    });

  hasErrors = () => {
    return Object.keys(this.state.errors).some(error => {
      return this.state.errors[error] !== null;
    });
  };

  render() {
    const { shipments, refetchQueries } = this.props;
    const { errors } = this.state;

    return (
      <Mutation mutation={MutationCreateRoll} refetchQueries={refetchQueries}>
        {(addRoll, { loading, error }) => {
          return (
            <div>
              <h1>Add Roll</h1>
              {error && <p>Error :( Please try again</p>}
              {loading ? (
                <Loading />
              ) : (
                <div>
                  <Form.Group>
                    <Form.Label>Length</Form.Label>
                    <Form.Control
                      type="number"
                      id="originalLength"
                      name="originalLength"
                      onChange={this.onChange("originalLength")}
                      placeholder="Length in yards"
                      value={this.state.originalLength || ""}
                    />
                    <FormError errorMsg={errors.originalLength} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Glen Raven Id</Form.Label>
                    <Form.Control
                      type="number"
                      id="glenRavenId"
                      name="glenRavenId"
                      onChange={this.onChange("glenRavenId")}
                      placeholder="From sticker on bag"
                      value={this.state.glenRavenId || ""}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Shipment</Form.Label>
                    <DropdownButton
                      variant="dark"
                      id="dropdown-basic-button"
                      title={getShipmentName(this.getCurrentShipment())}
                    >
                      {shipments.map(shipment => (
                        <Dropdown.Item
                          as="button"
                          href="#"
                          onClick={this.onChange("shipmentId")}
                          value={shipment.id}
                          key={shipment.id}
                        >
                          {getShipmentName(shipment)}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      type="textarea"
                      id="notes"
                      name="notes"
                      onChange={this.onChange("notes")}
                      placeholder="Notes"
                      value={this.state.notes || ""}
                    />
                  </Form.Group>
                  <Button
                    disabled={this.hasErrors()}
                    variant="dark"
                    size="lg"
                    onClick={this.addRoll(addRoll)}
                  >
                    Add Roll
                  </Button>
                </div>
              )}
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default AddRoll;
