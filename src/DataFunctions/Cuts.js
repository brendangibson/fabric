const reasons = [
    ['shopifyOrder', 'Shopify Order'],
    ['otherOrder', 'Other Order'],
    ['defect', 'Defect'],
    ['waste', 'Waste'],
    ['personal', 'Personal'],
    ['product', 'Product'],
    ['reconciliation', 'Reconciliation']
]

const getReasonName = (reasonId) => {
    return reasons.find((reason) => {
        return reasonId === reason[0]
    })[1]
}

export { reasons, getReasonName }