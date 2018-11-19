import React, { Component } from "react"
import {Mutation} from 'react-apollo'
import Form from 'react-bootstrap/lib/Form'
import Button from 'react-bootstrap/lib/Button'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import Dropdown from 'react-bootstrap/lib/Dropdown'

import Loading from './Loading'
import MutationCreateCut from "../GraphQL/MutationCreateCut"

const reasons = [
    ['shopifyOrder', 'Shopify Order'],
    ['otherOrder', 'Other Order'],
    ['defect', 'Defect'],
    ['waste', 'Waste'],
    ['personal', 'Personal'],
    ['product', 'Product'], 
    ['reconciliation', 'Reconciliation']
]

class AddCut extends Component {

    state = {
        length: 0,
        reason: reasons[0][0],
        notes: null,
        orderId: null
    }

    onChange = (index) => {

        return ({ target: { value } }) => {
            this.setState({ [index]: value });
        }
    }

    addCut = (mutator) => {
        return () => {
            const { length, reason, notes, orderId } = this.state
            const {rollId} = this.props
            mutator({ variables: { rollId, length, reason, notes, orderId } })
        }
    }

    getCurrentReasonName = () => {
        return reasons.find((reason) => {
            return this.state.reason === reason[0]
        })[1]
    }

    render() {

        return (
            <Mutation mutation={MutationCreateCut} refetchQueries={this.props.refetchQueries}>
                {(addCut, {loading, error}) => (
                    <div>
                        <Form.Group>
                            <Form.Label>Length</Form.Label>
                            <Form.Control type="text" id='length' name='length' onChange={this.onChange('length')} placeholder="Length in yards" />
                        </Form.Group>
                       
                        <Form.Group>
                            <Form.Label>Reason</Form.Label>
                            <DropdownButton id="dropdown-basic-button" title={this.getCurrentReasonName()}>
                                {reasons.map((reason) =>
                                    <Dropdown.Item as="button" onClick={this.onChange('reason')} value={reason[0]} key={reason[0]}>{reason[1]}</Dropdown.Item>
                                )}
                            </DropdownButton>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Order Id</Form.Label>
                            <Form.Control type="text" id='orderId' name='orderId' onChange={this.onChange('orderId')} placeholder="Shopify order id" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control type="textarea" id='notes' name='notes' onChange={this.onChange('notes')} placeholder="Notes" />
                        </Form.Group>
                        <Button variant="primary" size="lg" onClick={this.addCut(addCut)}>Add Cut</Button>
                        {loading && <Loading />}
                        {error && <p>Error :( Please try again</p>}
                    </div>)}
            </Mutation>)
    }
}

export default AddCut