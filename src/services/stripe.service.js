const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (course, userId) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: course.title },
          unit_amount: course.price,
        },
        quantity: 1,
      },
    ],
    metadata: { courseId: course.id, userId },
    success_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/success` : 'http://localhost:3000/success',
    cancel_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/courses` : 'http://localhost:3000/courses',
  });
  return session.url;
};

module.exports = { stripe, createCheckoutSession };
