import { useEffect, useState } from 'react';
import StaticContentPage from '../components/layout/StaticContentPage';
import { API } from '../data/catalog';

export default function ReturnsRefunds() {
  const [shippingZones, setShippingZones] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/settings`).then((response) => response.ok ? response.json() : null)
      .then((data) => setShippingZones(Array.isArray(data?.shippingZones) ? data.shippingZones : []))
      .catch(() => {});
  }, []);

  return (
    <StaticContentPage slug="returns-refunds" afterContent={shippingZones.length > 0 ? (
      <section className="cms-live-returns">
        <h2>Change-of-mind return costs by delivery area</h2>
        <ul>{shippingZones.map((zone) => <li key={zone.name}><strong>{zone.name}:</strong> {zone.changeOfMindReturnCost || 'Contact us before ordering to confirm any applicable direct return cost. We will not charge a return cost that was not disclosed before purchase.'}</li>)}</ul>
      </section>
    ) : null}>
      <p className="kicker">CUSTOMER INFORMATION</p>
      <h1>Returns and refunds policy</h1>
      <p><strong>Effective date: 18 November 2026</strong></p>
      <p>At Des Collection Ltd, we want every customer shopping at Descollection.co.uk to have a positive shopping experience. We take care to ensure that orders are processed correctly and products are delivered in satisfactory condition.</p>
      <p>However, if you receive an incorrect, damaged, faulty, or otherwise unsuitable item, we are committed to handling your complaint fairly and in accordance with applicable UK consumer protection laws.</p>
      <p>Please read our Returns and Refunds Policy below.</p>

      <h2>1. Incorrect items delivered</h2>
      <p>If you receive an item that differs from the product you ordered, please contact us as soon as possible.</p>
      <p>Examples include receiving a different product from the one purchased; the wrong size, colour, style, or model where these differ from your confirmed order; an incomplete order; or an item that does not match the agreed product description.</p>
      <h3>What you should do</h3>
      <ul>
        <li>Contact our customer service team through the contact details provided on Descollection.co.uk.</li>
        <li>Provide your order number and a description of the problem.</li>
        <li>Where possible, attach clear photographs of the item received, its packaging, and the delivery label.</li>
        <li>Keep the item and its original packaging until we advise you on the next steps.</li>
      </ul>
      <h3>What we will do</h3>
      <p>If goods are faulty, damaged on arrival or do not match your order, you can usually reject them for a refund within 30 days of delivery. Please tell us what went wrong. Photographs and packaging can help us investigate where available, but are not required to exercise your rights. We will arrange collection or explain how to return the goods and cover reasonable return costs in accordance with your statutory rights.</p>

      <h2>2. Damaged items on arrival</h2>
      <p>If your order arrives damaged, please contact us as soon as reasonably possible after delivery. This includes broken or cracked products; damaged footwear, bags, jewellery, or accessories; products with significant physical damage that was not disclosed before purchase; items damaged during transportation or delivery; and packaging damage that has also affected the product.</p>
      <h3>What you should do</h3>
      <p>Please contact us with your order number, a description of the damage, and clear photographs showing the damaged product. Include photographs of the outer packaging and shipping label where available. Please retain the damaged product and its packaging until we advise you about the return or collection process.</p>
      <h3>What we will do</h3>
      <p>You can usually reject faulty, damaged or incorrect goods for a refund within 30 days of delivery. After that initial period, repair or replacement is ordinarily the first remedy. If neither is available, one attempt fails, or the remedy is delayed unreasonably or causes significant inconvenience, a price reduction or final right to reject may be available. A fault arising within six months is generally presumed to have existed at delivery unless we show otherwise or the presumption is incompatible with the goods or fault.</p>
      <p>We will arrange or cover reasonable return costs where we are responsible for supplying a damaged or faulty item. Customers will not be required to pay additional charges to correct an order that arrived damaged due to circumstances for which Des Collection Ltd is responsible.</p>
      <p>Your legal rights do not depend on reporting damage within an arbitrary 24- or 48-hour period. However, contacting us promptly helps us investigate delivery-related problems efficiently.</p>

      <h2>3. Faulty or defective products</h2>
      <p>If an item develops a fault or does not meet the standards required by applicable consumer protection law, please contact us with your order details and a description of the problem. Photographs may help us investigate where available but are not required to exercise your rights.</p>
      <p>Under the UK Consumer Rights Act 2015, goods must meet the applicable requirements of satisfactory quality, fitness for purpose, and conformity with their description. You can usually exercise the 30-day short-term right to reject faulty goods for a refund. After that initial period, repair or replacement is ordinarily the first remedy. If neither is available, one attempt fails, or the remedy is delayed unreasonably or causes significant inconvenience, you may be entitled to a price reduction or final right to reject. A fault arising within six months is generally presumed to have existed at delivery unless we show otherwise or the presumption is incompatible with the goods or fault.</p>
      <p>Our team will assess the issue and explain the remedies available under the circumstances. Nothing in this policy limits your statutory consumer rights.</p>

      <h2>4. Change of mind and unwanted items</h2>
      <p>If you purchase an item online and subsequently change your mind, you may have the right to cancel your order under the Consumer Contracts Regulations 2013. For most online purchases, you generally have 14 days from the day after receiving the goods to notify us that you wish to cancel. After notifying us, you normally have a further 14 days to return the goods.</p>
      <p>The cancellation right is subject to certain legal exceptions, including some personalised goods and certain sealed goods that are unsuitable for return for health protection or hygiene reasons once unsealed.</p>
      <h3>Conditions for change-of-mind returns</h3>
      <p>To cancel, email <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> or write to us at the contact address in our Terms and Conditions. You do not need to give a reason. Unless we offer to collect the goods, send them back within 14 days after telling us you are cancelling. Our returns address is Des Collection Ltd, 312 Moston Lane, Manchester, M40 9WB. The applicable direct cost of a change-of-mind return, including an estimate for goods that cannot normally be returned by post, is listed below and shown before you pay. You may inspect goods as you would in a shop. We may deduct for diminished value caused by handling beyond what is needed to establish the goods’ nature, characteristics and functioning only where permitted by law and where we gave you the required cancellation information.</p>

      <h2>5. Items that may not be eligible for change-of-mind returns</h2>
      <p>The change-of-mind exception for hygiene applies only to goods that are sealed, unsuitable for return on health or hygiene grounds, and unsealed after delivery. The personalised-goods exception applies only to goods made to your specifications or clearly personalised. We will flag applicable exceptions before purchase. These exceptions do not remove your remedies for faulty goods.</p>
      <p>This section does not remove your right to a remedy for goods that are faulty, damaged, incorrectly supplied, or not as described.</p>

      <h2>6. Refund processing</h2>
      <p><strong>Statutory cancellation:</strong> We refund without undue delay. If you must send the goods back, the deadline is 14 days after we receive the goods or earlier evidence that you sent them. If we offer to collect the goods, the deadline is 14 days after you tell us you are cancelling. We refund the least expensive qualifying outbound delivery option, use your original payment method unless you expressly agree otherwise, and charge no refund fee.</p>
      <p><strong>Statutory rejection of non-conforming goods:</strong> We refund without undue delay and within 14 days beginning when we agree that you are entitled to a refund. We use the same payment method unless you expressly agree otherwise and charge no refund fee.</p>
      <p>The time it takes for the refunded amount to appear in your account may depend on your bank, card issuer, or payment provider. We will not charge an administration fee for processing a refund where such a fee would be unlawful.</p>

      <h2>7. Exchanges and replacements</h2>
      <p>If you receive an incorrect or damaged item, we will explain whether a replacement is available. Replacements are subject to stock availability and any applicable legal requirements. If the correct item is unavailable, we will discuss an appropriate alternative or refund where required. For change-of-mind exchanges, please contact us first to confirm availability and the applicable return arrangements.</p>

      <h2>8. Return shipping costs</h2>
      <p>The responsibility for return shipping costs depends on the reason for the return.</p>
      <ul>
        <li><strong>Incorrect, damaged, or faulty goods:</strong> Where we are responsible for supplying an incorrect, damaged, or faulty item, we will cover the reasonable return costs where required by law.</li>
        <li><strong>Change-of-mind returns:</strong> Customers may be responsible for direct return postage costs if this was disclosed before the purchase and the law permits us to charge those costs.</li>
      </ul>
      <p>You do not need our permission or address confirmation before returning goods after cancellation. Send them to Des Collection Ltd, 312 Moston Lane, Manchester, M40 9WB, unless we offer to collect them or give you a different returns address. The direct return cost information for each delivery zone is listed above and shown again at checkout before payment. If goods cannot normally be returned by post, we will provide an estimate before you order.</p>

      <h2>9. Refunds for lost or undelivered orders</h2>
      <p>If your order has not arrived within the delivery period shown before you placed it, please contact us with your order number. We will investigate with the courier we arranged. If we refuse delivery or miss an essential delivery deadline, you may end the contract immediately. In other cases, you can usually set an appropriate further deadline and end the contract if delivery is still not made. We will refund payments due under the contract without undue delay when it is ended on these grounds.</p>
      <p>A delivery company’s tracking status alone does not remove your statutory rights where the goods have not been delivered as required.</p>

      <h2>10. How to request a return or refund</h2>
      <p>To cancel an order, email <a href="mailto:sales@descollection.co.uk">sales@descollection.co.uk</a> or write to Des Collection Ltd, 312 Moston Lane, Manchester, M40 9WB, with a clear statement that you wish to cancel. You do not need to give a reason or provide photographs. You may also use the model cancellation form in our <a href="/terms">Terms and Conditions</a>. For a fault, damage or incorrect item, please provide your order number and a description; photographs can help us investigate where available.</p>
      <p>Our team will review your request and provide instructions on the next steps. We aim to respond as promptly as reasonably possible.</p>

      <h2>11. Important information</h2>
      <p>Please do not dispose of a damaged or incorrect product before contacting us, as we may need photographs or other information to assess your request.</p>
      <p>We may investigate suspected misuse, fraudulent claims, or repeated abuse of our returns process. However, this will not affect any statutory rights you have under applicable law.</p>
      <p>Nothing in this policy excludes, restricts, or replaces any consumer rights that cannot lawfully be excluded or restricted under the laws of the United Kingdom.</p>

      <h2>12. Contact us</h2>
      <p>If you have questions about a return, replacement, or refund, please contact Des Collection Ltd through the contact details published on our website.</p>
      <p><strong>Business name:</strong> Des Collection Ltd<br /><strong>Website:</strong> Descollection.co.uk</p>
      <p>We may update this policy for future orders. The version in force when you place your order applies to that order, and an update does not affect your statutory rights.</p>
      <p>We appreciate your trust in Des Collection Ltd and will do our best to resolve genuine product and delivery issues fairly, professionally, and efficiently.</p>
      <p>Des Collection Ltd — Your destination for fashion, beauty, and accessories.</p>
    </StaticContentPage>
  );
}
