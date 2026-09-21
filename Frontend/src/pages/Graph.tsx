/**
 * ============================================================================
 * File: Graph.tsx
 * Path: Frontend/src/pages/Graph.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Displays the interactive dependency graph of a selected Knected project.
 *
 * Responsibilities:
 * - Fetch dependency graph data from the backend
 * - Convert backend nodes and edges into React Flow format
 * - Display an interactive dependency graph
 * - Provide zoom, fit-view and minimap controls
 * - Keep the graph visually consistent with the Knected application
 *
 * Backend API:
 * GET /api/projects/:id/graph
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";


// ============================================================================
// Types
// ============================================================================

interface BackendNode {
  id: string;
  name: string;
  type: string;
}

interface BackendEdge {
  source: string;
  target: string;
}

interface GraphResponse {
  success: boolean;
  message: string;
  data: {
    nodes: BackendNode[];
    edges: BackendEdge[];
  };
}


// ============================================================================
// Component
// ============================================================================

const Graph = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node>([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================================
  // Fetch graph from backend
  // ==========================================================================

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

        const result: GraphResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Failed to fetch dependency graph."
          );
        }

        // ====================================================================
        // Convert backend nodes into React Flow nodes
        // ====================================================================

        const graphNodes: Node[] =
          result.data.nodes.map((node, index) => {
            const column = index % 5;
            const row = Math.floor(index / 5);

            return {
              id: node.id,

              position: {
                x: column * 310 + 100,
                y: row * 145 + 80,
              },

              data: {
                label: (
                  <div style={styles.nodeContent}>

                    <div style={styles.nodeType}>
                      {node.type || "FILE"}
                    </div>

                    <div style={styles.nodeName}>
                      {node.name}
                    </div>

                  </div>
                ),
              },

              style: styles.graphNode,
            };
          });

        // ====================================================================
        // Convert backend edges into React Flow edges
        // ====================================================================

        const graphEdges: Edge[] =
          result.data.edges.map((edge, index) => ({
            id: `edge-${index}`,

            source: edge.source,
            target: edge.target,

            animated: false,

            style: {
              stroke: "#596267",
              strokeWidth: 1.4,
            },

            markerEnd: {
              type: "arrowclosed",
              color: "#8b969b",
            },
          }));

        setNodes(graphNodes);
        setEdges(graphEdges);

      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Failed to load dependency graph."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [id, navigate, setNodes, setEdges]);


  // ==========================================================================
  // Loading State
  // ==========================================================================

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerMessage}>

          <div style={styles.loader}></div>

          <h2 style={styles.loadingTitle}>
            Loading Dependency Graph
          </h2>

          <p style={styles.loadingText}>
            Knected is preparing your project graph...
          </p>

        </div>
      </div>
    );
  }


  // ==========================================================================
  // Error State
  // ==========================================================================

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.centerMessage}>

          <div style={styles.errorIcon}>
            !
          </div>

          <h2 style={styles.errorTitle}>
            Unable to Load Graph
          </h2>

          <p style={styles.errorText}>
            {error}
          </p>

          <button
            style={styles.backButton}
            onClick={() =>
              navigate(`/projects/${id}`)
            }
          >
            ← Back to Project
          </button>

        </div>
      </div>
    );
  }


  // ==========================================================================
  // Main Graph Page
  // ==========================================================================

  return (
    <div style={styles.page}>

      {/* ====================================================================
          React Flow control styling
      ==================================================================== */}

      <style>
        {`
          .react-flow__controls {
            border: 1px solid #343b3f;
            border-radius: 4px;
            overflow: hidden;
            background: #0d1012;
            box-shadow: 0 10px 30px rgba(0,0,0,.35);
          }

          .react-flow__controls-button {
            width: 42px;
            height: 42px;
            background: #0d1012;
            border: none;
            border-bottom: 1px solid #292f32;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .react-flow__controls-button:last-child {
            border-bottom: none;
          }

          .react-flow__controls-button svg {
            width: 18px;
            height: 18px;
            stroke: #b8c0c3;
            fill: none;
          }

          .react-flow__controls-button:hover {
            background: #171b1e;
          }

          .react-flow__minimap {
            background: #0c0f10 !important;
            border: 1px solid #343b3f !important;
            border-radius: 4px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,.35);
          }

          .react-flow__minimap-mask {
            fill: rgba(8,10,11,.58) !important;
          }

          .react-flow__minimap-node {
            stroke: #d0d7d9 !important;
            fill: #7d898e !important;
          }

          .react-flow__edge-path {
            stroke-linecap: round;
          }

          .react-flow__attribution {
            display: none;
          }
        `}
      </style>


      {/* ====================================================================
          Header
      ==================================================================== */}

      <header style={styles.header}>

        <div style={styles.headerLeft}>

          <button
            style={styles.backLink}
            onClick={() =>
              navigate(`/projects/${id}`)
            }
          >
            ← Project Details
          </button>

          <h1 style={styles.title}>
            Dependency Graph
          </h1>

          <p style={styles.subtitle}>
            Visual representation of your project's
            code dependencies.
          </p>

        </div>


        {/* ==================================================================
            Statistics
        ================================================================== */}

        <div style={styles.statsContainer}>

          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              ●
            </div>

            <div>
              <div style={styles.statNumber}>
                {nodes.length}
              </div>

              <div style={styles.statLabel}>
                NODES
              </div>
            </div>

          </div>


          <div style={styles.statCard}>

            <div style={styles.statIcon}>
              ↗
            </div>

            <div>
              <div style={styles.statNumber}>
                {edges.length}
              </div>

              <div style={styles.statLabel}>
                CONNECTIONS
              </div>
            </div>

          </div>

        </div>

      </header>


      {/* ====================================================================
          Graph Area
      ==================================================================== */}

      <main style={styles.graphWrapper}>

        {nodes.length === 0 ? (

          <div style={styles.emptyGraph}>

            <div style={styles.emptyIcon}>
              ◌
            </div>

            <h2 style={styles.emptyTitle}>
              No Dependencies Found
            </h2>

            <p style={styles.emptyText}>
              Knected could not find any supported
              dependency relationships in this project.
            </p>

          </div>

        ) : (

          <ReactFlow
            nodes={nodes}
            edges={edges}

            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}

            fitView

            fitViewOptions={{
              padding: 0.12,
              minZoom: 0.15,
              maxZoom: 1.15,
            }}

            minZoom={0.08}
            maxZoom={2.5}

            nodesDraggable={true}
            nodesConnectable={false}

            zoomOnScroll={true}
            zoomOnPinch={true}

            panOnDrag={true}

            attributionPosition="bottom-left"
          >

            {/* --------------------------------------------------------------
                Background Grid
            -------------------------------------------------------------- */}

            <Background
              gap={28}
              size={1}
              color="#252b2e"
            />


            {/* --------------------------------------------------------------
                Zoom Controls
            -------------------------------------------------------------- */}

            <Controls
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />


            {/* --------------------------------------------------------------
                Mini Map
            -------------------------------------------------------------- */}

            <MiniMap
              nodeStrokeWidth={1.5}
              nodeColor="#7d898e"
              nodeStrokeColor="#d0d7d9"
              nodeBorderRadius={2}
              zoomable={true}
              pannable={true}
              maskColor="rgba(8, 10, 11, 0.58)"
              style={{
                width: 230,
                height: 150,
                background: "#0c0f10",
                border: "1px solid #343b3f",
              }}
            />

          </ReactFlow>

        )}

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
  // Main Page
  // --------------------------------------------------------------------------

  page: {
    minHeight: "100vh",
    background: "#080a0b",
    color: "#eef2f3",
    padding: "30px 32px 32px",
    boxSizing: "border-box",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  // --------------------------------------------------------------------------
  // Header
  // --------------------------------------------------------------------------

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "20px",
  },

  headerLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  backLink: {
    border: "none",
    background: "transparent",
    color: "#aeb8bc",
    padding: 0,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "10px",
  },

  title: {
    margin: 0,
    color: "#eef2f3",
    fontSize: "34px",
    fontWeight: 700,
    letterSpacing: "-0.8px",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#8b969b",
    fontSize: "15px",
  },


  // --------------------------------------------------------------------------
  // Statistics
  // --------------------------------------------------------------------------

  statsContainer: {
    display: "flex",
    gap: "12px",
  },

  statCard: {
    minWidth: "125px",
    padding: "12px 16px",
    border: "1px solid #2b3235",
    borderRadius: "4px",
    background: "#0d1012",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    boxShadow:
      "0 3px 12px rgba(15, 23, 42, 0.04)",
  },

  statIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#15191b",
    color: "#c5cdd0",
    fontSize: "14px",
    fontWeight: 700,
  },

  statNumber: {
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: 1.1,
    color: "#eef2f3",
  },

  statLabel: {
    marginTop: "3px",
    fontSize: "10px",
    color: "#8f9a9f",
    fontWeight: 700,
    letterSpacing: "0.8px",
  },


  // --------------------------------------------------------------------------
  // Graph Wrapper
  // --------------------------------------------------------------------------

  graphWrapper: {
    width: "100%",
    height: "calc(100vh - 190px)",
    minHeight: "500px",

    border: "1px solid #2b3235",
    borderRadius: "4px",

    overflow: "hidden",

    background: "#0b0e0f",

    boxShadow:
      "0 8px 30px rgba(15, 23, 42, 0.06)",

    position: "relative",
  },


  // --------------------------------------------------------------------------
  // Graph Nodes
  // --------------------------------------------------------------------------

  graphNode: {
    width: 230,

    padding: "14px 16px",

    borderRadius: "3px",

    border: "1px solid #3c4549",

    background: "#111517",

    color: "#eef2f3",

    boxShadow:
      "0 5px 18px rgba(79, 70, 229, 0.10)",

    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  nodeContent: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  nodeType: {
    fontSize: "9px",
    fontWeight: 700,
    color: "#9ca7ab",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },

  nodeName: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#d7dddf",
    wordBreak: "break-word",
  },


  // --------------------------------------------------------------------------
  // Loading State
  // --------------------------------------------------------------------------

  centerMessage: {
    minHeight: "80vh",

    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
    alignItems: "center",

    textAlign: "center",
  },

  loader: {
    width: "34px",
    height: "34px",

    borderRadius: "50%",

    border: "3px solid #e0e7ff",
    borderTop: "3px solid #6366f1",

    marginBottom: "18px",

    animation:
      "spin 0.8s linear infinite",
  },

  loadingTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "20px",
  },

  loadingText: {
    marginTop: "8px",
    color: "#8b969b",
    fontSize: "15px",
  },


  // --------------------------------------------------------------------------
  // Error State
  // --------------------------------------------------------------------------

  errorIcon: {
    width: "46px",
    height: "46px",

    borderRadius: "50%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "#fee2e2",
    color: "#dc2626",

    fontSize: "22px",
    fontWeight: 700,

    marginBottom: "15px",
  },

  errorTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "20px",
  },

  errorText: {
    maxWidth: "500px",
    marginTop: "8px",
    color: "#dc2626",
    fontSize: "14px",
  },

  backButton: {
    marginTop: "15px",

    padding: "11px 18px",

    border: "none",
    borderRadius: "9px",

    background: "#4f46e5",
    color: "#ffffff",

    cursor: "pointer",

    fontWeight: 600,
    fontSize: "13px",
  },


  // --------------------------------------------------------------------------
  // Empty Graph
  // --------------------------------------------------------------------------

  emptyGraph: {
    height: "100%",

    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
    alignItems: "center",

    textAlign: "center",

    padding: "30px",
  },

  emptyIcon: {
    fontSize: "50px",
    color: "#6366f1",
    marginBottom: "10px",
  },

  emptyTitle: {
    margin: 0,
    color: "#1e293b",
    fontSize: "20px",
  },

  emptyText: {
    maxWidth: "450px",
    marginTop: "8px",
    color: "#8b969b",
    fontSize: "15px",
    lineHeight: 1.6,
  },
};


// ============================================================================
export default Graph;