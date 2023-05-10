export const calculateRemaining = (roll) =>
	roll.originalLength
		? roll.originalLength -
		  roll.cuts.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0)
		: 0;
//# sourceMappingURL=rolls.js.map
