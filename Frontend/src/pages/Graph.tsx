/**
 * ============================================================================
 * File: Graph.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Displays an interactive dependency graph for a Knected project.
 *
 * Responsibilities:
 * - Fetch graph data from the backend
 * - Convert backend graph data into React Flow format
 * - Display source files as interactive nodes
 * - Display dependencies as connected edges
 * - Support zooming, panning and dragging
 * - Navigate back to project details
 * ============================================================================
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

/* ============================================================================
   TYPES
============================================================================ */

interface BackendNode {
  id: string;
  name: string;
  type: string;
}

interface BackendEdge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: BackendNode[];
  edges: BackendEdge[];
}

/* ============================================================================
   COMPONENT
============================================================================ */

const Graph = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [graph, setGraph] = useState<GraphData>({
    nodes: [],
    edges: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================================
     FETCH GRAPH DATA
  ========================================================================== */

  useEffect(() => {
    const fetchGraph = async () => {
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
          `http://localhost:5000/api/projects/${id}/graph`,
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
            result.message || "Failed to fetch dependency graph."
          );
        }

        setGraph({
          nodes: result.data?.nodes || [],
          edges: result.data?.edges || [],
        });
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong while loading the graph.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [id, navigate]);

  /* ==========================================================================
     CONVERT BACKEND NODES → REACT FLOW NODES
  ========================================================================== */

  const flowNodes: Node[] = useMemo(() => {
    const totalNodes = graph.nodes.length;

    return graph.nodes.map((node, index) => {
      /*
       * Arrange nodes in a circular layout initially.
       * Users can drag them afterwards.
       */
      const angle =
        (index / Math.max(totalNodes, 1)) * Math.PI * 2;

      const radius = Math.max(
        180,
        Math.min(320, totalNodes * 45)
      );

      return {
        id: node.id,

        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },

        data: {
          label: (
            <div style={styles.nodeContent}>
              <div style={styles.nodeType}>
                {getNodeType(node.type)}
              </div>

              <div style={styles.nodeName}>
                {getFileName(node.name || node.id)}
              </div>

              <div style={styles.nodePath}>
                {node.name || node.id}
              </div>
            </div>
          ),
        },

        style: styles.node,
      };
    });
  }, [graph.nodes]);

  /* ==========================================================================
     CONVERT BACKEND EDGES → REACT FLOW EDGES
  ========================================================================== */

  const flowEdges: Edge[] = useMemo(() => {
    return graph.edges.map((edge, index) => ({
      id: `edge-${index}`,

      source: edge.source,
      target: edge.target,

      animated: true,

      markerEnd: {
        type: MarkerType.ArrowClosed,
      },

      style: {
        strokeWidth: 1.5,
      },
    }));
  }, [graph.edges]);

  /* ==========================================================================
     LOADING STATE
  ========================================================================== */

  if (loading) {
    return (
      <div style={styles.centerState}>
        <div style={styles.spinner}></div>

        <h2 style={styles.stateTitle}>
          Building dependency graph...
        </h2>

        <p style={styles.stateText}>
          Knected is preparing your project's connections.
        </p>
      </div>
    );
  }

  /* ==========================================================================
     ERROR STATE
  ========================================================================== */

  if (error) {
    return (
      <div style={styles.centerState}>
        <div style={styles.errorIcon}>!</div>

        <h2 style={styles.stateTitle}>
          Unable to load graph
        </h2>

        <p style={styles.stateText}>
          {error}
        </p>

        <button
          style={styles.primaryButton}
          onClick={() => navigate(`/projects/${id}`)}
        >
          ← Back to Project
        </button>
      </div>
    );
  }

  /* ==========================================================================
     MAIN UI
  ========================================================================== */

  return (
    <div style={styles.page}>

      {/* ================================================================
          NAVBAR
      ================================================================ */}

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
            style={styles.navButtonActive}
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


      {/* ================================================================
          GRAPH HEADER
      ================================================================ */}

      <header style={styles.header}>

        <div>

          <button
            style={styles.backButton}
            onClick={() =>
              navigate(`/projects/${id}`)
            }
          >
            ← Project Details
          </button>

          <div style={styles.eyebrow}>
            DEPENDENCY VISUALIZATION
          </div>

          <h1 style={styles.heading}>
            Explore your code connections.
          </h1>

          <p style={styles.description}>
            Drag nodes, zoom in and explore how your
            source files depend on each other.
          </p>

        </div>


        {/* GRAPH STATS */}

        <div style={styles.stats}>

          <div style={styles.stat}>

            <span style={styles.statNumber}>
              {graph.nodes.length}
            </span>

            <span style={styles.statLabel}>
              Nodes
            </span>

          </div>


          <div style={styles.stat}>

            <span style={styles.statNumber}>
              {graph.edges.length}
            </span>

            <span style={styles.statLabel}>
              Connections
            </span>

          </div>

        </div>

      </header>


      {/* ================================================================
          GRAPH AREA
      ================================================================ */}

      <main style={styles.graphContainer}>

        {graph.nodes.length === 0 ? (

          /* EMPTY GRAPH */

          <div style={styles.emptyGraph}>

            <div style={styles.emptyIcon}>
              ◌
            </div>

            <h2 style={styles.emptyTitle}>
              No dependencies found
            </h2>

            <p style={styles.emptyText}>
              Knected could not find any dependency
              relationships in this project.
            </p>

            <button
              style={styles.primaryButton}
              onClick={() =>
                navigate(`/projects/${id}`)
              }
            >
              ← Back to Project
            </button>

          </div>

        ) : (

          /* ==============================================================
             REACT FLOW
          ============================================================== */

          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            fitView

            fitViewOptions={{
              padding: 0.25,
            }}

            minZoom={0.2}
            maxZoom={2}

            style={{
              width: "100%",
              height: "100%",
            }}
          >

            <Background
              gap={24}
              size={1}
            />

            <Controls />

            <MiniMap
              pannable
              zoomable
              nodeStrokeWidth={3}
            />

          </ReactFlow>

        )}


        {/* ==============================================================
            GRAPH HELP
        ============================================================== */}

        {graph.nodes.length > 0 && (

          <div style={styles.graphInfo}>

            <span style={styles.liveDot}></span>

            Dependency graph

            <span style={styles.separator}>
              •
            </span>

            Drag to move

            <span style={styles.separator}>
              •
            </span>

            Scroll to zoom

          </div>

        )}

      </main>

    </div>
  );
};


