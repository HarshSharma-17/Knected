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
 * - Generate AI-powered project summary
 * - Render AI response using Markdown
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { deleteProject } from "../services/projectService";


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


  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);


  // AI project summary state
  const [aiSummary, setAiSummary] =
    useState("");

  const [generatingSummary, setGeneratingSummary] =
    useState(false);

  const [aiSummaryError, setAiSummaryError] =
    useState("");


  // ==========================================================================
  // Fetch Project Details
  // ==========================================================================

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


        const token =
          localStorage.getItem("token");


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


        const result =
          await response.json();


        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "Failed to fetch project."
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


  // ==========================================================================
  // Delete Project
  // ==========================================================================

  const handleDeleteProject = async () => {

    if (!id) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeleting(true);
      setError("");


      await deleteProject(id);


      // Return to dashboard after successful deletion
      navigate("/dashboard");

    } catch (err) {

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete project.");
      }


      setDeleting(false);
    }
  };


  // ==========================================================================
  // Generate AI Project Summary
  // ==========================================================================

  const handleGenerateSummary = async () => {

    if (!id) {
      return;
    }


    try {

      setGeneratingSummary(true);
      setAiSummaryError("");


      const token =
        localStorage.getItem("token");


      if (!token) {
        navigate("/login");
        return;
      }


      const response = await fetch(
        `http://localhost:5000/api/ai/projects/${id}/summary`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      const result =
        await response.json();


      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
          "Failed to generate AI summary."
        );
      }


      setAiSummary(
        result.data?.summary || ""
      );

    } catch (err) {

      if (err instanceof Error) {
        setAiSummaryError(err.message);
      } else {
        setAiSummaryError(
          "Failed to generate AI summary."
        );
      }

    } finally {

      setGeneratingSummary(false);

    }
  };


  // ==========================================================================
  // Loading State
  // ==========================================================================

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


  // ==========================================================================
  // Error State
  // ==========================================================================

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
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>
    );
  }


  // ==========================================================================
  // Project Data
  // ==========================================================================

  const files =
    project.analysis?.files || [];

  const nodes =
    project.analysis?.graph?.nodes || [];

  const edges =
    project.analysis?.graph?.edges || [];


  const dependencyCount =
    files.reduce(
      (total, file) =>
        total +
        (file.dependencies?.length || 0),
      0
    );


  const projectName =
    project.sourceType === "github"
      ? project.githubRepo ||
        "GitHub Repository"
      : project.originalName?.replace(
          /\.zip$/i,
          ""
        ) ||
        "Uploaded Project";


  // ==========================================================================
  // Main UI
  // ==========================================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

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
            style={styles.navButton}
            onClick={() => navigate("/recent-projects")
            }
          >
            RECENTS
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


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main style={styles.container}>

        {/* Back */}

        <button
          style={styles.backButton}
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>


        {/* =====================================================
            PROJECT HEADER
        ===================================================== */}

        <section
          style={styles.projectHeader}
        >

          <div style={styles.projectIcon}>

            {project.sourceType === "github"
              ? "GH"
              : "ZIP"}

          </div>


          <div
            style={styles.projectHeaderInfo}
          >

            <div
              style={styles.sourceBadge}
            >
              {project.sourceType === "github"
                ? "GITHUB REPOSITORY"
                : "UPLOADED PROJECT"}
            </div>


            <h1
              style={styles.projectTitle}
            >
              {projectName}
            </h1>


            <p
              style={styles.projectSubtitle}
            >
              {project.sourceType === "github"
                ? project.githubUrl
                : project.originalName}
            </p>

          </div>


          <div
            style={styles.headerActions}
          >

            <button
              style={styles.deleteButton}
              onClick={handleDeleteProject}
              disabled={deleting}
            >
              {deleting
                ? "Deleting..."
                : "Delete Project"}
            </button>


            <button
              style={styles.graphButton}
              onClick={() =>
                navigate(
                  `/projects/${id}/graph`
                )
              }
            >
              View Dependency Graph

              <span>
                →
              </span>

            </button>

          </div>

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

                <h2
                  style={styles.cardTitle}
                >
                  Analyzed Files
                </h2>

                <p
                  style={styles.cardSubtitle}
                >
                  Source files discovered by Knected.
                </p>

              </div>


              <span
                style={styles.countBadge}
              >
                {files.length}
              </span>

            </div>


            {files.length === 0 ? (

              <div style={styles.emptyState}>
                No source files were found.
              </div>

            ) : (

              <div style={styles.fileList}>

                {files.map(
                  (file, index) => (

                    <div
                      key={`${file.file}-${index}`}
                      style={styles.fileItem}
                    >

                      <div
                        style={styles.fileIcon}
                      >
                        {getFileExtension(
                          file.file
                        )}
                      </div>


                      <div
                        style={styles.fileInfo}
                      >

                        <p
                          style={styles.fileName}
                        >
                          {file.file}
                        </p>


                        <p
                          style={
                            styles.dependencyText
                          }
                        >
                          {file.dependencies?.length ||
                            0}{" "}

                          {file.dependencies?.length ===
                          1
                            ? "dependency"
                            : "dependencies"}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* Dependency Summary */}

          <div style={styles.card}>

            <div style={styles.cardHeader}>

              <div>

                <h2
                  style={styles.cardTitle}
                >
                  Dependency Overview
                </h2>

                <p
                  style={styles.cardSubtitle}
                >
                  How your source files are connected.
                </p>

              </div>

            </div>


            <div
              style={styles.overviewVisual}
            >

              <div
                style={styles.centralNode}
              >
                <span>
                  KN
                </span>
              </div>


              <div
                style={styles.orbitNodeOne}
              >
                FILE
              </div>


              <div
                style={styles.orbitNodeTwo}
              >
                DEP
              </div>


              <div
                style={styles.orbitNodeThree}
              >
                CODE
              </div>


              <div
                style={styles.connectionOne}
              ></div>

              <div
                style={styles.connectionTwo}
              ></div>

              <div
                style={styles.connectionThree}
              ></div>

            </div>


            <div
              style={styles.overviewStats}
            >

              <div>

                <span
                  style={styles.overviewNumber}
                >
                  {nodes.length}
                </span>

                <span
                  style={styles.overviewLabel}
                >
                  Nodes
                </span>

              </div>


              <div>

                <span
                  style={styles.overviewNumber}
                >
                  {edges.length}
                </span>

                <span
                  style={styles.overviewLabel}
                >
                  Connections
                </span>

              </div>


              <div>

                <span
                  style={styles.overviewNumber}
                >
                  {dependencyCount}
                </span>

                <span
                  style={styles.overviewLabel}
                >
                  Dependencies
                </span>

              </div>

            </div>


            <button
              style={styles.secondaryButton}
              onClick={() =>
                navigate(
                  `/projects/${id}/graph`
                )
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


        {/* =====================================================
            AI PROJECT INTELLIGENCE
        ===================================================== */}

        <section style={styles.aiCard}>

          <div style={styles.aiHeader}>

            <div>

              <div style={styles.aiLabel}>
                KNECTED AI
              </div>


              <h2
                style={styles.cardTitle}
              >
                Project Intelligence
              </h2>


              <p
                style={styles.cardSubtitle}
              >
                Get an AI-generated summary of your project's architecture,
                important files, dependencies, and recommendations.
              </p>

            </div>


            <button
              style={
                generatingSummary
                  ? styles.aiButtonDisabled
                  : styles.aiButton
              }
              onClick={
                handleGenerateSummary
              }
              disabled={
                generatingSummary
              }
            >
              {generatingSummary
                ? "ANALYZING..."
                : aiSummary
                  ? "REGENERATE SUMMARY"
                  : "GENERATE SUMMARY"}
            </button>

          </div>


          {/* AI Error */}

          {aiSummaryError && (

            <div style={styles.aiError}>
              {aiSummaryError}
            </div>

          )}


          {/* AI Markdown Response */}

          {aiSummary && (

            <div style={styles.aiSummary}>

              <div
                style={styles.aiSummaryLabel}
              >
                AI PROJECT SUMMARY
              </div>


              <div
                style={styles.aiSummaryText}
              >

                <ReactMarkdown
                  components={{

                    h1: ({ children }) => (
                      <h1
                        style={styles.markdownH1}
                      >
                        {children}
                      </h1>
                    ),


                    h2: ({ children }) => (
                      <h2
                        style={styles.markdownH2}
                      >
                        {children}
                      </h2>
                    ),


                    h3: ({ children }) => (
                      <h3
                        style={styles.markdownH3}
                      >
                        {children}
                      </h3>
                    ),


                    p: ({ children }) => (
                      <p
                        style={
                          styles.markdownParagraph
                        }
                      >
                        {children}
                      </p>
                    ),


                    ul: ({ children }) => (
                      <ul
                        style={
                          styles.markdownList
                        }
                      >
                        {children}
                      </ul>
                    ),


                    ol: ({ children }) => (
                      <ol
                        style={
                          styles.markdownList
                        }
                      >
                        {children}
                      </ol>
                    ),


                    li: ({ children }) => (
                      <li
                        style={
                          styles.markdownListItem
                        }
                      >
                        {children}
                      </li>
                    ),


                    strong: ({ children }) => (
                      <strong
                        style={
                          styles.markdownStrong
                        }
                      >
                        {children}
                      </strong>
                    ),


                    code: ({ children }) => (
                      <code
                        style={
                          styles.markdownCode
                        }
                      >
                        {children}
                      </code>
                    ),


                    hr: () => (
                      <hr
                        style={
                          styles.markdownHr
                        }
                      />
                    ),


                    table: ({ children }) => (
                      <div
                        style={
                          styles.markdownTableWrapper
                        }
                      >
                        <table
                          style={
                            styles.markdownTable
                          }
                        >
                          {children}
                        </table>
                      </div>
                    ),


                    th: ({ children }) => (
                      <th
                        style={
                          styles.markdownTh
                        }
                      >
                        {children}
                      </th>
                    ),


                    td: ({ children }) => (
                      <td
                        style={
                          styles.markdownTd
                        }
                      >
                        {children}
                      </td>
                    ),

                  }}
                >
                  {aiSummary}
                </ReactMarkdown>

              </div>

            </div>

          )}


          {/* Empty AI State */}

          {!aiSummary &&
            !aiSummaryError &&
            !generatingSummary && (

              <div style={styles.aiEmpty}>

                Click{" "}

                <strong>
                  Generate Summary
                </strong>{" "}

                to let Knected AI analyze this
                project's existing dependency data.

              </div>

            )}

        </section>

      </main>

    </div>
  );
};


// ============================================================================
// Helpers
// ============================================================================

const getFileExtension = (
  fileName: string
) => {

  const parts =
    fileName.split(".");


  if (parts.length < 2) {
    return "FILE";
  }


  return parts[
    parts.length - 1
  ]
    .toUpperCase()
    .slice(0, 4);
};


// ============================================================================
// Styles
// ============================================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#080a0b",
    color: "#eef2f3",
    fontFamily: "Inter, Arial, sans-serif",
  },


  navbar: {
    height: "72px",
    padding: "0 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#090b0c",
    borderBottom: "1px solid #24292c",
    position: "relative" as const,
    zIndex: 2,
  },


  logo: {
    fontSize: "17px",
    fontWeight: "700",
    letterSpacing: "2.5px",
    color: "#f1f4f5",
    cursor: "pointer",
  },


  navLinks: {
    display: "flex",
    gap: "6px",
  },


  navButton: {
    border: "1px solid transparent",
    background: "transparent",
    padding: "9px 15px",
    fontSize: "14px",
    letterSpacing: ".5px",
    cursor: "pointer",
    color: "#b7c0c4",
  },


  container: {
    width: "90%",
    maxWidth: "1380px",
    margin: "0 auto",
    padding: "34px 0 70px",
  },


  backButton: {
    border: "none",
    background: "transparent",
    color: "#7f898e",
    fontSize: "11px",
    letterSpacing: "1.5px",
    cursor: "pointer",
    padding: "0",
    marginBottom: "20px",
  },


  projectHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    padding: "28px",
    background: "#0d1012",
    border: "1px solid #2a3033",
    marginBottom: "10px",
  },


  projectIcon: {
    width: "62px",
    height: "62px",
    border: "1px solid #424a4e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#15191b",
    color: "#e0e5e7",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
    flexShrink: 0,
  },


  projectHeaderInfo: {
    flex: 1,
    minWidth: 0,
  },


  sourceBadge: {
    display: "inline-block",
    marginBottom: "9px",
    color: "#8c969b",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.8px",
  },


  projectTitle: {
    margin: "0 0 8px",
    color: "#f1f4f5",
    fontSize: "32px",
    lineHeight: 1.15,
    fontWeight: "500",
    letterSpacing: "-1px",
    overflowWrap: "break-word" as const,
  },


  projectSubtitle: {
    margin: "0",
    color: "#8d989d",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },


  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexShrink: 0,
  },


  deleteButton: {
    height: "44px",
    padding: "0 15px",
    border: "1px solid #49383c",
    background: "#151112",
    borderRadius: "2px",
    color: "#d0b9be",
    fontSize: "12px",
    letterSpacing: "1px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },


  graphButton: {
    height: "44px",
    padding: "0 18px",
    border: "1px solid #dce1e3",
    borderRadius: "2px",
    background: "#e8ecee",
    color: "#111416",
    fontSize: "12px",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    whiteSpace: "nowrap" as const,
  },


  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "10px",
  },


  statCard: {
    minHeight: "126px",
    padding: "18px 20px",
    background: "#0c0f10",
    border: "1px solid #252b2e",
  },


  statIcon: {
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #394145",
    background: "#121618",
    color: "#b7bec1",
    fontSize: "12px",
  },


  statLabel: {
    margin: "14px 0 0",
    color: "#8f9a9f",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1.8px",
  },


  statValue: {
    margin: "5px 0 0",
    color: "#eef2f3",
    fontSize: "34px",
    fontWeight: "400",
    letterSpacing: "-.7px",
  },


  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.55fr) minmax(320px, .75fr)",
    gap: "10px",
  },


  card: {
    background: "#0c0f10",
    border: "1px solid #252b2e",
    padding: "24px",
    minWidth: 0,
  },


  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
  },


  cardTitle: {
    margin: "0 0 6px",
    color: "#e9edef",
    fontSize: "22px",
    fontWeight: "500",
    letterSpacing: "-.3px",
  },


  cardSubtitle: {
    margin: "0",
    color: "#899499",
    fontSize: "12px",
    lineHeight: 1.5,
  },


  countBadge: {
    minWidth: "32px",
    height: "28px",
    padding: "0 8px",
    border: "1px solid #394145",
    background: "#111517",
    color: "#e0e5e7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
  },


  fileList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "6px",
    maxHeight: "470px",
    overflowY: "auto" as const,
  },


  fileItem: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "10px 11px",
    background: "#101416",
    border: "1px solid #20272a",
  },


  fileIcon: {
    minWidth: "38px",
    height: "30px",
    border: "1px solid #394145",
    background: "#15191b",
    color: "#aeb6b9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "7px",
    fontWeight: "700",
  },


  fileInfo: {
    minWidth: 0,
  },


  fileName: {
    margin: "0 0 5px",
    color: "#c9d0d2",
    fontSize: "12px",
    fontFamily: "monospace",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },


  dependencyText: {
    margin: "0",
    color: "#7f8b90",
    fontSize: "11px",
  },


  emptyState: {
    padding: "60px 20px",
    textAlign: "center" as const,
    color: "#7d898e",
    fontSize: "11px",
    letterSpacing: "1.5px",
  },


  overviewVisual: {
    position: "relative" as const,
    height: "270px",
    marginBottom: "18px",
    background:
      "radial-gradient(circle at center, #171c1f 0%, #0e1113 48%, #090b0c 100%)",
    border: "1px solid #20272a",
    overflow: "hidden",
  },


  centralNode: {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    border: "1px solid #8b9498",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111517",
    color: "#eef2f3",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    boxShadow:
      "0 0 0 8px rgba(170,180,184,.05)",
    zIndex: 2,
  },


  orbitNodeOne: {
    position: "absolute" as const,
    left: "16%",
    top: "23%",
    padding: "7px 10px",
    border: "1px solid #414a4e",
    background: "#111517",
    color: "#c0c8cb",
    fontSize: "10px",
    letterSpacing: "1px",
  },


  orbitNodeTwo: {
    position: "absolute" as const,
    right: "15%",
    top: "25%",
    padding: "7px 10px",
    border: "1px solid #414a4e",
    background: "#111517",
    color: "#c0c8cb",
    fontSize: "10px",
    letterSpacing: "1px",
  },


  orbitNodeThree: {
    position: "absolute" as const,
    right: "18%",
    bottom: "19%",
    padding: "7px 10px",
    border: "1px solid #414a4e",
    background: "#111517",
    color: "#c0c8cb",
    fontSize: "10px",
    letterSpacing: "1px",
  },


  connectionOne: {
    position: "absolute" as const,
    width: "31%",
    height: "1px",
    background: "#4d575b",
    left: "27%",
    top: "40%",
    transform: "rotate(16deg)",
  },


  connectionTwo: {
    position: "absolute" as const,
    width: "29%",
    height: "1px",
    background: "#4d575b",
    right: "28%",
    top: "40%",
    transform: "rotate(-14deg)",
  },


  connectionThree: {
    position: "absolute" as const,
    width: "28%",
    height: "1px",
    background: "#3e484c",
    right: "29%",
    bottom: "31%",
    transform: "rotate(20deg)",
  },


  overviewStats: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 4px",
    borderTop: "1px solid #20272a",
    borderBottom: "1px solid #20272a",
  },


  overviewNumber: {
    display: "block",
    marginBottom: "4px",
    color: "#e5eaec",
    fontSize: "18px",
    fontWeight: "400",
  },


  overviewLabel: {
    color: "#7f8a8f",
    fontSize: "10px",
    letterSpacing: "1.2px",
  },


  secondaryButton: {
    width: "100%",
    height: "44px",
    marginTop: "16px",
    border: "1px solid #3b4448",
    background: "#111517",
    color: "#dce2e4",
    fontSize: "12px",
    letterSpacing: "1.1px",
    fontWeight: "600",
    cursor: "pointer",
  },


  infoCard: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1fr",
    gap: "25px",
    marginTop: "10px",
    padding: "21px 24px",
    background: "#0c0f10",
    border: "1px solid #252b2e",
  },


  infoLabel: {
    margin: "0 0 7px",
    color: "#7f8a8f",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.6px",
  },


  infoValue: {
    margin: "0",
    color: "#d0d7d9",
    fontSize: "12px",
    wordBreak: "break-all" as const,
  },


  // ==========================================================================
  // AI Styles
  // ==========================================================================

  aiCard: {
    marginTop: "10px",
    padding: "24px",
    background: "#0c0f10",
    border: "1px solid #252b2e",
  },


  aiHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },


  aiLabel: {
    marginBottom: "7px",
    color: "#aeb7ba",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
  },


  aiButton: {
    height: "44px",
    padding: "0 18px",
    border: "1px solid #dce2e4",
    background: "#e8ecee",
    color: "#101416",
    fontSize: "10px",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },


  aiButtonDisabled: {
    height: "44px",
    padding: "0 18px",
    border: "1px solid #3b4448",
    background: "#15191b",
    color: "#7f8a8f",
    fontSize: "10px",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "not-allowed",
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },


  aiSummary: {
    padding: "20px",
    background: "#101416",
    border: "1px solid #20272a",
  },


  aiSummaryLabel: {
    marginBottom: "12px",
    color: "#7f8a8f",
    fontSize: "9px",
    fontWeight: "700",
    letterSpacing: "1.6px",
  },


  aiSummaryText: {
    color: "#cbd2d4",
    fontSize: "13px",
    lineHeight: 1.75,
    overflowWrap: "break-word" as const,
  },


  markdownH1: {
    margin: "0 0 14px",
    color: "#eef2f3",
    fontSize: "21px",
    lineHeight: 1.35,
    fontWeight: "600",
  },


  markdownH2: {
    margin: "24px 0 10px",
    color: "#eef2f3",
    fontSize: "17px",
    lineHeight: 1.4,
    fontWeight: "600",
  },


  markdownH3: {
    margin: "18px 0 8px",
    color: "#dfe5e7",
    fontSize: "15px",
    lineHeight: 1.4,
    fontWeight: "600",
  },


  markdownParagraph: {
    margin: "0 0 12px",
    color: "#cbd2d4",
    fontSize: "13px",
    lineHeight: 1.75,
  },


  markdownList: {
    margin: "8px 0 16px",
    paddingLeft: "22px",
    color: "#cbd2d4",
  },


  markdownListItem: {
    marginBottom: "7px",
    fontSize: "13px",
    lineHeight: 1.7,
  },


  markdownStrong: {
    color: "#eef2f3",
    fontWeight: "600",
  },


  markdownCode: {
    padding: "2px 5px",
    background: "#181d1f",
    border: "1px solid #2b3235",
    color: "#d8dfe1",
    fontFamily: "monospace",
    fontSize: "12px",
  },


  markdownHr: {
    border: "none",
    borderTop: "1px solid #252b2e",
    margin: "22px 0",
  },


  markdownTableWrapper: {
    width: "100%",
    overflowX: "auto" as const,
    margin: "14px 0 20px",
  },


  markdownTable: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "12px",
  },


  markdownTh: {
    padding: "9px 10px",
    textAlign: "left" as const,
    background: "#15191b",
    border: "1px solid #2a3033",
    color: "#e1e6e8",
    fontWeight: "600",
  },


  markdownTd: {
    padding: "9px 10px",
    border: "1px solid #252b2e",
    color: "#bfc8cb",
    verticalAlign: "top" as const,
  },


  aiEmpty: {
    padding: "18px 20px",
    background: "#101416",
    border: "1px solid #20272a",
    color: "#7f8f90",
    fontSize: "12px",
    lineHeight: 1.6,
  },


  aiError: {
    marginBottom: "14px",
    padding: "13px 15px",
    border: "1px solid #60474c",
    background: "#151112",
    color: "#c6aeb3",
    fontSize: "12px",
    lineHeight: 1.5,
  },


  // ==========================================================================
  // Loading / Error Styles
  // ==========================================================================

  centerState: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#080a0b",
    color: "#eef2f3",
    textAlign: "center" as const,
    padding: "30px",
  },


  spinner: {
    width: "30px",
    height: "30px",
    border: "1px solid #555e62",
    marginBottom: "20px",
  },


  errorIcon: {
    width: "44px",
    height: "44px",
    border: "1px solid #60474c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b8989d",
    marginBottom: "15px",
  },


  stateTitle: {
    margin: "0 0 8px",
    color: "#eef2f3",
    fontSize: "23px",
    fontWeight: "500",
  },


  stateText: {
    margin: "0 0 20px",
    color: "#8b969b",
    fontSize: "13px",
  },


  primaryButton: {
    height: "44px",
    padding: "0 18px",
    border: "1px solid #dce2e4",
    background: "#e8ecee",
    color: "#101416",
    fontSize: "9px",
    letterSpacing: "1px",
    fontWeight: "700",
    cursor: "pointer",
  },

};


export default ProjectDetails;