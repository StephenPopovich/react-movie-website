// frontend/src/pages/Login.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmail } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmail({ email: email.trim(), password });
      navigate("/chat");
    } catch (err) {
      const msg =
        err?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err?.code === "auth/user-not-found"
          ? "No account found for that email."
          : err?.code === "auth/wrong-password"
          ? "Invalid email or password."
          : err?.message || "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="mb-2">Sign in</h1>
      <p className="text-muted mb-4">
        Sign in to use the chatroom with your account.
      </p>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="card p-4 shadow-sm">
        <label className="form-label">Email</label>
        <input
          className="form-control mb-3"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />

        <label className="form-label">Password</label>
        <input
          className="form-control mb-3"
          type="password"
          autoComplete="current-password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        <button className="btn btn-primary w-100" disabled={!canSubmit} type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="d-flex justify-content-between mt-3">
          <span className="text-muted">No account?</span>
          <Link to="/signup">Create one</Link>
        </div>
      </form>
    </div>
  );
}
