/**
 * ============================================================================
 * File: RecentProjects.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Displays the complete project analysis history for the authenticated user.
 *
 * Responsibilities:
 * - Fetch all analyzed projects
 * - Search projects
 * - Filter projects by source
 * - Sort projects by analysis date
 * - Open project details
 * - Navigate between Knected sections
 * ============================================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  FileCode2,
  GitBranch,
  Search,
  SlidersHorizontal,
} from "lucide-react";

interface Project {
  _id: string;
  sourceType: "github" | "zip";
  originalName?: string;
  githubRepo?: string;
  githubUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  fileSize?: number;
}

type SourceFilter = "all" | "github" | "zip";
type SortOption = "newest" | "oldest";

const RecentProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] =
    useState<SourceFilter>("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("newest");

  /* ==========================================================================
   FETCH PROJECTS
========================================================================== */

useEffect(() => {
  let cancelled = false;

  const fetchProjects = async () => {
    try {
      if (!cancelled) {
        setLoading(true);
        setError("");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "GET",
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
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading projects."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchProjects();

  return () => {
    cancelled = true;
  };
}, [navigate]);

  /* ==========================================================================
     PROJECT HELPERS
  ========================================================================== */

  const getProjectName = (project: Project) => {
    if (project.sourceType === "github") {
      return project.githubRepo || "GitHub Repository";
    }

    return (
      project.originalName?.replace(/\.zip$/i, "") ||
      "Uploaded Project"
    );
  };

  const getProjectSource = (project: Project) => {
    if (project.sourceType === "github") {
      return project.githubUrl || "GitHub repository";
    }

    return project.originalName || "ZIP upload";
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return "Recently analyzed";
    }

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

  const formatTime = (date?: string) => {
    if (!date) {
      return "";
    }

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return "";
    }

    return value.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ==========================================================================
     FILTER + SEARCH + SORT
  ========================================================================== */

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = projects.filter((project) => {
      const projectName = getProjectName(project).toLowerCase();
      const source = getProjectSource(project).toLowerCase();

      const matchesSearch =
        !query ||
        projectName.includes(query) ||
        source.includes(query);

      const matchesSource =
        sourceFilter === "all" ||
        project.sourceType === sourceFilter;

      return matchesSearch && matchesSource;
    });

    result.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.updatedAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.updatedAt || 0
      ).getTime();

      return sortOption === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    projects,
    searchQuery,
    sourceFilter,
    sortOption,
  ]);

  /* ==========================================================================
     COUNTS
  ========================================================================== */

  const githubCount = projects.filter(
    (project) => project.sourceType === "github"
  ).length;

  const zipCount = projects.filter(
    (project) => project.sourceType === "zip"
  ).length;

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div className="recent-page">

      {/* ================================================================
          HUD BACKGROUND
      ================================================================ */}

      <div className="recent-grid" />
      <div className="recent-vignette" />

      {/* ================================================================
          NAVBAR
      ================================================================ */}

      <header className="recent-topbar">

        <button
          className="recent-brand"
          onClick={() => navigate("/dashboard")}
          aria-label="Knected Dashboard"
        >
          <img
            src="/knected-k-logo.png"
            alt="Knected"
            className="recent-logo"
          />
        </button>

        <nav className="recent-navigation">

          <button
            className="recent-nav-item"
            onClick={() => navigate("/dashboard")}
          >
            DASHBOARD
          </button>

          <button
            className="recent-nav-item recent-nav-active"
            onClick={() => navigate("/recent-projects")}
          >
            RECENTS
          </button>

          <button
            className="recent-nav-item"
            onClick={() => navigate("/github-analysis")}
          >
            GITHUB
          </button>

          <button
            className="recent-nav-item"
            onClick={() => navigate("/upload-project")}
          >
            UPLOAD
          </button>

        </nav>

        <div className="recent-account">

          <span className="recent-connected">
            <span className="recent-connected-dot" />
            CONNECTED
          </span>

          <button
            className="recent-profile"
            onClick={() => navigate("/profile")}
          >
            PROFILE
          </button>

        </div>

      </header>

      {/* ================================================================
          MAIN CONTENT
      ================================================================ */}

      <main className="recent-main">

        {/* ============================================================
            SEARCH + FILTER BAR
        ============================================================ */}

        <section className="recent-controls">

          <div className="recent-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

          </div>

          <button
            className="recent-filter"
            onClick={() => {
              setSourceFilter((current) => {
                if (current === "all") return "github";
                if (current === "github") return "zip";
                return "all";
              });
            }}
          >

            <SlidersHorizontal size={15} />

            <span>
              {sourceFilter === "all"
                ? "All Sources"
                : sourceFilter === "github"
                ? "GitHub"
                : "ZIP"}
            </span>

            <ChevronDown size={15} />

          </button>

          <button
            className="recent-sort"
            onClick={() => {
              setSortOption((current) =>
                current === "newest"
                  ? "oldest"
                  : "newest"
              );
            }}
          >

            <span className="sort-label">
              SORT
            </span>

            <span>
              {sortOption === "newest"
                ? "Newest"
                : "Oldest"}
            </span>

            <ChevronDown size={15} />

          </button>

        </section>

        {/* ============================================================
            PROJECT INDEX
        ============================================================ */}

        <section className="project-index">

          <div className="project-index-header">

            <div>

              <p className="project-index-kicker">
                [ PROJECT_INDEX ]
              </p>

              <h1>
                All Projects
              </h1>

            </div>

            <div className="project-results">
              {filteredProjects.length} RESULTS
            </div>

          </div>

          {/* ==========================================================
              TABLE HEADER
          ========================================================== */}

          <div className="project-table-header">

            <span>NO.</span>

            <span>PROJECT</span>

            <span>SOURCE</span>

            <span>ANALYZED</span>

            <span />

          </div>

          {/* ==========================================================
              LOADING
          ========================================================== */}

          {loading && (
            <div className="recent-state">

              <div className="recent-loader" />

              <h2>
                Loading projects
              </h2>

              <p>
                Fetching your analysis history.
              </p>

            </div>
          )}

          {/* ==========================================================
              ERROR
          ========================================================== */}

          {!loading && error && (
            <div className="recent-state">

              <div className="recent-error-icon">
                !
              </div>

              <h2>
                Unable to load projects
              </h2>

              <p>
                {error}
              </p>

              <button
                className="recent-retry"
                onClick={() => window.location.reload()}
              >
                RETRY
              </button>

            </div>
          )}

          {/* ==========================================================
              EMPTY
          ========================================================== */}

          {!loading &&
            !error &&
            filteredProjects.length === 0 && (
              <div className="recent-state">

                <div className="recent-empty-icon">
                  <Search size={24} />
                </div>

                <h2>
                  No projects found
                </h2>

                <p>
                  Try changing your search or source filter.
                </p>

              </div>
            )}

          {/* ==========================================================
              PROJECT ROWS
          ========================================================== */}

          {!loading &&
            !error &&
            filteredProjects.length > 0 && (
              <div className="project-list">

                {filteredProjects.map(
                  (project, index) => (
                    <button
                      key={project._id}
                      className="recent-project-row"
                      onClick={() =>
                        navigate(
                          `/projects/${project._id}`
                        )
                      }
                    >

                      {/* NUMBER */}

                      <span className="recent-number">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      {/* PROJECT */}

                      <span className="recent-project">

                        <span className="recent-project-icon">

                          {project.sourceType ===
                          "github" ? (
                            <GitBranch size={18} />
                          ) : (
                            <FileCode2 size={18} />
                          )}

                        </span>

                        <span className="recent-project-info">

                          <strong>
                            {getProjectName(project)}
                          </strong>

                          <small>
                            {getProjectSource(project)}
                          </small>

                        </span>

                      </span>

                      {/* SOURCE */}

                      <span className="recent-source">

                        {project.sourceType ===
                        "github" ? (
                          <>
                            <GitBranch size={15} />
                            GITHUB
                          </>
                        ) : (
                          <>
                            <FileCode2 size={15} />
                            ZIP
                          </>
                        )}

                      </span>

                      {/* DATE */}

                      <span className="recent-date">

                        <strong>
                          {formatDate(
                            project.createdAt
                          )}
                        </strong>

                        <small>
                          {formatTime(
                            project.createdAt
                          )}
                        </small>

                      </span>

                      {/* ARROW */}

                      <span className="recent-arrow">
                        <ArrowUpRight size={18} />
                      </span>

                    </button>
                  )
                )}

              </div>
            )}

        </section>

        {/* ============================================================
            FOOTER INFO
        ============================================================ */}

        {!loading && !error && (
          <div className="recent-footer">

            <span>
              TOTAL PROJECTS&nbsp;
              <strong>{projects.length}</strong>
            </span>

            <span>
              GITHUB&nbsp;
              <strong>{githubCount}</strong>
            </span>

            <span>
              ZIP&nbsp;
              <strong>{zipCount}</strong>
            </span>

          </div>
        )}

      </main>

      {/* ================================================================
          STYLES
      ================================================================ */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .recent-page {
          position: relative;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(
              circle at 72% 20%,
              rgba(35, 65, 92, .16),
              transparent 32%
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

        /* ============================================================
           BACKGROUND
        ============================================================ */

        .recent-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .30;
          background-image:
            linear-gradient(
              rgba(151, 182, 204, .07) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(151, 182, 204, .07) 1px,
              transparent 1px
            );
          background-size: 96px 96px;
          mask-image:
            linear-gradient(
              to bottom,
              black,
              rgba(0,0,0,.35) 72%,
              transparent
            );
        }

        .recent-vignette {
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at center,
              transparent 38%,
              rgba(0,0,0,.55) 100%
            );
        }

        /* ============================================================
           NAVBAR
        ============================================================ */

        .recent-topbar {
          position: relative;
          z-index: 20;
          height: 78px;
          padding: 0 34px;
          display: grid;
          grid-template-columns: 240px 1fr 280px;
          align-items: center;
          border-bottom: 1px solid rgba(151, 182, 204, .15);
          background: rgba(2, 4, 5, .78);
          backdrop-filter: blur(18px);
        }

        .recent-brand {
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

        .recent-logo {
          width: 105px;
          height: 70px;
          display: block;
          object-fit: contain;
        }

        .recent-navigation {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 48px;
        }

        .recent-nav-item {
          position: relative;
          height: 100%;
          padding: 0;
          border: 0;
          background: transparent;
          color: rgba(242, 249, 251, .38);
          font-family: "IBM Plex Mono", monospace;
          font-size: 12px;
          letter-spacing: 1.4px;
          cursor: pointer;
        }

        .recent-nav-item:hover,
        .recent-nav-active {
          color: #f2f9fb;
        }

        .recent-nav-active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 1px;
          background: #97b6cc;
        }

        .recent-account {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .recent-connected {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(242, 249, 251, .45);
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
        }

        .recent-connected-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b9d8eb;
          box-shadow:
            0 0 12px rgba(185, 216, 235, .65);
        }

        .recent-profile {
          margin-left: 12px;
          padding: 8px 12px;
          border: 1px solid rgba(151, 182, 204, .3);
          background: rgba(151, 182, 204, .06);
          color: #dcecf4;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.1px;
          cursor: pointer;
        }

        /* ============================================================
           MAIN
        ============================================================ */

        .recent-main {
          position: relative;
          z-index: 5;
          width: min(1410px, calc(100% - 48px));
          margin: 0 auto;
          padding: 52px 0 60px;
        }

        /* ============================================================
           CONTROLS
        ============================================================ */

        .recent-controls {
          display: grid;
          grid-template-columns: 1fr 180px 188px;
          gap: 10px;
          margin-bottom: 36px;
        }

        .recent-search,
        .recent-filter,
        .recent-sort {
          height: 50px;
          border: 1px solid #252d30;
          background: #0c1012;
          color: #9aa7ac;
        }

        .recent-search {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
        }

        .recent-search svg {
          color: #607078;
          flex-shrink: 0;
        }

        .recent-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #dce4e7;
          font-size: 14px;
        }

        .recent-search input::placeholder {
          color: #59666c;
        }

        .recent-filter,
        .recent-sort {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
          cursor: pointer;
        }

        .recent-filter svg:last-child,
        .recent-sort svg:last-child {
          margin-left: auto;
        }

        .recent-filter:hover,
        .recent-sort:hover {
          border-color: #394449;
        }

        .sort-label {
          color: #59666c;
          font-size: 9px;
          letter-spacing: 1.3px;
        }

        /* ============================================================
           PROJECT INDEX
        ============================================================ */

        .project-index {
          border: 1px solid #252b2e;
          background: rgba(10, 13, 14, .82);
        }

        .project-index-header {
          min-height: 92px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #252b2e;
        }

        .project-index-kicker {
          margin: 0 0 7px;
          color: #65737a;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 2px;
        }

        .project-index-header h1 {
          margin: 0;
          color: #dfe7e9;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -.3px;
        }

        .project-results {
          color: #66747a;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.4px;
        }

        /* ============================================================
           TABLE HEADER
        ============================================================ */

        .project-table-header {
          min-height: 46px;
          padding: 0 22px;
          display: grid;
          grid-template-columns: 70px minmax(0, 1fr) 150px 190px 50px;
          align-items: center;
          border-bottom: 1px solid #1d2427;
          color: #58666c;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
        }

        /* ============================================================
           PROJECT ROW
        ============================================================ */

        .recent-project-row {
          width: 100%;
          min-height: 86px;
          padding: 0 22px;
          display: grid;
          grid-template-columns: 70px minmax(0, 1fr) 150px 190px 50px;
          align-items: center;
          border: 0;
          border-bottom: 1px solid #1c2326;
          background: #0c1011;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .recent-project-row:last-child {
          border-bottom: 0;
        }

        .recent-project-row:hover {
          background: #111617;
        }

        .recent-number {
          color: #536066;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .recent-project {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .recent-project-icon {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #30393d;
          background: #121719;
          color: #9eabb0;
        }

        .recent-project-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        /*
         * Increased project name size from the previous small version.
         */
        .recent-project-info strong {
          overflow: hidden;
          color: #e1e8ea;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /*
         * Slightly larger secondary project/source text.
         */
        .recent-project-info small {
          overflow: hidden;
          max-width: 720px;
          color: #69767c;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-source {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #89969b;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
        }

        .recent-source svg {
          color: #76868d;
        }

        .recent-date {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .recent-date strong {
          color: #bdc7ca;
          font-size: 12px;
          font-weight: 500;
        }

        .recent-date small {
          color: #59666c;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
        }

        .recent-arrow {
          display: flex;
          justify-content: flex-end;
          color: #75838a;
        }

        /* ============================================================
           STATES
        ============================================================ */

        .recent-state {
          min-height: 360px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          text-align: center;
          border-bottom: 1px solid #1c2326;
        }

        .recent-state h2 {
          margin: 8px 0 0;
          color: #dce4e7;
          font-size: 18px;
          font-weight: 500;
        }

        .recent-state p {
          max-width: 420px;
          margin: 0;
          color: #68757a;
          font-size: 13px;
          line-height: 1.6;
        }

        .recent-loader {
          width: 30px;
          height: 30px;
          border: 2px solid #283134;
          border-top-color: #aebfc8;
          border-radius: 50%;
          animation: recentSpin .8s linear infinite;
        }

        .recent-error-icon,
        .recent-empty-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #343d40;
          background: #111516;
          color: #9ca9ad;
        }

        .recent-error-icon {
          font-family: "IBM Plex Mono", monospace;
          font-size: 18px;
        }

        .recent-retry {
          margin-top: 10px;
          padding: 10px 18px;
          border: 1px solid #3b464a;
          background: #151a1c;
          color: #dce4e7;
          font-family: "IBM Plex Mono", monospace;
          font-size: 10px;
          letter-spacing: 1.2px;
          cursor: pointer;
        }

        /* ============================================================
           FOOTER
        ============================================================ */

        .recent-footer {
          min-height: 54px;
          display: flex;
          align-items: center;
          gap: 28px;
          padding: 0 4px;
          color: #56646a;
          font-family: "IBM Plex Mono", monospace;
          font-size: 9px;
          letter-spacing: 1.2px;
        }

        .recent-footer strong {
          color: #9eabb0;
          font-weight: 500;
        }

        /* ============================================================
           ANIMATION
           Only loader animation is used.
        ============================================================ */

        @keyframes recentSpin {
          to {
            transform: rotate(360deg);
          }
        }

        /* ============================================================
           RESPONSIVE
        ============================================================ */

        @media (max-width: 1000px) {

          .recent-topbar {
            grid-template-columns: 150px 1fr 180px;
            padding: 0 20px;
          }

          .recent-navigation {
            gap: 22px;
          }

          .recent-main {
            width: min(100% - 28px, 1410px);
          }

          .project-table-header,
          .recent-project-row {
            grid-template-columns:
              50px
              minmax(0, 1fr)
              110px
              150px
              40px;
          }

          .recent-project-info strong {
            font-size: 14px;
          }

        }

        @media (max-width: 760px) {

          .recent-topbar {
            height: auto;
            min-height: 72px;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            padding: 12px 18px;
          }

          .recent-brand {
            width: 130px;
          }

          .recent-brand img {
            width: 115px;
          }

          .recent-navigation {
            order: 3;
            width: 100%;
            height: 42px;
            justify-content: flex-start;
            overflow-x: auto;
            gap: 24px;
          }

          .recent-account {
            margin-left: auto;
          }

          .recent-connected {
            display: none;
          }

          .recent-controls {
            grid-template-columns: 1fr;
          }

          .project-table-header {
            display: none;
          }

          .recent-project-row {
            min-height: 105px;
            padding: 15px;
            grid-template-columns:
              38px
              minmax(0, 1fr)
              80px
              30px;
            gap: 8px;
          }

          .recent-project {
            grid-column: 2;
          }

          .recent-source {
            grid-column: 3;
          }

          .recent-date {
            display: none;
          }

          .recent-arrow {
            grid-column: 4;
          }

          .recent-number {
            grid-column: 1;
          }

          .recent-project-info strong {
            font-size: 14px;
          }

          .recent-project-info small {
            font-size: 9px;
          }

          .recent-footer {
            flex-wrap: wrap;
            gap: 15px;
            padding: 15px 0;
          }

        }

      `}</style>

    </div>
  );
};

export default RecentProjects;