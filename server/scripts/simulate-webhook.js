
const payload = {
  event_id: "evt_01khbq91av8k4nbtrktjk5qpz9",
  event_type: "subscription.activated",
  occurred_at: new Date().toISOString(),
  data: {
    id: "sub_01khbq91av8k4nbtrktjk5qpz9",
    status: "active",
    customer_id: "ctm_01khbq91av8k4nbtrktjk5qpz9",
    address_id: "add_01khbq91av8k4nbtrktjk5qpz9",
    business_id: null,
    currency_code: "USD",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    first_billed_at: new Date().toISOString(),
    next_billed_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    paused_at: null,
    canceled_at: null,
    discount: null,
    collection_mode: "automatic",
    billing_details: null,
    current_billing_period: {
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    items: [
      {
        price_id: "pri_01khbq91av8k4nbtrktjk5qpz9",
        quantity: 1,
        status: "active"
      }
    ],
    custom_data: {
      userId: "d8e3d6f0-1a2b-3c4d-5e6f-7g8h9i0j1k2l" // Sample UUID
    }
  }
};

fetch('http://localhost:4000/api/v1/billing/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
