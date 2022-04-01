import React, { Component } from "react";
import { Mutation } from "react-apollo";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FormError from "./FormError";
import Loading from "./Loading";
import MutationCreateStandby from "../GraphQL/MutationCreateStandby";

class AddStandby extends Component {
  state = {
    length: 0,
    inches: 0,
    errors: {},
  };

  onChange = (index) => {
    return ({ target: { value } }) => {
      this.setState({ [index]: value });
      this.setErrors(index, value);
    };
  };

  addStandby = (mutator) => {
    return () => {
      const { length, inches } = this.state;
      const { colourStyleId } = this.props;

      const totalLength = parseInt(length, 10) + parseInt(inches, 10) / 36;
      mutator({
        variables: {
          colourStyleId,
          length: totalLength,
        },
        optimisticResponse: {
          __typename: "Mutation",
          createStandby: {
            __typename: "ColourStyle",
            id: "12345",
            colourStyleId,
            length: totalLength,
          },
        },
      });
      this.setState({
        length: 0,
        inches: 0,
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
        mutation={MutationCreateStandby}
        refetchQueries={this.props.refetchQueries}
      >
        {(addStandby, { loading, error }) => (
          <div>
            <h1>Add Fabric on Standby</h1>
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

            <Button
              disabled={loading || this.isDisabled()}
              variant="dark"
              size="lg"
              onClick={this.addStandby(addStandby)}
            >
              Add Standby
            </Button>
          </div>
        )}
      </Mutation>
    );
  }
}

export default AddStandby;
