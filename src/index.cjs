// Simple NodeJS Server for M-Pesa Daraja API

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));


const port = process.env.PORT || 3000;

// OAuth token
async function getOAuthToken() {
    const { CONSUMER_KEY, CONSUMER_SECRET } = process.env;
    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
        console.error('Missing Consumer Key or Secret in environment variables');
        return null;
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}` }
        });
        console.log('OAuth token response:', response.data);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting OAuth token:', error.response ? error.response.data : error);
        return null;
    }
}

// Initiate Payment
app.post('/pay', async (req, res) => {
    console.log("Pay");
    console.log('Received Payment Request:', req.body);

    const token = await getOAuthToken();
    if (!token) {
        console.error('Failed to get OAuth token');
        return res.status(500).send('Error getting OAuth token');
    }

    const Timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const Passkey = process.env.PASSKEY;
    const BusinessShortCode = "174379";

    const paymentData = {
        BusinessShortCode: BusinessShortCode,
        Password: Buffer.from(`${BusinessShortCode}${Passkey}${Timestamp}`).toString('base64'),
        Timestamp: Timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: req.body.amount,
        PartyA: req.body.phone,
        PartyB: BusinessShortCode,
        PhoneNumber: req.body.phone,
        CallBackURL: "https://7376-197-237-130-155.ngrok-free.app/mpesa-callback",
        AccountReference: "Ticket123",
        TransactionDesc: "Payment for Bus Ticket"
    };

    console.log('Sending Payment Data:', paymentData);

    try {
        const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', paymentData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Payment Response:', response.data);
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error initiating payment:', error.response ? error.response.data : error);
        res.status(500).send('Error processing payment');
    }
});

// Callback Route
app.post('/mpesa-callback', (req, res) => {
    console.log("Callback");
    console.log('M-Pesa callback:', req.body);
    res.status(200).send('Callback received');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
