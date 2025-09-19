// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRef } from "react";

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const firstLoad = useRef(true);
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    navigate("/login");
  }

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/sessions",
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
      );
      if (res.data.success) {
        setSessions(res.data.sessions);
        setFilteredSessions(res.data.sessions);
      }
    } catch (err) {
      console.error("Fetch all sessions error:", err.response?.data || err.message);
      toast.error("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKhata = async (id) => {
    if (!window.confirm("Are you sure you want to delete this khata?")) return;

    try {
      const res = await axios.delete(`http://localhost:8080/api/sessions/${id}`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        });

      // const data = await res.json();
      if (res) {
        toast.success("Session deleted successfully!");
        navigate("/"); // delete ke baad wapas home ya list page
        fetchAll(); // refresh the list
      }
    } catch (err) {
      toast.error("Server error: " + err.message);
    }
  };

  const handleLogout = async () => {
  try {
    await axios.post("http://localhost:8080/api/auth/logout", {}, {
      withCredentials: true, // ✅ send cookies
    });
    toast.success("Logged out successfully");
    localStorage.removeItem("user")
    navigate("/login");
    // clear local state if needed
  } catch (err) {
    console.error("Logout error:", err);
    toast.error("Logout failed");
  }
};
  useEffect(() => {
    if (firstLoad.current) {
      fetchAll();
      firstLoad.current = false;
    }
  }, []);

  // live search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredSessions(sessions);
    } else {
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
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex justify-between items-center mb-12">
        <img className="w-16" src="/logo.png" alt="" />
        <h1 className="font-extrabold text-2xl">Taimoor Akram & <span className="text-red-600">Brothers</span></h1>
        <div className="flex gap-1 items-center">
          <div className="bg-red-600 rounded-full text-white w-12 h-12 flex items-center justify-center">{user?.user?.name?.charAt(0)}</div>
          <div>
            <h1>{user?.user?.email}</h1>
            <button onClick={handleLogout} className="underline text-red-600">Logout</button>
          </div>
        </div>
        {/* <button className="bg-black text-white px-5 h-12 rounded-full">Create Khata</button> */}

      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">All Customer Sessions</h1>
        <Link to={"/new"}>
          <button className="bg-black text-white px-5 h-12 rounded-full">Create Khata</button>
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

      {loading ? (
        <div className="w-full h-auto flex items-center justify-center z-50 "><h1 className="text-xl font-bold">Loading...</h1></div>
      ) : (
        <div className="space-y-4">
          {filteredSessions && filteredSessions.length === 0 && <p>No sessions found.</p>}

          {filteredSessions &&
            filteredSessions.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between p-4 border rounded-md bg-white shadow-sm"
              >
                <div>
                  <p className="font-semibold text-xl">
                    {s.customerName} — {s.contactNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Items: {s.items?.length || 0} • GrandTotal: {s.grandTotal ?? s.total ?? 0}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => navigate(`/session/${s._id}`)}
                    className="px-3 h-12 bg-yellow-500 text-black font-bold rounded-md"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteKhata(s._id)}
                    className="px-3 h-12 bg-red-600 font-bold text-white rounded w-full sm:w-auto"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
