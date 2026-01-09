Rate limiting is implemented using the **token bucket algorithm**, defined by three primary tunable parameters: **capacity**, **refill rate**, and **endpoint cost**.

1. **Identification**: Users are identified by unique keys (e.g., `rate:user:requests`, `rate:user:ai`).
2. **Capacity**: The maximum number of tokens a user can accumulate, which determines the allowable burst size.
3. **Refill Rate**: The frequency at which tokens are replenished (e.g., tokens per second).
4. **Endpoint Cost**: The number of tokens deducted per request, which can vary based on the resource intensity of the endpoint.
5. **Enforcement**: If a user's token balance is lower than the endpoint's cost, the request is rejected with a "rate limit exceeded" error.
6. **Storage**: Redis stores the current token count and the timestamp of the last refill to ensure consistency across distributed instances.
7. **Rationale**: The token bucket approach supports traffic bursts and provides a secure, scalable way to manage limits.