import {
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";

import {
  supabase,
} from "../lib/supabase";

import "./login.css";


function Login() {
  const [
    mode,
    setMode,
  ] = useState("login");

  const [
    form,
    setForm,
  ] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bracket: "1",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  /* =========================================================
     INPUT
  ========================================================= */

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]:
          value,
      })
    );

    setError("");
    setSuccess("");
  }


  /* =========================================================
     RESET
  ========================================================= */

  function resetForm() {
    setForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      bracket: "1",
    });

    setShowPassword(
      false
    );

    setShowConfirmPassword(
      false
    );

    setError("");
    setSuccess("");
  }


  /* =========================================================
     SWITCH MODE
  ========================================================= */

  function switchMode(
    newMode
  ) {
    resetForm();

    setMode(
      newMode
    );
  }


  /* =========================================================
     LOGIN
  ========================================================= */

  async function handleLogin(
    event
  ) {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }


    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;


    if (!email) {
      setError(
        "Please enter your email."
      );

      return;
    }


    if (!password) {
      setError(
        "Please enter your password."
      );

      return;
    }


    setError("");
    setSuccess("");
    setIsSubmitting(
      true
    );


    try {
      const {
        data,
        error:
          loginError,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });


      if (
        loginError
      ) {
        throw loginError;
      }


      if (
        !data?.user
      ) {
        throw new Error(
          "Could not sign in."
        );
      }


      /*
       * App.jsx will detect
       * the new session automatically.
       */
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );


      const message =
        String(
          error?.message ||
          ""
        ).toLowerCase();


      if (
        message.includes(
          "invalid login credentials"
        )
      ) {
        setError(
          "Invalid email or password."
        );
      } else if (
        message.includes(
          "email not confirmed"
        )
      ) {
        setError(
          "Please confirm your email before signing in."
        );
      } else {
        setError(
          error?.message ||
          "Could not sign in."
        );
      }
    } finally {
      setIsSubmitting(
        false
      );
    }
  }


  /* =========================================================
     SIGN UP
  ========================================================= */

  async function handleSignUp(
    event
  ) {
    event.preventDefault();

    if (
      isSubmitting
    ) {
      return;
    }


    const fullName =
      form.fullName
        .trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;

    const confirmPassword =
      form.confirmPassword;

    const bracket =
      Number(
        form.bracket
      );


    /* =========================
       VALIDATION
    ========================= */

    if (!fullName) {
      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!email) {
      setError(
        "Please enter your email."
      );

      return;
    }


    if (
      password.length <
      8
    ) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }


    if (
      ![
        1,
        2,
        3,
        4,
      ].includes(
        bracket
      )
    ) {
      setError(
        "Please select a valid bracket."
      );

      return;
    }


    setError("");
    setSuccess("");
    setIsSubmitting(
      true
    );


    try {
      /*
       * IMPORTANT:
       *
       * We only send:
       * - full_name
       * - bracket
       *
       * We DO NOT send role.
       *
       * Your Supabase trigger must create:
       *
       * role = "user"
       * status = "Active"
       *
       * This prevents users from changing
       * their role from the frontend.
       */

      const {
        data,
        error:
          signUpError,
      } =
        await supabase.auth.signUp({
          email,

          password,

          options: {
            data: {
              full_name:
                fullName,

              bracket:
                bracket,
            },
          },
        });


      if (
        signUpError
      ) {
        throw signUpError;
      }


      if (
        !data?.user
      ) {
        throw new Error(
          "Account creation failed."
        );
      }


      /*
       * EMAIL CONFIRMATION OFF
       *
       * If Supabase immediately gives
       * a session, App.jsx will pick
       * it up automatically.
       *
       * DO NOT insert into profiles here.
       *
       * The database trigger creates
       * the profiles row.
       */
      if (
        data.session
      ) {
        setSuccess(
          "Account created successfully. Signing you in..."
        );

        return;
      }


      /*
       * EMAIL CONFIRMATION ON
       */
      setSuccess(
        "Account created successfully. Please check your email and confirm your account before signing in."
      );


      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        bracket: "1",
      });
    } catch (error) {
      console.error(
        "SIGNUP ERROR:",
        error
      );


      const message =
        String(
          error?.message ||
          ""
        ).toLowerCase();


      if (
        message.includes(
          "already registered"
        ) ||
        message.includes(
          "already exists"
        ) ||
        message.includes(
          "user already registered"
        )
      ) {
        setError(
          "An account with this email already exists."
        );
      } else if (
        message.includes(
          "database error saving new user"
        )
      ) {
        setError(
          "Supabase could not create the player profile. Please check the profiles trigger in Supabase."
        );
      } else if (
        message.includes(
          "password"
        )
      ) {
        setError(
          error?.message ||
          "Invalid password."
        );
      } else {
        setError(
          error?.message ||
          "Could not create account."
        );
      }
    } finally {
      setIsSubmitting(
        false
      );
    }
  }


  /* =========================================================
     DEMO ACCOUNTS
  ========================================================= */

  function fillDemoAccount(
    role
  ) {
    setMode(
      "login"
    );

    setError("");
    setSuccess("");


    if (
      role ===
      "admin"
    ) {
      setForm({
        fullName: "",
        email:
          "admin@stax.com",
        password:
          "admin123456",
        confirmPassword:
          "",
        bracket:
          "1",
      });

      return;
    }


    setForm({
      fullName: "",
      email:
        "user@stax.com",
      password:
        "user123456",
      confirmPassword:
        "",
      bracket:
        "1",
    });
  }


  /* =========================================================
     LOGIN FORM
  ========================================================= */

  function renderLoginForm() {
    return (
      <>
        <div className="stax-login-heading">

          <span className="stax-login-eyebrow">
            Welcome back
          </span>


          <h2>
            Sign in to STAX
          </h2>


          <p>
            Enter your credentials
            to continue.
          </p>

        </div>


        <form
          className="stax-login-form"
          onSubmit={
            handleLogin
          }
        >

          <label className="stax-login-field">

            <span>
              Email
            </span>


            <div className="stax-login-input">

              <Mail
                size={18}
              />


              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </label>


          <label className="stax-login-field">

            <span>
              Password
            </span>


            <div className="stax-login-input">

              <LockKeyhole
                size={18}
              />


              <input
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
              />


              <button
                type="button"
                className="stax-password-toggle"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >

                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}

              </button>

            </div>

          </label>


          {error && (
            <div className="stax-login-error">
              {error}
            </div>
          )}


          {success && (
            <div className="stax-login-success">
              {success}
            </div>
          )}


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="stax-login-submit"
          >

            {isSubmitting
              ? "Signing in..."
              : "Sign in"}


            {!isSubmitting && (
              <ArrowRight
                size={18}
              />
            )}

          </button>

        </form>


        <div className="stax-signup-prompt">

          <span>
            Don't have an account?
          </span>


          <button
            type="button"
            onClick={() =>
              switchMode(
                "signup"
              )
            }
          >
            Create player account
          </button>

        </div>


        <div className="stax-demo-divider">
          Demo accounts
        </div>


        <div className="stax-demo-accounts">

          <button
            type="button"
            onClick={() =>
              fillDemoAccount(
                "user"
              )
            }
          >

            <span className="stax-demo-icon">
              U
            </span>


            <span>

              <strong>
                User account
              </strong>

              <small>
                user@stax.com
              </small>

            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              fillDemoAccount(
                "admin"
              )
            }
          >

            <span className="stax-demo-icon">
              A
            </span>


            <span>

              <strong>
                Admin account
              </strong>

              <small>
                admin@stax.com
              </small>

            </span>

          </button>

        </div>
      </>
    );
  }


  /* =========================================================
     SIGNUP FORM
  ========================================================= */

  function renderSignupForm() {
    return (
      <>
        <button
          type="button"
          className="stax-back-login"
          onClick={() =>
            switchMode(
              "login"
            )
          }
        >
          <ArrowLeft
            size={17}
          />

          Back to sign in
        </button>


        <div className="stax-login-heading">

          <span className="stax-login-eyebrow">
            Player registration
          </span>


          <h2>
            Create your STAX account
          </h2>


          <p>
            Create a player account
            to shop cards, join events,
            and participate in rankings.
          </p>

        </div>


        <form
          className="stax-login-form"
          onSubmit={
            handleSignUp
          }
        >

          {/* FULL NAME */}

          <label className="stax-login-field">

            <span>
              Full name
            </span>


            <div className="stax-login-input">

              <User
                size={18}
              />


              <input
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="Enter your full name"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </label>


          {/* EMAIL */}

          <label className="stax-login-field">

            <span>
              Email
            </span>


            <div className="stax-login-input">

              <Mail
                size={18}
              />


              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </label>


          {/* BRACKET */}

          <label className="stax-login-field">

            <span>
              Player bracket
            </span>


            <div className="stax-login-input stax-login-select">

              <Trophy
                size={18}
              />


              <select
                name="bracket"
                value={
                  form.bracket
                }
                onChange={
                  handleChange
                }
              >

                <option value="1">
                  Bracket 1
                </option>

                <option value="2">
                  Bracket 2
                </option>

                <option value="3">
                  Bracket 3
                </option>

                <option value="4">
                  Bracket 4
                </option>

              </select>

            </div>

          </label>


          {/* PASSWORD */}

          <label className="stax-login-field">

            <span>
              Password
            </span>


            <div className="stax-login-input">

              <LockKeyhole
                size={18}
              />


              <input
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.password
                }
                onChange={
                  handleChange
                }
              />


              <button
                type="button"
                className="stax-password-toggle"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >

                {showPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}

              </button>

            </div>

          </label>


          {/* CONFIRM PASSWORD */}

          <label className="stax-login-field">

            <span>
              Confirm password
            </span>


            <div className="stax-login-input">

              <LockKeyhole
                size={18}
              />


              <input
                name="confirmPassword"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Enter your password again"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={
                  handleChange
                }
              />


              <button
                type="button"
                className="stax-password-toggle"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                onClick={() =>
                  setShowConfirmPassword(
                    (
                      current
                    ) =>
                      !current
                  )
                }
              >

                {showConfirmPassword ? (
                  <EyeOff
                    size={18}
                  />
                ) : (
                  <Eye
                    size={18}
                  />
                )}

              </button>

            </div>

          </label>


          <div className="stax-player-account-note">

            <ShieldCheck
              size={18}
            />


            <span>
              New accounts are created
              as player accounts only.
            </span>

          </div>


          {error && (
            <div className="stax-login-error">
              {error}
            </div>
          )}


          {success && (
            <div className="stax-login-success">
              {success}
            </div>
          )}


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="stax-login-submit"
          >

            {isSubmitting
              ? "Creating account..."
              : "Create account"}


            {!isSubmitting && (
              <ArrowRight
                size={18}
              />
            )}

          </button>

        </form>


        <div className="stax-signup-prompt">

          <span>
            Already have an account?
          </span>


          <button
            type="button"
            onClick={() =>
              switchMode(
                "login"
              )
            }
          >
            Sign in
          </button>

        </div>
      </>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="stax-login-page">

      <section className="stax-login-showcase">

        <div className="stax-login-showcase__glow" />


        <div className="stax-login-brand">

          <div className="stax-login-brand__logo">
            S
          </div>


          <div>

            <strong>
              STAX
            </strong>

            <span>
              Cards. Events. Community.
            </span>

          </div>

        </div>


        <div className="stax-login-showcase__content">

          <span className="stax-login-eyebrow">

            <Sparkles
              size={15}
            />

            The card shop experience

          </span>


          <h1>
            Build your deck.

            <span>
              {" "}
              Rise through the ranks.
            </span>
          </h1>


          <p>
            Browse collectible cards,
            join competitive events,
            check player rankings,
            and connect with the
            STAX community.
          </p>


          <div className="stax-login-features">

            <article>

              <ShieldCheck
                size={21}
              />


              <div>

                <strong>
                  Secure access
                </strong>

                <span>
                  Separate player and
                  administrator accounts.
                </span>

              </div>

            </article>


            <article>

              <Sparkles
                size={21}
              />


              <div>

                <strong>
                  One platform
                </strong>

                <span>
                  Cards, tournaments,
                  rankings and orders.
                </span>

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

            <div className="stax-login-brand__logo">
              S
            </div>


            <div>

              <strong>
                STAX
              </strong>

              <span>
                Card Shop
              </span>

            </div>

          </div>


          {mode ===
          "login"
            ? renderLoginForm()
            : renderSignupForm()}

        </div>

      </section>

    </main>
  );
}


export default Login;