/* ============================================================================
   HELPERS
============================================================================ */

/*
 * Extract only the filename from an absolute path.
 *
 * Example:
 * /home/harsh/project/src/index.js
 *
 * becomes:
 * index.js
 */
const getFileName = (path: string) => {
  const parts = path.split(/[\\/]/);

  return parts[parts.length - 1] || path;
};


/*
 * Format node type for display.
 */
const getNodeType = (type: string) => {
  if (!type) {
    return "FILE";
  }

  return type
    .toUpperCase()
    .slice(0, 8);
};


/* ============================================================================
   STYLES
============================================================================ */

const styles = {

  /* ================================================================
     PAGE
  ================================================================ */

  page: {
    minHeight: "100vh",

    background: "#f7f8fc",

    color: "#111827",

    fontFamily: "Arial, sans-serif",

    display: "flex",

    flexDirection: "column" as const,
  },


  /* ================================================================
     NAVBAR
  ================================================================ */

  navbar: {
    height: "70px",

    padding: "0 7%",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    background: "#ffffff",

    borderBottom: "1px solid #e5e7eb",

    flexShrink: 0,
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

  navButtonActive: {
    border: "none",

    background: "#eef2ff",

    padding: "10px 16px",

    borderRadius: "8px",

    fontSize: "15px",

    cursor: "pointer",

    color: "#4f46e5",

    fontWeight: "600",
  },


  /* ================================================================
     HEADER
  ================================================================ */

  header: {
    minHeight: "145px",

    padding: "25px 7%",

    background: "#ffffff",

    borderBottom: "1px solid #e5e7eb",

    display: "flex",

    alignItems: "center",

    justifyContent: "space-between",

    gap: "30px",

    flexShrink: 0,
  },

  backButton: {
    border: "none",

    background: "transparent",

    padding: "0",

    marginBottom: "12px",

    color: "#64748b",

    fontSize: "13px",

    cursor: "pointer",
  },

  eyebrow: {
    color: "#4f46e5",

    fontSize: "10px",

    fontWeight: "700",

    letterSpacing: "1.8px",

    marginBottom: "7px",
  },

  heading: {
    margin: "0 0 7px",

    fontSize: "28px",

    letterSpacing: "-0.7px",
  },

  description: {
    margin: "0",

    color: "#64748b",

    fontSize: "13px",
  },


  /* ================================================================
     STATS
  ================================================================ */

  stats: {
    display: "flex",

    gap: "12px",
  },

  stat: {
    minWidth: "90px",

    padding: "15px 18px",

    background: "#f8fafc",

    border: "1px solid #e5e7eb",

    borderRadius: "12px",

    textAlign: "center" as const,
  },

  statNumber: {
    display: "block",

    fontSize: "22px",

    fontWeight: "700",

    marginBottom: "4px",
  },

  statLabel: {
    color: "#94a3b8",

    fontSize: "10px",

    textTransform: "uppercase" as const,

    letterSpacing: "1px",
  },


  /* ================================================================
     GRAPH CONTAINER
  ================================================================ */

  graphContainer: {
    position: "relative" as const,

    width: "100%",

    /*
     * IMPORTANT:
     * React Flow needs a definite height.
     */
    height: "calc(100vh - 215px)",

    minHeight: "600px",

    background: "#ffffff",

    overflow: "hidden",
  },


  /* ================================================================
     GRAPH INFORMATION
  ================================================================ */

  graphInfo: {
    position: "absolute" as const,

    bottom: "18px",

    left: "50%",

    transform: "translateX(-50%)",

    zIndex: 10,

    padding: "9px 15px",

    background: "rgba(255,255,255,0.94)",

    border: "1px solid #e5e7eb",

    borderRadius: "20px",

    color: "#64748b",

    fontSize: "10px",

    boxShadow:
      "0 4px 15px rgba(15,23,42,0.06)",

    whiteSpace: "nowrap" as const,
  },

  liveDot: {
    display: "inline-block",

    width: "6px",

    height: "6px",

    borderRadius: "50%",

    background: "#4f46e5",

    marginRight: "7px",
  },

  separator: {
    margin: "0 8px",

    color: "#cbd5e1",
  },


  /* ================================================================
     GRAPH NODES
  ================================================================ */

  node: {
    minWidth: "170px",

    padding: "0",

    borderRadius: "12px",

    border: "1px solid #dbe4ff",

    background: "#ffffff",

    boxShadow:
      "0 8px 25px rgba(79,70,229,0.10)",
  },

  nodeContent: {
    padding: "11px 13px",
  },

  nodeType: {
    color: "#4f46e5",

    fontSize: "8px",

    fontWeight: "700",

    letterSpacing: "1px",

    marginBottom: "5px",
  },

  nodeName: {
    color: "#111827",

    fontSize: "12px",

    fontWeight: "700",

    marginBottom: "4px",
  },

  nodePath: {
    color: "#94a3b8",

    fontSize: "8px",

    maxWidth: "145px",

    overflow: "hidden",

    textOverflow: "ellipsis",

    whiteSpace: "nowrap" as const,
  },


  /* ================================================================
     LOADING / ERROR
  ================================================================ */

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

    animation:
      "spin 0.8s linear infinite",

    marginBottom: "20px",
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


  /* ================================================================
     BUTTON
  ================================================================ */

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


  /* ================================================================
     EMPTY GRAPH
  ================================================================ */

  emptyGraph: {
    position: "absolute" as const,

    inset: "0",

    display: "flex",

    flexDirection: "column" as const,

    alignItems: "center",

    justifyContent: "center",

    textAlign: "center" as const,

    padding: "30px",
  },

  emptyIcon: {
    fontSize: "45px",

    color: "#4f46e5",

    marginBottom: "10px",
  },

  emptyTitle: {
    margin: "0 0 8px",

    fontSize: "20px",
  },

  emptyText: {
    maxWidth: "400px",

    margin: "0 0 20px",

    color: "#64748b",

    fontSize: "13px",

    lineHeight: "1.6",
  },
};

export default Graph;