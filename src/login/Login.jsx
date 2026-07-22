import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "./login.css";

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim().toLowerCase();

    setError("");
    setIsSubmitting(true);

    window.setTimeout(() => {
      if (email === "user" && password === "user") {
        onLogin("user");
        return;
      }

      if (email === "admin" && password === "admin") {
        onLogin("admin");
        return;
      }

      setError("Invalid email or password.");
      setIsSubmitting(false);
    }, 400);
  }

  function fillDemoAccount(role) {
    setForm({
      email: role,
      password: role,
    });

    setError("");
  }

  return (
    <main className="stax-login-page">
      <section className="stax-login-showcase">
        <div className="stax-login-showcase__glow" />

        <div className="stax-login-brand">
          <div className="stax-login-brand__logo">S</div>

          <div>
            <strong>STAX</strong>
            <span>Cards. Events. Community.</span>
          </div>
        </div>

        <div className="stax-login-showcase__content">
          <span className="stax-login-eyebrow">
            <Sparkles size={15} />
            The card shop experience
          </span>

          <h1>
            Build your deck.
            <span> Rise through the ranks.</span>
          </h1>

          <p>
            Browse collectible cards, join competitive events, check player
            rankings, and connect with the STAX community.
          </p>

          <div className="stax-login-features">
            <article>
              <ShieldCheck size={21} />

              <div>
                <strong>Secure access</strong>
                <span>Separate user and administrator areas.</span>
              </div>
            </article>

            <article>
              <Sparkles size={21} />

              <div>
                <strong>One platform</strong>
                <span>Manage cards, events, rankings, and orders.</span>
              </div>
            </article>
          </div>
        </div>

        <p className="stax-login-showcase__footer">
          STAX Card Shop Management Platform
        </p>
      </section>

      <section className="stax-login-panel">
        <div className="stax-login-form-wrapper">
          <div className="stax-login-mobile-brand">
            <div className="stax-login-brand__logo">S</div>

            <div>
              <strong>STAX</strong>
              <span>Card Shop</span>
            </div>
          </div>

          <div className="stax-login-heading">
            <span className="stax-login-eyebrow">Welcome back</span>
            <h2>Sign in to STAX</h2>
            <p>Enter your account credentials to continue.</p>
          </div>

          <form className="stax-login-form" onSubmit={handleSubmit}>
            <label className="stax-login-field">
              <span>Email or username</span>

              <div className="stax-login-input">
                <Mail size={18} />

                <input
                  autoComplete="username"
                  name="email"
                  placeholder="Enter your email or username"
                  required
                  type="text"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </label>

            <label className="stax-login-field">
              <span>Password</span>

              <div className="stax-login-input">
                <LockKeyhole size={18} />

                <input
                  autoComplete="current-password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                />

                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="stax-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="stax-login-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="stax-login-submit"
              disabled={isSubmitting}
              type="submit"
            >
              <span>{isSubmitting ? "Signing in..." : "Sign in"}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="stax-demo-divider">
            <span>Demo accounts</span>
          </div>

          <div className="stax-demo-accounts">
            <button type="button" onClick={() => fillDemoAccount("user")}>
              <span className="stax-demo-icon">U</span>

              <span>
                <strong>User account</strong>
                <small>user / user</small>
              </span>
            </button>

            <button type="button" onClick={() => fillDemoAccount("admin")}>
              <span className="stax-demo-icon">A</span>

              <span>
                <strong>Admin account</strong>
                <small>admin / admin</small>
              </span>
            </button>
          </div>

          <p className="stax-login-note">
            Select a demo account to automatically fill in its credentials.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;