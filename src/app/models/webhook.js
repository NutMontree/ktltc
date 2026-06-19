
// Basic webhook implementation
const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    // Get the webhook payload
    const payload = req.body;

    // Process webhook data
    console.log('Received webhook:', payload);

    // Add your webhook processing logic here

    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Webhook received successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process webhook'
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});