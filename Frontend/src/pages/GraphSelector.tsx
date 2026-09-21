/**
 * ============================================================================
 * File: GraphSelector.tsx
 * Path: Frontend/src/pages/GraphSelector.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Allows the user to select an analyzed Knected project before opening
 * its dependency graph.
 *
 * Responsibilities:
 * - Fetch projects belonging to the logged-in user
 * - Display available projects
 * - Show project source and basic information
 * - Navigate to the selected project's dependency graph
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


// ============================================================================
// Types
// ============================================================================

interface Project {
  _id: string;

  sourceType?: "zip" | "github";

  originalName?: string;

  githubOwner?: string;
  githubRepo?: string;
  githubUrl?: string;

  fileSize?: number;

  createdAt?: string;
}


// ============================================================================
// Component
// ============================================================================

const GraphSelector = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================================================
  // Fetch user's projects
  // ==========================================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

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

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to fetch your projects."
          );
        }

        setProjects(result.data || []);

      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Something went wrong while loading projects."
          );
        }

      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [navigate]);


  // ==========================================================================
  // Get project display name
  // ==========================================================================

  const getProjectName = (project: Project) => {
    if (project.sourceType === "github") {
      return (
        project.githubRepo ||
        "GitHub Repository"
      );
    }

    return (
      project.originalName?.replace(
        /\.zip$/i,
        ""
      ) ||
      "Uploaded Project"
    );
  };


  // ==========================================================================
  // Get project subtitle
  // ==========================================================================

  const getProjectSubtitle = (
    project: Project
  ) => {
    if (project.sourceType === "github") {
      return (
        project.githubUrl ||
        "GitHub repository"
      );
    }

    return (
      project.originalName ||
      "Uploaded ZIP project"
    );
  };


  // ==========================================================================
  // Format date
  // ==========================================================================

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "Unknown date";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ==========================================================================
  // Open graph
  // ==========================================================================

  const openGraph = (
    projectId: string
  ) => {
    navigate(
      `/projects/${projectId}/graph`
    );
  };


  // ==========================================================================
  // Loading state
  // ==========================================================================

  if (loading) {
    return (
      <div style={styles.page}>

        <nav style={styles.navbar}>

          <div
            style={styles.logo}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Knected
          </div>

        </nav>

        <main style={styles.container}>

          <div style={styles.centerState}>

            <div style={styles.spinner}></div>

            <h2 style={styles.stateTitle}>
              Loading your projects...
            </h2>

            <p style={styles.stateText}>
              Preparing your available dependency graphs.
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ==========================================================================
  // Error state
  // ==========================================================================

  if (error) {
    return (
      <div style={styles.page}>

        <nav style={styles.navbar}>

          <div
            style={styles.logo}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Knected
          </div>

        </nav>

        <main style={styles.container}>

          <button
            style={styles.backButton}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div style={styles.centerState}>

            <div style={styles.errorIcon}>
              !
            </div>

            <h2 style={styles.stateTitle}>
              Unable to load projects
            </h2>

            <p style={styles.errorText}>
              {error}
            </p>

            <button
              style={styles.primaryButton}
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }


  // ==========================================================================
  // Main page
  // ==========================================================================

  return (
    <div style={styles.page}>

      {/* ====================================================================
          NAVBAR
      ==================================================================== */}

      <nav style={styles.navbar}>

        <div
          style={styles.logo}
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Knected
        </div>

        <div style={styles.navLinks}>

          <button
            style={styles.navButton}
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            style={{
              ...styles.navButton,
              ...styles.activeNavButton,
            }}
          >
            Graph
          </button>

          <button
            style={styles.navButton}
            onClick={() =>
              navigate("/profile")
            }
          >
            Profile
          </button>

        </div>

      </nav>


      {/* ====================================================================
          MAIN CONTENT
      ==================================================================== */}

      <main style={styles.container}>

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>


        {/* ==================================================================
            HEADER
        ================================================================== */}

        <section style={styles.header}>

          <div style={styles.iconCircle}>
            ◇
          </div>

          <p style={styles.eyebrow}>
            DEPENDENCY VISUALIZATION
          </p>

          <h1 style={styles.heading}>
            Choose a project.
            <br />

            <span style={styles.highlight}>
              Explore its connections.
            </span>
          </h1>

          <p style={styles.description}>
            Select one of your analyzed projects to
            open its interactive dependency graph.
          </p>

        </section>


        {/* ==================================================================
            PROJECT LIST
        ================================================================== */}

        <section>

          <div style={styles.sectionHeader}>

            <div>

              <h2 style={styles.sectionTitle}>
                Your Projects
              </h2>

              <p style={styles.sectionSubtitle}>
                {projects.length === 0
                  ? "No analyzed projects yet."
                  : `${projects.length} ${
                      projects.length === 1
                        ? "project"
                        : "projects"
                    } available`}
              </p>

            </div>

          </div>


          {projects.length === 0 ? (

            <div style={styles.emptyState}>

              <div style={styles.emptyIcon}>
                ◌
              </div>

              <h2 style={styles.emptyTitle}>
                No projects available
              </h2>

              <p style={styles.emptyText}>
                Analyze a GitHub repository or upload
                a ZIP project first. Your project will
                appear here once the analysis is complete.
              </p>

              <div style={styles.emptyActions}>

                <button
                  style={styles.primaryButton}
                  onClick={() =>
                    navigate("/github-analysis")
                  }
                >
                  Analyze GitHub
                </button>

                <button
                  style={styles.secondaryButton}
                  onClick={() =>
                    navigate("/upload-project")
                  }
                >
                  Upload ZIP
                </button>

              </div>

            </div>

          ) : (

            <div style={styles.projectGrid}>

              {projects.map((project) => (

                <article
                  key={project._id}
                  style={styles.projectCard}
                >

                  {/* --------------------------------------------------------
                      Project top
                  -------------------------------------------------------- */}

                  <div style={styles.cardTop}>

                    <div
                      style={{
                        ...styles.projectIcon,
                        ...(project.sourceType ===
                        "github"
                          ? styles.githubIcon
                          : styles.zipIcon),
                      }}
                    >
                      {project.sourceType ===
                      "github"
                        ? "GH"
                        : "ZIP"}
                    </div>

                    <div
                      style={styles.sourceBadge}
                    >
                      {project.sourceType ===
                      "github"
                        ? "GITHUB"
                        : "ZIP PROJECT"}
                    </div>

                  </div>


                  {/* --------------------------------------------------------
                      Project information
                  -------------------------------------------------------- */}

                  <h3 style={styles.projectName}>
                    {getProjectName(project)}
                  </h3>

                  <p
                    style={styles.projectSubtitle}
                    title={getProjectSubtitle(
                      project
                    )}
                  >
                    {getProjectSubtitle(
                      project
                    )}
                  </p>


                  {/* --------------------------------------------------------
                      Project metadata
                  -------------------------------------------------------- */}

                  <div style={styles.metadata}>

                    <span>
                      Analyzed
                    </span>

                    <span>
                      {formatDate(
                        project.createdAt
                      )}
                    </span>

                  </div>


                  {/* --------------------------------------------------------
                      Graph button
                  -------------------------------------------------------- */}

                  <button
                    style={styles.graphButton}
                    onClick={() =>
                      openGraph(
                        project._id
                      )
                    }
                  >
                    <span>
                      View Dependency Graph
                    </span>

                    <span style={styles.arrow}>
                      →
                    </span>
                  </button>

                </article>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
};


// ============================================================================
// Styles
// ============================================================================

const styles: {
  [key: string]: React.CSSProperties;
} = {

  // --------------------------------------------------------------------------
  // Page
  // --------------------------------------------------------------------------

  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#111827",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  // --------------------------------------------------------------------------
  // Navbar
  // --------------------------------------------------------------------------

  navbar: {
    height: "72px",
    padding: "0 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxSizing: "border-box",
  },

  logo: {
    fontSize: "21px",
    fontWeight: 750,
    color: "#111827",
    cursor: "pointer",
    letterSpacing: "-0.5px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  navButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    padding: "9px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },

  activeNavButton: {
    color: "#4f46e5",
    background: "#eef2ff",
  },


  // --------------------------------------------------------------------------
  // Container
  // --------------------------------------------------------------------------

  container: {
    width: "86%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "32px 0 70px",
    boxSizing: "border-box",
  },


  // --------------------------------------------------------------------------
  // Back button
  // --------------------------------------------------------------------------

  backButton: {
    border: "none",
    background: "transparent",
    color: "#6366f1",
    padding: 0,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "28px",
  },


  // --------------------------------------------------------------------------
  // Header
  // --------------------------------------------------------------------------

  header: {
    maxWidth: "700px",
    marginBottom: "42px",
  },

  iconCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "21px",
    fontWeight: 700,
    marginBottom: "17px",
  },

  eyebrow: {
    margin: 0,
    color: "#6366f1",
    fontSize: "11px",
    fontWeight: 750,
    letterSpacing: "1.4px",
  },

  heading: {
    margin: "10px 0 0",
    color: "#111827",
    fontSize: "39px",
    lineHeight: 1.12,
    letterSpacing: "-1.3px",
    fontWeight: 750,
  },

  highlight: {
    color: "#6366f1",
  },

  description: {
    margin: "15px 0 0",
    maxWidth: "610px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.7,
  },


  // --------------------------------------------------------------------------
  // Section
  // --------------------------------------------------------------------------

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "17px",
  },

  sectionTitle: {
    margin: 0,
    color: "#111827",
    fontSize: "20px",
    fontWeight: 700,
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },


  // --------------------------------------------------------------------------
  // Project grid
  // --------------------------------------------------------------------------

  projectGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },


  // --------------------------------------------------------------------------
  // Project card
  // --------------------------------------------------------------------------

  projectCard: {
    padding: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow:
      "0 5px 18px rgba(15, 23, 42, 0.045)",
    boxSizing: "border-box",
  },

  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "18px",
  },

  projectIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 800,
  },

  githubIcon: {
    background: "#f1f5f9",
    color: "#111827",
  },

  zipIcon: {
    background: "#eef2ff",
    color: "#4f46e5",
  },

  sourceBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: 750,
    letterSpacing: "0.7px",
  },

  projectName: {
    margin: 0,
    color: "#111827",
    fontSize: "18px",
    fontWeight: 700,
    wordBreak: "break-word",
  },

  projectSubtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  metadata: {
    marginTop: "20px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "11px",
  },

  graphButton: {
    width: "100%",
    height: "42px",
    marginTop: "18px",
    padding: "0 14px",
    border: "1px solid #c7d2fe",
    borderRadius: "9px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
  },

  arrow: {
    fontSize: "17px",
  },


  // --------------------------------------------------------------------------
  // Empty state
  // --------------------------------------------------------------------------

  emptyState: {
    padding: "65px 30px",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "15px",
    background: "#eef2ff",
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "15px",
  },

  emptyTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "19px",
  },

  emptyText: {
    maxWidth: "520px",
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  emptyActions: {
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  },


  // --------------------------------------------------------------------------
  // Buttons
  // --------------------------------------------------------------------------

  primaryButton: {
    padding: "11px 17px",
    border: "none",
    borderRadius: "9px",
    background: "#4f46e5",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 650,
  },

  secondaryButton: {
    padding: "10px 17px",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 650,
  },


  // --------------------------------------------------------------------------
  // States
  // --------------------------------------------------------------------------

  centerState: {
    minHeight: "65vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },

  spinner: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "3px solid #e0e7ff",
    borderTop: "3px solid #6366f1",
    marginBottom: "17px",
  },

  stateTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "20px",
  },

  stateText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  errorIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fee2e2",
    color: "#dc2626",
    fontSize: "21px",
    fontWeight: 700,
    marginBottom: "15px",
  },

  errorText: {
    maxWidth: "500px",
    margin: "9px 0 0",
    color: "#dc2626",
    fontSize: "13px",
  },
};


export default GraphSelector;