import type { TRoll } from '../fabric';

export const calculateRemaining = (roll: TRoll) =>
	roll.originalLength
		? roll.originalLength -
			roll.cuts.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0)
		: 0;
