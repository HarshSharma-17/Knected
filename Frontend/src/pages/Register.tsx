import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles normal account registration
  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const result = await registerUser(name, email, password);

      if (result.success) {
        alert("Account created successfully!");
        navigate("/login");
      } else {
        alert(result.message || "Registration failed");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Something went wrong. Please try again.");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Uses the existing Google authentication endpoint
  const handleGoogleSignup = async (credential: string) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/auth/google", {
        idToken: credential,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        navigate("/dashboard");
      } else {
        alert(response.data.message || "Google signup failed");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Google authentication failed");
      } else {
        alert("Something went wrong during Google signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Signup uses a different dependency pattern from Login */}
      <svg className="dependency-graph" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g className="graph-network">
          <path d="M0 120 H120 L190 190 H360 L430 120 H570" />
          <path d="M0 300 H170 L240 240 H390 L470 300 H540" />
          <path d="M0 500 H100 L180 420 H330 L410 500 H560" />
          <path d="M0 710 H150 L230 630 H390 L470 710 H580" />
          <path d="M120 120 V240" />
          <path d="M330 420 V300" />
          <path d="M390 630 V500" />
          <circle cx="120" cy="120" r="5" /><circle cx="190" cy="190" r="5" />
          <circle cx="360" cy="190" r="5" /><circle cx="240" cy="240" r="5" />
          <circle cx="390" cy="240" r="5" /><circle cx="180" cy="420" r="5" />
          <circle cx="330" cy="420" r="5" /><circle cx="230" cy="630" r="5" />
          <circle cx="390" cy="630" r="5" />

          <path d="M1600 120 H1480 L1410 190 H1240 L1170 120 H1030" />
          <path d="M1600 300 H1430 L1360 240 H1210 L1130 300 H1060" />
          <path d="M1600 500 H1500 L1420 420 H1270 L1190 500 H1040" />
          <path d="M1600 710 H1450 L1370 630 H1210 L1130 710 H1020" />
          <path d="M1480 120 V240" />
          <path d="M1270 420 V300" />
          <path d="M1210 630 V500" />
          <circle cx="1480" cy="120" r="5" /><circle cx="1410" cy="190" r="5" />
          <circle cx="1240" cy="190" r="5" /><circle cx="1360" cy="240" r="5" />
          <circle cx="1210" cy="240" r="5" /><circle cx="1420" cy="420" r="5" />
          <circle cx="1270" cy="420" r="5" /><circle cx="1370" cy="630" r="5" />
          <circle cx="1210" cy="630" r="5" />
        </g>

        <g className="floating-nodes">
          <circle cx="70" cy="70" r="3" /><circle cx="300" cy="90" r="3" />
          <circle cx="520" cy="220" r="3" /><circle cx="80" cy="820" r="3" />
          <circle cx="310" cy="760" r="3" /><circle cx="520" cy="850" r="3" />
          <circle cx="1530" cy="70" r="3" /><circle cx="1300" cy="90" r="3" />
          <circle cx="1080" cy="220" r="3" /><circle cx="1520" cy="820" r="3" />
          <circle cx="1290" cy="760" r="3" /><circle cx="1080" cy="850" r="3" />
        </g>

        <g className="circuit-lines">
          <path d="M0 220 H210" /><path d="M0 400 H140" />
          <path d="M0 610 H240" /><path d="M1600 220 H1390" />
          <path d="M1600 400 H1460" /><path d="M1600 610 H1360" />
        </g>
      </svg>

      <div className="graph-overlay" />

      <main className="register-content">
        <div className="brand">
          <img className="knected-logo" src="/knected-logo.png" alt="Knected - AI Code Dependency Visualizer" />
        </div>

        <div className="register-form">
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" placeholder="Enter your name" value={name}
              onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="Enter your email" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Create a password" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" placeholder="Confirm your password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              onKeyDown={(e) => { if (e.key === "Enter") handleSignup(); }} />
          </div>

          <button type="button" className="register-button" onClick={handleSignup} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <div className="google-login-section">
            <div className="google-divider"><span /><p>OR</p><span /></div>

            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
              <div className="google-login-wrapper">
                <button type="button" className="custom-google-button" aria-label="Continue with Google">
                  <img src="/google-logo.png" alt="Google" className="google-logo" />
                  <span>Continue with Google</span>
                </button>

                <div className="google-auth-overlay">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleSignup(credentialResponse.credential);
                      } else {
                        alert("Google did not return a credential");
                      }
                    }}
                    onError={() => alert("Google signup failed")}
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    width="320"
                    useOneTap={false}
                  />
                </div>
              </div>
            </GoogleOAuthProvider>
          </div>

          <p className="login-text">
            Already have an account?
            <button type="button" className="login-link" onClick={() => navigate("/login")}>Login</button>
          </p>
        </div>
      </main>

      <div className="bottom-text">
        <span className="status-dot" />
        <span>Build</span><span className="separator">•</span>
        <span>Connect</span><span className="separator">•</span>
        <span>Understand</span>
      </div>

      <style>{`
        * { box-sizing: border-box; }

        .register-page {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          color: #111;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .dependency-graph {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          opacity: .9;
        }

        .graph-network path {
          fill: none;
          stroke: #111;
          stroke-width: 1.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: .52;
          animation: registerConnectionPulse 8s ease-in-out infinite;
        }

        .graph-network circle {
          fill: #111;
          opacity: .82;
          animation: registerNodePulse 5s ease-in-out infinite;
        }

        .floating-nodes circle {
          fill: #555;
          opacity: .6;
          animation: registerFloatingPulse 6s ease-in-out infinite;
        }

        .circuit-lines path {
          fill: none;
          stroke: rgba(50,50,50,.2);
          stroke-width: 1;
          stroke-linecap: round;
        }

        @keyframes registerConnectionPulse {
          0%,100% { opacity: .38; }
          50% { opacity: .78; }
        }

        @keyframes registerNodePulse {
          0%,100% {
            opacity: .5;
            transform: scale(.9);
            transform-box: fill-box;
            transform-origin: center;
          }
          50% {
            opacity: .9;
            transform: scale(1.12);
            transform-box: fill-box;
            transform-origin: center;
          }
        }

        @keyframes registerFloatingPulse {
          0%,100% { opacity: .4; }
          50% { opacity: .8; }
        }

        .graph-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            rgba(255,255,255,.985) 0%,
            rgba(255,255,255,.94) 40%,
            rgba(255,255,255,.74) 76%,
            rgba(255,255,255,.88) 100%
          );
        }

        .register-content {
          position: relative;
          z-index: 10;
          width: min(390px, calc(100vw - 44px));
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-bottom: 20px;
        }

        .knected-logo {
          display: block;
          width: min(280px, 74vw);
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .register-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group { width: 100%; }

        .input-group label {
          display: block;
          margin-bottom: 6px;
          color: rgba(55,55,55,.7);
          font-size: 11px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .input-group input {
          width: 100%;
          height: 43px;
          padding: 0 3px;
          border: none;
          border-bottom: 1px solid rgba(30,30,30,.22);
          outline: none;
          background: transparent;
          color: #0c0c0c;
          font-size: 14px;
          transition: border-color .25s ease, box-shadow .25s ease;
        }

        .input-group input::placeholder { color: rgba(100,100,100,.5); }

        .input-group input:focus {
          border-bottom-color: rgba(17,17,17,.75);
          box-shadow: 0 8px 24px -18px rgba(0,0,0,.18);
        }

        .register-button {
          align-self: center;
          width: 320px;
          height: 44px;
          margin-top: 7px;
          border: 1px solid #111;
          border-radius: 90px;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.1px;
          cursor: pointer;
          transition: all .25s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,.1);
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #000;
          border-color: #000;
          box-shadow: 0 12px 28px rgba(0,0,0,.16);
        }

        .register-button:disabled { cursor: not-allowed; opacity: .55; }

        .google-login-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .google-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .google-divider span {
          flex: 1;
          height: 1px;
          background: rgba(0,0,0,.12);
        }

        .google-divider p {
          margin: 0;
          color: rgba(27,27,27,.72);
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .google-login-wrapper {
          position: relative;
          width: 320px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 90px;
        }

        .custom-google-button {
          position: absolute;
          inset: 0;
          width: 320px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #777;
          border-radius: 90px;
          background: #fff;
          color: #111;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, box-shadow .2s ease;
        }

        .custom-google-button:hover {
          background: #fafafa;
          border-color: #555;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        .custom-google-button .google-logo {
          position: absolute;
          left: 20px;
          width: 22px;
          height: 22px;
          object-fit: contain;
        }

        .google-auth-overlay {
          position: absolute;
          inset: 0;
          width: 320px;
          height: 44px;
          opacity: 0;
          z-index: 5;
        }

        .google-auth-overlay > div {
          width: 320px !important;
          max-width: 320px !important;
          height: 44px !important;
        }

        .login-text {
          margin: 1px 0 0;
          text-align: center;
          color: rgba(80,80,80,.85);
          font-size: 12px;
        }

        .login-link {
          padding: 0;
          margin-left: 5px;
          border: none;
          background: none;
          color: #111;
          font: inherit;
          cursor: pointer;
        }

        .login-link:hover { color: #555; }

        .bottom-text {
          position: absolute;
          z-index: 10;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(70,70,70,.55);
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #111;
          animation: statusPulse 2.5s ease-in-out infinite;
        }

        .separator { opacity: .35; }

        @keyframes statusPulse {
          0%,100% { opacity: .4; }
          50% { opacity: 1; }
        }

        @media (max-width: 700px) {
          .dependency-graph { opacity: .65; }
          .register-content { width: min(350px, calc(100vw - 44px)); }
          .brand { margin-bottom: 24px; }
          .knected-logo { width: min(250px, 76vw); }
          .bottom-text { bottom: 17px; font-size: 8px; }
        }

        @media (max-height: 760px) {
          .brand { margin-bottom: 12px; }
          .knected-logo { width: min(230px, 68vw); }
          .register-form { gap: 12px; }
          .input-group input { height: 39px; }
          .register-button,
          .google-login-wrapper,
          .custom-google-button,
          .google-auth-overlay { height: 42px; }
        }
      `}</style>
    </div>
  );
};

export default Register;
