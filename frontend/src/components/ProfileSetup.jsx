import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileSetup = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    salutation: "",
    degree: "",
    fieldOfStudy: "",
    yearOfGraduation: "",
    collegeName: "",
    country: "",
  });

  const degreeOptions = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA"];
  const currentYear = new Date().getFullYear();

    const graduationYears = Array.from(
      { length: 7 },
      (_, i) => (currentYear - 3 + i).toString()
    );
//   const graduationYears = ["2022", "2023", "2024", "2025", "2026", "2027"];
  const countryOptions = ["India", "United States", "Canada", "United Kingdom", "Australia"];
  const collegeOptions = [
    "IIT Delhi",
    "IIT Bombay",
    "IIT Madras",
    "NIT Trichy",
    "BITS Pilani",
    "Stanford University",
    "MIT",
    "Harvard University",
    "NSUT"
  ];
  const salutationOptions = [
    "Developer",
    "Software Developer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
  ];

  useEffect(() => {
    if (!isLoaded || !user) return;

    setFormData((prev) => ({
      ...prev,
      username: prev.username || user.username || user.firstName || "",
    }));
    toast.success("successfully logged in!", {
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

    const checkProfile = async () => {
      try {
        if (user.primaryEmailAddress?.emailAddress) {
          await api.post("/api/user/sync", {
            clerkUserId: user.id,
            email: user.primaryEmailAddress.emailAddress,
            username: user.username || user.firstName || user.id,
            image: user.imageUrl || "",
          });
        }

        const response = await api.get(`/api/user/${user.id}/profile`);
        if (response.data?.profileCompleted) {
          navigate("/");
        }
      } catch (err) {
        
      }
    };

    checkProfile();
  }, [isLoaded, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setError("");

    const {
      username,
      salutation,
      degree,
      fieldOfStudy,
      yearOfGraduation,
      collegeName,
      country,
    } = formData;

    if (
      !username ||
      !salutation ||
      !degree ||
      !fieldOfStudy ||
      !yearOfGraduation ||
      !collegeName ||
      !country
    ) {
      setError("Please complete all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      try {
        await api.put(
          `/api/user/${user.id}/profile`,
          {
            ...formData,
            yearOfGraduation: Number(formData.yearOfGraduation),
          }
        );
      } catch (err) {
        if (err?.response?.status === 404) {
          if (user.primaryEmailAddress?.emailAddress) {
            await api.post("/api/user/sync", {
              clerkUserId: user.id,
              email: user.primaryEmailAddress.emailAddress,
              username: user.username || user.firstName || user.id,
              image: user.imageUrl || "",
            });
          }
          await api.put(
            `/api/user/${user.id}/profile`,
            {
              ...formData,
              yearOfGraduation: Number(formData.yearOfGraduation),
            }
          );
        } else {
          throw err;
        }
      }
      setTimeout(() => navigate("/profile?onboard=1"), 300);
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to save profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-10">
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
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col gap-6 rounded-3xl border border-blue-100 p-6 md:p-10">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0d1526] md:text-3xl">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-sm text-gray-500 md:text-base">
              Tell us a little about your academic background to personalize your
              experience.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="salutation">
                Professional Title
              </label>
              <select
                id="salutation"
                name="salutation"
                required
                value={formData.salutation}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select a title
                </option>
                {salutationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700" htmlFor="degree">
                Degree
              </label>
              <select
                id="degree"
                name="degree"
                required
                value={formData.degree}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select degree
                </option>
                {degreeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="yearOfGraduation"
              >
                Graduation Year
              </label>
              <select
                id="yearOfGraduation"
                name="yearOfGraduation"
                required
                value={formData.yearOfGraduation}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select year
                </option>
                {graduationYears.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="collegeName"
              >
                College Name
              </label>
              <select
                id="collegeName"
                name="collegeName"
                required
                value={formData.collegeName}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select college
                </option>
                {collegeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
  <label
    className="text-sm font-medium text-gray-700"
    htmlFor="fieldOfStudy"
  >
    Field of Study
  </label>
  <input
    id="fieldOfStudy"
    name="fieldOfStudy"
    type="text"
    required
    value={formData.fieldOfStudy}
    onChange={handleChange}
    placeholder="e.g. Computer Science"
    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
  />
</div>


            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="country">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select country
                </option>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p className="md:col-span-2 text-sm text-red-500">{error}</p>
            )}

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-xs rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
