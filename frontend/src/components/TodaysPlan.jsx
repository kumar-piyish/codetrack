import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import {
  CircleX,
  LayoutDashboard,
  User,
  Menu,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  TrendingUp,
  Clock,
  ExternalLink,
  Target,
} from "lucide-react";

export default function TodaysPlan() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [todayPlan, setTodayPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [reviseForm, setReviseForm] = useState({
    confidenceLevel: "MEDIUM",
    wayOfSolving: "SOLVED_SELF",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [potd, setPotd] = useState(null);
  const [isLoadingPotd, setIsLoadingPotd] = useState(true);

  // Get user ID
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

  // Fetch today's plan
  useEffect(() => {
    if (!userId) return;

    const fetchTodayPlan = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/today/${userId}`, {
          timeout: 10000,
        });
        setTodayPlan(response.data);
      } catch (err) {
        console.error("Failed to fetch today's plan:", err.response?.data || err.message);
        // Set empty plan on error
        setTodayPlan({ questions: [], stats: {} });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayPlan();
  }, [userId]);

  // Fetch LeetCode POTD
  useEffect(() => {
    const fetchPOTD = async () => {
      setIsLoadingPotd(true);
      try {
        const response = await axios.get("http://localhost:5000/api/question/potd", {
          timeout: 10000, // 10 second timeout
        });
        if (response.data && response.data.title && !response.data.error) {
          setPotd(response.data);
        } else {
          setPotd(null);
        }
      } catch (err) {
        // Network errors are expected if backend is down or POTD API fails
        console.error("Failed to fetch POTD:", err.response?.data || err.message);
        setPotd(null);
      } finally {
        setIsLoadingPotd(false);
      }
    };

    fetchPOTD();
  }, []);

  // Handle mark as revised
  const handleMarkRevised = async () => {
    if (!selectedQuestion || !userId) return;

    setIsSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/today/${userId}/mark-revised`, {
        questionId: selectedQuestion._id,
        confidenceLevel: reviseForm.confidenceLevel,
        wayOfSolving: reviseForm.wayOfSolving,
      });

      // Refresh today's plan
      const response = await axios.get(`http://localhost:5000/api/today/${userId}`);
      setTodayPlan(response.data);

      setIsReviseModalOpen(false);
      setSelectedQuestion(null);
      setReviseForm({ confidenceLevel: "MEDIUM", wayOfSolving: "SOLVED_SELF" });
    } catch (err) {
      console.error("Failed to mark as revised:", err);
      alert("Failed to update question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLeetCodeUrl = (question) => {
    if (question.platform === "LeetCode" && question.slug) {
      return `https://leetcode.com/problems/${question.slug}/`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
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
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col p-4">
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

            <nav className="space-y-2 border-t border-gray-200">
              <button
                onClick={() => navigate("/")}
                className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
              >
                <LayoutDashboard size={20} className="text-gray-600" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/today")}
                className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 font-medium text-blue-700"
              >
                <Calendar size={20} className="text-blue-600" />
                <span className="font-semibold text-blue-700">Today's Plan</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
              >
                <User size={20} className="text-gray-600" />
                <span>Profile</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Today's Revision Plan
              </h2>
              <p className="text-gray-600">
                Questions scheduled for revision today, prioritized by confidence and practice needs
              </p>
            </div>

            {/* LeetCode POTD Card */}
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Calendar size={20} className="text-white" />
                    <span className="text-sm font-medium text-white/90">LeetCode Problem of the Day</span>
                  </div>
                  {isLoadingPotd ? (
                    <div className="flex items-center gap-2 text-white">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Loading POTD...</span>
                    </div>
                  ) : potd && potd.title ? (
                    <>
                      <h3 className="mb-2 text-xl font-bold text-white">{potd.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            potd.difficulty === "Easy"
                              ? "bg-green-100 text-green-800"
                              : potd.difficulty === "Hard"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {potd.difficulty}
                        </span>
                        {potd.tags?.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-white/30 px-2 py-1 text-xs font-medium text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={potd.link || `https://leetcode.com/problems/${potd.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-600 transition-colors hover:bg-purple-50 cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        Solve on LeetCode
                      </a>
                    </>
                  ) : (
                    <div className="text-white/80">
                      <p className="text-sm">POTD not available right now.</p>
                      <p className="text-xs mt-1">Visit <a href="https://leetcode.com/problemset/" target="_blank" rel="noopener noreferrer" className="underline">LeetCode</a> for today's challenge.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading today's plan...</span>
              </div>
            ) : !todayPlan ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Failed to load today's plan.</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-100">Total Due</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                          {todayPlan.stats?.total || 0}
                        </p>
                      </div>
                      <Target size={24} className="text-white opacity-80" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-100">Low Confidence</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                          {todayPlan.stats?.lowConfidence || 0}
                        </p>
                      </div>
                      <AlertCircle size={24} className="text-white opacity-80" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-100">Overdue</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                          {todayPlan.stats?.overdue || 0}
                        </p>
                      </div>
                      <Clock size={24} className="text-white opacity-80" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-100">Need Practice</p>
                        <p className="mt-2 text-3xl font-bold text-white">
                          {todayPlan.stats?.watchedOrAI || 0}
                        </p>
                      </div>
                      <TrendingUp size={24} className="text-white opacity-80" />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="mb-6 text-xl font-bold text-gray-900">Questions to Revise</h3>

                  {todayPlan.questions?.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        All caught up! 🎉
                      </p>
                      <p className="text-gray-500">
                        No questions due for revision today. Great job staying on track!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayPlan.questions?.map((question, index) => (
                        <div
                          key={question._id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-blue-200 hover:shadow-md"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-3">
                                <span className="font-mono text-sm font-medium text-gray-400">
                                  #{index + 1}
                                </span>
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {question.title}
                                </h4>
                              </div>
                              <div className="flex flex-wrap items-center gap-3">
                                <span
                                  className={`rounded-full px-3 py-1 text-sm font-medium ${getDifficultyColor(
                                    question.difficulty
                                  )}`}
                                >
                                  {question.difficulty}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-sm font-medium ${getConfidenceColor(
                                    question.confidenceLevel
                                  )}`}
                                >
                                  {question.confidenceLevel} Confidence
                                </span>
                                <span className="text-xs text-gray-500">
                                  {question.platform}
                                </span>
                                {question.daysOverdue > 0 && (
                                  <span className="text-xs font-medium text-red-600">
                                    {question.daysOverdue} days overdue
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {getLeetCodeUrl(question) && (
                                <a
                                  href={getLeetCodeUrl(question)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
                                >
                                  <ExternalLink size={16} />
                                  Solve
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedQuestion(question);
                                  setReviseForm({
                                    confidenceLevel: question.confidenceLevel,
                                    wayOfSolving: question.wayOfSolving,
                                  });
                                  setIsReviseModalOpen(true);
                                }}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                              >
                                Mark Revised
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Revise Modal */}
      {isReviseModalOpen && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">Mark as Revised</h3>
              <p className="mt-1 text-sm text-gray-600">{selectedQuestion.title}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Level
                </label>
                <select
                  value={reviseForm.confidenceLevel}
                  onChange={(e) =>
                    setReviseForm((prev) => ({ ...prev, confidenceLevel: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you solve it?
                </label>
                <select
                  value={reviseForm.wayOfSolving}
                  onChange={(e) =>
                    setReviseForm((prev) => ({ ...prev, wayOfSolving: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="SOLVED_SELF">Solved independently</option>
                  <option value="TOOK_HINTS">Took hints</option>
                  <option value="USED_AI">Used AI assistance</option>
                  <option value="WATCHED_SOLUTION">Watched solution</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsReviseModalOpen(false);
                    setSelectedQuestion(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkRevised}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Mark Revised"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
