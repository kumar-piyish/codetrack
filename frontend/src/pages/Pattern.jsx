import { useEffect, useMemo, useState } from "react"
import api from "../utils/api";
import {
  BookOpen,
  Layers,
  ListChecks,
  Puzzle,
  Sparkles,
  ChevronRight,
  X,
  ExternalLink,
  Loader2,
  Hash,
  Type,
  Filter,
  Code,
  Terminal,
  FileCode
} from "lucide-react";
import patternsData from "../../data/patterns.json";
import { CircleX, LayoutDashboard, Calendar, Building2, User, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { UserButton } from "@clerk/clerk-react";


const normalizeTitle = (title) =>
  title.replace(/^\s*(\d+\s*\.?\s*)+/i, "").trim();

const buildProgressKey = (categoryTitle, patternId, questionTitle) =>
  `${categoryTitle}||${patternId}||${questionTitle}`;

const getSafeHtml = (htmlString) => {
  if (!htmlString) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  doc.querySelectorAll("script, style").forEach((node) => node.remove());
  return doc.body.innerHTML;
};

const extractExamples = (htmlString) => {
  if (!htmlString) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return Array.from(doc.querySelectorAll("pre"))
    .map((node) => node.textContent?.trim())
    .filter(Boolean);
};

const getDescriptionHtml = (htmlString) => {
  if (!htmlString) return "";
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  doc.querySelectorAll("script, style, pre").forEach((node) => node.remove());
  return doc.body.innerHTML;
};

const difficultyColor = {
  Easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Hard: "bg-rose-100 text-rose-800 border-rose-200"
};

const Pattern = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedPatternQuestions, setCompletedPatternQuestions] = useState({});
  const [patternProgressEntries, setPatternProgressEntries] = useState([]);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const categories = useMemo(() => {
    const patternRoot = patternsData?.pattern || {};
    return Object.entries(patternRoot).map(([title, value], index) => {
      const patternCount = Object.keys(value?.patterns || {}).length;
      return {
        title,
        patternCount,
        description: `Master ${patternCount} essential patterns`
      };
    });
  }, []);

  const patternCards = useMemo(() => {
    if (!selectedCategory) return [];
    const category = patternsData?.pattern?.[selectedCategory];
    const patterns = category?.patterns || {};
    return Object.entries(patterns)
      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10))
      .map(([id, value], index) => {
        const questions = value?.["array of questions title"] || [];
        return {
          id,
          title: value?.["name of pattern"] || "Pattern",
          questionCount: questions.length,
          questions,
          patternNumber: parseInt(id, 10)
        };
      });
  }, [selectedCategory]);

  const questionList = selectedPattern?.questions || [];

  useEffect(() => {
    if (!selectedCategory) {
      setPatternProgressEntries([]);
      setCompletedPatternQuestions({});
      return;
    }
    if (!isLoaded || !user) return;

    const fetchProgress = async () => {
      try {
        const response = await api.get("/api/patterns/progress", {
          params: { clerkUserId: user.id, category: selectedCategory },
        });
        const completed = response.data?.completed || [];
        const nextMap = {};
        completed.forEach((entry) => {
          const key = buildProgressKey(
            entry.categoryTitle,
            entry.patternId,
            entry.questionTitle
          );
          nextMap[key] = true;
        });
        setPatternProgressEntries(completed);
        setCompletedPatternQuestions(nextMap);
      } catch (err) {
        setPatternProgressEntries([]);
        setCompletedPatternQuestions({});
      }
    };

    fetchProgress();
  }, [isLoaded, selectedCategory, user]);

  const handleCategorySelect = (title) => {
    setSelectedCategory(title);
    setSelectedPattern(null);
    setActiveQuestion(null);
    setQuestionDetails(null);
  };

  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    setActiveQuestion(null);
    setQuestionDetails(null);
  };

  const handleQuestionClick = async (questionTitle) => {
    const cleanedTitle = normalizeTitle(questionTitle);
    setActiveQuestion(cleanedTitle);
    setIsQuestionLoading(true);
    setQuestionDetails(null);

    try {
      const metaRes = await api.post(
        "/api/question/preview-leetcode",
        { input: cleanedTitle }
      );
      setQuestionDetails(metaRes.data);
    } catch (err) {
      setQuestionDetails(null);
    } finally {
      setIsQuestionLoading(false);
    }
  };

  const closeQuestionModal = () => {
    setActiveQuestion(null);
    setQuestionDetails(null);
  };

  const getPatternCompletedCount = (pattern) => {
    if (!pattern) return 0;
    return (pattern.questions || []).reduce((count, questionTitle) => {
      const cleanedTitle = normalizeTitle(questionTitle);
      const key = buildProgressKey(selectedCategory, pattern.id, cleanedTitle);
      return completedPatternQuestions[key] ? count + 1 : count;
    }, 0);
  };

  const categoryProgressStats = useMemo(() => {
    if (!selectedCategory) return null;
    const totalQuestions = patternCards.reduce(
      (sum, pattern) => sum + (pattern.questionCount || 0),
      0
    );
    const patternStats = patternCards.map((pattern) => {
      const completed = getPatternCompletedCount(pattern);
      return {
        id: pattern.id,
        title: pattern.title,
        completed,
        total: pattern.questionCount || 0,
      };
    });
    const completedCount = patternStats.reduce(
      (sum, item) => sum + item.completed,
      0
    );
    const progress = totalQuestions
      ? Math.round((completedCount / totalQuestions) * 100)
      : 0;

    return {
      totalQuestions,
      completedCount,
      progress,
      patternStats,
    };
  }, [completedPatternQuestions, patternCards, selectedCategory]);

  const patternProgressStats = useMemo(() => {
    if (!selectedPattern) return null;
    const totalQuestions = selectedPattern.questionCount || 0;
    const completedCount = getPatternCompletedCount(selectedPattern);
    const progress = totalQuestions
      ? Math.round((completedCount / totalQuestions) * 100)
      : 0;

    return {
      totalQuestions,
      completedCount,
      progress,
    };
  }, [completedPatternQuestions, selectedPattern]);

  const togglePatternQuestionComplete = async (questionTitle) => {
    if (!isLoaded || !user || !selectedCategory || !selectedPattern) return;
    const cleanedTitle = normalizeTitle(questionTitle);
    const key = buildProgressKey(selectedCategory, selectedPattern.id, cleanedTitle);
    const nextValue = !completedPatternQuestions[key];
    const prevMap = { ...completedPatternQuestions };
    const prevEntries = [...patternProgressEntries];

    setCompletedPatternQuestions((prev) => {
      const next = { ...prev };
      if (nextValue) {
        next[key] = true;
      } else {
        delete next[key];
      }
      return next;
    });

    setPatternProgressEntries((prev) => {
      if (nextValue) {
        const exists = prev.some(
          (item) =>
            item.categoryTitle === selectedCategory &&
            String(item.patternId) === String(selectedPattern.id) &&
            item.questionTitle === cleanedTitle
        );
        if (exists) return prev;
        return [
          ...prev,
          {
            categoryTitle: selectedCategory,
            patternId: String(selectedPattern.id),
            questionTitle: cleanedTitle,
          },
        ];
      }
      return prev.filter(
        (item) =>
          !(
            item.categoryTitle === selectedCategory &&
            String(item.patternId) === String(selectedPattern.id) &&
            item.questionTitle === cleanedTitle
          )
      );
    });

    try {
      await api.put("/api/patterns/progress", {
        clerkUserId: user.id,
        categoryTitle: selectedCategory,
        patternId: String(selectedPattern.id),
        questionTitle: cleanedTitle,
        completed: nextValue,
      });
    } catch (err) {
      setCompletedPatternQuestions(prevMap);
      setPatternProgressEntries(prevEntries);
    }
  };

  const examples = extractExamples(questionDetails?.content);
  const descriptionHtml = getDescriptionHtml(questionDetails?.content);
  const activeProgressKey =
    selectedPattern && activeQuestion
      ? buildProgressKey(selectedCategory, selectedPattern.id, activeQuestion)
      : null;
  const isActiveCompleted = activeProgressKey
    ? Boolean(completedPatternQuestions[activeProgressKey])
    : false;

  return (
    <div className="flex">
      {/* Sidebar - Simpler Design */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-screen sticky top-0 flex-col p-4">
          {/* Logo */}
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <img src="/logo.png" alt="Codyssey" className="h-8 w-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Codyssey</h1>

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
              onClick={() => navigate("/dashboard")}
              className="mt-3 cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
            >
              <LayoutDashboard size={20} />
              <span >Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/today")}
              className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
            >
              <Calendar size={20} className="text-gray-600" />
              <span>Today's Plan</span>
            </button>
            <button
              onClick={() => navigate("/company-wise")}
              className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
            >
              <Building2 size={20} className="text-gray-600" />
              <span>Company-Wise Question</span>
            </button>
            <button
              onClick={() => navigate("/patterns")}
              className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 bg-blue-50 font-medium text-blue-700"
            >
              <img src="https://cdn-icons-png.freepik.com/512/1306/1306252.png" alt="Patterns" className="h-6 w-6 text-gray-600" />
              <span className="font-semibold text-blue-700">Patterns Library</span>
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
                className="cursor-pointer mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
            <img src="/logo.png" alt="Codyssey" className="h-8 w-12" />
          </div>
        </div>

        {/* Pattern Component Content */}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
          {/* Header */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-2">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      Pattern Library
                    </h1>
                    <p className="text-sm text-slate-600">
                      Structured learning for systematic mastery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            {(selectedCategory || selectedPattern) && (
              <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedPattern(null);
                  }}
                  className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900"
                >
                  All Categories
                </button>
                {selectedCategory && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <button
                      onClick={() => setSelectedPattern(null)}
                      className="rounded-lg px-3 py-1.5 hover:bg-slate-100 hover:text-slate-900"
                    >
                      {selectedCategory}
                    </button>
                  </>
                )}
                {selectedPattern && (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    <span className="rounded-lg bg-blue-100 px-3 py-1.5 font-medium text-blue-700">
                      {selectedPattern.title}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Category Selection */}
            {!selectedCategory && (
              <div className="mt-8">
                <div className="mb-6 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-slate-500" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    Pattern Categories
                  </h2>
                  <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {categories.length} categories
                  </span>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map(({ title, patternCount, description }) => (
                    <button
                      key={title}
                      type="button"
                      onClick={() => handleCategorySelect(title)}
                      className="cursor-pointer group relative overflow-hidden rounded-xl border border-slate-300 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <ChevronRight className="h-5 w-5 text-blue-500" />
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                        {title}
                      </h3>
                      <p className="mb-4 text-sm text-slate-600">{description}</p>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {patternCount} patterns
                        </span>
                        <span className="text-xs text-slate-500">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pattern Selection */}
            {selectedCategory && !selectedPattern && (
              <div className="mt-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {selectedCategory}
                      </h2>
                      <p className="text-sm text-slate-600">
                        Select a pattern to explore questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsProgressOpen(true)}
                      className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Track Progress
                    </button>
                    <button
                      onClick={() => handleCategorySelect(null)}
                      className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {patternCards.map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => handlePatternSelect(pattern)}
                      className="cursor-pointer group relative overflow-hidden rounded-xl border border-slate-300 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <ChevronRight className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 p-2.5 w-12 h-12 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {pattern.patternNumber.toString().padStart(2, '0')}
                          </span>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {pattern.questionCount} Q
                        </span>
                      </div>
                      <h3 className="mb-2 font-semibold text-slate-900 group-hover:text-blue-700">
                        {pattern.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {pattern.questionCount} curated questions
                      </p>
                      {selectedCategory && (
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          {getPatternCompletedCount(pattern)} of {pattern.questionCount} completed
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <FileCode className="h-3 w-3" />
                        Tap to explore →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Questions List */}
            {selectedPattern && (
              <div className="mt-8">
                <div className="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {selectedCategory}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                          Pattern #{selectedPattern.id}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {selectedPattern.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        Master this pattern through {selectedPattern.questionCount} carefully selected problems
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsProgressOpen(true)}
                        className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Track Progress
                      </button>
                      <button
                        onClick={() => setSelectedPattern(null)}
                        className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        ← Patterns
                      </button>
                      <button
                        onClick={() => handleCategorySelect(null)}
                        className="cursor-pointer rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Categories
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {questionList.map((questionTitle, index) => {
                    const cleanedTitle = normalizeTitle(questionTitle);
                    const progressKey = buildProgressKey(
                      selectedCategory,
                      selectedPattern.id,
                      cleanedTitle
                    );
                    const isCompleted = Boolean(completedPatternQuestions[progressKey]);
                    return (
                      <button
                        key={questionTitle}
                        type="button"
                        onClick={() => handleQuestionClick(questionTitle)}
                        className={`cursor-pointer group relative overflow-hidden rounded-lg border p-4 text-left transition-all duration-200 hover:shadow-sm ${
                          isCompleted
                            ? "border-green-600 bg-green-100 hover:border-green-700"
                            : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 group-hover:bg-blue-100">
                              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                                {(index + 1).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 group-hover:text-blue-800">
                                {cleanedTitle}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Click to preview problem details
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {isCompleted && (
                              <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                                Completed
                              </span>
                            )}
                            <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Question Modal */}
          {activeQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-2">
                          <Terminal className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600">
                            Problem Preview
                          </p>
                          <h3 className="mt-1 text-xl font-bold text-slate-900">
                            {questionDetails?.title || activeQuestion}
                          </h3>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {questionDetails?.difficulty && (
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyColor[questionDetails.difficulty] || 'bg-slate-100 text-slate-800'}`}>
                            {questionDetails.difficulty}
                          </span>
                        )}
                        {questionDetails?.acceptance && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {questionDetails.acceptance}% Accepted
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={closeQuestionModal}
                      className="cursor-pointer ml-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isQuestionLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                        <p className="mt-3 text-sm text-slate-600">
                          Fetching problem details...
                        </p>
                      </div>
                    </div>
                  ) : questionDetails ? (
                    <div className="space-y-8">
                      {/* Tags */}
                      {questionDetails?.tags?.length > 0 && (
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Hash className="h-4 w-4" />
                            Topics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {questionDetails.tags.slice(0, 6).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <Type className="h-4 w-4" />
                          Description
                        </h4>
                        <div className="prose prose-sm max-w-none text-slate-700">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getSafeHtml(descriptionHtml),
                            }}
                          />
                        </div>
                      </div>

                      {/* Examples */}
                      {examples.length > 0 && (
                        <div>
                          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <FileCode className="h-4 w-4" />
                            Examples
                          </h4>
                          <div className="space-y-4">
                            {examples.map((example, index) => (
                              <div
                                key={index}
                                className="overflow-hidden rounded-lg border border-slate-300 bg-slate-50"
                              >
                                <div className="border-b border-slate-300 bg-slate-100 px-4 py-2">
                                  <span className="text-xs font-medium text-slate-700">
                                    Example {index + 1}
                                  </span>
                                </div>
                                <pre className="whitespace-pre-wrap p-4 text-sm text-slate-800">
                                  {example}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LeetCode Link */}
                      {selectedPattern && activeQuestion && (
                        <div className="flex flex-wrap gap-3 pt-4">
                          <button
                            onClick={() => togglePatternQuestionComplete(activeQuestion)}
                            className={`cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white ${
                              isActiveCompleted
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {isActiveCompleted ? "Completed" : "Mark as Complete"}
                          </button>
                        </div>
                      )}

                      {/* LeetCode Link */}
                      {questionDetails?.slug && (
                        <div className="pt-4">
                          <a
                            href={`https://leetcode.com/problems/${questionDetails.slug}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Solve on LeetCode
                            <span className="ml-2 opacity-0 transition-all group-hover:opacity-100 group-hover:ml-4">
                              →
                            </span>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Terminal className="h-6 w-6 text-slate-400" />
                      </div>
                      <h4 className="mb-2 text-lg font-semibold text-slate-900">
                        Problem Details Unavailable
                      </h4>
                      <p className="text-sm text-slate-600">
                        Couldn't fetch details for this problem. Try solving it directly on LeetCode.
                      </p>
                      <a
                        href={`https://leetcode.com/problems/${encodeURIComponent(activeQuestion.toLowerCase().replace(/\s+/g, '-'))}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Try LeetCode Directly
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isProgressOpen && (selectedCategory || selectedPattern) && (
            <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 px-4 pt-18">
              <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Progress
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedPattern
                        ? `${selectedPattern.title} overview`
                        : `${selectedCategory} overview`}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsProgressOpen(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-[#101828] p-4 text-white">
                  <div className="flex items-center gap-4">
                    <div
                      className="relative h-20 w-20 rounded-full"
                      style={{
                        background: `conic-gradient(#22c55e ${
                          (selectedPattern
                            ? patternProgressStats?.progress
                            : categoryProgressStats?.progress) || 0
                        }%, #1f2937 0)`,
                      }}
                    >
                      <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-[#101828]">
                        <span className="text-lg font-semibold">
                          {selectedPattern
                            ? patternProgressStats?.completedCount || 0
                            : categoryProgressStats?.completedCount || 0}
                        </span>
                        <span className="text-[10px] text-white/70">completed</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                        <span className="text-emerald-300">Total</span>
                        <span className="font-semibold">
                          {selectedPattern
                            ? patternProgressStats?.totalQuestions || 0
                            : categoryProgressStats?.totalQuestions || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                        <span className="text-slate-200">Progress</span>
                        <span className="font-semibold">
                          {(selectedPattern
                            ? patternProgressStats?.progress
                            : categoryProgressStats?.progress) || 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedPattern && categoryProgressStats?.patternStats?.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {categoryProgressStats.patternStats.map((pattern) => (
                      <div
                        key={pattern.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                      >
                        <span className="font-medium">{pattern.title}</span>
                        <span className="font-semibold">
                          {pattern.completed}/{pattern.total}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Pattern;