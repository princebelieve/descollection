import { useEffect, useState } from 'react';
import PolicyLinks from '../components/layout/PolicyLinks';
import { API } from '../data/catalog';

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export default function Shipping() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/settings`).then((response) => response.ok ? response.json() : null)
      .then((data) => setZones(Array.isArray(data?.shippingZones) ? data.shippingZones : []))
      .catch(() => {});
  }, []);

  return (
    <main className="page text-page legal-page">
      <p className="kicker">CUSTOMER INFORMATION</p>
      <h1>Shipping policy</h1>
      <p>At Des Collection Ltd (Descollection.co.uk), we aim to deliver your orders safely and promptly. We arrange delivery with the courier and handle delivery problems with them.</p>

      <h2>Order processing</h2>
      <p>Orders are normally processed within 1–3 business days after payment confirmation, excluding weekends and public holidays. This is processing time and is separate from the delivery period.</p>

      <h2>Delivery times</h2>
      <p>Delivery estimates by destination are shown below. We will deliver without undue delay and within 30 days of the contract being made unless we agree a different delivery period with you before the contract is made. The delivery countries and any restrictions that apply will be shown before you order.</p>
      {zones.length > 0 && <ul>{zones.map((zone) => <li key={zone.name}><strong>{zone.name} ({zone.countries.map((code) => regionNames.of(code) || code).join(', ')}):</strong> {zone.deliveryEstimate || 'Without undue delay and within 30 days of the contract.'}</li>)}</ul>}

      <h2>Shipping charges</h2>
      <p>We will show the delivery charge for your selected destination before you place your order.</p>

      <h2>Order tracking</h2>
      <p>Where tracking is available, customers will receive tracking information once their orders have been dispatched.</p>

      <h2>Delivery issues</h2>
      <p>If your order is late, missing or misdelivered, email <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> with your order number. We will investigate with the courier. Where we arrange delivery, the goods remain at our risk until you, or someone you identify to receive them, takes physical possession. If we refuse delivery or miss an essential delivery deadline, you may end the contract immediately. In other cases, you can usually set an appropriate further deadline and end the contract if delivery is still not made. We will refund payments due under the contract without undue delay when it is ended on these grounds.</p>

      <h2>Incorrect delivery details</h2>
      <p>Customers are responsible for providing accurate delivery information when placing an order. Please contact us as soon as possible if you notice an error.</p>

      <p>We may update this policy for future orders. The version in force when you place your order applies to that order, and an update does not affect your statutory rights.</p>
      <p>For further assistance, please contact Des Collection Ltd through Descollection.co.uk.</p>
      <PolicyLinks />
    </main>
  );
}
