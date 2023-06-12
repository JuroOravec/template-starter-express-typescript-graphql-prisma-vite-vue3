# Paddle

## Flows

- Displaying products

  1. A recurring job fetches all our Paddle products and saves them to our database (every 15 min)
  2. Paddle products are exposed via GraphQL API
  3. Products are fetched on the frontend and displayed to user
  4. When user selects a product on the frontend, we use the product's ID
     to open a Paddle Checkout flow (which allows user to buy the product).

- Purchasing products
  1. When user purchases a Paddle product, Paddle calls our webhook with an order_fulfillment event
  2. On receive we verify the event request IP and payload signature
  3. If valid, we save the purchase transaction to our database.
  4. Based on the product type (defined in the Paddle UI (Catalog)), we run additional logic
