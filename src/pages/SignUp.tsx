import { Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Loading from "@/components/Loading";
function SignUpPage() {
    const[fullName,setFullName] = useState("");
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const[age,setAge] = useState(0);
    const[success,setSuccess] = useState("");
    const[error,setError] = useState("")
    const[loading,setLoading] = useState(false)
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
    const response = await axios.post(`${url}users/register`, {
            name: fullName,
            email,
            password,
            age,
          });

          toast.success(response.data.success);
          setSuccess(response.data.success);
          navigate("/signin");

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
      return loading ? (<Loading />) : (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full space-y-6 border border-blue-200 animate-fade-in"
          >
            <h2 className="text-3xl font-bold text-center text-purple-700">Register</h2>
    
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
              onChange={(e) => setFullName(e.target.value)}
            />
    
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

              <input
              type="number"
              placeholder="Age"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
              onChange={(e) => e.target.value}
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
              Sign Up
            </button>
            <div className="text-center text-sm font-bold">
              If you Already have an account
              <span className="text-gray-600 underline">
                <Link to="/signin"> Signin!</Link>
              </span>
            </div>
          </form>
        </div>
      );
}

export default SignUpPage;