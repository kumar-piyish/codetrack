import PolicyPage from "../pages/PolicyPage";

const Privacy = () => {
  const sections = [
    {
      title: "Information We Collect",
      items: [
        "Account details such as name, email address, and login credentials.",
        "Usage data including feature interactions and activity history.",
        "Payment information is handled securely by our payment partners."
      ]
    },
    {
      title: "How We Use Your Data",
      items: [
        "To provide and improve Codyssey features.",
        "To personalize your learning and revision insights.",
        "To communicate important updates and support responses."
      ]
    },
    {
      title: "Cookies and Analytics",
      text: "We use cookies and similar technologies to keep you signed in, remember preferences, and measure product performance."
    },
    {
      title: "Data Sharing",
      text: "We do not sell your personal data. We only share data with trusted service providers required to deliver the platform."
    },
    {
      title: "Data Security",
      text: "We use industry-standard security practices to protect your data. No online service is 100% secure, but we continually improve our safeguards."
    },
    {
      title: "Your Choices",
      items: [
        "Update your profile information at any time.",
        "Request account deletion by contacting support.",
        "Opt out of non-essential product emails."
      ]
    },
    {
      title: "Children's Privacy",
      text: "Codyssey is not intended for children under 13, and we do not knowingly collect their data."
    },
    {
      title: "Contact",
      text: "Questions about privacy? Email us at kumarpiyushxd@gmail.com"
    }
  ];

  return (
    <PolicyPage
      badge="Privacy"
      title="Privacy Policy"
      subtitle="Learn what data we collect, why we collect it, and how we keep it safe."
      sections={sections}
    />
  );
};

export default Privacy;
