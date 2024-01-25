# Stripe Webhook Integration with Supabase

This project is a Node.js API that integrates Stripe webhooks to update user payment details in a Supabase database. It's designed to listen for Stripe's checkout.session.completed events and update user records in Supabase accordingly.

## Features

Stripe webhook handling for checkout.session.completed events.
Secure verification of Stripe webhook signatures.
Updates user payment status in a Supabase database.

## Local Setup

### Clone the repository:

```
git clone https://github.com/EricStrohmaier/stripe-webhook/
cd stripe-webhook

```

### Install dependencies:

```
npm install
```

Set up environment variables. Create a .env file in the root directory and add the following variables:

### .env
```
STRIPE_SECRET_KEY=your_stripe_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
ENDPOINT_SECRET=your_stripe_endpoint_secret
```

### Run the server:

```
node index.js
```

## Deployment
This application is set up for deployment on Vercel.

## Stripe Setup
Configure a webhook endpoint in your Stripe Dashboard.
Set the webhook to listen for checkout.session.completed events.
Copy the webhook signing secret provided by Stripe and add it to your environment variables.

## Supabase Setup
Create a table named social_media_user_config with appropriate fields (like user_chat_id, customer_stripe_data, has_paid).
Ensure the fields match the data structure used in the updateUserDetailsInDatabase function.

## Endpoints
POST /webhook: Endpoint for Stripe webhook events.
GET /: A simple hello endpoint.
GET /health: Health check endpoint.