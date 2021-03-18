export const calculateRemaining = (roll) =>
  roll.originalLength -
  roll.cuts.reduce(
    (accumulator, currentValue) => accumulator + currentValue.length,
    0
  );
