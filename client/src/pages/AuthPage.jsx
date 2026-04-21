import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ type = "login" }) {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (type === "signup") {
        await register(form);
        toast.success("Signup successful. Please login with same credentials.");
        navigate("/login");
      } else {
        await login(form);
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{type === "signup" ? "Create Student / Teacher Account" : "Welcome Back"}</h1>
        <p className="text-sm text-slate-500">
          {type === "signup" ? "Sign up to access your personalized portal." : "Login as student or teacher."}
        </p>
        {type === "signup" && (
          <>
            <input
              className="w-full rounded-lg border p-2.5"
              placeholder="Full name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select className="w-full rounded-lg border p-2.5" onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </>
        )}
        <input className="w-full rounded-lg border p-2.5" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input
          className="w-full rounded-lg border p-2.5"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="w-full rounded-lg bg-slate-900 p-2.5 font-medium text-white transition hover:bg-slate-800">
          {loading ? "Please wait..." : type === "signup" ? "Create Account" : "Login"}
        </button>
        <p className="text-center text-sm text-slate-500">
          {type === "signup" ? "Already have an account?" : "New user?"}{" "}
          <Link className="font-medium text-slate-900" to={type === "signup" ? "/login" : "/signup"}>
            {type === "signup" ? "Login" : "Sign up"}
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400">Built by batch 10 csm-b</p>
      </form>
    </div>
  );
}
