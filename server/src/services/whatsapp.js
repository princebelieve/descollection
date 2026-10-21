const enabled = () => Boolean(
  process.env.WHATSAPP_ACCESS_TOKEN &&
  process.env.WHATSAPP_PHONE_NUMBER_ID &&
  process.env.WHATSAPP_ORDER_RECIPIENT &&
  process.env.WHATSAPP_ORDER_TEMPLATE_NAME &&
  process.env.WHATSAPP_TEMPLATE_LANGUAGE &&
  process.env.WHATSAPP_GRAPH_API_VERSION,
);

function short(value, max = 950) {
  const text = String(value || '').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text || 'Not provided';
}

async function sendPaidOrderNotification(order) {
  if (!enabled()) return { sent: false, skipped: true };

  const version = process.env.WHATSAPP_GRAPH_API_VERSION;
  if (!/^v\d+\.\d+$/.test(version)) throw new Error('WHATSAPP_GRAPH_API_VERSION must look like vXX.0');
  const recipient = process.env.WHATSAPP_ORDER_RECIPIENT.replace(/\D/g, '');
  if (!recipient) throw new Error('WHATSAPP_ORDER_RECIPIENT must be an international phone number');

  let items = [];
  try { items = JSON.parse(order.items || '[]'); } catch { /* Preserve a useful fallback in the template. */ }
  const itemSummary = Array.isArray(items) && items.length
    ? items.map((item) => `${item.name || item.description || item.id || 'Item'} × ${item.quantity || item.qty || 1}`).join('; ')
    : 'Order items are available in the admin dashboard';
  const address = [order.deliveryAddress, order.deliveryCity, order.deliveryState, order.deliveryPostcode, order.deliveryCountry]
    .filter(Boolean)
    .join(', ');
  const values = [
    order.stripeSessionId,
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    `${Number(order.amount || 0).toFixed(2)} GBP`,
    itemSummary,
    address,
  ];
  const parameters = values.map((text, index) => ({
    type: 'text',
    text: short(text, index === 5 ? 400 : index === 6 ? 300 : 150),
  }));

  const response = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipient,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_ORDER_TEMPLATE_NAME,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE },
        components: [{ type: 'body', parameters }],
      },
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const apiMessage = result.error?.message || 'WhatsApp rejected the order notification';
    throw new Error(apiMessage);
  }
  return { sent: true, messageId: result.messages?.[0]?.id || '' };
}

module.exports = { sendPaidOrderNotification, isWhatsAppConfigured: enabled };
