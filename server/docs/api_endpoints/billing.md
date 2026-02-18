# Billing API Endpoints

Base Path: `/api/v1/billing`

## Webhooks

### Receive Paddle Webhook

`POST /webhook`

Receives asynchronous notifications from Paddle regarding subscription and transaction events.

- **Security**: Requires a valid `paddle-signature` header. Checked against `PADDLE_WEBHOOK_SECRET`.
- **Payload**: Automatic Paddle notification payload (verified by SDK).
- **Responses**:
  - `200 OK`: Acknowledged (Paddle requires 200 even for failed internal processing to stop retries).

## Subscription Management

### Get Available Plans

`GET /plans`

Returns a list of subscription plans (Free, Pro Monthly, Pro Yearly) available for checkout.

### Create Checkout

`POST /create-checkout`

Creates a Paddle checkout session for a specific price ID.

- **Body**: `{ "priceId": string }`
- **Response**: Paddle transaction/checkout data.

### Get Subscription Status

`GET /status`

Returns the current user's subscription status, tier, and expiration date.

### Cancel Subscription

`POST /cancel`

Cancels the current user's active subscription at the end of the billing period.

### Get Customer Portal

`GET /portal`

Generates a link to the Paddle Customer Portal where users can manage their payment methods and history.
