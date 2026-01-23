// App.jsx
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignInPage from "./components/SignIn";
import SignUpPage from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import Landing from "./components/Landing";
import Contact from "./components/Contact";
import Profile from "./components/Profile";
import ProfileSetup from "./components/ProfileSetup";
import TodaysPlan from "./components/TodaysPlan";

function App() {
  return (
    <BrowserRouter>
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

        {/* Home Route - Landing when signed out, Dashboard when signed in */}
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <Landing />
              </SignedOut>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;