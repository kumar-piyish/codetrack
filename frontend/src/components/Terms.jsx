import PolicyPage from "../pages/PolicyPage";

const Terms = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      text: "By accessing or using Codyssey, you agree to these Terms and Conditions. If you do not agree, please discontinue use."
    },
    {
      title: "Account Responsibilities",
      items: [
        "Provide accurate account information and keep it updated.",
        "Maintain the confidentiality of your login credentials.",
        "Notify us immediately of any unauthorized account access."
      ]
    },
    {
      title: "Subscriptions and Billing",
      items: [
        "Paid plans are billed in advance on a recurring basis.",
        "You may cancel anytime to avoid future billing cycles.",
        "Prices and plan features may change with notice."
      ]
    },
    {
      title: "Acceptable Use",
      items: [
        "Do not misuse the platform or attempt to access data you do not own.",
        "Do not upload harmful, illegal, or infringing content.",
        "Respect the community and keep interactions professional."
      ]
    },
    {
      title: "Intellectual Property",
      text: "Codyssey content, branding, and product features remain the property of Codyssey. You may not copy or redistribute them without permission."
    },
    {
      title: "Service Availability",
      text: "We aim for reliable uptime, but the service may occasionally be interrupted for maintenance or improvements."
    },
    {
      title: "Limitation of Liability",
      text: "Codyssey is provided on an \"as-is\" basis. We are not liable for indirect damages, data loss, or interruptions beyond our control."
    },
    {
      title: "Changes to Terms",
      text: "We may update these terms periodically. Continued use after changes means you accept the new terms."
    },
    {
      title: "Contact",
      text: "Questions about these terms? Reach out at kumarpiyushxd@gmail.com."
    }
  ];

  return (
    <PolicyPage
      badge="Legal"
      title="Terms and Conditions"
      subtitle="These terms outline your rights and responsibilities when using Codyssey."
      sections={sections}
    />
  );
};

export default Terms;
