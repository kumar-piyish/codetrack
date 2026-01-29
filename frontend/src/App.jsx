// App.jsx
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import SignInPage from "./components/SignIn";
import SignUpPage from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import ProfileSetup from "./components/ProfileSetup";
import TodaysPlan from "./components/TodaysPlan";
import CompanyWise from "./components/CompanyWise";
import Pattern from "./components/Pattern";

const TitleManager = () => {
  const location = useLocation();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const titleMap = {
      "/dashboard": "Dashboard",
      "/company-wise": "Company Sheet",
      "/today": "Today's Plan",
      "/profile": "Profile",
      "/patterns": "Patterns Library",
    };

    const baseTitle = titleMap[location.pathname] || "Codyssey";
    const name =
      user?.fullName || user?.username || user?.firstName || "User";

    document.title =
      baseTitle === "Codyssey"
        ? baseTitle
        : isLoaded && user
        ? `${baseTitle} | ${name}`
        : baseTitle;
  }, [location.pathname, user, isLoaded]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <TitleManager />
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/complete-profile"
          element={
            <>
              <SignedIn>
                <ProfileSetup />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          }
        />

        {/* Home Route - Landing when signed out, Profile when signed in */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Navigate to="/profile" />
              </SignedIn>
              <SignedOut>
                <Landing />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/company-wise"
          element={
            <>
              <SignedIn>
                <CompanyWise />
              </SignedIn>
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <SignedIn>
                <Profile />
              </SignedIn>
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn>
                <Dashboard/>
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/today"
          element={
            <>
              <SignedIn>
                <TodaysPlan />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          }
        />
        <Route
          path="/patterns"
          element={
            <>
              <SignedIn>
                <Pattern />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;