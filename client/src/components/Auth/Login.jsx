import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom"; // <-- use this if you have routing
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 state for spinner

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // start spinner
    try {
      // 👉 Send login request
      const response = await axios.post(
        'https://store-management-backend-hcpb.onrender.com/api/auth/login',
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 ensures cookies are stored
      );

      if (response.data.success) {
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success(response?.data?.message || "Login Successfully !");
        navigate("/");
      }


    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false); // stop spinner
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md border rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-black">Login</h2>
        <p className="mt-2 text-center text-gray-600">
          Welcome back! Please login to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-black">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>

          {/* Password with toggle */}
          <div>
            <label className="block text-sm font-medium text-black">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none pr-10"
              />
              <span
                className="absolute right-3 top-3 cursor-pointer text-xl text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // disable while loading
            className={`w-full py-2 rounded-lg transition flex items-center justify-center ${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:opacity-90 text-white"
              }`}
          >
            {loading ? (
              <span className="loader border-2 border-t-2 border-white w-5 h-5 rounded-full animate-spin"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-black">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-black font-semibold underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
