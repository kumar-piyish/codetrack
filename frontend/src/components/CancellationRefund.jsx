import PolicyPage from "../pages/PolicyPage";

const CancellationRefund = () => {
  const sections = [
    {
      title: "Overview",
      text: "We want every coder to feel confident in Codyssey. If you change your mind, we make cancellations and refunds simple and transparent."
    },
    {
      title: "Cancellation Window",
      items: [
        "You can cancel your subscription at any time from your account settings.",
        "Cancellations stop future billing immediately.",
        "You will retain access until the end of your current billing period."
      ]
    },
    {
      title: "Refund Eligibility",
      items: [
        "Refunds are available within 7 days of your first paid subscription purchase.",
        "Refunds are not available for renewals or add-on purchases after the initial period.",
        "If the service is unavailable for an extended period, we may issue a prorated refund."
      ]
    },
    {
      title: "How to Request a Refund",
      items: [
        "Email us with your account email and purchase details.",
        "Share the reason for your request so we can improve.",
        "We confirm your request within 2 business days."
      ]
    },
    {
      title: "Processing Time",
      text: "Approved refunds are processed back to the original payment method within 7 to 10 business days, depending on your bank."
    },
    {
      title: "Non-Refundable Items",
      items: [
        "One-time services or custom deliverables once completed.",
        "Promotional or discounted plans marked as final sale."
      ]
    }
  ];

  return (
    <PolicyPage
      badge="Cancellation & Refund"
      title="Cancellation and Refund Policy"
      subtitle="Understand how cancellations, refunds, and billing adjustments work at Codyssey."
      sections={sections}
    />
  );
};

export default CancellationRefund;
