import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import icon1 from "../assets/icon1.png";
import icon2 from "../assets/icon2.png";
import icon3 from "../assets/icon3.png";
import { 
  FaCheckCircle, 
  FaChartLine, 
  FaBell, 
  FaLightbulb, 
  FaArrowRight,
  FaStar,
  FaGithub,
  FaCode,
  FaCalendarCheck,
  FaLayerGroup,
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaTerminal,
  FaDatabase
} from "react-icons/fa";

const Landing = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: <FaCode className="text-xl" />,
      title: "Universal Problem Tracker",
      description: "Track coding problems from LeetCode, Codeforces, CodeChef, GFG, and any platform in one unified dashboard.",
      highlights: ["Multi-platform support", "Clean interface", "Easy bulk import"],
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconColor: "text-blue-600"
    },
    {
      icon: <FaLightbulb className="text-xl" />,
      title: "Solution Method Tagging",
      description: "Tag how you solved each problem to maintain honest learning insights.",
      highlights: ["Self-solved", "With hints", "AI-assisted", "Editorial reference"],
      color: "bg-gradient-to-br from-cyan-500 to-blue-500",
      iconColor: "text-cyan-600"
    },
    {
      icon: <FaChartLine className="text-xl" />,
      title: "Confidence Scoring",
      description: "Automatic confidence calculation based on solving method, revisions, and time gaps.",
      highlights: ["Data-driven scoring", "Progress tracking", "Weakness identification"],
      color: "bg-gradient-to-br from-indigo-500 to-blue-500",
      iconColor: "text-indigo-600"
    },
    {
      icon: <FaBell className="text-xl" />,
      title: "Smart Revision Alerts",
      description: "Get intelligent reminders to revisit problems based on your confidence levels.",
      highlights: ["Spaced repetition", "Custom schedules", "Email notifications"],
      color: "bg-gradient-to-br from-blue-500 to-purple-500",
      iconColor: "text-purple-600"
    },
    {
      icon: <FaCalendarCheck className="text-xl" />,
      title: "Progress Analytics",
      description: "Visualize your coding journey with detailed metrics and progress charts.",
      highlights: ["Topic breakdown", "Time analysis", "Growth tracking"],
      color: "bg-gradient-to-br from-blue-600 to-indigo-600",
      iconColor: "text-blue-700"
    },
    {
      icon: <FaLayerGroup className="text-xl" />,
      title: "Interview Preparation",
      description: "Specialized tools for technical interview preparation with company-specific kits.",
      highlights: ["Company-wise tracking", "Pattern recognition", "Mock interview stats"],
      color: "bg-gradient-to-br from-sky-500 to-blue-500",
      iconColor: "text-sky-600"
    },
  ];

  const faqs = [
    {
      question: "How is this different from LeetCode's tracking?",
      answer: "LeetCode tracks only problems solved on their platform but it does not provide the reminder system to revise the problems. We track problems from any coding platform (Codeforces, CodeChef, GFG, etc.) and provide confidence scoring, smart revision reminders, and comprehensive analytics across all platforms in one dashboard."
    },
    {
      question: "Do I need to manually add every problem?",
      answer: "Yes you need to add problems manually. We're also working on browser extensions to automatically track problems as you solve them."
    },
    {
      question: "How does the confidence scoring work?",
      answer: "Confidence score is calculated based on: 1) Your solving method (self-solved vs with help), 2) Revision history, 3) Time since last attempt, 4) Problem difficulty. This gives you an accurate measure of actual understanding."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, we offer a fully responsive web app that works great on mobile browsers. Native mobile apps are planned for future releases."
    },
    {
      question: "How much does it cost?",
      answer: "The core features are completely free forever. We offer premium features for advanced analytics and team collaboration at competitive prices for students."
    },
   
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2302569B' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 lg:items-center">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center rounded-lg bg-blue-100 border border-blue-200 px-4 py-2 text-sm font-mono text-blue-700 mb-6">
                <FaTerminal className="mr-2" />
                &gt;_ Built by developers, for developers
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl max-w-2xl mx-auto text-center">
                Track. Analyze.
                <span className="block mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Master Code.
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-600 text-center ">
                Stop losing solved problems in scattered bookmarks. A developer-first platform that helps you systematically track every coding question, measure real understanding, and optimize revision with data-driven insights.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <Link
                  to="/sign-in"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
                >
                  <FaCode className="mr-2" />
                  Start Coding Smarter
                  <FaArrowRight className="ml-2" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center rounded-lg border border-blue-300 bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-all duration-300"
                >
                  <FaStar className="mr-2 text-yellow-500" />
                  View Features
                </a>
              </div>
              
              {/* Stats */}
              <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 text-center">
                <div className="rounded-lg bg-white p-4 border border-blue-100 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-500">Problems Tracked</div>
                </div>
                <div className="rounded-lg bg-white p-4 border border-blue-100 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">348</div>
                  <div className="text-sm text-gray-500">Active Days</div>
                </div>
                <div className="rounded-lg bg-white p-4 border border-blue-100 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">92%</div>
                  <div className="text-sm text-gray-500">Avg Confidence</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative rounded-xl border border-blue-200 bg-white p-2 shadow-xl">
                <div className="absolute -top-3 left-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-sm font-mono text-white">
                  profile.tsx
                </div>
                <img
                  src="./hero.png"
                  alt="Developer dashboard showing code tracking"
                  className="rounded-lg "
                />
                <div className="absolute -bottom-4 -right-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-mono text-white shadow-lg">
                  <FaChartLine className="inline mr-2" />
                  confidence: 92%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card Grid */}
      <section id="features" className="py-10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-lg bg-blue-100 border border-blue-200 px-4 py-2 text-sm font-mono text-blue-700">
              <FaCode className="mr-2" />
              FEATURES
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">
              Developer Tools for Coding Mastery
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to track, analyze, and improve your coding skills
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-blue-100 bg-white p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex rounded-lg p-3 mb-4 ${feature.color}`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center text-sm text-blue-700">
                      <FaCheckCircle className="mr-2 text-green-500 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-10 bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-lg bg-blue-100 border border-blue-200 px-4 py-2 text-sm font-mono text-blue-700">
              <FaDatabase className="mr-2" />
              WORKFLOW
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Simple workflow, powerful results
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <img src={icon1} alt="Solve" className="h-12 w-12" />,
                step: "01",
                title: "Solve Problems",
                description: "Solve coding problems on any platform - LeetCode, Codeforces, CodeChef, or others.",
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-50"
              },
              {
                icon: <img src={icon2} alt="Track" className="h-12 w-12" />,
                step: "02",
                title: "Track & Analyze",
                description: "Add to dashboard, tag solving method, get instant confidence analysis.",
                color: "from-cyan-500 to-indigo-500",
                bgColor: "bg-cyan-50"
              },
              {
                icon: <img src={icon3} alt="Revise" className="h-12 w-12" />,
                step: "03",
                title: "Revise Smartly",
                description: "Receive intelligent reminders based on confidence score to optimize retention.",
                color: "from-indigo-500 to-purple-500",
                bgColor: "bg-indigo-50"
              },
            ].map((step, idx) => (
              <div
                key={step.title}
                className="relative rounded-xl border border-blue-100 bg-white p-8 text-center shadow-lg"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`rounded-full bg-gradient-to-r ${step.color} p-1`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl font-bold text-blue-600">
                      {step.step}
                    </div>
                  </div>
                </div>
                <div className={`mt-4 inline-flex rounded-lg p-4 ${step.bgColor}`}>
                  {step.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-10 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center rounded-lg bg-blue-100 border border-blue-200 px-4 py-2 text-sm font-mono text-blue-700">
              <FaQuestionCircle className="mr-2" />
              FAQ
            </div>
            <h2 className="mt-4 text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to know about the platform
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-blue-100 bg-white overflow-hidden hover:border-blue-300 transition-colors duration-300"
              >
                <button
                  className="flex w-full items-center justify-between p-6 text-left hover:bg-blue-50 transition-colors duration-300"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="ml-4 text-blue-600">
                    {activeFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    activeFaq === index ? "pb-6 max-h-96" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-b from-white to-blue-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-200 p-8 shadow-xl">
            <div className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-sm font-mono text-white mb-6">
              <FaCode className="mr-2" />
              READY TO LEVEL UP?
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your Developer Journey Today
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of developers who are already tracking their progress and mastering coding interviews
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sign-in"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
              >
                <FaCode className="mr-2" />
                Get Started Free
                <FaArrowRight className="ml-2" />
              </Link>
              
              <a
                href="https://github.com/kumar-piyish/codetrack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-black bg-white px-8 py-3 text-lg font-semibold text-black hover:bg-black hover:text-white transition-all duration-300"
              >
                <FaGithub className="mr-2" />
                View on GitHub
              </a>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              No credit card required • Free forever plan • Open-source components
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;