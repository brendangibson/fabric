import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import FormError from "./FormError";
import Button from "react-bootstrap/Button";
import Loading from "./Loading";
import MutationCreateShipment from "../GraphQL/MutationCreateShipment";

class AddShipment extends Component {
  state = {
    name: new Date(),
    dateSent: new Date(),
    dateReceived: new Date(),
    glenRavenId: "",
    errors: {},
  };

  onChange = (index) => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  setErrors = (index, value) => {
    let { errors } = this.state;
    switch (index) {
      case "name":
        if (value === "") {
          errors[index] = "Enter a memorable name";
        } else {
          errors[index] = null;
        }
        break;
      default:
    }
    this.setState({ errors });
  };

  addShipment = (mutator) => {
    return () => {
      const { name, dateSent, dateReceived, glenRavenId } = this.state;
      mutator({
        variables: {
          name: name,
          dateSent: dateSent,
          dateReceived: dateReceived,
          glenRavenId: glenRavenId,
        },
        optimisticResponse: {
          __typename: "Mutation",
          createShipment: {
            __typename: "Shipment",
            id: "12345",
            name: name,
            dateSent: dateSent,
            dateReceived: dateReceived,
            glenRavenId: glenRavenId,
          },
        },
      });
      this.setState({
        name: new Date(),
        dateSent: new Date(),
        dateReceived: new Date(),
        glenRavenId: glenRavenId,
      });
    };
  };

  hasErrors = () => {
    return Object.keys(this.state.errors).some((error) => {
      return this.state.errors[error] !== null;
    });
  };

  render() {
    const { refetchQueries } = this.props;
    const { errors } = this.state;

    return (
      <Mutation
        mutation={MutationCreateShipment}
        refetchQueries={refetchQueries}
      >
        {(addShipment, { loading, error }) => {
          return (
            <div>
              <h1>Add Shipment</h1>
              {error && <p>Error :( Please try again</p>}
              {loading ? (
                <Loading />
              ) : (
                <div>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      id="name"
                      name="name"
                      onChange={this.onChange("name")}
                      placeholder="Memorable name"
                      value={this.state.name || ""}
                    />
                    <FormError errorMsg={errors.name} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Date Sent</Form.Label>
                    <Form.Control
                      type="date"
                      id="dateSent"
                      name="dateSent"
                      onChange={this.onChange("dateSent")}
                      value={this.state.dateSent || ""}
                    />
                    <FormError errorMsg={errors.dateSent} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Date Received</Form.Label>
                    <Form.Control
                      type="date"
                      id="dateReceived"
                      name="dateReceived"
                      onChange={this.onChange("dateReceived")}
                      value={this.state.dateReceived || ""}
                    />
                    <FormError errorMsg={errors.dateReceived} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Glen Raven Id</Form.Label>
                    <Form.Control
                      type="number"
                      id="glenRavenId"
                      name="glenRavenId"
                      onChange={this.onChange("glenRavenId")}
                      placeholder="From packing slip"
                      value={this.state.glenRavenId || ""}
                    />
                  </Form.Group>
                  <Button
                    disabled={this.hasErrors()}
                    variant="dark"
                    size="lg"
                    onClick={this.addShipment(addShipment)}
                  >
                    Add Shipment
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

export default AddShipment;
