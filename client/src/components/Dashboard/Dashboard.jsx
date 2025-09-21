// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const firstLoad = useRef(true);

  // keep user in sync with localStorage (logout in other tabs)
  useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://store-management-backend-hcpb.onrender.com/api/sessions",
        { withCredentials: true }
      );
      if (res.data.success) {
        setSessions(res.data.sessions);
        setFilteredSessions(res.data.sessions);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKhata = async (id) => {
    if (!window.confirm("Are you sure you want to delete this khata?")) return;
    try {
      await axios.delete(
        `https://store-management-backend-hcpb.onrender.com/api/sessions/${id}`,
        { withCredentials: true }
      );
      toast.success("Session deleted successfully!");
      fetchAll(); // refresh list
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://store-management-backend-hcpb.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  useEffect(() => {
    if (firstLoad.current && user) {
      fetchAll();
      firstLoad.current = false;
    }
  }, [user]);

  // live search filter
  useEffect(() => {
    if (!search.trim()) setFilteredSessions(sessions);
    else {
      const lower = search.toLowerCase();
      setFilteredSessions(
        sessions.filter(
          (s) =>
            s.customerName?.toLowerCase().includes(lower) ||
            s.contactNumber?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, sessions]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* ✅ Sticky Header */}
      <header className="sticky top-0 bg-white z-20 border-b mb-6">
        <div className="flex justify-between items-center py-4">
          <img className="w-16" src="/logo.png" alt="logo" />
          <h1 className="font-extrabold text-xl sm:text-2xl">
            Taimoor Akram & <span className="text-red-600">Brothers</span>
          </h1>
          <div className="flex gap-2 items-center">
            <div className="bg-red-600 rounded-full text-white w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg font-bold">
              {user?.user?.name?.charAt(0)}
            </div>
            <div className="text-right">
              <p className="text-sm">{user?.user?.email}</p>
              <button
                onClick={handleLogout}
                className="text-red-600 underline text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Title + Create Button */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <h2 className="text-xl font-bold">All Customer Sessions</h2>
        <Link to="/new">
          <button className="bg-black text-white px-5 h-11 rounded-full">
            Create Khata
          </button>
        </Link>
      </div>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search by name or contact..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* ✅ Scrollable List */}
      <div className="border rounded-md bg-gray-50 max-h-[65vh] overflow-y-auto p-3">
        {loading ? (
          <div className="flex justify-center py-8 text-lg font-semibold">
            Loading...
          </div>
        ) : filteredSessions.length === 0 ? (
          <p className="text-center text-gray-600 py-6">No sessions found.</p>
        ) : (
          filteredSessions.map((s) => (
            <div
              key={s._id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 mb-3 bg-white rounded-md shadow-sm border"
            >
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-lg">
                  {s.customerName} — {s.contactNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Items: {s.items?.length || 0} • GrandTotal:{" "}
                  {s.grandTotal ?? s.total ?? 0}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/session/${s._id}`)}
                  className="px-4 h-10 bg-yellow-500 text-black font-bold rounded-md"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteKhata(s._id)}
                  className="px-4 h-10 bg-red-600 font-bold text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
