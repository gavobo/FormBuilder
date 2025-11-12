// templates.js – central place for all document templates
// Exposes window.TEMPLATES so other scripts (app.js) can use it.

window.TEMPLATES = [
  {
    id: 'listing',
    name: 'Listing Agreement',
    desc: 'Property listing authorization + commission',
    html: `
    <div class="doc" data-tpl="listing">
      <div class="header">
        <div class="org">{{orgName}}</div>
        <div class="stamp">Document Code: {{docCode}}</div>
      </div>
      <h1>Listing Agreement</h1>
      <p class="muted">Date: <b>{{date}}</b></p>
      <hr>
      <p><b>Owner/Seller</b>: {{ownerName}}</p>
      <p><b>Authorized Broker</b>: {{brokerName}}</p>
      <p><b>Property</b>: {{propertyAddress}}</p>
      <p><b>Listing Type</b>: {{listingType}} &nbsp; | &nbsp; <b>Term</b>: {{listingTerm}}</p>
      <p><b>List Price</b>: {{listPrice}} &nbsp; | &nbsp; <b>Commission</b>: {{commissionPercent}}%</p>
      <hr>
      <ol class="doc-terms">
        <li><b>Authority.</b> Owner authorizes Broker to market the Property, advertise, arrange viewings, and cooperate with co-brokers.</li>
        <li><b>Commission.</b> Commission is earned upon execution of a binding sale/lease and is payable at closing. Co-broker split: {{coBrokerSplit}}% of total commission if applicable.</li>
        <li><b>Owner Obligations.</b> Owner represents information supplied is accurate and will provide reasonable access for inspections and viewings.</li>
        <li><b>Exclusivity.</b> If marked Exclusive, Owner shall not appoint other brokers during the Term.</li>
        <li><b>Termination.</b> Either party may terminate upon {{terminationDays}} days’ written notice; obligations accrued survive.</li>
        <li><b>Governing Law.</b> Republic of the Philippines.</li>
      </ol>
      <hr>
      <div class="sign-row">
        <div class="sign-slot">
          <div class="sign-box" data-role="provider">Sign Here – Provider (Broker)</div>
          <div class="sig-meta">Provider: {{brokerName}}</div>
        </div>
        <div class="sign-slot">
          <div class="sign-box" data-role="client">Sign Here – Client (Owner/Seller)</div>
          <div class="sig-meta">Client: {{ownerName}}</div>
        </div>
      </div>
    </div>`
  },
  {
    id: 'lease',
    name: 'Lease Agreement',
    desc: 'Basic commercial/residential lease',
    html: `
    <div class="doc" data-tpl="lease">
      <div class="header">
        <div class="org">{{orgName}}</div>
        <div class="stamp">Document Code: {{docCode}}</div>
      </div>
      <h1>Lease Agreement</h1>
      <p class="muted">Date: <b>{{date}}</b></p>
      <hr>
      <p><b>Lessor</b>: {{lessorName}} &nbsp; | &nbsp; <b>Lessee</b>: {{lesseeName}}</p>
      <p><b>Premises</b>: {{propertyAddress}}</p>
      <p><b>Permitted Use</b>: {{permittedUse}}</p>
      <p><b>Term</b>: {{leaseStart}} to {{leaseEnd}}</p>
      <p><b>Rent</b>: {{monthlyRent}} / month &nbsp; | &nbsp; <b>Security Deposit</b>: {{securityDeposit}}</p>
      <hr>
      <ol class="doc-terms">
        <li><b>Payments.</b> Rent due every 1st of the month; late charges may apply after 5 days.</li>
        <li><b>Utilities.</b> Unless otherwise stated, Lessee pays utilities and association dues attributable to the Premises.</li>
        <li><b>Maintenance.</b> Lessee keeps the Premises in good order; structural repairs remain with Lessor.</li>
        <li><b>Assignment/Sublease.</b> Requires Lessor’s written consent.</li>
        <li><b>Default & Remedies.</b> Non-payment or material breach after notice may result in termination and forfeiture of deposits as allowed by law.</li>
        <li><b>Governing Law.</b> Republic of the Philippines.</li>
      </ol>
      <hr>
      <div class="sign-row">
        <div class="sign-slot">
          <div class="sign-box" data-role="provider">Sign Here – Provider (Lessor)</div>
          <div class="sig-meta">Provider: {{lessorName}}</div>
        </div>
        <div class="sign-slot">
          <div class="sign-box" data-role="client">Sign Here – Client (Lessee)</div>
          <div class="sig-meta">Client: {{lesseeName}}</div>
        </div>
      </div>
    </div>`
  },
  {
    id: 'loi',
    name: 'Letter of Intent (LOI)',
    desc: 'Non-binding offer terms (with binding confidentiality/exclusivity)',
    html: `
    <div class="doc" data-tpl="loi">
      <div class="header">
        <div class="org">{{orgName}}</div>
        <div class="stamp">Document Code: {{docCode}}</div>
      </div>
      <h1>Letter of Intent</h1>
      <p class="muted">Date: <b>{{date}}</b></p>
      <hr>
      <p><b>Buyer/Tenant</b>: {{loiBuyerTenantName}} &nbsp; | &nbsp; <b>Seller/Landlord</b>: {{sellerLandlordName}}</p>
      <p><b>Property</b>: {{propertyAddress}}</p>
      <p><b>Offer Type</b>: {{offerType}} &nbsp; | &nbsp; <b>Offer Price / Rent</b>: {{offerPrice}} {{monthlyRent}}</p>
      <p><b>Earnest Money / Deposit</b>: {{earnestMoney}} &nbsp; | &nbsp; <b>Due Diligence</b>: {{dueDiligenceDays}} days</p>
      <p><b>Target Closing / Commencement</b>: {{closingDate}}</p>
      <hr>
      <ol class="doc-terms">
        <li><b>Contingencies.</b> Subject to satisfactory due diligence, clear title, and (if applicable) financing approval.</li>
        <li><b>Confidentiality.</b> Parties shall not disclose deal terms except to advisors; binding upon execution.</li>
        <li><b>Exclusivity.</b> Seller/Landlord to negotiate exclusively with Buyer/Tenant until <b>{{validThrough}}</b>; binding during this period.</li>
        <li><b>Non-Binding.</b> Aside from Confidentiality and Exclusivity, this LOI is an expression of intent only; definitive agreement to follow.</li>
        <li><b>Governing Law.</b> Republic of the Philippines.</li>
      </ol>
      <hr>
      <div class="sign-row">
        <div class="sign-slot">
          <div class="sign-box" data-role="provider">Sign Here – Provider (Seller/Landlord)</div>
          <div class="sig-meta">Provider: {{sellerLandlordName}}</div>
        </div>
        <div class="sign-slot">
          <div class="sign-box" data-role="client">Sign Here – Client (Buyer/Tenant)</div>
          <div class="sig-meta">Client: {{loiBuyerTenantName}}</div>
        </div>
      </div>
    </div>`
  }
];
