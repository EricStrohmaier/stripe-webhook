import express from 'express';
import Stripe from 'stripe';
import { createClient } from "@supabase/supabase-js";

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
});
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserDetailsInDatabase(chatId, customerDetails) {
    try {
        const { data, error } = await supabase
            .from('social_media_user_config')
            .select('*')
            .eq('user_chat_id', chatId)
            .single();

        if (error) {
            throw error;
        }

        if (data) {
            // Record exists, update it
            const { error: updateError } = await supabase
                .from('social_media_user_config')
                .update({ customer_stripe_data: customerDetails, has_paid: true })
                .eq('user_chat_id', chatId);

            if (updateError) {
                throw updateError;
            }
        } else {
            // Record doesn't exist, handle accordingly (e.g., create a new record or log an error)
            console.log('⚠️  User details not found in database, creating new record');
        }

        return true;
    } catch (error) {
        console.error('Error updating user details:', error);
        return false;
    }
}


app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;
    const endpoint = process.env.ENDPOINT_SECRET;
    if (!endpoint) {
        console.log('❌ Webhook signing secret is missing');
        return;
    }
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpoint);
    } catch (err) {
        console.error(`Error in webhook signature verification: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const chatId = session.metadata.chat_id;
     
        const customerDetails = {
            chatId: session.metadata.chat_id,
            customer_id: session.customer,
            subscription_id: session.subscription,
            customer_email: session.customer_details.email,
            customer_name: session.customer_details.name,
        };
        console.log(`Payment successful for chat ID: ${chatId}`);

        const success = await updateUserDetailsInDatabase(chatId, customerDetails);
        if (success) {
            console.log('Database updated successfully');
        } else {
            console.log('Failed to update database');
        } 
        
        response.json({ received: true });
    } else {
        // Unexpected event type
        return response.status(400).end();
    }
});

app.listen(4242, () => console.log('Running on port 4242'));

