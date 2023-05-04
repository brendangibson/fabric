<script lang="ts">
	import React, { useState } from 'react';
	import { Mutation } from 'react-apollo';
	import Form from 'react-bootstrap/Form';
	import Button from 'react-bootstrap/Button';
	import Col from 'react-bootstrap/Col';
	import FormError from './FormError';
	import Loading from './Loading';
	import MutationUpdateIncoming from '../GraphQL/MutationUpdateIncoming';
	import moment from 'moment';
	import type { TIncoming } from '../fabric';
	import { format } from 'date-fns';

	export let incoming: TIncoming;
	export let colourStyleId: string;
	export let onComplete: () => {};

	let length = incoming.length;
	let expected = format(new Date(incoming.expected), 'yyyy-MM-dd');
	let errors: Record<string, string> = {};

	$: checkErrors('length', length);
	$: checkErrors('expected', expected);

	const checkErrors = (index: string, value: string | number) => {
		switch (index) {
			case 'length':
				if (isNaN(value)) {
					errors[index] = 'Enter the number of yards';
				} else {
					if (value <= 0) {
						errors[index] = 'Too short';
					} else {
						errors[index] = null;
					}
				}
				break;
			default:
		}
	};

	const isDisabled =
		!length ||
		Object.keys(errors).some((error) => {
			return errors[error] !== null;
		});

	const selectAll = (e: HTMLInputElement) => {
		const el = e.target;
		el.select();
	};
</script>

<form>
	<div>
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
						onChange={onChange('length')}
						placeholder="yards"
					/>
				</Col>
				<Col style={{ lineHeight: 'calc(2.25rem + 2px)' }}>yards</Col>
			</Form.Row>
			<FormError errorMsg={errors.length} />
		</Form.Group>

		<Form.Group>
			<Form.Label>Expected</Form.Label>
			<Form.Control
				type="date"
				id="expected"
				name="expected"
				onChange={onChange('expected')}
				value={expected || ''}
			/>
			<FormError errorMsg={errors.expected} />
		</Form.Group>

		<Button disabled={loading || isDisabled} variant="dark" size="lg">Update Incoming</Button>
	</div>
</form>

<style>
</style>
