import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  FileCode2,
  FolderGit2,
  GitBranch,
  Network,
  Plus,
  Upload,
} from "lucide-react";
import DashboardLogo from "../components/DashboardLogo";
interface Project {
  _id: string;
  sourceType: "github" | "zip";
  originalName?: string;
  githubRepo?: string;
  githubUrl?: string;
  createdAt?: string;
  fileSize?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the authenticated user's projects for the dashboard.
  useEffect(() => {
    let cancelled = false;

    const fetchProjects = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load projects."
          );
        }

        if (!cancelled) {
          setProjects(result.data || []);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading projects."
          );
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const githubCount = useMemo(
    () =>
      projects.filter(
        (project) => project.sourceType === "github"
      ).length,
    [projects]
  );

  const zipCount = useMemo(
    () =>
      projects.filter(
        (project) => project.sourceType === "zip"
      ).length,
    [projects]
  );

  const recentProjects = useMemo(
    () => projects.slice(0, 4),
    [projects]
  );


  const getProjectName = (project: Project) => {
    if (project.sourceType === "github") {
      return project.githubRepo || "GitHub Repository";
    }

    return (
      project.originalName?.replace(/\.zip$/i, "") ||
      "Uploaded Project"
    );
  };

  const formatDate = (date?: string) => {
    if (!date) return "Recently analyzed";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "Recently analyzed";
    }

    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  

  return (
    <div className="dashboard-page">
      {/* =========================================================
          HUD BACKGROUND
      ========================================================= */}
      <div className="hud-grid" />
      <div className="hud-vignette" />

      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* =========================================================
          TOP NAVIGATION
      ========================================================= */}
      <DashboardLogo />
      <header className="topbar">
        

        <nav className="top-navigation">
          <button
            className="nav-item nav-item-active"
            onClick={() => navigate("/dashboard")}
          >
            DASHBOARD
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/recent-projects")}
          >
            RECENTS
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/github-analysis")}
          >
            GITHUB
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/upload-project")}
          >
            UPLOAD
          </button>
        </nav>

        <div className="account-status">
          <span className="connection-dot" />
          <span>CONNECTED</span>

