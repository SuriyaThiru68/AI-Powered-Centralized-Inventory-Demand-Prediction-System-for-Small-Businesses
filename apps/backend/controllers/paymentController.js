/**
 * Razorpay integration — mock flow until RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are configured.
 */

exports.createOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ success: false, message: 'Valid amount is required' });
  }

  const hasRazorpay =
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

  if (!hasRazorpay) {
    return res.json({
      success: true,
      mock: true,
      message: 'Razorpay credentials not configured — returning mock order',
      data: {
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created',
      },
    });
  }

  res.status(501).json({
    success: false,
    message: 'Live Razorpay integration pending — configure keys and implement SDK call',
  });
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ success: false, message: 'Missing payment fields' });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.json({
      success: true,
      mock: true,
      verified: true,
      message: 'Mock payment verified',
      data: { orderId: razorpay_order_id, paymentId: razorpay_payment_id },
    });
  }

  res.status(501).json({
    success: false,
    message: 'Live signature verification not yet implemented',
  });
};
