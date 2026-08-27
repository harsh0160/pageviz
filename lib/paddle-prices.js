// Single source of truth for Paddle price IDs.
// CheckoutButton uses PLAN_TO_PRICE to open the right checkout.
// The webhook uses PRICE_TO_PLAN (built from the same object) to know which
// plan to grant when a payment comes in. Keeping both directions derived from
// ONE object means you only ever update price IDs in one place (e.g. when you
// switch sandbox -> live).

export const PLAN_TO_PRICE = {
  pro: 'pri_01m0x6qar386c4snh3xpfez5cg',
  business: 'pri_01m0x6sd5jqb660zm4eka60zw3',
}

export const PRICE_TO_PLAN = Object.fromEntries(
  Object.entries(PLAN_TO_PRICE).map(([plan, priceId]) => [priceId, plan])
)