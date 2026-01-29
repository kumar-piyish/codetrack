import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Code } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "#features" },
    { name: "How It Works", path: "#how-it-works" },
    { name: "FAQ", path: "#faq" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-blue-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <img src="/logo.png" alt="Codyssey" className="h-8 w-12" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Codyssey
              </span>
              <div className="-mt-1 text-xs text-gray-500 font-mono">
                &gt;_ track your code
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              link.path.startsWith("#") ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <SignedOut>
              <Link
                to="/sign-in"
                className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/30"
              >
                Get Started Free
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border-2 border-blue-200",
                    userButtonOuterIdentifier: "text-sm font-medium text-gray-700"
                  }
                }} 
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={toggleMenu}
            className="rounded-lg p-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 md:hidden transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="border-t border-blue-100 bg-white px-4 py-4 shadow-lg">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              link.path.startsWith("#") ? (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={toggleMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={toggleMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                >
                  {link.name}
                </Link>
              )
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="mt-4 flex flex-col gap-3 border-t border-blue-100 pt-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  onClick={toggleMenu}
                  className="rounded-lg px-4 py-3 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={toggleMenu}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
                >
                  Get Started Free
                </Link>
              </SignedOut>
              <SignedIn>
                <div className="flex justify-center">
                  <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-10 h-10",
                        userButtonOuterIdentifier: "text-sm font-medium text-gray-700"
                      }
                    }} 
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;