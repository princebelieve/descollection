import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="page text-page legal-page">
      <p className="kicker">CUSTOMER INFORMATION</p>
      <h1>Terms and conditions</h1>
      <p><strong>Last updated: 22 October 2026</strong></p>
      <p>These terms apply when you use descollection.co.uk or buy products from Des Collection LTD. Please read them before placing an order. By placing an order, you agree to these terms. They do not affect rights you have under UK consumer law.</p>

      <h2>Who we are and how to contact us</h2>
      <p>Des Collection LTD (company number 17531535) operates this website. Our contact address is 312 Moston Lane, Manchester M40 9WB. You can contact us at <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> or +44 7440 248472.</p>

      <h2>Orders and contract</h2>
      <p>Product pages describe the main features and show the price and available delivery destinations. Delivery charges and the total payable are shown before you pay. Your order is an offer to buy. We accept it when we confirm dispatch; the payment confirmation alone confirms receipt of payment, not dispatch. If we cannot supply an item, we will tell you and refund any amount paid for it.</p>
      <p>We take reasonable care to display product details, colours and prices accurately. Screen settings can affect how colours appear. If a price or description contains an obvious error, we may contact you before dispatch so you can confirm the order at the correct details or cancel for a refund.</p>

      <h2>Payment and delivery</h2>
      <p>Payments are processed securely by Stripe. We do not receive or store your full payment card details. Prices and delivery charges are displayed at checkout before you confirm payment. We deliver to the countries offered at checkout. We will make delivery within the period stated at checkout or, if no period is stated, without undue delay and within 30 days unless we agree otherwise. If delivery is delayed, contact us so we can resolve it; your legal remedies remain available.</p>

      <h2>Your right to cancel an online order</h2>
      <p>If you are a consumer, you can usually cancel an online order within 14 days after you receive the goods, without giving a reason. For an order delivered in parts, the period starts after you receive the last item. Tell us clearly by email or post using the contact details above. You may use the model cancellation wording below, but you do not have to.</p>
      <p>After telling us you are cancelling, send the goods back within 14 days. You are responsible for the direct return postage cost unless we agree to pay it or the goods are faulty or not as described. We will refund the cost of standard delivery (not any extra you chose for an upgraded service) and the price paid within 14 days of receiving the goods back, or evidence that you sent them. We may reduce the refund if handling went beyond what is needed to establish the goods’ nature, characteristics and functioning.</p>
      <p>The cancellation right has legal exceptions. These include goods made to your specifications or clearly personalised, and sealed goods unsuitable for return for health protection or hygiene reasons where they have been unsealed after delivery. We will explain any applicable exception on the product page or before you order. These exceptions do not remove your rights if goods are faulty or do not conform to the contract.</p>
      <p><strong>Model cancellation wording:</strong> “I give notice that I cancel my contract for the purchase of the following goods: [item]. Ordered on / received on: [date]. Name: [name]. Address: [address]. Date: [date].”</p>

      <h2>Faulty, damaged or incorrect goods</h2>
      <p>Your rights under the Consumer Rights Act 2015 apply. Goods must be of satisfactory quality, fit for purpose and as described. If there is a problem, contact us at <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> with your order details and, if useful, photographs. Depending on the circumstances and your legal rights, you may be entitled to reject goods for a refund, or request repair, replacement or a price reduction. Nothing in these terms limits or excludes those rights.</p>

      <h2>Accounts and acceptable use</h2>
      <p>You may check out as a guest. If you create an account, keep your sign-in details secure and tell us if you suspect unauthorised use. Use the website lawfully and do not interfere with its security, availability or other users’ access. We may suspend access where reasonably necessary to protect the site, customers or our business, and will explain the reason where practicable.</p>

      <h2>Our responsibility</h2>
      <p>We are responsible for foreseeable loss caused by our breach of these terms. We do not exclude or limit liability where the law does not allow it, including liability for death or personal injury caused by negligence, fraud, or your statutory consumer rights. We are not responsible for losses that were not reasonably foreseeable when the contract was made or losses caused by events outside our reasonable control; if such an event affects an order, we will contact you and your legal rights continue to apply.</p>

      <h2>Privacy, changes and governing law</h2>
      <p>Our <Link to="/privacy">Privacy notice</Link> explains how we use personal information. We may update these terms for future orders by publishing a revised version here; the version in force when you order applies to that order. These terms are governed by the law of England and Wales. If you live elsewhere in the UK, you may also benefit from mandatory protections and bring proceedings in your local courts.</p>
      <p>For help or a complaint, contact us first at <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a>. We will work with you to resolve the issue.</p>
    </main>
  );
}
