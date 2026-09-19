import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLogo from "../components/DashboardLogo";

const GithubAnalysis = () => {
  const navigate = useNavigate();

  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setError("");

    if (!githubUrl.trim()) {
      setError("Please enter a GitHub repository URL.");
      return;
    }

    if (!githubUrl.includes("github.com")) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    try {
      setLoading(true);
    
      const token = localStorage.getItem("token");
    
      if (!token) {
        throw new Error("Your session has expired. Please login again.");
      }
    
      const response = await fetch(
        "http://localhost:5000/api/github/clone",
        {
          method: "POST",
    
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
    
          body: JSON.stringify({
            githubUrl: githubUrl.trim(),
          }),
        }
      );
    
      const result = await response.json();
    
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "GitHub analysis failed."
        );
      }
    
      // Get project ID created by backend
      const projectId = result.data?.projectId;
    
      if (!projectId) {
        throw new Error(
          "Analysis completed, but project ID was not returned."
        );
      }
    
      // Open the newly created project
      navigate(`/projects/${projectId}`);
    
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes branchPulse {
          0%, 100% { opacity: .35; transform: scale(.94); }
          50% { opacity: .95; transform: scale(1.08); }
        }

        @keyframes commitTravel {
          0% { stroke-dashoffset: 0; opacity: .18; }
          50% { opacity: .7; }
          100% { stroke-dashoffset: -140; opacity: .18; }
        }

        @keyframes branchDraw {
          0%, 100% { opacity: .28; }
          50% { opacity: .72; }
        }

        @keyframes terminalBlink {
          0%, 45%, 100% { opacity: .35; }
          50%, 75% { opacity: .9; }
        }

        @keyframes githubOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes githubOrbitReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes scanLine {
          0% { transform: translateX(-120%); opacity: 0; }
          20% { opacity: .5; }
          80% { opacity: .5; }
          100% { transform: translateX(120%); opacity: 0; }
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .github-nav-button { transition: color .2s ease; }
        .github-nav-button:hover { color: #edf1f2 !important; }

        .github-analysis-card {
          transition: border-color .25s ease, box-shadow .25s ease;
        }

        .github-analysis-card:focus-within {
          border-color: rgba(190,198,201,.48) !important;
          box-shadow: 0 0 0 1px rgba(190,198,201,.08),
                      0 30px 90px rgba(0,0,0,.35) !important;
        }

        .github-input::placeholder { color: #596166; }

        .github-analyze-button {
          transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .github-analyze-button:hover:not(:disabled) {
          transform: translateY(-1px);
          background: #f3f5f5 !important;
          box-shadow: 0 12px 30px rgba(190,198,201,.08);
        }

        @media (max-width: 900px) {
          .github-topbar { padding: 0 22px !important; }
          .github-nav-links { gap: 8px !important; }
          .github-nav-button {
            padding: 29px 7px 26px !important;
            font-size: 10px !important;
          }
          .github-main { width: 90% !important; }
          .github-hero-title { font-size: 50px !important; }
          .github-card { padding: 28px !important; }
          .github-steps { grid-template-columns: 1fr !important; }
          .github-step-line { display: none; }
          .git-reference-art { opacity: .42 !important; }
        }

        @media (max-width: 620px) {
          .github-logo { left: 18px !important; }
          .github-nav-links {
            margin-left: 55px !important;
            justify-content: flex-end !important;
          }
          .github-nav-button:nth-child(4) { display: none; }
          .github-status { display: none !important; }
          .github-hero-title { font-size: 38px !important; }
          .github-card { padding: 22px !important; }
          .github-card-header { flex-direction: column !important; }
          .github-badge { align-self: flex-start !important; }
          .git-reference-art { opacity: .22 !important; }
        }
`}</style>

      <div style={styles.gridOverlay} />
      <div style={styles.topGlow} />

      {/* GitHub-specific animated background: branches, commits, repo tree and clone terminal */}
      <div style={styles.gitBackground} className="git-reference-art" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 1400 820" preserveAspectRatio="none">
          <defs>
            <radialGradient id="commitGlow">
              <stop offset="0%" stopColor="#eef2f2" stopOpacity=".32" />
              <stop offset="35%" stopColor="#c6ced0" stopOpacity=".13" />
              <stop offset="100%" stopColor="#c6ced0" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="branchStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#aab4b8" stopOpacity=".08" />
              <stop offset="45%" stopColor="#d9dfe1" stopOpacity=".78" />
              <stop offset="100%" stopColor="#8e999e" stopOpacity=".08" />
            </linearGradient>
            <linearGradient id="branchDim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7e898e" stopOpacity=".02" />
              <stop offset="50%" stopColor="#c4ccce" stopOpacity=".32" />
              <stop offset="100%" stopColor="#7e898e" stopOpacity=".02" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* faint repository grid */}
          <g opacity=".22" stroke="#8d989d" strokeWidth=".5">
            {Array.from({length: 15}, (_, i) => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="820" />)}
            {Array.from({length: 9}, (_, i) => <line key={`h${i}`} x1="0" y1={i*100} x2="1400" y2={i*100} />)}
          </g>

          {/* MAIN branch */}
          <path d="M68 150 C68 220 120 246 120 318 C120 378 168 402 228 402 C300 402 325 455 325 520 C325 590 360 625 430 625"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.6" />
          <path d="M68 150 C68 220 120 246 120 318 C120 378 168 402 228 402 C300 402 325 455 325 520 C325 590 360 625 430 625"
            fill="none" stroke="#dce2e3" strokeOpacity=".22" strokeWidth="1"
            strokeDasharray="5 14" style={{animation:"commitTravel 8s linear infinite"}} />

          {/* DEVELOP branch */}
          <path d="M120 318 C120 350 142 370 182 370 L280 370 C320 370 348 345 348 310"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.25" />
          <path d="M348 310 C348 266 382 244 430 244 L495 244"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.25"
            strokeDasharray="5 11" style={{animation:"commitTravel 7s linear infinite reverse"}} />

          {/* FEATURE branch */}
          <path d="M228 402 C228 465 260 495 310 495 L420 495 C470 495 500 535 500 585"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.25" />
          <path d="M500 585 C500 625 536 650 585 650 L655 650"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.15"
            strokeDasharray="4 12" style={{animation:"commitTravel 10s linear infinite"}} />

          {/* animated commit nodes */}
          {[
            [68,150,8],[120,318,6],[182,370,5],[228,402,7],[325,520,6],
            [430,625,7],[348,310,6],[430,244,5],[495,244,7],[310,495,5],
            [420,495,6],[500,585,7],[585,650,5],[655,650,7]
          ].map(([cx,cy,r], i) => (
            <g key={`${cx}-${cy}`} style={{animation:`branchPulse ${2.4 + (i%5)*.65}s ease-in-out infinite`}}>
              <circle cx={cx} cy={cy} r={r*4.2} fill="url(#commitGlow)" filter="url(#softGlow)" />
              <circle cx={cx} cy={cy} r={r} fill="#aeb8bc" opacity=".92" />
              <circle cx={cx} cy={cy} r={Math.max(1.5,r/3)} fill="#f0f3f3" />
            </g>
          ))}

          {/* right repository orbit / REAL GitHub logo */}
          <g transform="translate(1200 510)">
            <circle r="205" fill="none" stroke="#aeb8bc" strokeWidth="1" strokeDasharray="1 8" opacity=".16"
              style={{animation:"githubOrbit 34s linear infinite"}} />
            <circle r="168" fill="none" stroke="#899397" strokeWidth="1" strokeDasharray="2 11" opacity=".18"
              style={{animation:"githubOrbitReverse 26s linear infinite"}} />
            <circle r="132" fill="none" stroke="#b7c0c3" strokeWidth="1" strokeDasharray="1 7" opacity=".12" />

            {/* Your github-logo.png — inverted so the black logo becomes visible on Knected's dark theme */}
            <image
              href="/github-logo.png"
              x="-112"
              y="-112"
              width="224"
              height="224"
              preserveAspectRatio="xMidYMid meet"
              opacity=".17"
              style={{filter:"invert(1)"}}
            />

            {/* subtle scan ring around the real logo */}
            <circle r="108" fill="none" stroke="#dfe4e5" strokeWidth="1" strokeDasharray="3 8" opacity=".10"
              style={{animation:"githubOrbit 18s linear infinite reverse"}} />
          </g>

          {/* lower-right repository connection */}
          <path d="M1400 700 C1330 700 1308 660 1270 620 C1232 580 1182 590 1140 632 C1110 661 1080 680 1030 680"
            fill="none" stroke="url(#branchStroke)" strokeWidth="1.35" />
          <path d="M1400 700 C1330 700 1308 660 1270 620 C1232 580 1182 590 1140 632 C1110 661 1080 680 1030 680"
            fill="none" stroke="#c8ced0" strokeOpacity=".25" strokeWidth="1"
            strokeDasharray="5 12" style={{animation:"commitTravel 9s linear infinite reverse"}} />
          <circle cx="1270" cy="620" r="6" fill="#d2d8da" opacity=".75" />
          <circle cx="1140" cy="632" r="5" fill="#b3bdc0" opacity=".7" />
          <circle cx="1030" cy="680" r="6" fill="#d2d8da" opacity=".72" />

          {/* git clone terminal */}
          <g transform="translate(980 70)">
            <rect width="260" height="132" rx="2" fill="#05090b" fillOpacity=".76" stroke="#9da8ac" strokeOpacity=".27" />
            <line x1="0" y1="29" x2="260" y2="29" stroke="#aab4b8" strokeOpacity=".14" />
            <circle cx="18" cy="14" r="3" fill="#d3d9da" opacity=".8" />
            <circle cx="30" cy="14" r="3" fill="#8c979b" opacity=".55" />
            <circle cx="42" cy="14" r="3" fill="#697479" opacity=".5" />
            <text x="18" y="54" fill="#c4cbcd" fontSize="11" fontFamily="monospace">› git clone</text>
            <text x="18" y="75" fill="#748084" fontSize="10" fontFamily="monospace">Analyzing...</text>
            <text x="18" y="94" fill="#748084" fontSize="10" fontFamily="monospace">Scanning files...</text>
            <text x="18" y="113" fill="#9ca6aa" fontSize="10" fontFamily="monospace">Mapping dependencies...</text>
            <text x="234" y="18" fill="#aab4b8" fontSize="12" fontFamily="monospace">×</text>
          </g>

          {/* repository tree */}
          <g transform="translate(1285 255)" opacity=".62" fontFamily="monospace" fontSize="10">
            <text y="0" fill="#c2c9cb">▰ src/</text>
            <text y="27" fill="#8f9a9e">▰ components/</text>
            <text y="54" fill="#8f9a9e">▰ utils/</text>
            <text y="81" fill="#8f9a9e">▰ hooks/</text>
            <text y="108" fill="#8f9a9e">▰ pages/</text>
            <text y="135" fill="#c2c9cb">□ package.json</text>
          </g>
        </svg>

        <div style={styles.branchLabelMain}>⌘ &nbsp; main</div>
        <div style={styles.branchLabelDevelop}>⌘ &nbsp; develop</div>
        <div style={styles.branchLabelFeature}>⌘ &nbsp; feature/auth</div>

        <div style={styles.gitLabelTop}>
          <span>[ GITHUB // ANALYSIS ]</span>
          <small>REPOSITORY / BRANCH / DEPENDENCIES</small>
        </div>
        <div style={styles.gitLabelBottom}>
          <span>KNECTED // CODE INTELLIGENCE</span>
          <span>BUILT FOR DEVELOPERS // REMOTE SOURCE</span>
        </div>
        <div style={styles.scanLine} />
      </div>

      {/* Independent Knected logo + centered navbar */}
      <nav style={styles.navbar} className="github-topbar">
        <div
          style={styles.logoComponent}
          className="github-logo"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") navigate("/dashboard"); }}
        >
          <DashboardLogo />
        </div>

        <div style={styles.navLinks} className="github-nav-links">
          <button className="github-nav-button" style={styles.navButton}
            onClick={() => navigate("/dashboard")}>
            <span style={styles.navNumber}></span> DASHBOARD
          </button>
          <button className="github-nav-button" style={styles.navButton}
            onClick={() => navigate("/recent-projects")}>
            <span style={styles.navNumber}></span> RECENTS
          </button>
          <button className="github-nav-button" style={{...styles.navButton,...styles.activeNavButton}}>
            <span style={styles.navNumber}></span> GITHUB
          </button>
          <button className="github-nav-button" style={styles.navButton}
            onClick={() => navigate("/upload-project")}>
            <span style={styles.navNumber}></span> UPLOAD
          </button>
        </div>

        <div style={styles.navRight}>
          <div style={styles.status} className="github-status">
            <span style={styles.statusDot} /> CONNECTED
          </div>
          <button style={styles.profileButton} onClick={() => navigate("/profile")}>
            PROFILE
          </button>
        </div>
      </nav>

      <main style={styles.container} className="github-main">
        <button style={styles.backButton} onClick={() => navigate("/dashboard")}>
          ← BACK TO DASHBOARD
        </button>

        <section style={styles.header}>
          <div style={styles.eyebrow}>
            <span style={styles.eyebrowDot} />
            GITHUB // SOURCE CONTROL
          </div>

          <h1 style={styles.heading} className="github-hero-title">
            Connect your
            <br />
            <span style={styles.headingMuted}>repository.</span>
          </h1>

          <p style={styles.description}>
            Import a GitHub repository and let Knected map its source files,
            dependencies and project architecture into an interactive graph.
          </p>
        </section>

        <section style={styles.analysisCard}
          className="github-analysis-card github-card">
          <div style={styles.cardHeader} className="github-card-header">
            <div>
              <div style={styles.cardEyebrow}>[ REMOTE_SOURCE ]</div>
              <h2 style={styles.cardTitle}>GitHub Repository</h2>
              <p style={styles.cardSubtitle}>
                Paste the public repository URL you want to analyze.
              </p>
            </div>
            <div style={styles.githubBadge} className="github-badge">
              <span style={styles.githubBadgeDot} /> GITHUB
            </div>
          </div>

          <div style={styles.inputLabel}>REPOSITORY URL</div>

          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>↗</span>
            <input
              className="github-input"
              type="text"
              value={githubUrl}
              onChange={(e) => { setGithubUrl(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleAnalyze(); }}
              placeholder="https://github.com/username/repository"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <button
            className="github-analyze-button"
            style={{...styles.analyzeButton,...(loading ? styles.analyzeButtonDisabled : {})}}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinner} />
                ANALYZING REPOSITORY...
              </>
            ) : (
              <>
                ANALYZE REPOSITORY
                <span style={styles.arrow}>↗</span>
              </>
            )}
          </button>

          <div style={styles.infoRow}>
            <div style={styles.infoItem}><span style={styles.infoDot}/> PUBLIC REPOSITORIES</div>
            <div style={styles.infoItem}><span style={styles.infoDot}/> AUTOMATIC DEPENDENCY ANALYSIS</div>
            <div style={styles.infoItem}><span style={styles.infoDot}/> INTERACTIVE GRAPH</div>
          </div>
        </section>

        <section style={styles.stepsSection}>
          <div style={styles.sectionEyebrow}>[ ANALYSIS_PIPELINE ]</div>
          <h2 style={styles.stepsTitle}>From repository to dependency map.</h2>

          <div style={styles.steps} className="github-steps">
            <div style={styles.step}>
              <div style={styles.stepNumber}>01</div>
              <div>
                <h3 style={styles.stepHeading}>CONNECT</h3>
                <p style={styles.stepText}>Provide the URL of a public GitHub repository.</p>
              </div>
            </div>

            <div style={styles.stepLine} className="github-step-line" />

            <div style={styles.step}>
              <div style={styles.stepNumber}>02</div>
              <div>
                <h3 style={styles.stepHeading}>ANALYZE</h3>
                <p style={styles.stepText}>Knected scans source files and resolves dependencies.</p>
              </div>
            </div>

            <div style={styles.stepLine} className="github-step-line" />

            <div style={styles.step}>
              <div style={styles.stepNumber}>03</div>
              <div>
                <h3 style={styles.stepHeading}>VISUALIZE</h3>
                <p style={styles.stepText}>Explore the resulting architecture as a dependency graph.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

/* =============================================================
   DARK KNECTED HUD STYLES
============================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative" as const,
    overflow: "hidden",
    background: "radial-gradient(circle at 72% 35%, rgba(52,88,118,.14), transparent 34%), #020405",
    color: "#f2f9fb",
    fontFamily: '"Inter", "SF Pro Display", "Segoe UI", Arial, sans-serif',
  },

  gridOverlay: {
    position: "fixed" as const, inset: 0, pointerEvents: "none" as const,
    opacity: .5,
    backgroundImage: "linear-gradient(rgba(151,182,204,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(151,182,204,.028) 1px, transparent 1px)",
    backgroundSize: "48px 48px", zIndex: 0,
  },

  topGlow: {
    position: "fixed" as const, top: "-180px", left: "50%", width: "720px", height: "420px",
    transform: "translateX(-50%)",
    background: "radial-gradient(circle, rgba(151,182,204,.055), transparent 68%)",
    pointerEvents: "none" as const, zIndex: 0,
  },

  gitBackground: {
    position: "absolute" as const, top: "78px", left: 0, right: 0, height: "820px",
    opacity: .95, pointerEvents: "none" as const, zIndex: 4, overflow: "hidden",
  },

  branchLabelMain: {
    position: "absolute" as const, left: "9.4%", top: "170px",
    padding: "8px 18px", border: "1px solid rgba(196,205,208,.34)",
    background: "rgba(4,8,10,.78)", color: "#cbd2d4",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "12px",
    letterSpacing: "1.4px", boxShadow: "0 12px 35px rgba(0,0,0,.2)",
  },

  branchLabelDevelop: {
    position: "absolute" as const, left: "14.7%", top: "340px",
    padding: "8px 18px", border: "1px solid rgba(180,190,194,.28)",
    background: "rgba(4,8,10,.76)", color: "#c5cccf",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "11px",
    letterSpacing: "1.3px",
  },

  branchLabelFeature: {
    position: "absolute" as const, left: "7.5%", top: "535px",
    padding: "8px 18px", border: "1px solid rgba(180,190,194,.28)",
    background: "rgba(4,8,10,.76)", color: "#c5cccf",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "11px",
    letterSpacing: "1.1px",
  },

  gitLabelTop: {
    position: "absolute" as const, top: "105px", left: "8%",
    display: "flex", flexDirection: "column" as const, gap: "6px",
    fontFamily: '"JetBrains Mono", monospace', color: "#7f919a",
    fontSize: "10px", letterSpacing: "2px",
  },

  gitLabelBottom: {
    position: "absolute" as const, bottom: "45px", right: "8%",
    display: "flex", gap: "35px",
    fontFamily: '"JetBrains Mono", monospace', color: "#505b60",
    fontSize: "9px", letterSpacing: "1.8px",
  },

  scanLine: {
    position: "absolute" as const, top: "250px", left: "20%", width: "60%", height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(151,182,204,.45), transparent)",
    animation: "scanLine 7s ease-in-out infinite",
  },

  navbar: {
    position: "relative" as const, zIndex: 20, height: "78px", padding: "0 34px",
    display: "flex", alignItems: "center", justifyContent: "center",
    borderBottom: "1px solid rgba(151,182,204,.12)",
    background: "rgba(2,4,5,.84)", backdropFilter: "blur(18px)",
  },

  logoComponent: {
    position: "absolute" as const, left: "28px", top: "14px",
    width: "64px", height: "58px", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", zIndex: 30,
  },

  logoImage: {
    width: "56px", height: "56px", objectFit: "contain" as const, display: "block",
  },

  navLinks: { display: "flex", alignItems: "center", justifyContent: "center", gap: "28px" },

  navButton: {
    position: "relative" as const, border: "none", background: "transparent",
    color: "#718087", padding: "29px 8px 26px",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "12px",
    letterSpacing: "1.7px", cursor: "pointer",
  },

  activeNavButton: { color: "#edf3f5" },
  navNumber: { color: "#596469", marginRight: "7px" },

  navRight: {
    position: "absolute" as const, right: "34px", display: "flex",
    alignItems: "center", gap: "22px",
  },

  status: {
    display: "flex", alignItems: "center", gap: "8px", color: "#6e787d",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "10px", letterSpacing: "1.4px",
  },

  statusDot: {
    width: "5px", height: "5px", borderRadius: "50%", background: "#b9c1c4",
    boxShadow: "0 0 10px rgba(159,196,223,.65)",
  },

  profileButton: {
    border: "1px solid rgba(151,182,204,.28)", background: "rgba(8,14,18,.6)",
    color: "#b8c0c3", padding: "8px 14px",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "10px",
    letterSpacing: "1.4px", cursor: "pointer",
  },

  container: {
    position: "relative" as const, zIndex: 10, width: "88%", maxWidth: "1280px",
    margin: "0 auto", padding: "42px 0 90px",
  },

  backButton: {
    border: "none", background: "transparent", color: "#91999d",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "14px",
    letterSpacing: "1.3px", cursor: "pointer", padding: "4px 0", marginBottom: "54px",
  },

  header: { position: "relative" as const, maxWidth: "850px", margin: "0 auto 48px", textAlign: "center" as const },

  eyebrow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "9px",
    marginBottom: "18px", color: "#8ea1aa",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "10px", letterSpacing: "2.2px",
  },

  eyebrowDot: {
    width: "5px", height: "5px", borderRadius: "50%", background: "#b9c1c4",
    boxShadow: "0 0 10px rgba(159,196,223,.7)",
  },

  heading: {
    margin: 0, fontWeight: 300, fontSize: "68px", lineHeight: "1.03",
    letterSpacing: "-3.2px", color: "#f2f9fb",
  },

  headingMuted: { color: "#707b81" },

  description: {
    maxWidth: "670px", margin: "22px auto 0", color: "#7b8589",
    fontSize: "15px", lineHeight: "1.8",
  },

  analysisCard: {
    position: "relative" as const, maxWidth: "820px", margin: "0 auto", padding: "34px",
    background: "linear-gradient(145deg, rgba(9,16,21,.9), rgba(4,8,11,.86))",
    border: "1px solid rgba(151,182,204,.17)", borderRadius: "2px",
    boxShadow: "0 30px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.025)",
    backdropFilter: "blur(18px)",
  },

  cardHeader: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: "25px", marginBottom: "28px",
  },

  cardEyebrow: {
    marginBottom: "9px", color: "#5c6d76",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "9px", letterSpacing: "1.8px",
  },

  cardTitle: {
    margin: "0 0 8px", color: "#e8ecec", fontSize: "24px",
    fontWeight: 500, letterSpacing: "-.5px",
  },

  cardSubtitle: { margin: 0, color: "#687378", fontSize: "13px", lineHeight: "1.6" },

  githubBadge: {
    display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px",
    border: "1px solid rgba(151,182,204,.16)", background: "rgba(151,182,204,.035)",
    color: "#a6b7c0", fontFamily: '"JetBrains Mono", monospace',
    fontSize: "9px", letterSpacing: "1.5px",
  },

  githubBadgeDot: {
    width: "5px", height: "5px", borderRadius: "50%", background: "#b9c1c4",
    boxShadow: "0 0 9px rgba(159,196,223,.55)",
  },

  inputLabel: {
    marginBottom: "9px", color: "#5f6b70",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "9px", letterSpacing: "1.6px",
  },

  inputWrapper: {
    display: "flex", alignItems: "center", height: "62px", padding: "0 18px",
    border: "1px solid rgba(151,182,204,.19)", background: "rgba(1,5,7,.7)", borderRadius: "2px",
  },

  inputIcon: { marginRight: "13px", color: "#aab4b8", fontFamily: '"JetBrains Mono", monospace', fontSize: "18px" },

  input: {
    width: "100%", height: "100%", border: "none", outline: "none",
    background: "transparent", color: "#dce1e2", fontSize: "14px",
    fontFamily: '"JetBrains Mono", monospace',
  },

  errorBox: {
    display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", padding: "11px 13px",
    border: "1px solid rgba(197,91,91,.24)", background: "rgba(100,25,25,.12)",
    color: "#d99494", fontSize: "12px",
  },

  errorIcon: {
    width: "18px", height: "18px", display: "flex", alignItems: "center",
    justifyContent: "center", border: "1px solid rgba(217,148,148,.35)",
    borderRadius: "50%", fontFamily: '"JetBrains Mono", monospace', fontSize: "10px",
  },

  analyzeButton: {
    width: "100%", height: "56px", marginTop: "20px",
    border: "1px solid rgba(242,249,251,.7)", borderRadius: "2px",
    background: "#e8ecec", color: "#080c0e",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "11px",
    fontWeight: 700, letterSpacing: "1.3px", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
  },

  analyzeButtonDisabled: { opacity: .55, cursor: "not-allowed" },
  arrow: { fontSize: "17px" },

  spinner: {
    width: "14px", height: "14px", border: "2px solid rgba(7,16,21,.25)",
    borderTopColor: "#080c0e", borderRadius: "50%", display: "inline-block",
    animation: "spin .8s linear infinite",
  },

  infoRow: {
    display: "flex", justifyContent: "center", flexWrap: "wrap" as const,
    gap: "22px", marginTop: "23px",
  },

  infoItem: {
    display: "flex", alignItems: "center", gap: "7px", color: "#667176",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "9px", letterSpacing: "1px",
  },

  infoDot: {
    width: "4px", height: "4px", borderRadius: "50%", background: "#9eb1bb",
    boxShadow: "0 0 7px rgba(127,169,199,.4)",
  },

  stepsSection: {
    maxWidth: "980px", margin: "74px auto 0", paddingTop: "25px",
    borderTop: "1px solid rgba(151,182,204,.1)",
  },

  sectionEyebrow: {
    marginBottom: "10px", textAlign: "center" as const, color: "#5b666b",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "9px", letterSpacing: "2px",
  },

  stepsTitle: {
    margin: "0 0 34px", textAlign: "center" as const, color: "#dce1e2",
    fontSize: "25px", fontWeight: 300, letterSpacing: "-.7px",
  },

  steps: {
    display: "grid", gridTemplateColumns: "1fr 60px 1fr 60px 1fr",
    alignItems: "center", gap: "12px",
  },

  step: { display: "flex", alignItems: "flex-start", gap: "15px" },

  stepNumber: {
    minWidth: "38px", height: "38px", display: "flex", alignItems: "center",
    justifyContent: "center", border: "1px solid rgba(151,182,204,.17)",
    background: "rgba(151,182,204,.035)", color: "#a9bac3",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "10px", letterSpacing: "1px",
  },

  stepHeading: {
    margin: "1px 0 7px", color: "#d9dfe1",
    fontFamily: '"JetBrains Mono", monospace', fontSize: "11px", letterSpacing: "1.5px",
  },

  stepText: { margin: 0, color: "#718087", fontSize: "12px", lineHeight: "1.6" },

  stepLine: {
    width: "100%", height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(151,182,204,.28), transparent)",
  },
};


export default GithubAnalysis;
