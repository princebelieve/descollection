function shippingMethodsForZone(zone = {}) {
  const methods = Array.isArray(zone.methods) ? zone.methods.filter((method) => method && method.id && method.name) : [];
  if (methods.length) return methods;
  return [{
    id: "standard",
    name: "Standard delivery",
    fee: Number(zone.fee || 0),
    deliveryEstimate: zone.deliveryEstimate || "",
  }];
}

module.exports = { shippingMethodsForZone };
