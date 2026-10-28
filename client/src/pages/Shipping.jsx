import PolicyLinks from '../components/layout/PolicyLinks';

export default function Shipping() {
  return (
    <main className="page text-page legal-page">
      <p className="kicker">CUSTOMER INFORMATION</p>
      <h1>Shipping policy</h1>
      <p>At Des Collection (Descollection.co.uk), we aim to deliver your orders safely and promptly.</p>

      <h2>Order processing</h2>
      <p>Orders are processed within 1–3 business days after payment confirmation, excluding weekends and public holidays.</p>

      <h2>Delivery times</h2>
      <p>Delivery times depend on your location and the shipping service selected. Estimated delivery times will be communicated where available.</p>

      <h2>Shipping charges</h2>
      <p>Delivery charges, where applicable, will be displayed at checkout before payment is completed.</p>

      <h2>Order tracking</h2>
      <p>Where tracking is available, customers will receive tracking information once their orders have been dispatched.</p>

      <h2>Delivery issues</h2>
      <p>If your order is delayed, lost, or delivered to the wrong address, please contact us promptly at our customer service contact provided on our website.</p>

      <h2>Incorrect delivery details</h2>
      <p>Customers are responsible for providing accurate delivery information when placing an order. Please contact us as soon as possible if you notice an error.</p>

      <p>For further assistance, please contact Des Collection Ltd through Descollection.co.uk.</p>
      <PolicyLinks />
    </main>
  );
}
