//server/src/routes/payment.routes.js
const express = require("express");
const stripe = require("../services/stripe");
const Product = require("../models/Product");
const StoreSettings = require("../models/StoreSettings");

const router = express.Router();

// Cart checkout: prices are always read from MongoDB on the server.
router.post("/create-cart-session", async (req, res) => {
  try {
    const { items, customer, uiMode } = req.body;
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
    const deliveryFee = settings?.deliveryFee ?? 0;
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
      shipping_address_collection: { allowed_countries: ["GB"] },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    };
    if (embedded) {
      sessionOptions.ui_mode = "embedded";
      sessionOptions.redirect_on_completion = "always";
      sessionOptions.return_url = `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    } else {
      sessionOptions.success_url = `${process.env.CLIENT_URL}/checkout/success`;
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
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      metadata: {
        productId: product._id.toString(),
      },

      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
