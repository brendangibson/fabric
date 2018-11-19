import React, { Component } from "react";
import {Mutation} from 'react-apollo'
import Form from 'react-bootstrap/lib/Form';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Dropdown from 'react-bootstrap/lib/Dropdown';

import MutationCreateRoll from "../GraphQL/MutationCreateRoll";

const getShipmentName = (shipment) => (
    shipment.name || shipment.dateReceived || shipment.dateSent
)

class AddRoll extends Component {

    state = {
        originalLength: 0,
        glenRavenId: null,
        notes: null,
        shipmentId: this.props.shipments[0].id
    }

    onChange = (index) => {
        return ({ target: { value } }) => {
            this.setState({ [index]: value });
        }
    }

    addRoll = (mutator) => {
        return () => {
            const { glenRavenId, originalLength, notes, shipmentId } = this.state
            const { styleColourId } = this.props
            mutator({ variables: { colourStyleId: styleColourId, glenRavenId: glenRavenId, originalLength: originalLength, notes: notes, shipmentId: shipmentId } })
        }
    }

    getCurrentShipment = () => (
        this.props.shipments.find((shipment) => {
            return shipment.id === this.state.shipmentId
        })
    )

    render() {

        const {shipments, refetchQueries} = this.props

        console.log('refetchQueries: ', refetchQueries)

        return (
            <Mutation mutation={MutationCreateRoll} refetchQueries={refetchQueries}>
                {(addRoll, {loading, error}) => (
                    <div>
                        <Form.Group>
                            <Form.Label>Length</Form.Label>
                            <Form.Control type="text" id='originalLength' name='originalLength' onChange={this.onChange('originalLength')} placeholder="Length in yards" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Glen Raven Id</Form.Label>
                            <Form.Control type="text" id='glenRavenId' name='glenRavenId' onChange={this.onChange('glenRavenId')} placeholder="From sticker on bag" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Shipment</Form.Label>
                            <DropdownButton id="dropdown-basic-button" title={getShipmentName(this.getCurrentShipment())}>
                                {shipments.map((shipment) =>
                                    <Dropdown.Item as="button" href="#" onClick={this.onChange('shipmentId')} value={shipment.id} key={shipment.id}>{getShipmentName(shipment)}</Dropdown.Item>
                                )}
                            </DropdownButton>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control type="textarea" id='notes' name='notes' onChange={this.onChange('notes')} placeholder="Notes" />
                        </Form.Group>
                        <Button variant="primary" size="lg" onClick={this.addRoll(addRoll)}>Add Roll</Button>
                        {loading && <p>Loading...</p>}
                {error && <p>Error :( Please try again</p>}
                    </div>)}
            </Mutation>)
    }
}

export default AddRoll