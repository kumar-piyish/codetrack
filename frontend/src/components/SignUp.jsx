// components/SignUp.jsx (Updated - No Scrollbar Version)
import { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignUpPage() {
  useEffect(() => {
    toast.info("If you already created an account, please log in.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 p-2 md:p-4 lg:p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="flex flex-col md:flex-row-reverse w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-2 md:my-4">
        
        {/* Right Side: Decorative Blue Section */}
        <div className="w-full md:w-3/5 bg-linear-to-br from-[#1a3a8a] to-[#2d4ba3] p-4 md:p-6 lg:p-10 text-white flex flex-col justify-center items-center md:items-start relative  min-h-[300px] md:min-h-[400px]">
          {/* Logo */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 z-10">
            <img src="./logo.png" alt="Logo" className="w-7 h-6 md:w-9 md:h-8" />
            <span className="text-base md:text-xl font-bold">CodeTrack</span>
          </div>
          
          {/* Welcome Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left mt-10 md:mt-0 w-full px-4">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4">Welcome Back!</h1>
            <p className="text-sm md:text-base lg:text-lg opacity-90 mb-4 md:mb-6 max-w-md">
              Already have an account? Sign in to continue your journey with us.
            </p>
            
            {/* Features List - Compact */}
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 w-full">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs md:text-sm">✓</span>
                </div>
                <span className="text-xs md:text-sm">Access premium features</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs md:text-sm">✓</span>
                </div>
                <span className="text-xs md:text-sm">Sync across all devices</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs md:text-sm">✓</span>
                </div>
                <span className="text-xs md:text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
          
          {/* Sign In Button */}
          <div className="w-full px-4 mt-3 md:mt-4">
            <Link 
              to="/sign-in" 
              className="block w-full md:w-auto bg-white text-[#1a3a8a] px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gray-100 transition-all duration-300 font-semibold text-center shadow-lg text-xs md:text-sm lg:text-base"
            >
              Sign In Now
            </Link>
          </div>
          
          {/* Decorative Elements */}
          <div className="hidden lg:block absolute bottom-0 left-0 w-24 h-24 lg:w-32 lg:h-32 bg-blue-400/10 rounded-full -translate-x-12 lg:-translate-x-16 translate-y-12 lg:translate-y-16"></div>
        </div>

        {/* Left Side: Clerk Form */}
        <div className="w-full md:w-3/5 p-4 md:p-6 lg:p-8 flex flex-col justify-center items-center overflow-y-auto min-h-[400px]">
          {/* Logo for Mobile */}
          <div className="md:hidden flex items-center gap-2 mb-3">
           <img src="./logo.png" alt="Logo" className="w-7 h-6" />
            <span className="text-base font-bold">CodeTrack</span>
          </div>
          
          <div className="w-full max-w-sm">
            <div className="text-center mb-2 md:mb-3">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                Create Account
              </h2>
            </div>
            
            <div className="w-full max-w-sm ">
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              forceRedirectUrl="/complete-profile"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-none w-full bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary: "bg-gradient-to-r from-[#1a3a8a] to-[#2d4ba3] text-white hover:opacity-90 rounded-full px-4 md:px-6 py-2 md:py-2.5 w-full font-semibold transition-all duration-300 text-xs md:text-sm",
                  socialButtonsBlockButton: "rounded-full border border-gray-300 hover:border-[#1a3a8a] hover:bg-blue-50 transition-colors py-2 md:py-2.5 text-xs md:text-sm",
                  socialButtonsBlockButtonText: "text-gray-700 text-xs md:text-sm",
                  formFieldInput: "bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 md:py-2.5 focus:border-[#1a3a8a] focus:ring-1 focus:ring-blue-100 transition-all text-xs md:text-sm",
                  formFieldLabel: "text-gray-700 font-medium text-xs md:text-sm mb-1",
                  footerActionLink: "text-[#1a3a8a] hover:text-[#2d4ba3] font-semibold text-xs md:text-sm",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500 text-[10px] md:text-xs",
                  identityPreviewText: "text-gray-700 text-xs md:text-sm",
                  formHeaderTitle: "text-base md:text-lg font-bold text-gray-800",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  showOptionalFields: false,
                },
                variables: {
                  colorPrimary: "#1a3a8a",
                }
              }}
            />
            </div>
            
            {/* Terms & Privacy */}
            <p className="text-center text-gray-500 text-[10px] md:text-xs mt-2 md:mt-3 px-2">
              By signing up, you agree to our{' '}
              <a href="#" className="text-[#1a3a8a] hover:underline font-medium">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-[#1a3a8a] hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}