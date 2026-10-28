import { Link } from 'react-router-dom';
import PolicyLinks from '../components/layout/PolicyLinks';

export default function Privacy() {
  return (
    <main className="page text-page legal-page">
      <p className="kicker">YOUR INFORMATION</p>
      <h1>Privacy notice</h1>
      <p><strong>Last updated: 22 October 2026</strong></p>
      <p>This notice explains how Des Collection LTD uses personal information when you visit descollection.co.uk, contact us, create an account, submit measurements or place an order. We act as the data controller. Contact us at 312 Moston Lane, Manchester M40 9WB, <a href="mailto:admin@descollection.co.uk">admin@descollection.co.uk</a>, or +44 7440 248472 with privacy questions.</p>

      <h2>Information we collect</h2>
      <ul>
        <li>Contact and account details such as your name, email address and account sign-in information.</li>
        <li>Order and delivery details, including your items, contact number if provided, delivery address, country and order status.</li>
        <li>Body measurements and notes you choose to submit through our measurement form, along with your name and phone number.</li>
        <li>Messages you send us and information needed to handle a customer service request.</li>
        <li>Payment and transaction information. Stripe processes card and other payment details; we receive payment and transaction status and identifiers, not your full card number.</li>
        <li>Information stored in your browser to operate the shop, including your basket, saved product preferences, catalogue data and sign-in token. These are currently stored in local browser storage.</li>
        <li>Basic technical information that may be processed by our hosting and security services when you use the website.</li>
      </ul>

      <h2>Why we use it and our lawful bases</h2>
      <ul>
        <li><strong>Orders, payment, delivery and customer support:</strong> to take steps at your request and perform our contract with you.</li>
        <li><strong>Accounts and sign-in:</strong> to provide the account features you request and keep accounts secure. Google sign-in may be available; Google handles its own sign-in process and shares account details with us.</li>
        <li><strong>Measurement requests:</strong> to respond to and fulfil the service you ask for. Please provide only information you choose to share and avoid adding sensitive personal details in notes.</li>
        <li><strong>Legal, tax, accounting and fraud-prevention requirements:</strong> to comply with law and protect our legitimate interests in operating a secure shop.</li>
        <li><strong>Website operation and security:</strong> to maintain and protect the service, based on our legitimate interests, balanced against your rights.</li>
      </ul>
      <p>We do not use your order or measurement details to send marketing messages unless you separately agree or the law otherwise permits it. You can object to processing based on legitimate interests; we will stop unless we have compelling grounds or need the information for legal claims.</p>

      <h2>Who receives information</h2>
      <p>We share only information needed with service providers that help us run the shop: Stripe for payments, Google if you choose Google sign-in, website/database and file hosting providers, delivery services, and WhatsApp/Meta if we use WhatsApp to contact you about a paid order. These providers process information under their own terms and applicable data protection arrangements. We may also disclose information where required by law or needed to establish, exercise or defend legal claims. We do not sell personal information.</p>

      <h2>International transfers</h2>
      <p>Some service providers may process information outside the UK. Where this happens, we rely on an applicable adequacy regulation or suitable safeguards such as approved contractual protections, as required by UK data protection law. Contact us if you would like more information about the safeguards relevant to your information.</p>

      <h2>How long we keep it</h2>
      <p>We keep account information while your account is active and then for a period needed to handle queries and legal claims. Order and transaction records are retained for the periods required by tax, accounting and other laws. Measurement requests and customer messages are kept only as long as needed to deal with the request and any follow-up. Security and technical records are retained for a limited period appropriate to their purpose. We then delete or anonymise the information unless the law requires longer retention.</p>

      <h2>Your choices and rights</h2>
      <p>Depending on the circumstances, you can ask for access to your information, correction, deletion, restriction, or a copy in a portable format. You can object to processing based on legitimate interests. Where processing relies on consent, you can withdraw it at any time; this does not affect earlier processing. Some rights are subject to legal conditions, and we may need to keep records where required by law.</p>
      <p>To exercise a right, email <a href="mailto:admin@descollection.co.uk">admin@descollection.co.uk</a>. You can also complain to the UK Information Commissioner’s Office (ICO) at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>. We would appreciate the chance to address your concern first.</p>

      <h2>Cookies and updates</h2>
      <p>The shop uses browser local storage for the functions described above. You can clear this data through your browser settings, though this may remove your saved basket or sign-in session. We may update this notice when our practices or legal requirements change. The current version will be published here.</p>
      <p>See also our <Link to="/terms">Terms and conditions</Link>.</p>
      <PolicyLinks />
    </main>
  );
}
