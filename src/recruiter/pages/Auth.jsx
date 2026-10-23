import React, { useMemo, useState } from "react";

export function Login({ onRegister, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    const result = onLogin(form);

    if (result?.error) setError(result.error);
  };

  return (
    <div className="auth">
      <section className="auth-left">
        <div className="auth-logo">Omics<span>Hub</span></div>
        <div>
          <small>RECRUITER WORKSPACE</small>
          <h1>Build stronger scientific teams.</h1>
          <p>
            Manage opportunities, discover talent and move candidates
            through a professional recruitment workflow.
          </p>
          <div className="ticks">
            <span>✓ Job management</span>
            <span>✓ Scientific talent search</span>
            <span>✓ Recruitment analytics</span>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card">
          <small>WELCOME BACK</small>
          <h2>Recruiter Sign In</h2>
          <p>Access your OmicsHub workspace.</p>

          <button
            className="google"
            type="button"
            onClick={() =>
              setError(
                "Google sign-in requires a configured authentication provider."
              )
            }
          >
            <b>G</b>Continue with Google
          </button>

          <div className="or">OR CONTINUE WITH EMAIL</div>

          <form onSubmit={submit}>
            <label>
              Work email
              <input
                type="email"
                value={form.email}
                onChange={(event) => {
                  setForm({ ...form, email: event.target.value });
                  setError("");
                }}
                placeholder="you@company.com"
                required
              />
            </label>

            <label>
              Password
              <div className="pass">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => {
                    setForm({ ...form, password: event.target.value });
                    setError("");
                  }}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && <div className="error">{error}</div>}

            <button className="primary full" type="submit">
              Sign In →
            </button>
          </form>

          <div className="switch">
            New to OmicsHub?{" "}
            <button type="button" onClick={onRegister}>
              Create a recruiter account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Register({ onLogin, onRegister }) {
  const [form, setForm] = useState({
    recruiterName: "",
    companyName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    industry: "Biotechnology",
    companySize: "",
    location: "",
    website: "",
    bio: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordScore = useMemo(
    () =>
      [
        form.password.length >= 8,
        /[A-Z]/.test(form.password),
        /[0-9]/.test(form.password),
        /[^A-Za-z0-9]/.test(form.password),
      ].filter(Boolean).length,
    [form.password]
  );

  const change = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const submit = (event) => {
    event.preventDefault();

    if (
      !form.recruiterName.trim() ||
      !form.companyName.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("Complete all required account fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (form.website && !/^https?:\/\//i.test(form.website)) {
      setError("Enter the company website starting with https:// or http://.");
      return;
    }

    if (!form.terms) {
      setError("Please accept the recruiter terms.");
      return;
    }

    onRegister({
      recruiterName: form.recruiterName.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
      industry: form.industry,
      companySize: form.companySize,
      location: form.location.trim(),
      website: form.website.trim(),
      bio: form.bio.trim(),
    });
  };

  return (
    <div className="auth">
      <section className="auth-left">
        <div className="auth-logo">Omics<span>Hub</span></div>
        <div>
          <small>BUILD YOUR SCIENTIFIC TEAM</small>
          <h1>Recruit with confidence.</h1>
          <p>
            Create a professional workspace for biotechnology, genomics,
            bioinformatics and life-science recruitment.
          </p>
          <div className="mini-stats">
            <b>∞<small>Scientific talent</small></b>
            <b>24/7<small>Workspace access</small></b>
            <b>1<small>Recruiter workspace</small></b>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-card register">
          <small>GET STARTED</small>
          <h2>Create recruiter account</h2>
          <p>Set up your account and organization profile.</p>

          <form onSubmit={submit}>
            <div className="registration-section">
              <h3>Recruiter information</h3>
              <p>Your account and contact details.</p>
            </div>

            <div className="two">
              <label>
                Full name *
                <input
                  name="recruiterName"
                  value={form.recruiterName}
                  onChange={change}
                  placeholder="Your name"
                  required
                />
              </label>

              <label>
                Work email *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  placeholder="+91 98765 43210"
                />
              </label>

              <label>
                Password *
                <div className="pass">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={change}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            </div>

            {form.password && (
              <div className="strength">
                <div>
                  {[1, 2, 3, 4].map((level) => (
                    <i
                      className={passwordScore >= level ? "on" : ""}
                      key={level}
                    />
                  ))}
                </div>
                <small>
                  {["", "Weak", "Fair", "Good", "Strong"][passwordScore]} password
                </small>
              </div>
            )}

            <label>
              Confirm password *
              <input
                name="confirm"
                type={showPassword ? "text" : "password"}
                value={form.confirm}
                onChange={change}
                placeholder="Repeat password"
                required
              />
            </label>

            <div className="registration-section">
              <h3>Company information</h3>
              <p>This information will be displayed on your Company Profile page.</p>
            </div>

            <label>
              Company / Institution name *
              <input
                name="companyName"
                value={form.companyName}
                onChange={change}
                placeholder="Organization name"
                required
              />
            </label>

            <div className="two">
              <label>
                Industry
                <select
                  name="industry"
                  value={form.industry}
                  onChange={change}
                >
                  <option>Biotechnology</option>
                  <option>Bioinformatics</option>
                  <option>Genomics</option>
                  <option>Pharmaceuticals</option>
                  <option>Healthcare</option>
                  <option>Clinical Research</option>
                  <option>Academic / Research Institution</option>
                  <option>Life Sciences</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Company size
                <select
                  name="companySize"
                  value={form.companySize}
                  onChange={change}
                >
                  <option value="">Select company size</option>
                  <option>1–10 employees</option>
                  <option>11–50 employees</option>
                  <option>51–200 employees</option>
                  <option>201–500 employees</option>
                  <option>501–1,000 employees</option>
                  <option>1,000+ employees</option>
                </select>
              </label>

              <label>
                Headquarters / Location
                <input
                  name="location"
                  value={form.location}
                  onChange={change}
                  placeholder="City, country"
                />
              </label>

              <label>
                Company website
                <input
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={change}
                  placeholder="https://company.com"
                />
              </label>
            </div>

            <label>
              About the organization
              <textarea
                name="bio"
                value={form.bio}
                onChange={change}
                rows="4"
                placeholder="Briefly describe your organization, research focus or scientific team..."
              />
            </label>

            {error && <div className="error">{error}</div>}

            <label className="check">
              <input
                name="terms"
                type="checkbox"
                checked={form.terms}
                onChange={change}
              />
              I agree to the OmicsHub recruiter terms and privacy policy.
            </label>

            <button className="primary full" type="submit">
              Create Recruiter Account →
            </button>
          </form>

          <div className="switch">
            Already have an account?{" "}
            <button type="button" onClick={onLogin}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}