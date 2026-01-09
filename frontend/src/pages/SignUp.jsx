// frontend/src/pages/Signup.jsx
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../services/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      displayName.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      !loading
    );
  }, [displayName, email, password, loading]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUpWithEmail({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
      });
      navigate("/chat");
    } catch (err) {
      const msg =
        err?.code === "auth/email-already-in-use"
          ? "That email is already in use. Try signing in instead."
          : err?.code === "auth/invalid-email"
          ? "That email address is invalid."
          : err?.code === "auth/weak-password"
          ? "Password is too weak. Use 6+ characters."
          : err?.message || "Signup failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <h1 className="mb-2">Create account</h1>
      <p className="text-muted mb-4">
        Create an account to sign in and use the chatroom.
      </p>

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="card p-4 shadow-sm">
        <label className="form-label">Display name</label>
        <input
          className="form-control mb-3"
          type="text"
          autoComplete="nickname"
          placeholder="Stephen"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={loading}
          required
          minLength={2}
        />

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
          autoComplete="new-password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          minLength={6}
        />

        <button className="btn btn-primary w-100" disabled={!canSubmit} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>

        <div className="d-flex justify-content-between mt-3">
          <span className="text-muted">Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
