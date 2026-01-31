import PolicyPage from "../pages/PolicyPage";

const Shipping = () => {
  const sections = [
    {
      title: "Digital-First Delivery",
      text: "Codyssey is a digital platform. Your account access and features are delivered instantly once your subscription is active."
    },
    {
      title: "If Physical Items Are Offered",
      items: [
        "Shipping timelines and carriers will be clearly displayed at checkout.",
        "Tracking details will be emailed once the order is dispatched.",
        "Shipping fees, if any, will be shown before you complete payment."
      ]
    },
    {
      title: "International Availability",
      text: "Digital access is available worldwide. Physical shipments, when available, may be limited to select regions."
    },
    {
      title: "Address Accuracy",
      text: "For any physical deliveries, please ensure your shipping address is accurate. We are not responsible for delays caused by incorrect address details."
    },
    {
      title: "Need Help?",
      text: "If you have questions about delivery or access, contact kumarpiyushxd@gmail.com"
    }
  ];

  return (
    <PolicyPage
      badge="Shipping"
      title="Shipping Policy"
      subtitle="How Codyssey delivers digital access and any future physical items."
      sections={sections}
    />
  );
};

export default Shipping;
