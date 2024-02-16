const express = require("express");
const { default: mongoose } = require("mongoose");
const { User } = require("../models");
const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // Verify the event using your Stripe webhook signing secret
    const stripeSignature = req.headers["stripe-signature"];
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const webhookEvent = stripe.webhooks.constructEvent(
        req.body,
        stripeSignature,
        process.env.STRIPE_WEBSOCKET_SIGNING_KEY
      );

      const handleSubscription = async () => {
        const paymentLink = webhookEvent.data.object?.payment_link;

        console.log(paymentLink);

        const user = await User.findOne({
          "subscription.stripe_payment_link": paymentLink,
        });
        if (!user)
          return console.error(
            "User subscription created but not found in own DB"
          );
        user.subscription.paid = true;
        user.subscription.customer_id = webhookEvent.data.object.customer;
        user.subscribedOnce = true;
        user.subscription.id = webhookEvent.data.object?.subscription;
        user.markModified("subscription");

        await user.save();
      };

      const handleDeleteSubscription = async () => {
        const subscriptionId = webhookEvent.data.object?.id;

        const user = await User.findOne({
          "subscription.id": subscriptionId,
        });
        if (!user)
          return console.error(
            "User subscription cancelled but not found in own DB"
          );
        user.subscription = undefined;
        user.markModified("subscription");

        await user.save();
      };

      const handleSubscriptionUpdated = async () => {
        const subscriptionId = webhookEvent.data.object.id;
        const user = await User.findOne({ "subscription.id": subscriptionId });
        if (
          user &&
          webhookEvent.data.object.status === "active" &&
          webhookEvent.data.previous_attributes.status === "trialing"
        ) {
          // Trial ended
        }
      };

      const handlePayment = async () => {
        const id = webhookEvent.data.object.id;
      };

      const handleInvoiceCreated = async () => {
        const subscriptionId = webhookEvent.data.object?.subscription;
        const user = await User.findOne({
          "subscription.id": subscriptionId,
        });

        if (user && !!webhookEvent.data.object?.invoice_pdf) {
          // Send invoice via email, webhookEvent.data.object?.invoice_pdf
        }
      };

      const handlePaymentFailed = async () => {
        const subscriptionId = webhookEvent.data.object?.subscription;
        console.log(webhookEvent.data.object);
        if (!subscriptionId) return;
        const user = await User.findOne({
          "subscription.id": subscriptionId,
        });
        if (user) {
          // Cancel sub
          const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
          await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });
        }
      };

      const handleVerificationSession = async () => {
        const user = await User.findOne({
          "KYCProcess.id": webhookEvent.data.object.id,
        });

        if (!user) return;

        user.KYCProcess = webhookEvent.data.object;
        await user.save();
        if (webhookEvent.data.object.status !== "verified") return;

        user.kycVerified = true;
        await user.save();
      };

      console.log(webhookEvent.type);
      if (webhookEvent.type === "checkout.session.completed") {
        if (webhookEvent.data.object?.mode === "subscription")
          await handleSubscription();
        else await handlePayment();
      } else if (webhookEvent.type === "customer.subscription.deleted") {
        handleDeleteSubscription();
      } else if (webhookEvent.type === "invoice.created") {
        handleInvoiceCreated();
      } else if (webhookEvent.type === "invoice.payment_failed") {
        handlePaymentFailed();
      } else if (webhookEvent.type === "customer.subscription.updated") {
        handleSubscriptionUpdated();
      } else if (webhookEvent.type.includes("identity.verification_session")) {
        handleVerificationSession();
      }
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error("Error handling webhook event:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    return res.sendStatus(200);
  }
);

module.exports = router;
