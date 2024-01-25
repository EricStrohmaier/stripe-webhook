import express from 'express';
import Stripe from 'stripe';
const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.ENDPOINT_SECRET);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    /// Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Retrieve the chat ID from the metadata
        const chatId = session.metadata.chat_id;

        // Here, you can handle the post-payment process and update your database
        console.log(`Payment successful for chat ID: ${chatId}`);
        // Update your database here

        // Respond to Stripe to acknowledge receipt of the event
        response.json({ received: true });
    } else {
        // Unexpected event type
        return response.status(400).end();
    }
});

app.listen(4242, () => console.log('Running on port 4242'));

