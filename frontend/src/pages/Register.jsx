import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(form.name, form.email, form.password, form.confirmPassword);
    if (result.success) {
      toast.success("Account created");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
            <Zap size={20} />
          </div>
          <h1 className="mt-4 font-display text-2xl font-700">Create your account</h1>
          <p className="mt-1 text-sm text-ink/50">Start shortening links in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 bg-white p-6">
          <Field label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" />
          <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" />
          <Field label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:text-brand-dark">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink/70">{label}</label>
      <input
        {...props}
        required
        className="w-full rounded-xl border border-ink/15 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
      />
    </div>
  );
}
