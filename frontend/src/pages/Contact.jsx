import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiSend, 
  FiUser, 
  FiMail, 
  FiMessageSquare, 
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle 
} from "react-icons/fi";
import { API_BASE_URL } from "../utils/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    query: "",
  });
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "idle", message: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message.");
      }

      setStatus({ 
        type: "success", 
        message: "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours." 
      });
      setFormData({ name: "", email: "", query: "" });
    } catch (error) {
      setStatus({ 
        type: "error", 
        message: "Unable to send message at the moment. Please try again later or email us directly at support@example.com." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-md font-medium text-[#2f64ff] hover:text-[#2956d8] transition-colors duration-200 mb-8 group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left Column - Header & Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
                Get in <span className="text-[#2f64ff]">Touch</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiMail className="w-6 h-6 text-[#2f64ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600 ">kumarpiyushxd@gmail.com</p>
                  <p className="text-sm text-gray-500 mt-1">Typically replies within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <FiMessageSquare className="w-6 h-6 text-[#2f64ff]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Our Promise</h3>
                  <p className="text-gray-600">Quality support guaranteed</p>
                  <p className="text-sm text-gray-500 mt-1">We value every inquiry and ensure personalized responses</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">What happens next?</h3>
              <ul className="space-y-3 text-md text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2f64ff] rounded-full"></div>
                  <span>We review your inquiry within 24 hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2f64ff] rounded-full"></div>
                  <span>Our team prepares a personalized response</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#2f64ff] rounded-full"></div>
                  <span>We'll contact you via email with solutions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
              <p className="text-gray-600 mt-2">Fill out the form below and we'll get back to you soon</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="name">
                  <FiUser className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-[#2f64ff] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                  placeholder="Bhushan Yadav"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="email">
                  <FiMail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-[#2f64ff] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                  placeholder="bhushan@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="query">
                  <FiMessageSquare className="w-4 h-4" />
                  Your Message
                </label>
                <textarea
                  id="query"
                  name="query"
                  required
                  rows={6}
                  value={formData.query}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:border-[#2f64ff] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-[#2f64ff] to-[#4d82ff] px-6 py-4 text-base font-semibold text-white hover:from-[#2956d8] hover:to-[#3d6bdf] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              {status.message && (
                <div
                  className={`rounded-xl p-4 ${
                    status.type === "success" 
                      ? "bg-green-50 border border-green-100" 
                      : "bg-red-50 border border-red-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {status.type === "success" ? (
                      <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      status.type === "success" ? "text-green-700" : "text-red-700"
                    }`}>
                      {status.message}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-gray-500 pt-4">
                By submitting this form, you agree to our{" "}
                <a href="/privacy" className="text-[#2f64ff] hover:underline">Privacy Policy</a>
                {" "}and{" "}
                <a href="/terms" className="text-[#2f64ff] hover:underline">Terms of Service</a>.
              </p>
            </form>
          </div>
        </div>

        {/* Additional Contact Info (Mobile/Tablet) */}
        <div className="mt-12 lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600">24-48 hours</p>
              <p className="text-sm text-gray-500 mt-1">During business days</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Office Hours</h3>
              <p className="text-gray-600">Mon-Fri, 9AM-6PM</p>
              <p className="text-sm text-gray-500 mt-1">Local timezone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;