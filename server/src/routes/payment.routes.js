//server/src/routes/payment.routes.js
const express = require("express");
const stripe = require("../services/stripe");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");

const router = express.Router();

// The result page uses this to verify the payment directly with Stripe before
// it tells the customer that an order was paid.
router.get("/session-status/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ message: "Invalid checkout session" });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
    const intent = session.payment_intent && typeof session.payment_intent === "object" ? session.payment_intent : null;
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    const status = paid
      ? "paid"
      : intent?.status === "requires_payment_method" || session.status === "expired"
        ? "failed"
        : session.status === "open"
          ? "open"
          : "pending";
    const customer = session.customer_details || {};
    const shipping = session.shipping_details || {};
    const address = shipping.address || customer.address || {};
    let items = [];
    if (paid) {
      const stripeItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
      items = stripeItems.data.map((item) => ({
        name: item.description || "Item",
        quantity: item.quantity || 1,
        amount: Number(item.amount_total || 0) / 100,
      }));
    }
    res.set("Cache-Control", "no-store");
    return res.json({
      status,
      sessionId: session.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerName: shipping.name || customer.name || "",
      customerEmail: customer.email || session.customer_email || "",
      customerPhone: customer.phone || "",
      shippingAddress: {
        line1: address.line1 || "",
        line2: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postal_code || "",
        country: address.country || "",
      },
      items,
    });
  } catch (error) {
    return res.status(error.statusCode === 404 ? 404 : 502).json({ message: "We could not verify this payment with Stripe." });
  }
});

// Cart checkout: prices are always read from MongoDB on the server.
router.post("/create-cart-session", async (req, res) => {
  try {
    const { items, customer, uiMode, shippingCountry } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }
    const customerEmail = String(customer?.email || "").trim();

    const normalized = items.map(({ id, qty }) => ({
      id: String(id || ""),
      qty: Math.min(20, Math.max(1, Math.floor(Number(qty) || 1))),
    }));
    if (normalized.some((item) => !/^[a-f\d]{24}$/i.test(item.id))) {
      return res.status(400).json({ message: "One or more cart items are not available for online checkout yet" });
    }

    const products = await Product.find({ _id: { $in: normalized.map((item) => item.id) } });
    if (products.length !== normalized.length) {
      return res.status(400).json({ message: "A product in your cart is no longer available" });
    }
    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    const line_items = normalized.map(({ id, qty }) => {
      const product = byId.get(id);
      const price = Number(product.price);
      if (!Number.isFinite(price) || price <= 0) throw new Error(`${product.name} does not have a valid price`);
      return {
        price_data: {
          currency: "gbp",
          product_data: { name: product.name },
          unit_amount: Math.round(price * 100),
        },
        quantity: qty,
      };
    });
    const settings = await StoreSettings.findOne({ key: "store" });
    const country = String(shippingCountry || "").toUpperCase();
    const shippingZones = settings?.shippingZones?.length ? settings.shippingZones : [{ countries: ["GB"], fee: settings?.deliveryFee ?? 0 }];
    const shippingZone = shippingZones.find((zone) => zone.countries.includes(country));
    if (!shippingZone) {
      return res.status(400).json({ message: "We do not currently ship to that country. Choose an available destination." });
    }
    const deliveryFee = Number(shippingZone.fee || 0);
    if (deliveryFee > 0) {
      line_items.push({
        price_data: {
          currency: "gbp",
          product_data: { name: "Delivery" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }
    const embedded = uiMode === "embedded";
    const sessionOptions = {
      mode: "payment",
      metadata: {
        items: JSON.stringify(normalized),
      },
      line_items,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: [country] },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    };
    if (embedded) {
      sessionOptions.ui_mode = "embedded";
      sessionOptions.redirect_on_completion = "always";
      sessionOptions.return_url = `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionOptions.success_url = `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      sessionOptions.cancel_url = `${process.env.CLIENT_URL}/checkout/cancelled`;
    }
    const session = await stripe.checkout.sessions.create(sessionOptions);
    res.json(embedded ? { clientSecret: session.client_secret } : { url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { productId, shippingCountry } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const settings = await StoreSettings.findOne({ key: "store" });
    const country = String(shippingCountry || "").toUpperCase();
    const shippingZones = settings?.shippingZones?.length ? settings.shippingZones : [{ countries: ["GB"], fee: settings?.deliveryFee ?? 0 }];
    const shippingZone = shippingZones.find((zone) => zone.countries.includes(country));
    if (!shippingZone) {
      return res.status(400).json({ message: "We do not currently ship to that country. Choose an available destination." });
    }
    const lineItems = [{
      price_data: {
        currency: "gbp",
        product_data: { name: product.name },
        unit_amount: Math.round(Number(product.price) * 100),
      },
      quantity: 1,
    }];
    const deliveryFee = Number(shippingZone.fee || 0);
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: { currency: "gbp", product_data: { name: "Delivery" }, unit_amount: Math.round(deliveryFee * 100) },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      metadata: {
        productId: product._id.toString(),
      },

      line_items: lineItems,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: [country] },

      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
