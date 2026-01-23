import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, LogOut, User,CircleX , LayoutDashboard, Search, Plus, Star, ChevronRight, BarChart3, Target, Loader2, CheckCircle2, AlertCircle, ExternalLink, TrendingUp, Calendar, Clock } from "lucide-react";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const synced = useRef(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isQuestionDetailOpen, setIsQuestionDetailOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    platform: "LeetCode",
    leetcodeInput: "",
    difficulty: "",
    wayOfSolving: "SOLVED_SELF",
    confidenceLevel: "MEDIUM",
    tags: [],
    companies: [],
  });

  useEffect(() => {
    if (!isLoaded || !user || synced.current) return;
    synced.current = true;
    axios.post("http://localhost:5000/api/user/sync", {
      clerkUserId: user.id,
      email: user.primaryEmailAddress.emailAddress,
      username: user.username || user.firstName,
      image: user.imageUrl,
    }).catch(err => {
      console.error("Failed to sync user:", err.response?.data || err.message);
    });
  }, [isLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/user/${user.id}/profile`
        );
        if (!response.data?.profileCompleted) {
          navigate("/complete-profile");
        }
      } catch (err) {
        // Keep user on dashboard if profile check fails
      }
    };

    checkProfile();
  }, [isLoaded, user, navigate]);

  // Get user ID from backend
  const [userId, setUserId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
  });
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${user.id}/profile`);
        if (response.data && response.data._id) {
          setUserId(response.data._id);
        }
      } catch (err) {
        console.error("Failed to fetch user ID:", err.response?.data || err.message);
        // Don't crash the app, just log the error
      }
    };
    fetchUserId();
  }, [isLoaded, user]);

  // Fetch questions and stats when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoadingQuestions(true);
      try {
        // Fetch questions
        const questionsResponse = await axios.get(
          `http://localhost:5000/api/question/user/${userId}`,
          { timeout: 10000 }
        );
        setQuestions(questionsResponse.data || []);

        // Fetch dashboard stats
        const statsResponse = await axios.get(
          `http://localhost:5000/api/user/${user.id}/dashboard`,
          { timeout: 10000 }
        );
        setStats({
          totalQuestions: statsResponse.data.totalQuestions || 0,
          highConfidence: statsResponse.data.highConfidence || 0,
          mediumConfidence: statsResponse.data.mediumConfidence || 0,
          lowConfidence: statsResponse.data.lowConfidence || 0,
        });
      } catch (err) {
        console.error("Failed to fetch questions/stats:", err.response?.data || err.message);
        // Set empty state on error
        setQuestions([]);
        setStats({
          totalQuestions: 0,
          highConfidence: 0,
          mediumConfidence: 0,
          lowConfidence: 0,
        });
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchData();
  }, [userId, user]);

  // Preview LeetCode metadata
  const handlePreviewLeetCode = async () => {
    if (!formData.leetcodeInput || formData.platform !== "LeetCode") return;

    setIsLoadingPreview(true);
    setError("");
    setPreviewData(null);

    try {
      const response = await axios.post("http://localhost:5000/api/question/preview-leetcode", {
        input: formData.leetcodeInput,
      });

      setPreviewData(response.data);
      setFormData((prev) => ({
        ...prev,
        title: response.data.title || prev.title,
        difficulty: response.data.difficulty || prev.difficulty,
        tags: response.data.tags || [],
        companies: response.data.companies || [],
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch LeetCode data. You can still add manually.");
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError("User not found. Please refresh the page.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        title: formData.title,
        platform: formData.platform,
        wayOfSolving: formData.wayOfSolving,
        confidenceLevel: formData.confidenceLevel,
        userId: userId,
        ...(formData.platform === "LeetCode" && formData.leetcodeInput
          ? { leetcodeInput: formData.leetcodeInput }
          : { difficulty: formData.difficulty }),
        ...(formData.tags.length > 0 && { tags: formData.tags }),
        ...(formData.companies.length > 0 && { companies: formData.companies }),
      };

        try {
        await axios.post("http://localhost:5000/api/question/add-smart", payload);
        setSuccess(true);
      } catch (err) {
        if (err.response?.status === 409) {
          setError("This question already exists in your tracker. Please add a different question.");
        } else {
          setError(err.response?.data?.error || "Failed to add question. Please try again.");
        }
        setIsSubmitting(false);
        return; // Don't proceed to success state
      }
      setTimeout(async () => {
        setIsAddQuestionOpen(false);
        setFormData({
          title: "",
          platform: "LeetCode",
          leetcodeInput: "",
          difficulty: "",
          wayOfSolving: "SOLVED_SELF",
          confidenceLevel: "MEDIUM",
          tags: [],
          companies: [],
        });
        setPreviewData(null);
        setError("");
        setSuccess(false);
        
        // Refresh questions and stats
        if (userId && user) {
          try {
            const questionsResponse = await axios.get(
              `http://localhost:5000/api/question/user/${userId}`
            );
            setQuestions(questionsResponse.data || []);

            const statsResponse = await axios.get(
              `http://localhost:5000/api/user/${user.id}/dashboard`
            );
            setStats({
              totalQuestions: statsResponse.data.totalQuestions || 0,
              highConfidence: statsResponse.data.highConfidence || 0,
              mediumConfidence: statsResponse.data.mediumConfidence || 0,
              lowConfidence: statsResponse.data.lowConfidence || 0,
            });
          } catch (err) {
            console.error("Failed to refresh data:", err);
          }
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsAddQuestionOpen(false);
    setFormData({
      title: "",
      platform: "LeetCode",
      leetcodeInput: "",
      difficulty: "",
      wayOfSolving: "SOLVED_SELF",
      confidenceLevel: "MEDIUM",
      tags: [],
      companies: [],
    });
    setPreviewData(null);
    setError("");
    setSuccess(false);
  };

  // Handle question click - open detail modal
  const handleQuestionClick = async (question) => {
    setSelectedQuestion(question);
    setIsQuestionDetailOpen(true);
  };

  // Get LeetCode URL
  const getLeetCodeUrl = (question) => {
    if (question.platform === "LeetCode" && question.slug) {
      return `https://leetcode.com/problems/${question.slug}/`;
    }
    return null;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get confidence color
  const getConfidenceColor = (level) => {
    switch (level) {
      case "HIGH":
        return "bg-green-100 text-green-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get way of solving label
  const getWayOfSolvingLabel = (way) => {
    switch (way) {
      case "SOLVED_SELF":
        return "Solved Independently";
      case "TOOK_HINTS":
        return "Took Hints";
      case "USED_AI":
        return "Used AI";
      case "WATCHED_SOLUTION":
        return "Watched Solution";
      default:
        return way;
    }
  };

  // Helper function to get confidence-based star count (for display)
  const getConfidenceStars = (confidenceLevel) => {
    switch (confidenceLevel) {
      case "HIGH":
        return 5;
      case "MEDIUM":
        return 3;
      case "LOW":
        return 1;
      default:
        return 3;
    }
  };

  const renderStars = (count) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={14}
            className={index < count ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm lg:hidden">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="rounded-lg p-2 hover:bg-gray-100"
                    >
                        <Menu size={24} className="text-gray-700" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="CodeTrack" className="h-8 w-8" />
                        <span className="font-bold text-gray-900">CodeTrack</span>
                    </div>
                    <UserButton />
                </div>
            </div>

            <div className="flex">
                {/* Sidebar - Simpler Design */}
                <aside
                    className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div className="flex h-full flex-col p-4">
                        {/* Logo */}
                        <div className="mb-8 flex items-center gap-3 px-2">
                            <img src="/logo.png" alt="CodeTrack" className="h-10 w-10" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">CodeTrack</h1>
                                <p className="text-xs text-gray-500">by students, for students</p>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="ml-auto rounded-lg p-1 hover:bg-gray-100 lg:hidden"
                            >
                                <CircleX size={18} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2 border-t border-gray-200">
                            <button
                                onClick={() => navigate("/")}
                                className="mt-3 cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 bg-blue-50 font-medium text-blue-700"
                            >
                                <LayoutDashboard size={20} className="text-blue-600" />
                                <span className="font-semibold text-blue-700">Dashboard</span>
                            </button>
                            <button
                                onClick={() => navigate("/today")}
                                className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
                            >
                                <Calendar size={20} className="text-gray-600" />
                                <span>Today's Plan</span>
                            </button>
                            <button
                                onClick={() => navigate("/profile")}
                                className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
                            >
                                <User size={20} className="text-gray-600" />
                                <span>Profile</span>
                            </button>
                        </nav>

                        {/* User Info */}
                        <div className="mt-auto border-t border-gray-200 pt-4">
                            <div className="rounded-lg border border-gray-200 p-3">
                                <div className="flex items-center gap-3">
                                    <UserButton />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {user?.fullName || "Coder"}
                                        </p>
                                        <p className="text-xs text-gray-500">Free Plan</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut({ redirectUrl: "/" })}
                                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/20 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              {/* Stats Section */}
              <div className="mb-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Total Questions Card */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-blue-100">
                          Total Questions Tracked
                        </h3>
                        <div className="mb-4 flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white sm:text-5xl">∑</span>
                          <span className="text-4xl font-bold text-white sm:text-5xl">
                            {stats.totalQuestions}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/20 p-2">
                        <BarChart3 size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-blue-100">
                      {stats.totalQuestions > 0 ? (
                        <span className="font-medium">Keep it up!</span>
                      ) : (
                        <span>Start tracking questions</span>
                      )}
                    </div>
                  </div>

                  {/* High Confidence Card */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-emerald-100">
                          High Confidence Questions
                        </h3>
                        <p className="text-4xl font-bold text-white sm:text-5xl">
                          {stats.highConfidence}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/20 p-2">
                        <Target size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-emerald-100">
                      {stats.highConfidence > 0 ? (
                        <span className="font-medium">Great progress!</span>
                      ) : (
                        <span>Build your confidence</span>
                      )}
                    </div>
                  </div>

                  {/* Low Confidence Card */}
                  <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-6 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-amber-100">
                          Low Confidence Questions
                        </h3>
                        <p className="text-4xl font-bold text-white sm:text-5xl">
                          {stats.lowConfidence}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/20 p-2">
                        <Target size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-amber-100">
                      Needs review
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Add Section */}
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddQuestionOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
                  >
                    <Plus size={20} />
                    Add Question
                  </button>
                </div>
              </div>

              {/* Questions List Section */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Quiz Options</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="hidden sm:inline">Sorted by:</span>
                    <select className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm focus:outline-none">
                      <option>Difficulty</option>
                      <option>Recent</option>
                      <option>Rating</option>
                    </select>
                  </div>
                </div>

                <div className="">
                  {isLoadingQuestions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={32} className="animate-spin text-blue-600" />
                      <span className="ml-3 text-gray-600">Loading questions...</span>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No questions tracked yet.</p>
                      <button
                        onClick={() => setIsAddQuestionOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                      >
                        <Plus size={18} />
                        Add Your First Question
                      </button>
                    </div>
                  ) : (
                    questions.map((question, index) => (
                      <div
                        key={question._id || question.id}
                        onClick={() => handleQuestionClick(question)}
                        className={`rounded-xl border border-gray-200 p-5 transition-all hover:border-blue-200 hover:shadow-md cursor-pointer ${index % 2 === 0 ? "bg-[#344367]" : "bg-[#0F172A]"}`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Question Info */}
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="font-mono text-sm font-medium text-gray-400">
                                #{index + 1}
                              </span>
                              <h4 className="text-lg font-semibold text-white">
                                {question.title}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <span
                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                  question.difficulty === "Easy"
                                    ? "bg-green-100 text-green-800"
                                    : question.difficulty === "Hard"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {question.difficulty}
                              </span>
                              <span className="text-xs text-gray-400">
                                {question.platform}
                              </span>
                              {question.tags && question.tags.length > 0 && (
                                <span className="text-xs text-gray-400">
                                  {question.tags.slice(0, 2).join(", ")}
                                  {question.tags.length > 2 && "..."}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {renderStars(getConfidenceStars(question.confidenceLevel))}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuestionClick(question);
                              }}
                              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* View All Button */}
                <div className="mt-6 flex justify-center">
                  <button className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100">
                    View All Questions
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Question Modal */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Add New Question</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track your coding practice with smart revision scheduling
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <CircleX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, platform: e.target.value }));
                    setPreviewData(null);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="LeetCode">LeetCode</option>
                  <option value="GFG">GeeksforGeeks</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="CodeChef">CodeChef</option>
                  <option value="HackerRank">HackerRank</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* LeetCode Input (if LeetCode) */}
              {formData.platform === "LeetCode" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LeetCode Link, Slug, or Title
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.leetcodeInput}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, leetcodeInput: e.target.value }))
                      }
                      placeholder="https://leetcode.com/problems/two-sum/ or two-sum or Two Sum"
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={handlePreviewLeetCode}
                      disabled={!formData.leetcodeInput || isLoadingPreview}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isLoadingPreview ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Data */}
              {previewData && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span className="font-medium text-green-900">Metadata Fetched Successfully</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {previewData.title}
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>{" "}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          previewData.difficulty === "Easy"
                            ? "bg-green-100 text-green-800"
                            : previewData.difficulty === "Hard"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {previewData.difficulty}
                      </span>
                    </div>
                    {previewData.tags.length > 0 && (
                      <div>
                        <span className="font-medium">Tags:</span> {previewData.tags.join(", ")}
                      </div>
                    )}
                    {previewData.companies.length > 0 && (
                      <div>
                        <span className="font-medium">Companies:</span>{" "}
                        {previewData.companies.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Title (manual or from preview) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  placeholder="Enter question title"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Difficulty (manual if not LeetCode or fetch failed) */}
              {formData.platform !== "LeetCode" || (!previewData && !formData.leetcodeInput) ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
                    }
                    required={formData.platform !== "LeetCode" || !previewData}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              ) : null}

              {/* Way of Solving */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you solve it? *
                </label>
                <select
                  value={formData.wayOfSolving}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, wayOfSolving: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="SOLVED_SELF">Solved independently</option>
                  <option value="TOOK_HINTS">Took hints</option>
                  <option value="USED_AI">Used AI assistance</option>
                  <option value="WATCHED_SOLUTION">Watched solution</option>
                </select>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level *
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    value={
                      formData.confidenceLevel === "LOW"
                        ? 0
                        : formData.confidenceLevel === "MEDIUM"
                        ? 1
                        : 2
                    }
                    onChange={(e) => {
                      const levels = ["LOW", "MEDIUM", "HIGH"];
                      setFormData((prev) => ({
                        ...prev,
                        confidenceLevel: levels[parseInt(e.target.value)],
                      }));
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                  <div className="text-center">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                        formData.confidenceLevel === "LOW"
                          ? "bg-red-100 text-red-800"
                          : formData.confidenceLevel === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {formData.confidenceLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600" />
                  <span className="text-sm text-red-900">{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600" />
                  <span className="text-sm text-green-900">Question added successfully!</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || (!formData.difficulty && formData.platform !== "LeetCode" && !previewData)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Question"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Detail Modal */}
      {isQuestionDetailOpen && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedQuestion.title}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedQuestion.platform} • Added {formatDate(selectedQuestion.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsQuestionDetailOpen(false);
                  setSelectedQuestion(null);
                }}
                className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <CircleX size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Metadata Section */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Difficulty</div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                      selectedQuestion.difficulty === "Easy"
                        ? "bg-green-100 text-green-800"
                        : selectedQuestion.difficulty === "Hard"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedQuestion.difficulty}
                  </span>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Current Confidence</div>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getConfidenceColor(
                      selectedQuestion.confidenceLevel
                    )}`}
                  >
                    {selectedQuestion.confidenceLevel}
                  </span>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Revision Count</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedQuestion.revisionCount || 0}
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Next Revision</div>
                  <div className="text-sm text-gray-900">
                    {selectedQuestion.nextRevisionAt
                      ? formatDate(selectedQuestion.nextRevisionAt)
                      : "Not scheduled"}
                  </div>
                </div>
              </div>

              {/* Tags and Companies */}
              {(selectedQuestion.tags?.length > 0 ||
                selectedQuestion.companies?.length > 0) && (
                <div className="space-y-3">
                  {selectedQuestion.tags?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Topics</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedQuestion.companies?.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Companies</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuestion.companies.map((company, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Revision History / Confidence Trend */}
              {selectedQuestion.revisionHistory?.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-gray-700" />
                    <h4 className="text-lg font-semibold text-gray-900">Revision History</h4>
                  </div>
                  <div className="space-y-3">
                    {selectedQuestion.revisionHistory
                      .slice()
                      .reverse()
                      .map((revision, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-white p-3 border border-gray-200"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${getConfidenceColor(
                                  revision.confidenceLevel
                                )}`}
                              >
                                {revision.confidenceLevel}
                              </span>
                              <span className="text-xs text-gray-600">
                                {getWayOfSolvingLabel(revision.wayOfSolving)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(revision.revisedAt)} • Interval: {revision.intervalUsed}{" "}
                              days
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-700 mb-3">Current Status</div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-gray-600">Last Solved:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedQuestion.lastSolvedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-gray-600">Way of Solving:</span>
                    <span className="font-medium text-gray-900">
                      {getWayOfSolvingLabel(selectedQuestion.wayOfSolving)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {getLeetCodeUrl(selectedQuestion) && (
                  <a
                    href={getLeetCodeUrl(selectedQuestion)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 font-medium text-white hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    <ExternalLink size={18} />
                    Solve on LeetCode
                  </a>
                )}
                <button
                  onClick={() => {
                    setIsQuestionDetailOpen(false);
                    setSelectedQuestion(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}