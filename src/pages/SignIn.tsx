import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useContext} from "react";
import { AuthContext } from "@/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import Loading from "@/components/Loading";

export function SignInPage() {
  const[email,setEmail] = useState("")
  const[password,setPassword] = useState("")
  const[loading,setLoading] = useState(false)
  const[success,setSuccess] = useState("");
  const[error,setError] = useState("")
  const { setUser } = useContext(AuthContext);

  const url = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setSuccess(null);
  setError(null);

  if (!url) {
    setError("Backend URL not configured");
    toast.error("Backend URL not configured");
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post(`${url}users/login`, {
      email,
      password
    });

    const { token, user } = response.data;

    // ✅ Store token securely (preferably in memory or HttpOnly cookies if backend supports it)
    localStorage.setItem('token', token); // or use a context for extra security

    // ✅ Update state
    setUser(user);
    toast.success(`Welcome ${user.name}`);
    setSuccess("Logged in successfully");
    navigate("/home");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || "Something went wrong";
      toast.error(message);
      setError(message);
    } else {
      toast.error("Unexpected error");
      setError("Unexpected error");
    }
  } finally {
    setLoading(false);
  }
};

    return loading ? <Loading /> : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
          <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6 border border-blue-200 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-purple-700">Sign In</h2>
    
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
    
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              {success && <p className="bg-emerald-200 rounded-sm text-sm text-center">
                {success}</p>}
              {error && <p className="text-sm text-center text-red-500 bg-red-200 rounded-sm">
                {error}</p>}
              <button
              disabled={loading}
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-300"
              >
                Sign In
              </button>
              <div className="text-center text-sm font-bold">
                If you Don't have an account
                <span className="text-gray-600 underline">
                  <Link to="/"> Register?</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
    )
  }
  