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

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log(paymentIntentSucceeded);
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        case 'checkout.session.completed':
            const session = event.data.object;
            const customerId = session.customer;

            // Retrieve the chat ID from the session metadata
            const chatId = session.metadata.chat_id;

            // Check if chatId exists and is valid
            if (chatId) {
                await stripe.customers.update(customerId, {
                    metadata: { chat_id: chatId },
                });
            } else {
                console.log("Chat ID not found in session metadata");
            }
            break;


        case 'customer.subscription.created':
            const subscription = event.data.object;
            console.log(subscription);
            break

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});

app.listen(4242, () => console.log('Running on port 4242'));