          <button
            className="profile-chip"
            onClick={() => navigate("/profile")}
          >
            PROFILE
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN HUD
      ========================================================= */}
      <main className="dashboard-main">
        <section className="hero-section">
          {/* Left information panel */}
          <div className="hero-copy">
            <p className="eyebrow">
              [ KNECTED // CODE INTELLIGENCE ]
            </p>

            <h1>
              Understand
              <br />
              <span>how your code connects.</span>
            </h1>

            <p className="hero-description">
              Analyze source code, reveal dependencies and
              navigate the architecture of your projects through
              an interactive visual graph.
            </p>

            <div className="hero-actions">
              <button
                className="primary-action"
                onClick={() => navigate("/upload-project")}
              >
                <Upload size={18} />
                Analyze Project
                <ArrowUpRight size={18} />
              </button>

              <button
                className="secondary-action"
                onClick={() => navigate("/github-analysis")}
              >
                <GitBranch size={18} />
                Analyze GitHub
              </button>
            </div>

            <div className="hero-meta">
              <span>
                <span className="meta-dot" />
                LIVE ANALYSIS ENGINE
              </span>

              <span>•</span>

              <span>DEPENDENCY MAPPING</span>
            </div>
          </div>

          {/* Right dependency visualization */}
          <div className="visual-panel">
            <div className="visual-label visual-label-top">
              <span>[ CORE_SYSTEM ]</span>
              <small>PROJECT DEPENDENCY MAP</small>
            </div>

            <svg
              className="dependency-visual"
              viewBox="0 0 700 500"
              role="img"
              aria-label="Abstract code dependency visualization"
            >
              <defs>
                <radialGradient id="coreGlow">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity=".7" />
                  <stop offset="45%" stopColor="#9fc4ff" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#9fc4ff" stopOpacity="0" />
                </radialGradient>

                <linearGradient
                  id="hudLine"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#d9e7f5" stopOpacity=".7" />
                  <stop offset="100%" stopColor="#6ea5d6" stopOpacity=".16" />
                </linearGradient>

                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
              </defs>

              <circle
                cx="350"
                cy="250"
                r="125"
                fill="url(#coreGlow)"
                filter="url(#softGlow)"
              />

              {/* Technical guide rings */}
              <circle
                className="guide-ring"
                cx="350"
                cy="250"
                r="175"
              />
              <circle
                className="guide-ring guide-ring-small"
                cx="350"
                cy="250"
                r="105"
              />

              {/* Connection paths */}
              <g className="dependency-lines">
                <path d="M350 250 C300 170 225 125 135 105" />
                <path d="M350 250 C440 185 505 130 595 115" />
                <path d="M350 250 C255 275 180 320 105 370" />
                <path d="M350 250 C445 285 510 340 615 365" />
                <path d="M350 250 C350 165 350 105 350 55" />
                <path d="M350 250 C350 335 355 395 355 455" />

                <path d="M135 105 C105 135 90 165 85 195" />
                <path d="M595 115 C620 150 625 180 620 210" />
                <path d="M105 370 C135 395 165 410 205 420" />
                <path d="M615 365 C590 405 560 420 520 432" />
              </g>

              {/* Moving data pulses */}
              <g className="data-pulses">
                <circle cx="245" cy="171" r="3" />
                <circle cx="454" cy="184" r="3" />
                <circle cx="225" cy="316" r="3" />
                <circle cx="478" cy="315" r="3" />
                <circle cx="350" cy="145" r="3" />
                <circle cx="352" cy="350" r="3" />
              </g>

              {/* Outer nodes */}
              <g className="outer-nodes">
                <circle cx="135" cy="105" r="7" />
                <circle cx="595" cy="115" r="7" />
                <circle cx="105" cy="370" r="7" />
                <circle cx="615" cy="365" r="7" />
                <circle cx="350" cy="55" r="7" />
                <circle cx="355" cy="455" r="7" />
              </g>

              {/* Core */}
              <circle
                className="core-halo"
                cx="350"
                cy="250"
                r="42"
              />

              <circle
                className="core-node"
                cx="350"
                cy="250"
                r="15"
              />

              <circle
                className="core-center"
                cx="350"
                cy="250"
                r="5"
              />

              {/* Crosshair */}
              <path
                className="crosshair"
                d="M350 190 V210 M350 290 V310 M290 250 H310 M390 250 H410"
              />
            </svg>

            <div className="visual-callout callout-left">
              <span>[ SOURCE_NODE ]</span>
              <small>FILES / MODULES</small>
            </div>

            <div className="visual-callout callout-right">
              <span>[ DEPENDENCY ]</span>
              <small>IMPORT RELATIONSHIPS</small>
            </div>

            <div className="visual-footer">
              <span>NODE NETWORK</span>
              <span>{projects.length || 0} PROJECTS INDEXED</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            DATA STRIP
        ========================================================= */}
        <section className="data-strip">
          <div className="data-cell">
            <div className="data-icon">
              <Network size={17} />
            </div>
            <div>
              <span>PROJECTS ANALYZED</span>
              <strong>{loading ? "—" : projects.length}</strong>
            </div>
          </div>

          <div className="data-cell">
            <div className="data-icon">
              <GitBranch size={17} />
            </div>
            <div>
              <span>GITHUB SOURCES</span>
              <strong>{loading ? "—" : githubCount}</strong>
            </div>
          </div>

          <div className="data-cell">
            <div className="data-icon">
              <FileCode2 size={17} />
            </div>
            <div>
              <span>ZIP ANALYSES</span>
              <strong>{loading ? "—" : zipCount}</strong>
            </div>
          </div>

          <div className="data-cell data-cell-action">
            <button
              onClick={() => navigate("/upload-project")}
            >
              <Plus size={16} />
              NEW ANALYSIS
            </button>
          </div>
        </section>

        {/* =========================================================
            RECENT PROJECTS
        ========================================================= */}
        <section className="projects-section">
          <div className="section-heading">
            <div>
              <p>[ ANALYSIS_HISTORY ]</p>
              <h2>Recent Projects</h2>
            </div>

            <button
              className="view-all"
              onClick={() => navigate("/recent-projects")}
            >
              VIEW ALL
              <ChevronRight size={15} />
            </button>
          </div>

          {error ? (
            <div className="state-panel">
              <div>
                <strong>Unable to load analysis history</strong>
                <span>{error}</span>
              </div>

              <button onClick={() => window.location.reload()}>
                RETRY
              </button>
            </div>
          ) : loading ? (
            <div className="state-panel loading-panel">
              <span className="loading-line" />
              <span className="loading-line short" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="empty-panel">
              <div className="empty-icon">
                <FolderGit2 size={22} />
              </div>

              <div>
                <strong>No projects analyzed yet.</strong>
                <span>
                  Start with a ZIP upload or connect a GitHub repository.
                </span>
              </div>

              <button
                onClick={() => navigate("/upload-project")}
              >
                START ANALYSIS
                <ArrowUpRight size={18} />
              </button>
            </div>
          ) : (
            <div className="project-table">
              <div className="table-header">
                <span>PROJECT</span>
                <span>SOURCE</span>
                <span>ANALYZED</span>
                <span />
              </div>

              {recentProjects.map((project, index) => (
                <button
                  className="project-row"
                  key={project._id}
                  onClick={() =>
                    navigate(`/projects/${project._id}`)
                  }
                >
                  <span className="project-name">
                    <span className="row-number">
                      0{index + 1}
                    </span>

                    <span>
                      <strong>
                        {getProjectName(project)}
                      </strong>

                      <small>
                        {project.sourceType === "github"
                          ? project.githubUrl || "GitHub repository"
                          : project.originalName || "ZIP upload"}
                      </small>
                    </span>
                  </span>

                  <span className="source-type">
                    {project.sourceType === "github" ? (
                      <>
                        <GitBranch size={13} />
                        GITHUB
                      </>
                    ) : (
                      <>
                        <FileCode2 size={13} />
                        ZIP
                      </>
                    )}
                  </span>

                  <span className="project-date">
                    {formatDate(project.createdAt)}
                  </span>

                  <span className="row-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 72% 28%,
              rgba(35, 65, 92, .18),
              transparent 30%
            ),
            #020405;
          color: #f2f9fb;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .hud-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .34;
          background-image:
            linear-gradient(
              rgba(151, 182, 204, .08) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(151, 182, 204, .08) 1px,
              transparent 1px
            );
          background-size: 96px 96px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              rgba(0,0,0,.35) 70%,
              transparent
            );
        }

        .hud-vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at center,
              transparent 38%,
              rgba(0,0,0,.48) 100%
            );
        }

        .ambient {
          position: fixed;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .ambient-one {
          top: 5%;
          right: 4%;
          background: rgba(65, 126, 171, .09);
        }

        .ambient-two {
          bottom: 5%;
          left: 4%;
          background: rgba(78, 104, 128, .07);
        }

        .topbar {
          position: relative;
          z-index: 20;
          height: 78px;
          padding: 0 34px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          border-bottom: 1px solid rgba(151, 182, 204, .15);
          background: rgba(2, 4, 5, .72);
          backdrop-filter: blur(18px);
        }

        .brand {
          width: 180px;
          height: 50px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        
        .knected-logo {
          width: 135px;
          height: auto;
          display: block;
          object-fit: contain;

          filter: invert(1);
          mix-blend-mode: screen;
        }

        .brand-mark {
          position: relative;
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: block;
          margin-right: 11px;
        }

        .brand-mark span,
        .brand-mark i {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #dcecf4;
          box-shadow: 0 0 10px rgba(151, 182, 204, .7);
        }

        .brand-mark span:nth-child(1) { left: 2px; top: 11px; }
        .brand-mark span:nth-child(2) { left: 13px; top: 3px; }
        .brand-mark span:nth-child(3) { left: 13px; bottom: 3px; }
        .brand-mark span:nth-child(4) { right: 1px; top: 11px; }
        .brand-mark i {
          width: 6px;
          height: 6px;
          left: 13px;
          top: 12px;
          background: #6ea5d6;
        }

        .brand-mark::before,
        .brand-mark::after {
          content: "";
          position: absolute;
          left: 7px;
          top: 14px;
          width: 18px;
          height: 1px;
          background: rgba(220, 236, 244, .7);
          transform: rotate(-28deg);
          transform-origin: left center;
        }

        .brand-mark::after {
          transform: rotate(28deg);
        }

        .brand-name {
          color: #f2f9fb;
          font-family: "IBM Plex Mono", monospace;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 2.8px;
        }

        .top-navigation {
          grid-column: 2;
          display: flex;
          justify-content: center;
          gap: 48px;
          height: 100%;
        }

        .nav-item {
          position: relative;
          border: 0;
          padding: 0;
          background: transparent;
          color: rgba(242, 249, 251, .38);
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          letter-spacing: 1.4px;
          cursor: pointer;
          transition: color .25s ease;
        }

        .nav-item:hover:not(:disabled),
        .nav-item-active {
          color: #f2f9fb;
        }

        .nav-item-active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: #97b6cc;
        }

        .nav-item:disabled {
          opacity: .35;
          cursor: default;
        }

        .account-status {
          grid-column: 3;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          color: rgba(242, 249, 251, .45);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
        }

        .connection-dot,
        .meta-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b9d8eb;
          box-shadow: 0 0 12px rgba(185, 216, 235, .65);
          animation: pulse 2.5s ease-in-out infinite;
        }

        .profile-chip {
          margin-left: 12px;
          padding: 6px 10px;
          border: 1px solid rgba(151, 182, 204, .3);
          background: rgba(151, 182, 204, .06);
          color: #dcecf4;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
          cursor: pointer;
        }

        .dashboard-main {
          position: relative;
          z-index: 5;
          width: min(1440px, calc(100% - 48px));
          margin: 0 auto;
          padding: 54px 0 60px;
        }

        .hero-section {
          min-height: 480px;
          display: grid;
          grid-template-columns: .82fr 1.18fr;
          gap: 55px;
          align-items: center;
          border-bottom: 1px solid rgba(151, 182, 204, .15);
        }

        .hero-copy {
          padding: 20px 0 40px 26px;
        }

        .eyebrow {
          margin: 0 0 28px;
          color: rgba(151, 182, 204, .68);
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .hero-copy h1 {
          max-width: 600px;
          margin: 0;
          font-size: clamp(52px, 5.4vw, 84px);
          line-height: .98;
          font-weight: 300;
          letter-spacing: -4px;
        }

        .hero-copy h1 span {
          color: rgba(242, 249, 251, .45);
        }

        .hero-description {
          max-width: 475px;
          margin: 34px 0 0;
          color: rgba(242, 249, 251, .52);
          font-size: 15px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          gap: 10px;
          margin-top: 34px;
        }

        .primary-action,
        .secondary-action {
          height: 52px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 21px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          letter-spacing: .8px;
          cursor: pointer;
          transition: all .25s ease;
        }

        .primary-action {
          border: 1px solid #b8d5e6;
          background: #dcecf4;
          color: #091014;
        }

        .primary-action:hover {
          transform: translateY(-2px);
          background: #f2f9fb;
        }

        .secondary-action {
          border: 1px solid rgba(151, 182, 204, .32);
          background: rgba(151, 182, 204, .04);
          color: #c5d9e5;
        }

        .secondary-action:hover {
          border-color: rgba(151, 182, 204, .62);
          background: rgba(151, 182, 204, .08);
        }

        .hero-meta {
          display: flex;
          gap: 12px;
          margin-top: 30px;
          color: rgba(151, 182, 204, .34);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
        }

        .hero-meta > span:first-child {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .visual-panel {
          position: relative;
          height: 470px;
          overflow: hidden;
          border-left: 1px solid rgba(151, 182, 204, .14);
          border-right: 1px solid rgba(151, 182, 204, .08);
          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(66, 104, 130, .08),
              transparent 50%
            );
        }

        .visual-panel::before,
        .visual-panel::after {
          content: "";
          position: absolute;
          pointer-events: none;
          background: rgba(151, 182, 204, .16);
        }

        .visual-panel::before {
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
        }

        .visual-panel::after {
          top: 0;
          left: 50%;
          width: 1px;
          height: 100%;
        }

        .visual-label {
          position: absolute;
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 5px;
          color: rgba(242, 249, 251, .65);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
        }

        .visual-label small,
        .visual-callout small {
          color: rgba(151, 182, 204, .34);
          font-size: 9px;
        }

        .visual-label-top {
          top: 20px;
          left: 22px;
        }

        .dependency-visual {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .guide-ring {
          fill: none;
          stroke: rgba(151, 182, 204, .13);
          stroke-width: 1;
          stroke-dasharray: 3 9;
          animation: rotateRing 28s linear infinite;
          transform-origin: 350px 250px;
        }

        .guide-ring-small {
          stroke-dasharray: 2 12;
          animation-direction: reverse;
          animation-duration: 20s;
        }

        .dependency-lines path {
          fill: none;
          stroke: url(#hudLine);
          stroke-width: 1.2;
          opacity: .65;
          stroke-dasharray: 5 8;
          animation: dashMove 7s linear infinite;
        }

        .outer-nodes circle {
          fill: #9fc4da;
          stroke: rgba(242, 249, 251, .25);
          stroke-width: 2;
          filter: drop-shadow(0 0 8px rgba(151, 182, 204, .4));
          animation: nodeBreath 4s ease-in-out infinite;
        }

        .data-pulses circle {
          fill: #e1f1fa;
          filter: drop-shadow(0 0 8px rgba(225, 241, 250, .9));
          animation: travelPulse 3.5s ease-in-out infinite;
        }

        .core-halo {
          fill: none;
          stroke: rgba(201, 229, 243, .25);
          stroke-width: 1;
          animation: corePulse 3s ease-in-out infinite;
        }

        .core-node {
          fill: #e9f6fc;
          stroke: #6ea5d6;
          stroke-width: 3;
          filter: drop-shadow(0 0 16px rgba(151, 182, 204, .65));
        }

        .core-center {
          fill: #20354a;
        }

        .crosshair {
          fill: none;
          stroke: rgba(242, 249, 251, .32);
          stroke-width: 1;
        }

        .visual-callout {
          position: absolute;
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
          border-left: 1px solid rgba(151, 182, 204, .4);
          background: rgba(2, 4, 5, .3);
          color: rgba(242, 249, 251, .58);
          font-family: "IBM Plex Mono", monospace;
          font-size: 11px;
          letter-spacing: .8px;
        }

        .callout-left {
          left: 18px;
          bottom: 78px;
        }

        .callout-right {
          right: 18px;
          top: 170px;
        }

        .visual-footer {
          position: absolute;
          z-index: 3;
          left: 20px;
          right: 20px;
          bottom: 18px;
          display: flex;
          justify-content: space-between;
          color: rgba(151, 182, 204, .34);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
        }

        .data-strip {
          min-height: 104px;
          display: grid;
          grid-template-columns: repeat(3, 1fr) 1.1fr;
          border-bottom: 1px solid rgba(151, 182, 204, .15);
        }

        .data-cell {
          min-height: 104px;
          padding: 22px 26px;
          display: flex;
          align-items: center;
          gap: 14px;
          border-right: 1px solid rgba(151, 182, 204, .12);
        }

        .data-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(151, 182, 204, .18);
          color: rgba(216, 234, 244, .68);
        }

        .data-cell span {
          display: block;
          color: rgba(151, 182, 204, .42);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
        }

        .data-cell strong {
          display: block;
          margin-top: 5px;
          color: #f2f9fb;
          font-size: 32px;
          font-weight: 300;
          letter-spacing: -1px;
        }

        .data-cell-action {
          justify-content: flex-end;
          border-right: 0;
        }

        .data-cell-action button {
          height: 44px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 18px;
          border: 1px solid rgba(151, 182, 204, .28);
          background: transparent;
          color: #dcecf4;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
          cursor: pointer;
        }

        .data-cell-action button:hover {
          background: rgba(151, 182, 204, .08);
          border-color: rgba(151, 182, 204, .55);
        }

        .projects-section {
          padding-top: 44px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 22px;
        }

        .section-heading p {
          margin: 0 0 9px;
          color: rgba(151, 182, 204, .48);
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 34px;
          font-weight: 300;
          letter-spacing: -1.2px;
        }

        .view-all {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: rgba(242, 249, 251, .45);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
          cursor: pointer;
        }

        .view-all:hover {
          color: #f2f9fb;
        }

        .project-table {
          border-top: 1px solid rgba(151, 182, 204, .18);
        }

        .table-header,
        .project-row {
          display: grid;
          grid-template-columns: 1.7fr .7fr .8fr 40px;
          align-items: center;
          column-gap: 20px;
        }

        .table-header {
          min-height: 42px;
          padding: 0 16px;
          color: rgba(151, 182, 204, .48);
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 1.3px;
          border-bottom: 1px solid rgba(151, 182, 204, .14);
        }

        .project-row {
          width: 100%;
          min-height: 82px;
          padding: 0 16px;
          border: 0;
          border-bottom: 1px solid rgba(151, 182, 204, .13);
          background: transparent;
          color: #f2f9fb;
          text-align: left;
          cursor: pointer;
          transition: background .25s ease;
        }


        .project-row:hover {
          background: rgba(151, 182, 204, .055);
        }

        .project-name {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
        }

        .row-number {
          color: rgba(151, 182, 204, .28);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }

        .project-name strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 16px;
          font-weight: 400;
        }


        .project-name small {
          display: block;
          max-width: 500px;
          margin-top: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: rgba(151, 182, 204, .58);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }


        .source-type {
          display: flex;
          align-items: center;
          gap: 7px;
          color: rgba(216, 234, 244, .68);
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .project-date {
          color: rgba(151, 182, 204, .58);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }

        .row-arrow {
          display: grid;
          place-items: center;
          color: rgba(151, 182, 204, .34);
          transition: color .2s ease, transform .2s ease;
        }

        .project-row:hover .row-arrow {
          color: #dcecf4;
          transform: translate(2px, -2px);
        }

        .state-panel,
        .empty-panel {
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 24px;
          border: 1px solid rgba(151, 182, 204, .14);
          background: rgba(151, 182, 204, .025);
        }

        .state-panel > div,
        .empty-panel > div:last-of-type {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .state-panel strong,
        .empty-panel strong {
          font-size: 12px;
          font-weight: 400;
        }

        .state-panel span,
        .empty-panel span {
          color: rgba(151, 182, 204, .42);
          font-size: 10px;
        }

        .state-panel button,
        .empty-panel button {
          height: 36px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 13px;
          border: 1px solid rgba(151, 182, 204, .3);
          background: transparent;
          color: #dcecf4;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
          cursor: pointer;
        }

        .state-panel button:hover,
        .empty-panel button:hover {
          background: rgba(151, 182, 204, .08);
        }

        .loading-panel {
          justify-content: flex-start;
          flex-direction: column;
          align-items: flex-start;
        }

        .loading-line {
          width: 45%;
          height: 8px;
          background: rgba(151, 182, 204, .1);
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .loading-line.short {
          width: 22%;
        }

        .empty-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(151, 182, 204, .18);
          color: rgba(216, 234, 244, .55);
        }

        @keyframes pulse {
          0%, 100% { opacity: .45; }
          50% { opacity: 1; }
        }

        @keyframes dashMove {
          to { stroke-dashoffset: -90; }
        }

        @keyframes nodeBreath {
          0%, 100% { opacity: .65; }
          50% { opacity: 1; }
        }

        @keyframes travelPulse {
          0%, 100% { opacity: .15; }
          50% { opacity: 1; }
        }

        @keyframes corePulse {
          0%, 100% { opacity: .35; transform: scale(.95); transform-origin: 350px 250px; }
          50% { opacity: .8; transform: scale(1.08); transform-origin: 350px 250px; }
        }

        @keyframes rotateRing {
          to { transform: rotate(360deg); }
        }

        @keyframes shimmer {
          0%, 100% { opacity: .35; }
          50% { opacity: .8; }
        }

        @media (max-width: 1050px) {
          .topbar {
            grid-template-columns: 1fr auto 1fr;
          }

        .top-navigation {
            gap: 20px;
          }

          .hero-section {
            grid-template-columns: 1fr auto 1fr;
            gap: 20px;
          }

          .hero-copy {
            padding-left: 0;
          }

          .visual-panel {
            border-left: 1px solid rgba(151, 182, 204, .14);
          }
        }

        @media (max-width: 760px) {
          .topbar {
            height: auto;
            min-height: 68px;
            padding: 12px 18px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }

          .brand {
            width: 140px;
          }

          .brand-name {
            font-size: 13px;
          }

        .top-navigation {
            order: 3;
            width: 100%;
            height: 34px;
            justify-content: flex-start;
            overflow-x: auto;
          }

          .nav-item {
            flex: 0 0 auto;
          }

          .account-status {
            margin-left: auto;
          }

          .dashboard-main {
            width: min(100% - 28px, 1440px);
            padding-top: 32px;
          }

          .hero-copy h1 {
            font-size: 50px;
            letter-spacing: -2.5px;
          }

          .visual-panel {
            height: 390px;
          }

          .data-strip {
            grid-template-columns: 1fr 1fr;
          }

          .data-cell {
            padding: 18px;
            border-bottom: 1px solid rgba(151, 182, 204, .12);
          }

          .data-cell-action {
            justify-content: flex-start;
          }

          .table-header {
            display: none;
          }

          .project-row {
            grid-template-columns: 1fr 100px 28px;
            min-height: 82px;
          }

          .source-type {
            justify-content: flex-end;
          }

          .project-date {
            display: none;
          }

          .state-panel,
          .empty-panel {
            flex-wrap: wrap;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .connection-dot,
          .meta-dot,
          .guide-ring,
          .dependency-lines path,
          .outer-nodes circle,
          .data-pulses circle,
          .core-halo,
          .loading-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
