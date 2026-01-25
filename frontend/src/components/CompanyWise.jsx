import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import {
  Building2,
  ChevronRight,
  Loader2,
  Search,
  X,
  Calendar,
  Home,
  User,
  ArrowLeft,
  Filter,
  Menu,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  CircleX,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

const CompanyWise = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [companies, setCompanies] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionMeta, setQuestionMeta] = useState({});
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);
  const [isQuestionLoading, setIsQuestionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDifficulty, setFilteredDifficulty] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/company-sheets");
        setCompanies(response.data || []);
        
      } catch (err) {
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!searchTerm) return companies;
    return companies.filter((company) =>
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const filteredQuestions = useMemo(() => {
    if (!selectedCompany) return [];
    
    const questionsList = questions.map(q => ({
      ...q,
      meta: questionMeta[q.title]
    }));
    
    if (filteredDifficulty === "All") return questionsList;
    
    return questionsList.filter(q => 
      q.meta?.difficulty?.toLowerCase() === filteredDifficulty.toLowerCase()
    );
  }, [questions, questionMeta, selectedCompany, filteredDifficulty]);

  const progressStats = useMemo(() => {
    const completedCount = Object.values(completedQuestions).filter(Boolean).length;
    const difficultyCounts = questions.reduce(
      (acc, question) => {
        const difficulty = questionMeta[question.title]?.difficulty;
        if (difficulty === "Easy") acc.easy += 1;
        if (difficulty === "Medium") acc.medium += 1;
        if (difficulty === "Hard") acc.hard += 1;
        return acc;
      },
      { easy: 0, medium: 0, hard: 0 }
    );

    const total = questions.length;
    const progress = total ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      completedCount,
      progress,
      ...difficultyCounts,
    };
  }, [questions, questionMeta, completedQuestions]);

  const fetchCompanyQuestions = async (company) => {
    setSelectedCompany(company);
    setLoadingQuestions(true);
    setQuestions([]);
    setQuestionMeta({});
    setCompletedQuestions({});
    setActiveQuestion(null);
    setQuestionDetails(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/company-sheets/${company._id}`
      );
      const fetchedQuestions = response.data?.questions || [];
      setQuestions(fetchedQuestions);

      const metadataEntries = await Promise.all(
        fetchedQuestions.map(async (item) => {
          try {
            const metaResponse = await axios.post(
              "http://localhost:5000/api/question/preview-leetcode",
              { input: item.title }
            );
            return [item.title, metaResponse.data];
          } catch (err) {
            return [item.title, null];
          }
        })
      );

      setQuestionMeta(Object.fromEntries(metadataEntries));
      if (user?.id) {
        const progressResponse = await axios.get(
          `http://localhost:5000/api/company-sheets/${company._id}/progress`,
          { params: { clerkUserId: user.id } }
        );
        const completedMap = (progressResponse.data?.completed || []).reduce(
          (acc, title) => ({ ...acc, [title]: true }),
          {}
        );
        setCompletedQuestions(completedMap);
      }
    } catch (err) {
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleQuestionClick = async (questionTitle) => {
    setActiveQuestion(questionTitle);
    setIsQuestionLoading(true);
    setQuestionDetails(null);

    try {
      const metaRes = await axios.post(
        "http://localhost:5000/api/question/preview-leetcode",
        { input: questionTitle }
      );
      setQuestionDetails(metaRes.data);
    } catch (err) {
      setQuestionDetails(null);
    } finally {
      setIsQuestionLoading(false);
    }
  };
  

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
    setQuestions([]);
    setQuestionMeta({});
    setActiveQuestion(null);
    setQuestionDetails(null);
  };

  const getSafeHtml = (htmlString) => {
    if (!htmlString) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    doc.querySelectorAll("script, style").forEach((node) => node.remove());
    return doc.body.innerHTML;
  };

  const toggleQuestionComplete = async (title) => {
    if (!isLoaded || !user || !selectedCompany) return;
    const nextValue = !completedQuestions[title];
    setCompletedQuestions((prev) => ({
      ...prev,
      [title]: nextValue,
    }));

    try {
      await axios.put(
        `http://localhost:5000/api/company-sheets/${selectedCompany._id}/progress`,
        {
          clerkUserId: user.id,
          questionTitle: title,
          completed: nextValue,
        }
      );
    } catch (err) {
      setCompletedQuestions((prev) => ({
        ...prev,
        [title]: !nextValue,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex h-screen sticky top-0 flex-col p-4">
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
                  onClick={() => navigate("/dashboard")}
                  className="mt-3 cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 "
                >
                  <LayoutDashboard size={20} className="text-gray-600" />
                  <span>Dashboard</span>
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
                  className="cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 bg-blue-50 font-medium text-blue-700"
                >
                  <Building2 size={20} className="text-blue-600" />
                  <span className="font-semibold text-blue-700">Company-Wise Question</span>
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
        <main className="flex-1 ">
        <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
            </div>
          <div className="p-4 sm:p-6 lg:p-8">
          {!selectedCompany ? (
            // Company Selection View
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Company-Wise Questions
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Browse questions by company and track your progress. Made by students for students.
                </p>
              </div>

              <div className="mb-6 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search companies (Google, Amazon, Microsoft...)"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {loadingCompanies ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-gray-500 shadow-sm">
                  <div className="relative mb-4">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="text-blue-600" size={20} />
                    </div>
                  </div>
                  <p className="text-sm">Loading companies...</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company._id}
                      onClick={() => fetchCompanyQuestions(company)}
                      className="cursor-pointer group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:scale-[1.02] hover:border-blue-400 hover:shadow-lg"
                    >
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <ChevronRight className="text-blue-500" size={20} />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                          <Building2 className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {company.companyName}
                          </h3>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {company.questionCount} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loadingCompanies && filteredCompanies.length === 0 && (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <Search className="mx-auto mb-3 text-gray-400" size={24} />
                  <p className="text-gray-600">No companies found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Try a different search term
                  </p>
                </div>
              )}
            </>
          ) : (
            // Questions View for Selected Company
            <>
              <div className="mb-6">
                <button
                  onClick={handleBackToCompanies}
                  className=" cursor-pointer group mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                  <span className="text-sm font-medium">Back to companies</span>
                </button>
                
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-50">
                        <Building2 className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                          {selectedCompany.companyName}
                        </h1>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {questions.length} questions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProgressOpen(true)}
                    className="w-full md:w-auto rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Track Progress
                  </button>
                </div>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilteredDifficulty("All")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredDifficulty === "All"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilteredDifficulty("Easy")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredDifficulty === "Easy"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setFilteredDifficulty("Medium")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredDifficulty === "Medium"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setFilteredDifficulty("Hard")}
                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${filteredDifficulty === "Hard"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : "bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Hard
                  </button>
                </div>
                
              </div>

              {loadingQuestions ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-gray-500 shadow-sm">
                  <div className="relative mb-4">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="text-blue-600" size={20} />
                    </div>
                  </div>
                  <p className="text-sm">Loading questions...</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Fetching from LeetCode
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((question, index) => {
                    const meta = question.meta;
                    const isCompleted = Boolean(completedQuestions[question.title]);
                    return (
                      <div
                        key={question.title}
                        onClick={() => handleQuestionClick(question.title)}
                        className={`group cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                          isCompleted
                            ? "border-green-600 bg-green-100 hover:border-green-700"
                            : "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {index + 1}
                              </span>
                              <h3 className={`font-semibold text-gray-900 ${isCompleted ? "text-black" : "group-hover:text-blue-700"}`}>
                                {question.title}
                              </h3>
                              {isCompleted && (
                                <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
                                  Completed
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="flex flex-wrap gap-2">
                                {(question.tags || []).slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {question.tags && question.tags.length > 3 && (
                                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-400">
                                    +{question.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${meta?.difficulty === "Easy"
                                    ? "bg-green-50 text-green-700"
                                    : meta?.difficulty === "Hard"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-yellow-50 text-yellow-700"
                                  }`}
                              >
                                <div className={`h-1.5 w-1.5 rounded-full ${meta?.difficulty === "Easy"
                                    ? "bg-green-500"
                                    : meta?.difficulty === "Hard"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }`} />
                                {meta?.difficulty || "Unknown"}
                              </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!loadingQuestions && filteredQuestions.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                  <Filter className="mx-auto mb-4 text-gray-400" size={32} />
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">
                    No questions found
                  </h3>
                  <p className="text-gray-500">
                    {filteredDifficulty !== "All"
                      ? `No ${filteredDifficulty.toLowerCase()} questions found`
                      : "No questions available for this company"}
                  </p>
                  {filteredDifficulty !== "All" && (
                    <button
                      onClick={() => setFilteredDifficulty("All")}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Show all questions →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          </div>
        </main>

      </div>

      {/* Question Details Modal */}
      {activeQuestion && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            setActiveQuestion(null);
            setQuestionDetails(null);
          }}
        >
          <div 
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-50">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeQuestion}
                    </h3>
                    <div className="mt-1 flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${questionDetails?.difficulty === "Easy"
                          ? "bg-green-50 text-green-700"
                          : questionDetails?.difficulty === "Hard"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${questionDetails?.difficulty === "Easy"
                            ? "bg-green-500"
                            : questionDetails?.difficulty === "Hard"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`} />
                        {questionDetails?.difficulty || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedCompany?.companyName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveQuestion(null);
                  setQuestionDetails(null);
                }}
                className="cursor-pointer ml-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {isQuestionLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="relative mb-4">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={16} />
                  </div>
                </div>
                <p className="text-sm">Loading question details...</p>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(questionDetails?.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <h4 className="mb-3 font-semibold text-gray-900">Description</h4>
                   {questionDetails?.content || questionDetails?.description ? (
                     <div
                      className="prose prose-sm max-w-none text-gray-700 break-words [overflow-wrap:anywhere] [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_code]:break-words [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
                       dangerouslySetInnerHTML={{
                         __html: getSafeHtml(
                           questionDetails?.content || questionDetails?.description
                         ),
                       }}
                     />
                   ) : (
                     <p className="text-gray-500">
                       Question description not available. Try visiting LeetCode for more details.
                     </p>
                   )}
                </div>

                {questionDetails?.hints && questionDetails.hints.length > 0 && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                    <h4 className="mb-3 font-semibold text-blue-900 flex items-center gap-2">
                      <Star size={16} />
                      Hints
                    </h4>
                    <ul className="space-y-2">
                      {questionDetails.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold">
                            {index + 1}
                          </span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleQuestionComplete(activeQuestion)}
                    className={`cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white ${
                      completedQuestions[activeQuestion]
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {completedQuestions[activeQuestion] ? "Completed" : "Mark as Complete"}
                  </button>
                    <button className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100">
                      <Link to={`https://leetcode.com/problems/${questionDetails?.slug}/`} target="_blank">
                        Practice on LeetCode
                      </Link>
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isProgressOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40 px-4 pt-18">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <p className="text-xs text-gray-500">
                  {selectedCompany?.companyName || "Company"} overview
                </p>
              </div>
              <button
                onClick={() => setIsProgressOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#101828] p-4 text-white">
              <div className="flex items-center gap-4">
                <div
                  className="relative h-20 w-20 rounded-full"
                  style={{
                    background: `conic-gradient(#22c55e ${progressStats.progress}%, #1f2937 0)`,
                  }}
                >
                  <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-[#101828]">
                    <span className="text-lg font-semibold">
                      {progressStats.completedCount}
                    </span>
                    <span className="text-[10px] text-white/70">completed</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-emerald-300">Easy</span>
                    <span className="font-semibold">{progressStats.easy}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-amber-300">Medium</span>
                    <span className="font-semibold">{progressStats.medium}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-rose-300">Hard</span>
                    <span className="font-semibold">{progressStats.hard}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/60">
                {progressStats.total} total questions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyWise;