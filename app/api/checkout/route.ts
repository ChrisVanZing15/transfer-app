import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Transfer Planner Pro",
          },
          unit_amount: 999, // $9.99
        },
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000?success=true",
    cancel_url: "http://localhost:3000?canceled=true",
  });

  return Response.json({ url: session.url });
}
