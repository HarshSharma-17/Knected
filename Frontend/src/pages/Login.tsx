import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handles Google authentication and exchanges the Google ID token for a Knected JWT
  const handleGoogleLogin = async (credential: string) => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          idToken: credential,
        }
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        navigate("/dashboard");
      } else {
        alert(response.data.message || "Google login failed");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Google authentication failed"
        );
      } else {
        alert("Something went wrong during Google login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handles login using the existing backend authentication API
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(email, password);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        navigate("/dashboard");
      } else {
        alert(result.message || "Login failed");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="ambient-glow glow-left"></div>
      <div className="ambient-glow glow-right"></div>


      {/* =====================================================
          DEPENDENCY / CODE GRAPH BACKGROUND
      ===================================================== */}

      <svg
        className="dependency-graph"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>

          {/* Graph line gradient */}
          <linearGradient
            id="connectionGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0%" stopColor="#3978ff" />
            <stop offset="50%" stopColor="#6d8cff" />
            <stop offset="100%" stopColor="#8d6cff" />
          </linearGradient>

          {/* Node glow */}
          <filter id="nodeGlow">
            <feGaussianBlur
              stdDeviation="4"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Line glow */}
          <filter id="lineGlow">
            <feGaussianBlur
              stdDeviation="2"
              result="blur"
            />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

        </defs>


        {/* =================================================
            LEFT DEPENDENCY NETWORK
        ================================================= */}

        <g className="graph-network">

          <path d="M0 170 H150 L220 230 H380" />

          <path d="M0 320 H110 L175 260 H315 L375 320 H500" />

          <path d="M0 500 H150 L220 430 H380 L445 500 H520" />

          <path d="M0 680 H120 L195 610 H350 L420 680 H500" />

          <path d="M150 170 V260" />

          <path d="M220 430 V320" />

          <path d="M350 610 V500" />


          {/* Nodes */}

          <circle cx="150" cy="170" r="5" />

          <circle cx="380" cy="230" r="5" />

          <circle cx="175" cy="260" r="5" />

          <circle cx="315" cy="260" r="5" />

          <circle cx="220" cy="430" r="5" />

          <circle cx="380" cy="430" r="5" />

          <circle cx="195" cy="610" r="5" />

          <circle cx="350" cy="610" r="5" />

        </g>


        {/* =================================================
            RIGHT DEPENDENCY NETWORK
        ================================================= */}

        <g className="graph-network">

          <path d="M1600 170 H1450 L1380 230 H1220" />

          <path d="M1600 320 H1490 L1420 260 H1280 L1220 320 H1090" />

          <path d="M1600 500 H1460 L1390 430 H1230 L1170 500 H1080" />

          <path d="M1600 680 H1480 L1410 610 H1250 L1180 680 H1080" />

          <path d="M1450 170 V260" />

          <path d="M1390 430 V320" />

          <path d="M1250 610 V500" />


          {/* Nodes */}

          <circle cx="1450" cy="170" r="5" />

          <circle cx="1380" cy="230" r="5" />

          <circle cx="1420" cy="260" r="5" />

          <circle cx="1280" cy="260" r="5" />

          <circle cx="1390" cy="430" r="5" />

          <circle cx="1230" cy="430" r="5" />

          <circle cx="1410" cy="610" r="5" />

          <circle cx="1250" cy="610" r="5" />

        </g>


        {/* =================================================
            SMALL FLOATING CODE NODES
        ================================================= */}

        <g className="floating-nodes">

          <circle cx="80" cy="105" r="3" />
          <circle cx="300" cy="110" r="3" />
          <circle cx="500" cy="160" r="3" />

          <circle cx="90" cy="760" r="3" />
          <circle cx="290" cy="800" r="3" />
          <circle cx="500" cy="730" r="3" />

          <circle cx="1520" cy="105" r="3" />
          <circle cx="1300" cy="110" r="3" />
          <circle cx="1090" cy="160" r="3" />

          <circle cx="1510" cy="760" r="3" />
          <circle cx="1310" cy="800" r="3" />
          <circle cx="1100" cy="730" r="3" />

        </g>


        {/* =================================================
            SUBTLE HORIZONTAL CIRCUIT LINES
        ================================================= */}

        <g className="circuit-lines">

          <path d="M0 220 H250" />
          <path d="M0 390 H180" />
          <path d="M0 590 H260" />
          <path d="M0 735 H300" />

          <path d="M1600 220 H1350" />
          <path d="M1600 390 H1420" />
          <path d="M1600 590 H1340" />
          <path d="M1600 735 H1300" />

        </g>

      </svg>


      {/* Dark center overlay */}
      <div className="graph-overlay"></div>


      {/* =====================================================
          LOGIN CONTENT
      ===================================================== */}

      <main className="login-content">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="brand">

          <img
            className="knected-logo"
            src="/knected-logo.png"
            alt="Knected - AI Code Dependency Visualizer"
          />

        </div>


        {/* =================================================
            LOGIN FORM
        ================================================= */}

        <div className="login-form">

          {/* Email */}

          <div className="input-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

          </div>


          {/* Password */}

          <div className="input-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

          </div>


          {/* Login Button */}

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Login"}
          </button>

          {/* Google Login */}
          <div className="google-login-section">
            <div className="google-divider">
              <span></span>
              <p>OR</p>
              <span></span>
            </div>

            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            >
              <div className="google-login-wrapper">
            
              <button
                type="button"
                className="custom-google-button"
                aria-label="Continue with Google"
              >
                <img
                  src="/google-logo.png"
                  alt="Google"
                  className="google-logo"
                />
              
                <span>Continue with Google</span>
              </button>
            
              {/* Real Google authentication button */}
              <div className="google-auth-overlay">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleLogin(
                        credentialResponse.credential
                      );
                    } else {
                      alert("Google did not return a credential");
                    }
                  }}
                  onError={() => {
                    alert("Google login failed");
                  }}
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


          {/* Register */}

          <p className="register-text">

            Don't have an account?

            <button
              className="register-link"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>

          </p>

        </div>

      </main>


      {/* =====================================================
          BOTTOM STATUS
      ===================================================== */}

      <div className="bottom-text">

        <span className="status-dot"></span>

        <span>
          Analyze
        </span>

        <span className="separator">
          •
        </span>

        <span>
          Connect
        </span>

        <span className="separator">
          •
        </span>

        <span>
          Understand
        </span>

      </div>


      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`

        /* =================================================
           RESET
        ================================================= */

        * {
          box-sizing: border-box;
        }


        /* =================================================
           PAGE
        ================================================= */

        .login-page {
          position: relative;

          width: 100vw;
          min-height: 100vh;

          overflow: hidden;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #ffffff;

          color: #111111;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }


        /* =================================================
           AMBIENT GLOW
        ================================================= */

        .ambient-glow {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(110px);
        }


        .glow-left,
        .glow-right {
          display: none;
        }


        /* =================================================
           DEPENDENCY GRAPH
        ================================================= */

        .dependency-graph {
          position: absolute;

          inset: 0;

          width: 100vw;
          height: 100vh;

          pointer-events: none;

          opacity: 0.9;
        }


        /* =================================================
           GRAPH CONNECTIONS
        ================================================= */

        .graph-network path {
          fill: none;

          stroke: #111111;

          stroke-width: 1.6;

          stroke-linecap: round;
          stroke-linejoin: round;

          opacity: 0.55;

          filter: none;

          animation:
            connectionPulse
            7s
            ease-in-out
            infinite;
        }


        .graph-network circle {
          fill: #111111;

          opacity: 0.9;

          filter: none;

          animation:
            nodePulse
            4s
            ease-in-out
            infinite;
        }


        .floating-nodes circle {
          fill: #555555;

          opacity: 0.65;

          filter: none;

          animation:
            floatingPulse
            5s
            ease-in-out
            infinite;
        }


        .circuit-lines path {
          fill: none;

          stroke: rgba(
            50,
            50,
            50,
            0.22
          );

          stroke-width: 1;

          stroke-linecap: round;
        }


        /* =================================================
           ANIMATIONS
        ================================================= */

        @keyframes connectionPulse {

          0%,
          100% {
            opacity: 0.55;
          }

          50% {
            opacity: 0.95;
          }

        }


        @keyframes nodePulse {

          0%,
          100% {
            opacity: 0.55;

            transform: scale(0.9);

            transform-box: fill-box;
            transform-origin: center;
          }

          50% {
            opacity: 0.95;

            transform: scale(1.15);

            transform-box: fill-box;
            transform-origin: center;
          }

        }


        @keyframes floatingPulse {

          0%,
          100% {
            opacity: 0.55;
          }

          50% {
            opacity: 0.95;
          }

        }


        /* =================================================
           GRAPH OVERLAY
        ================================================= */

        .graph-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.92) 42%,
            rgba(255, 255, 255, 0.72) 76%,
            rgba(255, 255, 255, 0.88) 100%
          );
        }


        /* =================================================
           LOGIN CONTENT
        ================================================= */

        .login-content {
          position: relative;

          z-index: 10;

          width: min(
            390px,
            calc(100vw - 44px)
          );

          display: flex;

          flex-direction: column;

          align-items: center;
        }


        /* =================================================
           BRAND
        ================================================= */

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-bottom: 24px;
        }

        .knected-logo {
          display: block;
          width: min(300px, 76vw);
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
        }


        /* =================================================
           FORM
        ================================================= */

        .login-form {
          width: 100%;

          display: flex;

          flex-direction: column;

          gap: 22px;
        }


        /* =================================================
           INPUT
        ================================================= */

        .input-group {
          width: 100%;
        }


        .input-group label {
          display: block;

          margin-bottom: 8px;

          color:
            rgba(
              55,
              55,
              55,
              0.68
            );

          font-size: 12px;

          letter-spacing: 1.5px;

          text-transform: uppercase;
        }


        .input-group input {
          width: 100%;

          height: 48px;

          padding:
            0 3px;

          border: none;

          border-bottom:
            1px solid
            rgba(
              30,
              30,
              30,
              0.22
            );

          outline: none;

          background: transparent;

          color: #0c0c0c;

          font-size: 14px;

          transition:
            border-color
            0.3s ease,
            box-shadow
            0.3s ease;
        }


        .input-group input::placeholder {
          color:
            rgba(
              100,
              100,
              100,
              0.55
            );
        }


        .input-group input:focus {
          border-bottom-color:
            rgba(
              17,
              17,
              17,
              0.75
            );

          box-shadow:
            0 8px 24px -18px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }


        /* =================================================
           LOGIN BUTTON
        ================================================= */

        .login-button {
          align-self: center;
          width: 320px;
          height: 44px;
          margin-top: 12px;
          border: 1px solid #111111;
          border-radius: 90px;
          background: #111111;
          color: #ffffff;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1.1px;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
        }


        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #000000;
          border-color: #000000;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
        }


        .login-button:active:not(:disabled) {
          transform:
            translateY(0);
        }


        .login-button:disabled {
          cursor:
            not-allowed;

          opacity: 0.55;
        }


        /* =================================================
           REGISTER
        ================================================= */

        .google-login-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
          border-radius: 90px;
        }

        .google-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 2px;
        }

        .google-divider span {
          flex: 1;
          height: 1px;
          background: rgba(0, 0, 0, 0.12);
        }

        .google-divider p {
          margin: 0;
          color: rgba(27, 27, 27, 0.85);
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
          
            border: 1px solid #777777;
            border-radius: 90px;
          
            background: #ffffff;
          
            color: #111111;
          
            font-family:
              Inter,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          
            font-size: 14px;
            font-weight: 500;
          
            cursor: pointer;
          
            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }
          
          .custom-google-button:hover {
            background: #fafafa;
            border-color: #444444;
          
            box-shadow:
              0 6px 18px rgba(0, 0, 0, 0.08);
          }
          
          .google-logo {
            position: absolute;
          
            left: 20px;
          
            width: 22px;
            height: 22px;
          
            object-fit: contain;
          }
          
          .custom-google-button span {
            color: #111111;
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
        .google-login-wrapper > div {
          width: 100% !important;
          max-width: 320px !important;
        }

        .register-text {
          margin: 3px 0 0;

          text-align: center;

          color:
            rgba(
              80,
              80,
              80,
              0.85
            );

          font-size: 12px;
        }


        .register-link {
          padding: 0;

          margin-left: 5px;

          border: none;

          background: none;

          color: #111111;

          font: inherit;

          cursor: pointer;

          transition:
            color
            0.2s
            ease;
        }


        .register-link:hover {
          color: #555555;
        }
        

        /* =================================================
           BOTTOM STATUS
        ================================================= */

        .bottom-text {
          position: absolute;

          z-index: 10;

          bottom: 25px;

          left: 50%;

          transform:
            translateX(-50%);

          display: flex;

          align-items: center;

          gap: 7px;

          color:
            rgba(
              70,
              70,
              70,
              0.55
            );

          font-size: 9px;

          letter-spacing: 1.5px;

          text-transform: uppercase;

          white-space: nowrap;
        }


        .status-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #111111;

          box-shadow:
            0 0 10px
            rgba(
              0,
              0,
              0,
              0.55
            );

          animation:
            statusPulse
            2.5s
            ease-in-out
            infinite;
        }


        .separator {
          opacity: 0.35;
        }


        @keyframes statusPulse {

          0%,
          100% {
            opacity: 0.4;
          }

          50% {
            opacity: 1;
          }

        }


        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 700px) {

          .dependency-graph {
            opacity: 0.65;
          }


          .login-content {
            width:
              min(
                350px,
                calc(100vw - 44px)
              );
          }


          .brand {
            margin-bottom: 30px;
          }

          .knected-logo {
            width: min(250px, 76vw);
          }


          .brand h1 {
            font-size: 31px;
          }


          .brand p {
            font-size: 9px;

            letter-spacing: 1.6px;
          }


          .bottom-text {
            bottom: 17px;

            font-size: 8px;
          }

        }


        @media (max-height: 700px) {

          .brand {
            margin-bottom: 22px;
          }

          .knected-logo {
            width: min(225px, 70vw);
          }


          .brand-mark {
            width: 48px;
            height: 48px;

            margin-bottom: 10px;
          }


          .brand h1 {
            font-size: 29px;
          }


          .login-form {
            gap: 18px;
          }


          .input-group input {
            height: 42px;
          }

        }

      `}</style>

    </div>
  );
};

export default Login;