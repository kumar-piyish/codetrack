const Footer = () => {
  return (
    <footer id="contact" className="bg-[#0d1526] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 text-sm md:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="mt-3 space-y-1 text-white/80">
              <li>
                <a className="hover:text-white" href="/">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#features">
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#how-it-works">
                  How It Works
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#about">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="/contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-3 space-y-1 text-white/80">
              <li>Blog (future)</li>
              <li>Interview Prep (future)</li>
              <li>Roadmaps (future)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contact</h4>
            <div className="mt-3 space-y-2 text-white/80">
              <p>Email: kumarpiyishxd@gmail.com</p>
              <p><a href="https://github.com/kumar-piyish" className="text-white hover:text-white hover:font-bold">GitHub</a> | <a href="https://www.linkedin.com/in/kumar-piyush-1314ba1b9/" className="hover:text-white hover:font-bold">LinkedIn</a> | <a href="https://twitter.com/piyush_kumar" className="hover:text-white hover:font-bold">Twitter</a></p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-white/70">
          © 2026 Codyssey. Built to help coders grow with confidence.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
