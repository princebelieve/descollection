import { Link } from 'react-router-dom';
import StaticContentPage from '../components/layout/StaticContentPage';

export default function Terms() {
  return (
    <StaticContentPage slug="terms">
      <p className="kicker">CUSTOMER INFORMATION</p>
      <h1>Terms and conditions</h1>
      <p><strong>Last updated: 18 November 2026</strong></p>
      <p>These terms apply when you use descollection.co.uk or buy products from Des Collection LTD. Please read them before placing an order. By placing an order, you agree to these terms. They do not affect rights you have under UK consumer law.</p>

      <h2>Who we are and how to contact us</h2>
      <p>Des Collection Ltd is registered in England and Wales under company number 17531535. Our registered office is 312 Moston Lane, Manchester M40 9WB. For enquiries or complaints, email <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> or call +44 7440 248472.</p>

      <h2>Orders and contract</h2>
      <p>Product pages describe the main features and show the price. Your order is an offer to buy. We will acknowledge receipt of your order, but that acknowledgement and payment confirmation do not mean we have accepted it. We accept your order when we confirm dispatch. You can withdraw your order before we accept it by contacting us using the details above; if we have already taken payment, we will refund it. If we cannot supply an item, we will tell you and refund any amount paid for it.</p>
      <p>We take reasonable care to display product details, colours and prices accurately. Screen settings can affect how colours appear. If a price or description contains an obvious error, we may contact you before dispatch so you can confirm the order at the correct details or cancel for a refund.</p>

      <h2>Payment and delivery</h2>
      <p>Payments are processed securely by Stripe. We do not receive or store your full payment card details. Orders are normally processed within 1–3 business days after payment confirmation, excluding weekends and public holidays. Before you place your order, we will show the delivery destinations we support and the delivery charge for your order. We will deliver without undue delay and within 30 days of the contract being made unless we agree a different delivery period with you. Tracking details are sent after dispatch where tracking is available. If your order is delayed, lost, or delivered to the wrong address, contact us promptly. See our <Link to="/shipping">Shipping policy</Link>.</p>

      <h2>Your right to cancel an online order</h2>
      <p>Where the statutory right to cancel applies, you can cancel after acceptance up to 14 days after the day you, or someone you nominate, receive the goods. If one order arrives in separate deliveries, the period runs from receipt of the last item or part. To cancel, send us a clear statement by email or post using the contact details above before the deadline. You do not have to give a reason. You may use the model cancellation form below, but you do not have to.</p>
      <p>Unless we offer to collect the goods, send them back within 14 days after telling us you are cancelling. The returns address and details of any direct return costs, including for goods that cannot normally be returned by post, are set out in our <Link to="/returns-refunds">Returns and refunds policy</Link> and will be provided before you order. For a statutory cancellation, we refund without undue delay and no later than 14 days after we receive the goods back or you provide evidence that you sent them, whichever is earlier. If we offer to collect them, we refund no later than 14 days after you tell us you are cancelling. We refund the least expensive standard delivery option offered, use your original payment method unless you expressly agree otherwise, and charge no refund fee. We may deduct for diminished value only where the law permits, including where we gave you the required cancellation information. See our <Link to="/returns-refunds">Returns and refunds policy</Link> for further information.</p>
      <p>The cancellation right has legal exceptions. These include goods made to your specifications or clearly personalised, and sealed goods unsuitable for return for health protection or hygiene reasons where they have been unsealed after delivery. We will explain any applicable exception on the product page or before you order. These exceptions do not remove your rights if goods are faulty or do not conform to the contract.</p>
      <h3>Model cancellation form</h3>
      <p>(Complete and return this form only if you wish to cancel the contract.)</p>
      <p>To: Des Collection Ltd, 312 Moston Lane, Manchester, M40 9WB; email: <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a></p>
      <p>I/We hereby give notice that I/We cancel my/our contract of sale of the following goods: [insert goods].<br />Ordered on / received on: [insert date].<br />Name of consumer(s): [insert name].<br />Address of consumer(s): [insert address].<br />Signature of consumer(s) (only if this form is notified on paper): [signature].<br />Date: [insert date].</p>

      <h2>Faulty, damaged or incorrect goods</h2>
      <p>Your rights under the Consumer Rights Act 2015 apply. Goods must be of satisfactory quality, fit for purpose and as described. Where applicable, you can exercise the short-term right to reject faulty goods within 30 days of delivery. After that period, repair or replacement is ordinarily the first remedy. A price reduction or final right to reject may be available if repair or replacement is unavailable, fails, is delayed unreasonably, or causes significant inconvenience. A fault arising within six months is generally presumed to have existed at delivery unless we show otherwise or the presumption is incompatible with the goods or fault. If you are entitled to a refund for non-conforming goods, we will refund without undue delay and within 14 days beginning when we agree you are entitled to it, using your original payment method unless you expressly agree otherwise and charging no refund fee. Contact us at <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a>; photographs may help us investigate but are not required to exercise your rights. Nothing in these terms limits or excludes your statutory rights.</p>

      <h2>Accounts and acceptable use</h2>
      <p>You may check out as a guest. If you create an account, keep your sign-in details secure and tell us if you suspect unauthorised use. Use the website lawfully and do not interfere with its security, availability or other users’ access. We may suspend access where reasonably necessary to protect the site, customers or our business, and will explain the reason where practicable.</p>

      <h2>Our responsibility</h2>
      <p>We are responsible for foreseeable loss caused by our breach of these terms. We do not exclude or limit liability where the law does not allow it, including liability for death or personal injury caused by negligence, fraud, or your statutory consumer rights. If an event outside our reasonable control affects delivery, we will contact you and explain how we will handle the delay. Your delivery rights and remedies are set out in our <Link to="/shipping">Shipping policy</Link>.</p>

      <h2>Privacy, changes and governing law</h2>
      <p>Our <Link to="/privacy">Privacy notice</Link> explains how we use personal information. We may update these terms for future orders by publishing a revised version here; the version in force when you order applies to that order. These terms are governed by the law of England and Wales. If you live elsewhere in the UK, you may also benefit from mandatory protections and bring proceedings in your local courts.</p>
      <p>For help or a complaint, contact us first at <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a>. We will work with you to resolve the issue.</p>
    </StaticContentPage>
  );
}
