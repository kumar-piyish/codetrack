import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserButton, useClerk, useUser } from "@clerk/clerk-react";
import axios from "axios";
import platforms from "../../data/platform";
import {
    CircleX,
    LayoutDashboard,
    Calendar,
    LogOut,
    User,
    ChevronRight,
    Menu,
    Pencil,
    Save,
    Code2,
    School,
    Target,
    Trophy,
    Clock,
    Mail,
    Globe,
    BookOpen,
    GraduationCap,
    MapPin,
    Building,
    RefreshCw,
    ExternalLink,
    TrendingUp
} from "lucide-react";

export default function Profile() {
    const navigate = useNavigate();
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [isPlansOpen, setIsPlansOpen] = useState(false);
    const [error, setError] = useState("");
    const [profileData, setProfileData] = useState({
        email: "",
        image: "",
        username: "",
        salutation: "",
        degree: "",
        fieldOfStudy: "",
        yearOfGraduation: "",
        collegeName: "",
        country: "",
        currentLevel: "intermediate",
        primaryGoal: [],
        preferredCodingLanguage: [],
        targetPlatform: [],
        dailyPractice: "",
        emailNotification: false,
        socialLinks: {
            linkedin: "",
            github: "",
            twitter: "",
            insta: "",
        },
        leetcodeUsername: "",
    });

    const [leetcodeData, setLeetcodeData] = useState({
        stats: null,
        calendar: null,
        isSyncing: false,
    });

    const levelOptions = ["beginner", "intermediate", "advanced"];
    const primaryGoalOptions = ["Placement", "DSA Mastery", "Competitive Programming", "Interview Prep"];
    const languageOptions = ["C++", "Java", "Python", "JavaScript", "C#", "Go", "Rust", "Swift"];
    const platformOptions = platforms.map((platform) => platform.name);
    const dailyPracticeOptions = ["1", "2", "3", "4", "5+"];
    const salutationOptions = [
        "Developer",
        "Software Developer",
        "Full Stack Developer",
        "Frontend Developer",
        "Backend Developer",
        "Student Developer",
        "Aspiring Developer",
    ];
    const degreeOptions = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "B.E", "M.E", "B.Com", "Other"];
    const currentYear = new Date().getFullYear();

    const yearOptions = Array.from(
        { length: 7 },
        (_, i) => (currentYear - 3 + i).toString()
    );

    const countryOptions = ["India", "United States", "Canada", "United Kingdom", "Australia", "Germany", "Other"];
    const collegeOptions = [
        "IIT Delhi",
        "IIT Bombay",
        "IIT Madras",
        "NIT Trichy",
        "BITS Pilani",
        "Stanford University",
        "MIT",
        "NSUT",
        "Harvard University",
        "Local College",
        "Other",
    ];

    // Calculate stats from LeetCode data or use defaults
    const getStats = () => {
        if (leetcodeData.stats) {
            return {
                easy: { solved: leetcodeData.stats.easySolved || 0, color: "text-teal-500" },
                medium: { solved: leetcodeData.stats.mediumSolved || 0, color: "text-yellow-500" },
                hard: { solved: leetcodeData.stats.hardSolved || 0, color: "text-red-500" },
            };
        }
        return {
            easy: { solved: 0, color: "text-teal-500" },
            medium: { solved: 0, color: "text-yellow-500" },
            hard: { solved: 0, color: "text-red-500" },
        };
    };

    const stats = getStats();
    const totalSolved = leetcodeData.stats?.totalSolved || 0;
    
    // Calculate progress percentage for circular progress (assuming max 1000 for visual)
    const maxForDisplay = 1000;
    const progressPercentage = Math.min((totalSolved / maxForDisplay) * 100, 100);
    
    const radius = 60;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;


    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchProfile = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/user/${user.id}/profile`
                );
                if (response.data) {
                    setProfileData((prev) => ({
                        ...prev,
                        ...response.data,
                        socialLinks: {
                            ...prev.socialLinks,
                            ...(response.data.socialLinks || {}),
                        },
                        leetcodeUsername: response.data.leetcodeUsername || "",
                    }));

                    // Fetch LeetCode data if username exists
                    if (response.data.leetcodeUsername) {
                        fetchLeetCodeData(response.data.leetcodeUsername);
                    }
                }
            } catch (err) {
                setError("Unable to load profile data.");
            }
        };

        fetchProfile();
    }, [isLoaded, user]);

    // Separate useEffect to fetch LeetCode data when username is available
    useEffect(() => {
        if (!user || !profileData.leetcodeUsername) return;
        
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/user/${user.id}/leetcode`
                );
                if (response.data && response.data.leetcodeStats) {
                    setLeetcodeData({
                        stats: response.data.leetcodeStats,
                        calendar: response.data.leetcodeSubmissionCalendar || {},
                        isSyncing: false,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch LeetCode data:", err);
            }
        };
        
        fetchData();
    }, [profileData.leetcodeUsername, user]);

    const fetchLeetCodeData = async (username = null) => {
        const leetcodeUsername = username || profileData.leetcodeUsername;
        if (!user || !leetcodeUsername) return;
        
        try {
            const response = await axios.get(
                `http://localhost:5000/api/user/${user.id}/leetcode`
            );
            if (response.data && response.data.leetcodeStats) {
                setLeetcodeData({
                    stats: response.data.leetcodeStats,
                    calendar: response.data.leetcodeSubmissionCalendar || {},
                    isSyncing: false,
                });
            }
        } catch (err) {
            console.error("Failed to fetch LeetCode data:", err);
        }
    };

    const handleSyncLeetCode = async () => {
        if (!profileData.leetcodeUsername) {
            setError("Please enter your LeetCode username");
            return;
        }

        setLeetcodeData((prev) => ({ ...prev, isSyncing: true }));
        setError("");

        try {
            const response = await axios.post(
                `http://localhost:5000/api/user/${user.id}/leetcode/sync`,
                { leetcodeUsername: profileData.leetcodeUsername }
            );

            setLeetcodeData({
                stats: response.data.stats,
                calendar: response.data.calendar.submissionCalendar || {},
                isSyncing: false,
            });

            // Update profile data - ensure it's saved
            setProfileData((prev) => ({
                ...prev,
                leetcodeUsername: profileData.leetcodeUsername,
            }));
            
            // Also save the username to the backend profile
            try {
                await axios.put(`http://localhost:5000/api/user/${user.id}/profile`, {
                    username: profileData.username,
                    salutation: profileData.salutation,
                    degree: profileData.degree,
                    fieldOfStudy: profileData.fieldOfStudy,
                    yearOfGraduation: Number(profileData.yearOfGraduation),
                    collegeName: profileData.collegeName,
                    country: profileData.country,
                    currentLevel: profileData.currentLevel,
                    primaryGoal: profileData.primaryGoal,
                    preferredCodingLanguage: profileData.preferredCodingLanguage,
                    targetPlatform: profileData.targetPlatform,
                    dailyPractice: profileData.dailyPractice,
                    emailNotification: profileData.emailNotification,
                    socialLinks: profileData.socialLinks,
                    leetcodeUsername: profileData.leetcodeUsername || "",
                });
            } catch (saveErr) {
                console.error("Failed to save leetcodeUsername:", saveErr);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to sync LeetCode data");
            setLeetcodeData((prev) => ({ ...prev, isSyncing: false }));
        }
    };


    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
    };

    const handleArrayToggle = (field, value) => {
        setProfileData((prev) => {
            const current = prev[field] || [];
            return {
                ...prev,
                [field]: current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
            };
        });
    };

    const handleSocialChange = (event) => {
        const { name, value } = event.target;
        setProfileData((prev) => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [name]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setError("");

        try {
            await axios.put(`http://localhost:5000/api/user/${user.id}/profile`, {
                username: profileData.username,
                salutation: profileData.salutation,
                degree: profileData.degree,
                fieldOfStudy: profileData.fieldOfStudy,
                yearOfGraduation: Number(profileData.yearOfGraduation),
                collegeName: profileData.collegeName,
                country: profileData.country,
                currentLevel: profileData.currentLevel,
                primaryGoal: profileData.primaryGoal,
                preferredCodingLanguage: profileData.preferredCodingLanguage,
                targetPlatform: profileData.targetPlatform,
                dailyPractice: profileData.dailyPractice,
                emailNotification: profileData.emailNotification,
                socialLinks: profileData.socialLinks,
                leetcodeUsername: profileData.leetcodeUsername || "",
            });
            setIsEditing(false);
        } catch (err) {
            setError(err?.response?.data?.error || "Unable to save profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Simple Top Navigation for Mobile */}
            <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm lg:hidden">
                <div className="flex items-center justify-between p-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="cursor-pointer rounded-lg p-2 hover:bg-gray-100"
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
                                className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 cursor-pointer"
                            >
                                <LayoutDashboard size={20} className="text-gray-600" />
                                <span className="font-medium text-gray-700">Dashboard</span>
                            </button>
                            <button
                                onClick={() => navigate("/profile")}
                                className="mt-3 flex w-full items-center gap-3 font-semibold rounded-lg bg-blue-50 px-3 py-2.5 text-left font-medium text-blue-700 cursor-pointer"
                            >
                                <User size={20} className="text-blue-600" />
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
                                            {profileData.username || "Coder"}
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
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Profile</h1>
                                <p className="mt-1 text-gray-600">Customize your learning journey</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setIsSubscriptionOpen(true)}
                                    className="rounded-lg cursor-pointer bg-yellow-600 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-yellow-700"
                                >
                                    Manage Subscription
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Pencil size={18} />
                                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                                </button>

                                
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:p-6">
                        <div className="flex flex-col gap-8 lg:flex-row">
                            {/* LEFT: Profile Info */}
                            <div className="flex-1">
                                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                                    {/* Profile Image */}
                                    <div className="relative">
                                        <img
                                            src={profileData.image || user?.imageUrl || "/logo.png"}
                                            alt="Profile"
                                            className="h-28 w-28 rounded-full border-4 border-white shadow-lg sm:h-30 sm:w-30"
                                        />
                                        {isEditing && (
                                            <button className="absolute -bottom-1 -right-1 rounded-full bg-blue-500 p-2 text-white shadow-lg">
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Profile Text */}
                                    <div className="text-center md:text-left">
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            {user?.fullName || "Student Coder"}
                                        </h2>

                                        <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start md:gap-3">
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                                @{profileData.username || "coder123"}
                                            </span>
                                            <span className="text-sm text-gray-600 sm:text-base">
                                                {profileData.email || user?.primaryEmailAddress?.emailAddress}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-col items-center gap-1 sm:gap-2 md:items-start">
                                            <p className="text-gray-700">
                                                <GraduationCap size={16} className="mr-2 inline" />
                                                {profileData.salutation || "Aspiring Developer"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                <Building size={16} className="mr-2 inline" />
                                                {profileData.collegeName || "Student"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Progress Stats */}
                            <div className="flex w-full items-center justify-center rounded-xl bg-gray-900 p-4 text-white lg:w-80 lg:justify-between lg:mr-8">
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
                                    {/* Circular Progress */}
                                    <div className="relative shrink-0">
                                        <svg width="120" height="120" className="sm:w-[130px] sm:h-[130px]">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r={radius * 0.8}
                                                stroke="#2a2a2a"
                                                strokeWidth={stroke}
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r={radius * 0.8}
                                                stroke="#22c55e"
                                                strokeWidth={stroke}
                                                fill="transparent"
                                                strokeDasharray={circumference * 0.8}
                                                strokeDashoffset={totalSolved > 0 ? offset * 0.8 : circumference * 0.8}
                                                strokeLinecap="round"
                                                transform="rotate(-90 60 60)"
                                            />
                                        </svg>

                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <p className="text-2xl font-bold sm:text-3xl mr-2">{totalSolved}</p>
                                            <p className="text-xs text-gray-400 mr-3">questions</p>
                                        </div>
                                    </div>

                                    {/* Difficulty Stats */}
                                    <div className="w-full min-w-[180px] space-y-2 sm:w-auto">
                                        {Object.entries(stats).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 text-sm"
                                            >
                                                <span className={`font-medium capitalize ${value.color}`}>
                                                    {key}
                                                </span>
                                                <span className="text-gray-300">
                                                    {value.solved}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid Sections */}
                    <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                        {/* Coding Skills */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center gap-3 border-b pb-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Code2 size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Coding Skills</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Current Level */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Trophy size={16} />
                                        Current Level
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="currentLevel"
                                            value={profileData.currentLevel}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
                                        >
                                            {levelOptions.map((option) => (
                                                <option key={option} value={option}>
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className={`rounded-lg bg-blue-600 p-4`}>
                                            <span className="text-lg font-bold text-white">
                                                {profileData.currentLevel.charAt(0).toUpperCase() + profileData.currentLevel.slice(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Goal */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Target size={16} />
                                        Primary Goal
                                    </label>
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            {primaryGoalOptions.map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => handleArrayToggle("primaryGoal", option)}
                                                    className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${profileData.primaryGoal.includes(option)
                                                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.primaryGoal.map((goal) => (
                                                <span
                                                    key={goal}
                                                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700"
                                                >
                                                    {goal}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Languages */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Code2 size={16} />
                                        Preferred Languages
                                    </label>
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            {languageOptions.map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => handleArrayToggle("preferredCodingLanguage", lang)}
                                                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${profileData.preferredCodingLanguage.includes(lang)
                                                        ? "bg-blue-100 text-blue-700 border border-purple-200"
                                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.preferredCodingLanguage.map((lang) => (
                                                <span
                                                    key={lang}
                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                                                >
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Practice & Goals */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <div className="mb-6 flex items-center gap-3 border-b pb-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <BookOpen size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Practice Goals</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Platforms */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Target size={16} />
                                        Target Platforms
                                    </label>
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            {platformOptions.slice(0, 6).map((platform) => (
                                                <button
                                                    key={platform}
                                                    onClick={() => handleArrayToggle("targetPlatform", platform)}
                                                    className={`cursor-pointer flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${profileData.targetPlatform.includes(platform)
                                                        ? "bg-blue-100 text-blue-700 "
                                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {platform}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3">
                                            {platforms
                                                .filter(p => profileData.targetPlatform.includes(p.name))
                                                .map((platform) => (
                                                    <div
                                                        key={platform.name}
                                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5"
                                                    >
                                                        <img src={platform.image} alt={platform.name} className="h-5 w-5" />
                                                        <span className="text-sm font-medium">{platform.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>

                                {/* Daily Practice */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Clock size={16} />
                                        Daily Goal
                                    </label>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            {dailyPracticeOptions.map((hours) => (
                                                <button
                                                    key={hours}
                                                    onClick={() => setProfileData(prev => ({ ...prev, dailyPractice: hours }))}
                                                    className={`cursor-pointer flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${profileData.dailyPractice === hours
                                                        ? "border border-blue-600 bg-blue-50 text-black"
                                                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {hours} {hours === "5+" ? "hours+" : "hour" + (hours === "1" ? "" : "s")}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg px-4">
                                            <p className="text-3xl font-bold ">
                                                {profileData.dailyPractice || "0"} hour{profileData.dailyPractice !== "1" ? "s" : ""}
                                            </p>
                                            <p className="text-sm text-blue-600">Daily practice target</p>
                                        </div>
                                    )}
                                </div>

                                {/* Notifications */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Mail size={20} className="text-gray-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">Email Notifications</p>
                                                <p className="text-sm text-gray-500">Get study reminders</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex cursor-pointer items-center">
                                            <input
                                                type="checkbox"
                                                checked={profileData.emailNotification}
                                                onChange={(e) => setProfileData(prev => ({
                                                    ...prev,
                                                    emailNotification: e.target.checked
                                                }))}
                                                className="sr-only"
                                                disabled={!isEditing}
                                            />
                                            <div className={`h-6 w-11 rounded-full ${profileData.emailNotification ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${profileData.emailNotification ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        {/* Academic Details */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 md:col-span-2">
                            <div className="mb-6 flex items-center gap-3 border-b pb-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <School size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Academic Details</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { label: "Degree", icon: GraduationCap, name: "degree", options: degreeOptions },
                                    { label: "Field of Study", icon: BookOpen, name: "fieldOfStudy", type: "text" },
                                    { label: "Graduation Year", icon: Calendar, name: "yearOfGraduation", options: yearOptions },
                                    { label: "College", icon: Building, name: "collegeName", options: collegeOptions },
                                    { label: "Country", icon: MapPin, name: "country", options: countryOptions, colSpan: "md:col-span-2" },
                                    { label: "Salutation", icon: User, name: "salutation", options: salutationOptions },
                                ].map((field) => (
                                    <div key={field.name} className={field.colSpan || ""}>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <field.icon size={16} />
                                            {field.label}
                                        </label>
                                        {isEditing ? (
                                            field.options ? (
                                                <select
                                                    name={field.name}
                                                    value={profileData[field.name]}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm"
                                                >
                                                    <option value="">Select {field.label}</option>
                                                    {field.options.map(option => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name={field.name}
                                                    value={profileData[field.name]}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                                    placeholder={`Enter ${field.label}`}
                                                />
                                            )
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                                                <p className="font-medium text-gray-900">
                                                    {profileData[field.name] || `No ${field.label}`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 md:col-span-2">
                            <div className="mb-6 flex items-center gap-3 border-b pb-3">
                                <div className="rounded-lg bg-blue-100 p-2">
                                    <Globe size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Social Links</h3>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {[
                                    { name: "github", label: "GitHub", icon: "https://cdn-icons-png.flaticon.com/256/25/25231.png", color: "bg-gray-900 text-white" },
                                    { name: "linkedin", label: "LinkedIn", icon: "https://openvisualfx.com/wp-content/uploads/2019/10/linkedin-icon-logo-png-transparent.png", color: "bg-blue-600 text-white" },
                                    { name: "twitter", label: "Twitter", icon: "https://img.freepik.com/premium-vector/instagram-vector-logo-icon-social-media-logotype_901408-392.jpg?semt=ais_hybrid&w=740&q=80", color: "bg-sky-500 text-white" },
                                    { name: "insta", label: "Instagram", icon: "https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg?semt=ais_hybrid&w=740&q=80", color: "bg-pink-500 text-white" },
                                ].map((social) => (
                                    <div key={social.name}>
                                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <img src={social.icon} alt={social.label} className="h-5 w-5" />
                                            {social.label}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                name={social.name}
                                                value={profileData.socialLinks?.[social.name] || ""}
                                                onChange={handleSocialChange}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm"
                                                placeholder={`${social.label} username`}
                                            />
                                        ) : (
                                            <div>
                                                {profileData.socialLinks?.[social.name] ? (
                                                    <a
                                                        href={profileData.socialLinks[social.name]}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${social.color} hover:opacity-90`}
                                                    >
                                                        View {social.label}
                                                    </a>
                                                ) : (
                                                    <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5">
                                                        <p className="text-sm text-gray-500">Not connected</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>


                            </div>
                        </div>

                        {/* LeetCode Integration */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 md:col-span-2">
                            <div className="mb-6 flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-2">
                                        <Code2 size={20} className="text-orange-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">LeetCode Profile</h3>
                                </div>
                                {profileData.leetcodeUsername && (
                                    <a
                                        href={`https://leetcode.com/${profileData.leetcodeUsername}/`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
                                    >
                                        <ExternalLink size={16} />
                                        View Profile
                                    </a>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* LeetCode Username Input */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        LeetCode Username
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            name="leetcodeUsername"
                                            value={profileData.leetcodeUsername || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your LeetCode username"
                                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                        {isEditing && profileData.leetcodeUsername && (
                                            <button
                                                onClick={handleSyncLeetCode}
                                                disabled={leetcodeData.isSyncing}
                                                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <RefreshCw size={16} className={leetcodeData.isSyncing ? "animate-spin" : ""} />
                                                {leetcodeData.isSyncing ? "Syncing..." : "Sync"}
                                            </button>
                                        )}
                                    </div>
                                    {!isEditing && !profileData.leetcodeUsername && (
                                        <p className="mt-2 text-sm text-gray-500">
                                            Add your LeetCode username to sync your solved problems and streak
                                        </p>
                                    )}
                                </div>

                                {/* LeetCode Stats */}
                                {leetcodeData.stats && (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-green-100 p-4">
                                                <div className="text-sm font-medium text-green-700">Total Solved</div>
                                                <div className="mt-1 text-2xl font-bold text-green-900">
                                                    {leetcodeData.stats.totalSolved || 0}
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-teal-50 to-teal-100 p-4">
                                                <div className="text-sm font-medium text-teal-700">Easy</div>
                                                <div className="mt-1 text-2xl font-bold text-teal-900">
                                                    {leetcodeData.stats.easySolved || 0}
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
                                                <div className="text-sm font-medium text-yellow-700">Medium</div>
                                                <div className="mt-1 text-2xl font-bold text-yellow-900">
                                                    {leetcodeData.stats.mediumSolved || 0}
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-red-50 to-red-100 p-4">
                                                <div className="text-sm font-medium text-red-700">Hard</div>
                                                <div className="mt-1 text-2xl font-bold text-red-900">
                                                    {leetcodeData.stats.hardSolved || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Stats */}
                                        {(leetcodeData.stats.ranking > 0 || leetcodeData.stats.reputation > 0) && (
                                            <div className="grid gap-4 md:grid-cols-3">
                                                {leetcodeData.stats.ranking > 0 && (
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                            <Trophy size={16} />
                                                            Ranking
                                                        </div>
                                                        <div className="mt-1 text-xl font-bold text-gray-900">
                                                            #{leetcodeData.stats.ranking.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {leetcodeData.stats.reputation > 0 && (
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                            <TrendingUp size={16} />
                                                            Reputation
                                                        </div>
                                                        <div className="mt-1 text-xl font-bold text-gray-900">
                                                            {leetcodeData.stats.reputation.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {leetcodeData.stats.contributionPoints > 0 && (
                                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                            <Target size={16} />
                                                            Contribution
                                                        </div>
                                                        <div className="mt-1 text-xl font-bold text-gray-900">
                                                            {leetcodeData.stats.contributionPoints}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    </>
                                )}

                                {!leetcodeData.stats && profileData.leetcodeUsername && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Click "Sync" to fetch your LeetCode stats</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    {isEditing && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="cursor-pointer mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-70"
                        >
                            <Save size={18} />
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    )}

                    {isSubscriptionOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                                            Manage Subscription
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Upgrade, downgrade, or cancel your plan anytime.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsSubscriptionOpen(false)}
                                        className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                    >
                                        <CircleX size={20} />
                                    </button>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                        <h4 className="text-sm font-semibold text-blue-700">Current Plan</h4>
                                        <p className="mt-2 text-lg font-bold text-blue-900">Free</p>
                                        <p className="mt-1 text-sm text-blue-700">
                                            Access core tracking features.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                                        <h4 className="text-sm font-semibold text-gray-700">Upgrade Options</h4>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Unlock premium insights and smart reminders.
                                        </p>
                                <button
                                    onClick={() => setIsPlansOpen(true)}
                                    className="cursor-pointer mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                            Explore Plans
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        onClick={() => setIsSubscriptionOpen(false)}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                    <button className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                        Manage Billing
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isPlansOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                            <div className="w-full max-w-6xl rounded-2xl bg-white p-6 shadow-2xl md:p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold md:text-3xl">Plans</h3>
                                        <p className="mt-2 text-sm ">
                                            Choose the plan that fits your coding journey.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsPlansOpen(false)}
                                        className="cursor-pointer rounded-lg p-2 "
                                    >
                                        <CircleX size={20} />
                                    </button>
                                </div>

                                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex h-full flex-col rounded-xl  bg-blue-50 border border-blue-600 p-5 text-blue-600">
                                        <div>
                                            <h4 className="text-lg font-semibold">Hobby</h4>
                                            <p className="text-sm t">Free</p>
                                        </div>
                                        <p className="mt-4 text-sm ">Includes:</p>
                                        <ul className="mt-3 space-y-2 text-sm">
                                            <li>✓ Track up to 50 questions</li>
                                            <li>✓ Basic confidence insights</li>
                                            <li>✓ Manual revision reminders</li>
                                        </ul>
                                        <button className="cursor-pointer mt-6 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600/20">
                                            Get Started
                                        </button>
                                    </div>

                                    <div className="flex h-full flex-col rounded-xl border border-gray-500 bg-white p-5 text-gray-700">
                                        <div>
                                            <h4 className="text-lg font-semibold text-black">Pro</h4>
                                            <p className="text-sm text-black">$9/mo.</p>
                                        </div>
                                        <p className="mt-4 text-sm text-black">Everything in Hobby, plus:</p>
                                        <ul className="mt-3 space-y-2 text-sm">
                                            <li>✓ Unlimited questions</li>
                                            <li>✓ Smart confidence scoring</li>
                                            <li>✓ Weekly revision nudges</li>
                                        </ul>
                                        <button className="cursor-pointer mt-6 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600/90">
                                            Get Pro
                                        </button>
                                    </div>

                                    <div className="flex h-full flex-col rounded-xl  bg-blue-50 border border-blue-600 p-5 text-blue-600">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-semibold">Pro+</h4>
                                            <span className="text-xs font-semibold text-orange-400">
                                                Recommended
                                            </span>
                                        </div>
                                        <p className="text-sm ">$19/mo.</p>
                                        <p className="mt-4 text-sm ">Everything in Pro, plus:</p>
                                        <ul className="mt-3 space-y-2 text-sm">
                                            <li>✓ AI-guided revision plan</li>
                                            <li>✓ Topic strength dashboard</li>
                                            <li>✓ Priority email reminders</li>
                                        </ul>
                                        <button className="cursor-pointer mt-6 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600/90">
                                            Get Pro+
                                        </button>
                                    </div>

                                    <div className="flex h-full flex-col rounded-xl border border-gray-500 bg-white p-5 text-gray-700">
                                        <div>
                                            <h4 className="text-lg font-semibold text-black">Ultra</h4>
                                            <p className="text-sm text-black">$39/mo.</p>
                                        </div>
                                        <p className="mt-4 text-sm text-black">Everything in Pro+, plus:</p>
                                        <ul className="mt-3 space-y-2 text-sm">
                                            <li>✓ 1:1 mentor review sessions</li>
                                            <li>✓ Daily revision scheduling</li>
                                            <li>✓ Early access to new features</li>
                                        </ul>
                                        <button className="mt-6 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600/90">
                                            Get Ultra
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setIsPlansOpen(false)}
                                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </main>
            </div>
        </div>
    );
}