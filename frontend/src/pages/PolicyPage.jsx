import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {FiArrowLeft} from "react-icons/fi"

const PolicyPage = ({ title, subtitle, sections, badge = "Policies" }) => {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="flex gap-2 items-center mb-4">
          <FiArrowLeft className="text-sm text-white/70 hover:text-white"/>
          <Link to="/" className="text-sm text-white/70 hover:text-white">Back to Home</Link>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300">
            {badge}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-white/70 sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-blue-500/20 bg-white/5 p-6 shadow-lg shadow-blue-900/10 sm:p-8"
            >
              <h2 className="text-lg font-semibold text-blue-100 sm:text-xl">
                {section.title}
              </h2>
              {section.text && (
                <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                  {section.text}
                </p>
              )}
              {section.paragraphs && (
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/80 sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              )}
              {section.items && (
                <ul className="mt-4 space-y-2 text-sm text-white/80 sm:text-base">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PolicyPage;
