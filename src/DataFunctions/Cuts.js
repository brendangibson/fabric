const reasons = [
  ["shopifyOrder", "Shopify Order"],
  ["otherOrder", "Other Order"],
  ["showroom", "Showroom"],
  ["interior", "Interior Designer"],
  ["defect", "Defect"],
  ["waste", "Waste"],
  ["personal", "Personal"],
  ["product", "Product"],
  ["reconciliation", "Reconciliation"],
  ["samples", "Samples"],
];

const getReasonName = (reasonId) => {
  const found = reasons.find((reason) => {
    return reasonId === reason[0];
  });

  return found && found[1];
};

const humanize = (x) => x.toFixed(2).replace(/\.?0*$/, "");

export { reasons, getReasonName, humanize };
