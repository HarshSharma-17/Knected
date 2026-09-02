/**
 * ============================================================================
 * File: ProjectDetails.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Displays details and analysis information for a single Knected project.
 *
 * Responsibilities:
 * - Fetch project data from backend
 * - Display project information
 * - Display analysis statistics
 * - Display analyzed files and dependencies
 * - Navigate to dependency graph
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface AnalysisFile {
  file: string;
  dependencies: string[];
}

interface GraphNode {
  id: string;
  name: string;
  type: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface Project {
  _id: string;
  sourceType?: "zip" | "github";
  originalName?: string;
  fileName?: string;
  fileSize?: number;
  githubUrl?: string;
  githubOwner?: string;
  githubRepo?: string;
  createdAt?: string;

  analysis: {
    files: AnalysisFile[];
    graph: {
      nodes: GraphNode[];
      edges: GraphEdge[];
    };
  };
}

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch project details from backend
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        setError("Project ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/projects/${id}`,
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
            result.message || "Failed to fetch project."
          );
        }

        setProject(result.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate]);

  // Loading state
  if (loading) {
    return (
      <div style={styles.centerState}>
        <div style={styles.spinner}></div>

        <h2 style={styles.stateTitle}>
          Loading project...
        </h2>

        <p style={styles.stateText}>
          Fetching your project analysis.
        </p>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div style={styles.centerState}>
        <div style={styles.errorIcon}>
          !
        </div>

        <h2 style={styles.stateTitle}>
          Unable to load project
        </h2>

        <p style={styles.stateText}>
          {error || "Project not found."}
        </p>

        <button
          style={styles.primaryButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const files = project.analysis?.files || [];
  const nodes = project.analysis?.graph?.nodes || [];
  const edges = project.analysis?.graph?.edges || [];

  const dependencyCount = files.reduce(
    (total, file) =>
      total + (file.dependencies?.length || 0),
    0
  );

  const projectName =
    project.sourceType === "github"
      ? project.githubRepo || "GitHub Repository"
      : project.originalName?.replace(/\.zip$/i, "") ||
        "Uploaded Project";

  return (
    <div style={styles.page}>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav style={styles.navbar}>

        <div
          style={styles.logo}
          onClick={() => navigate("/dashboard")}
        >
          Knected
        </div>

        <div style={styles.navLinks}>

          <button
            style={styles.navButton}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            style={styles.navButton}
            onClick={() =>
              navigate(`/projects/${id}/graph`)
            }
          >
            Graph
          </button>

          <button
            style={styles.navButton}
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main style={styles.container}>

        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>


        {/* =====================================================
            PROJECT HEADER
        ===================================================== */}

        <section style={styles.projectHeader}>

          <div style={styles.projectIcon}>
            {project.sourceType === "github"
              ? "GH"
              : "ZIP"}
          </div>

          <div style={styles.projectHeaderInfo}>

            <div style={styles.sourceBadge}>
              {project.sourceType === "github"
                ? "GITHUB REPOSITORY"
                : "UPLOADED PROJECT"}
            </div>

            <h1 style={styles.projectTitle}>
              {projectName}
            </h1>

            <p style={styles.projectSubtitle}>
              {project.sourceType === "github"
                ? project.githubUrl
                : project.originalName}
            </p>

          </div>

          <button
            style={styles.graphButton}
            onClick={() =>
              navigate(`/projects/${id}/graph`)
            }
          >
            View Dependency Graph
            <span>→</span>
          </button>

        </section>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section style={styles.statsGrid}>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ◫
            </div>

            <div>
              <p style={styles.statLabel}>
                SOURCE FILES
              </p>

              <h2 style={styles.statValue}>
                {files.length}
              </h2>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ↗
            </div>

            <div>
              <p style={styles.statLabel}>
                DEPENDENCIES
              </p>

              <h2 style={styles.statValue}>
                {dependencyCount}
              </h2>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ●
            </div>

            <div>
              <p style={styles.statLabel}>
                GRAPH NODES
              </p>

              <h2 style={styles.statValue}>
                {nodes.length}
              </h2>
            </div>
          </div>


          <div style={styles.statCard}>
            <div style={styles.statIcon}>
              ⟷
            </div>

            <div>
              <p style={styles.statLabel}>
                GRAPH EDGES
              </p>

              <h2 style={styles.statValue}>
                {edges.length}
              </h2>
            </div>
          </div>

        </section>


        {/* =====================================================
            ANALYSIS OVERVIEW
        ===================================================== */}

        <section style={styles.contentGrid}>

          {/* Files */}

          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>
                <h2 style={styles.cardTitle}>
                  Analyzed Files
                </h2>

                <p style={styles.cardSubtitle}>
                  Source files discovered by Knected.
                </p>
              </div>

              <span style={styles.countBadge}>
                {files.length}
              </span>

            </div>


            {files.length === 0 ? (
              <div style={styles.emptyState}>
                No source files were found.
              </div>
            ) : (
              <div style={styles.fileList}>

                {files.map((file, index) => (
                  <div
                    key={`${file.file}-${index}`}
                    style={styles.fileItem}
                  >

                    <div style={styles.fileIcon}>
                      {getFileExtension(file.file)}
                    </div>

                    <div style={styles.fileInfo}>

                      <p style={styles.fileName}>
                        {file.file}
                      </p>

                      <p style={styles.dependencyText}>
                        {file.dependencies?.length || 0}{" "}
                        {file.dependencies?.length === 1
                          ? "dependency"
                          : "dependencies"}
                      </p>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>


          {/* Dependency Summary */}

          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>
                <h2 style={styles.cardTitle}>
                  Dependency Overview
                </h2>

                <p style={styles.cardSubtitle}>
                  How your source files are connected.
                </p>
              </div>

            </div>


            <div style={styles.overviewVisual}>

              <div style={styles.centralNode}>
                <span>KN</span>
              </div>

              <div style={styles.orbitNodeOne}>
                FILE
              </div>

              <div style={styles.orbitNodeTwo}>
                DEP
              </div>

              <div style={styles.orbitNodeThree}>
                CODE
              </div>

              <div style={styles.connectionOne}></div>
              <div style={styles.connectionTwo}></div>
              <div style={styles.connectionThree}></div>

            </div>


            <div style={styles.overviewStats}>

              <div>
                <span style={styles.overviewNumber}>
                  {nodes.length}
                </span>

                <span style={styles.overviewLabel}>
                  Nodes
                </span>
              </div>

              <div>
                <span style={styles.overviewNumber}>
                  {edges.length}
                </span>

                <span style={styles.overviewLabel}>
                  Connections
                </span>
              </div>

              <div>
                <span style={styles.overviewNumber}>
                  {dependencyCount}
                </span>

                <span style={styles.overviewLabel}>
                  Dependencies
                </span>
              </div>

            </div>


            <button
              style={styles.secondaryButton}
              onClick={() =>
                navigate(`/projects/${id}/graph`)
              }
            >
              Explore Full Graph →
            </button>

          </div>

        </section>


        {/* =====================================================
            PROJECT INFORMATION
        ===================================================== */}

        <section style={styles.infoCard}>

          <div>
            <p style={styles.infoLabel}>
              SOURCE
            </p>

            <p style={styles.infoValue}>
              {project.sourceType === "github"
                ? "GitHub Repository"
                : "ZIP Upload"}
            </p>
          </div>


          <div>
            <p style={styles.infoLabel}>
              PROJECT ID
            </p>

            <p style={styles.infoValue}>
              {project._id}
            </p>
          </div>


          {project.createdAt && (
            <div>
              <p style={styles.infoLabel}>
                ANALYZED
              </p>

              <p style={styles.infoValue}>
                {new Date(
                  project.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          )}

        </section>

      </main>

    </div>
  );
};


/* =============================================================
   HELPERS
============================================================= */

const getFileExtension = (fileName: string) => {
  const parts = fileName.split(".");

  if (parts.length < 2) {
    return "FILE";
  }

  return parts[parts.length - 1]
    .toUpperCase()
    .slice(0, 4);
};


/* =============================================================
   STYLES
============================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f7f8fc",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
  },

  navbar: {
    height: "70px",
    padding: "0 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },

  logo: {
    fontSize: "26px",
    fontWeight: "700",
    cursor: "pointer",
  },

  navLinks: {
    display: "flex",
    gap: "10px",
  },

  navButton: {
    border: "none",
    background: "transparent",
    padding: "10px 16px",
    fontSize: "15px",
    cursor: "pointer",
    color: "#374151",
  },

  container: {
    width: "86%",
    maxWidth: "1150px",
    margin: "0 auto",
    padding: "35px 0 70px",
  },

  backButton: {
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    padding: "5px 0",
    marginBottom: "28px",
  },

  projectHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "28px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    marginBottom: "22px",
  },

  projectIcon: {
    width: "62px",
    height: "62px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  projectHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },

  sourceBadge: {
    display: "inline-block",
    marginBottom: "7px",
    color: "#4f46e5",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.5px",
  },

  projectTitle: {
    margin: "0 0 7px",
    fontSize: "28px",
    letterSpacing: "-0.7px",
  },

  projectSubtitle: {
    margin: "0",
    color: "#64748b",
    fontSize: "13px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  graphButton: {
    height: "46px",
    padding: "0 18px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    whiteSpace: "nowrap" as const,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
    marginBottom: "22px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "21px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
  },

  statIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "16px",
    fontWeight: "700",
  },

  statLabel: {
    margin: "0 0 4px",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  statValue: {
    margin: "0",
    fontSize: "25px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "25px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "22px",
  },

  cardTitle: {
    margin: "0 0 6px",
    fontSize: "18px",
  },

  cardSubtitle: {
    margin: "0",
    color: "#64748b",
    fontSize: "12px",
  },

  countBadge: {
    minWidth: "28px",
    height: "28px",
    padding: "0 8px",
    borderRadius: "20px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
  },

  fileList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "9px",
    maxHeight: "360px",
    overflowY: "auto" as const,
  },

  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
  },

  fileIcon: {
    minWidth: "37px",
    height: "37px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: "700",
  },

  fileInfo: {
    minWidth: 0,
  },

  fileName: {
    margin: "0 0 4px",
    color: "#1e293b",
    fontSize: "12px",
    fontWeight: "600",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },

  dependencyText: {
    margin: "0",
    color: "#94a3b8",
    fontSize: "10px",
  },

  emptyState: {
    padding: "50px 20px",
    textAlign: "center" as const,
    color: "#94a3b8",
    fontSize: "13px",
  },

  overviewVisual: {
    position: "relative" as const,
    height: "230px",
    marginBottom: "20px",
    borderRadius: "14px",
    background:
      "radial-gradient(circle at center, #eef2ff 0%, #f8fafc 50%, #ffffff 100%)",
    overflow: "hidden",
  },

  centralNode: {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    boxShadow: "0 0 0 9px #e0e7ff",
    zIndex: 2,
  },

  orbitNodeOne: {
    position: "absolute" as const,
    left: "17%",
    top: "24%",
    padding: "8px 11px",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #dbe4ff",
    color: "#4f46e5",
    fontSize: "8px",
    fontWeight: "700",
  },

  orbitNodeTwo: {
    position: "absolute" as const,
    right: "15%",
    top: "27%",
    padding: "8px 11px",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #dbe4ff",
    color: "#4f46e5",
    fontSize: "8px",
    fontWeight: "700",
  },

  orbitNodeThree: {
    position: "absolute" as const,
    right: "19%",
    bottom: "20%",
    padding: "8px 11px",
    borderRadius: "8px",
    background: "#ffffff",
    border: "1px solid #dbe4ff",
    color: "#4f46e5",
    fontSize: "8px",
    fontWeight: "700",
  },

  connectionOne: {
    position: "absolute" as const,
    width: "30%",
    height: "1px",
    background: "#c7d2fe",
    left: "29%",
    top: "39%",
    transform: "rotate(16deg)",
  },

  connectionTwo: {
    position: "absolute" as const,
    width: "29%",
    height: "1px",
    background: "#c7d2fe",
    right: "29%",
    top: "40%",
    transform: "rotate(-13deg)",
  },

  connectionThree: {
    position: "absolute" as const,
    width: "27%",
    height: "1px",
    background: "#c7d2fe",
    right: "30%",
    bottom: "31%",
    transform: "rotate(20deg)",
  },

  overviewStats: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 5px",
    borderTop: "1px solid #eef2f7",
    borderBottom: "1px solid #eef2f7",
  },

  overviewNumber: {
    display: "block",
    marginBottom: "4px",
    fontSize: "18px",
    fontWeight: "700",
  },

  overviewLabel: {
    color: "#94a3b8",
    fontSize: "9px",
  },

  secondaryButton: {
    width: "100%",
    height: "44px",
    marginTop: "18px",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  infoCard: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    gap: "25px",
    marginTop: "22px",
    padding: "20px 25px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
  },

  infoLabel: {
    margin: "0 0 6px",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  infoValue: {
    margin: "0",
    color: "#334155",
    fontSize: "12px",
    wordBreak: "break-all" as const,
  },

  centerState: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8fc",
    textAlign: "center" as const,
    padding: "30px",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "3px solid #e0e7ff",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "20px",
  },

  errorIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff1f2",
    color: "#be123c",
    fontWeight: "700",
    marginBottom: "15px",
  },

  stateTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
  },

  stateText: {
    margin: "0 0 20px",
    color: "#64748b",
    fontSize: "13px",
  },

  primaryButton: {
    height: "45px",
    padding: "0 18px",
    border: "none",
    borderRadius: "9px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default ProjectDetails;