/**
 * ============================================================================
 * File: Profile.tsx
 * Path: Frontend/src/pages/Profile.tsx
 * ----------------------------------------------------------------------------
 * Purpose:
 * Displays the authenticated user's profile information and usage.
 *
 * Responsibilities:
 * - Fetch logged-in user information
 * - Fetch user's project count
 * - Handle loading and API errors
 * - Handle expired authentication
 * - Provide logout functionality
 * ============================================================================
 */

import {
  User,
  Mail,
  FolderOpen,
  GitBranch,
  Archive,
  LogOut,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


interface UserProfile {
  name: string;
  email: string;
  created_at?: string;
}

interface Project {
  _id: string;
  sourceType: "github" | "zip";
  originalName?: string;
  githubRepo?: string;
  createdAt?: string;
}

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile>({
    name: "",
    email: "",
    created_at: "",
  });

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalGenerations: 0,
    githubProjects: 0,
    zipProjects: 0,
  });

  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    let cancelled = false;
  
    const load = async () => {
      try {
        setLoading(true);
        setError("");
  
        const token = localStorage.getItem("token");
  
        if (!token) {
          navigate("/login");
          return;
        }
  
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
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
  
        if (!response.ok) {
          throw new Error("Failed to load profile.");
        }
  
        const result = await response.json();
  
        if (cancelled) return;
  
        const profileData = result.user || result.data || result;

        setUser({
          name: profileData.name || "",
          email: profileData.email || "",
          created_at:
            profileData.created_at ||
            profileData.createdAt ||
            "",
        });
  
        // Fetch projects for profile statistics
        const projectsResponse = await fetch(
          "http://localhost:5000/api/projects",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (projectsResponse.ok) {
          const projectsResult = await projectsResponse.json();
  
          if (!cancelled) {
            const projects = projectsResult.data || [];
  
            const githubProjects = projects.filter(
              (project: Project) => project.sourceType === "github"
            ).length;

            const zipProjects = projects.filter(
              (project: Project) => project.sourceType === "zip"
            ).length;

            setStats({
              totalProjects: projects.length,
              totalGenerations: 0,
              githubProjects,
              zipProjects,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
  
    load();
  
    return () => {
      cancelled = true;
    };
  }, [navigate, reloadKey]);

  // ================================================================
  // Loading State
  // ================================================================

  if (loading) {
    return (
      <div className="profile-container">
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            style={{
              width: "38px",
              height: "38px",
              border: "1px solid #3a4245",
              borderRadius: "0",
              background: "#15191b",
            }}
          />

          <p style={{ color: "#64748b" }}>
            Loading your profile...
          </p>
        </div>


      </div>
    );
  }

  // ================================================================
  // Error State
  // ================================================================

  if (error) {
    return (
      <div className="profile-container">
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "15px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "42px",
            }}
          >
            ⚠️
          </div>

          <h2 style={{ margin: 0 }}>
            Unable to load profile
          </h2>

          <p
            style={{
              color: "#64748b",
              maxWidth: "450px",
              margin: 0,
            }}
          >
            {error}
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "10px",
            }}
          >
            <button
              className="primary-btn"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try Again
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("")
    : "U";

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";



  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080a0b",
        color: "#eef2f3",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Static HUD grid */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.55,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "min(1180px, calc(100% - 48px))",
          margin: "0 auto",
          padding: "34px 0 48px",
        }}
      >
        {/* Top navigation */}
        <header
          style={{
            height: "58px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #242a2d",
            marginBottom: "48px",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              color: "#9ba5a9",
              fontSize: "13px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#e8edef",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#d9e0e2",
                display: "inline-block",
              }}
            />
            KNECTED
          </div>
        </header>

        {/* Hero */}
        <section style={{ marginBottom: "32px" }}>
          <div
            style={{
              color: "#8e999d",
              fontSize: "10px",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            [ USER // PROFILE ]
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "28px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#f1f4f5",
                  fontSize: "clamp(38px, 5vw, 58px)",
                  lineHeight: 0.98,
                  fontWeight: 600,
                  letterSpacing: "-2.8px",
                }}
              >
                Your workspace.
              </h1>

              <p
                style={{
                  margin: "18px 0 0",
                  maxWidth: "650px",
                  color: "#8d989c",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                Manage your Knected account and keep track of the repositories
                you have analyzed.
              </p>
            </div>

            <div
              style={{
                border: "1px solid #30373a",
                background: "#0d1012",
                padding: "12px 15px",
                minWidth: "145px",
              }}
            >
              <div
                style={{
                  color: "#697478",
                  fontSize: "9px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Account
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#cbd2d5",
                  fontSize: "12px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#aeb8bc",
                  }}
                />
                Active
              </div>
            </div>
          </div>
        </section>

        {/* Profile + account information */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "330px 1fr",
            gap: "18px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              border: "1px solid #30373a",
              background: "#0c0f10",
              padding: "30px",
              minHeight: "310px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: "82px",
                  height: "82px",
                  border: "1px solid #596367",
                  background: "#161b1d",
                  display: "grid",
                  placeItems: "center",
                  color: "#eef2f3",
                  fontSize: "25px",
                  fontWeight: 600,
                  letterSpacing: "-1px",
                  marginBottom: "24px",
                }}
              >
                {initials}
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#edf1f2",
                  fontSize: "25px",
                  fontWeight: 600,
                  letterSpacing: "-0.8px",
                }}
              >
                {user.name || "User"}
              </h2>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#879296",
                  fontSize: "13px",
                  wordBreak: "break-word",
                }}
              >
                {user.email || "No email available"}
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: "26px",
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                background: "#e8edef",
                border: "1px solid #e8edef",
                color: "#0a0c0d",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.1px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              View my projects
              <ExternalLink size={15} />
            </button>
          </div>

          <div
            style={{
              border: "1px solid #30373a",
              background: "#0c0f10",
              padding: "30px 32px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "20px",
                borderBottom: "1px solid #242a2d",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#687377",
                    fontSize: "9px",
                    letterSpacing: "2.2px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Identity
                </div>
                <h3
                  style={{
                    margin: 0,
                    color: "#edf1f2",
                    fontSize: "22px",
                    fontWeight: 600,
                  }}
                >
                  Account information
                </h3>
              </div>

              <User size={21} color="#9da8ac" />
            </div>

            <div>
              {[
                {
                  label: "Name",
                  value: user.name || "-",
                  icon: <User size={18} />,
                },
                {
                  label: "Email",
                  value: user.email || "-",
                  icon: <Mail size={18} />,
                },
                {
                  label: "Joined on",
                  value: joinedDate,
                  icon: <FolderOpen size={18} />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    minHeight: "74px",
                    display: "grid",
                    gridTemplateColumns: "40px 1fr",
                    alignItems: "center",
                    gap: "14px",
                    borderBottom: "1px solid #202629",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid #30383b",
                      background: "#111517",
                      color: "#aab4b8",
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#687377",
                        fontSize: "9px",
                        letterSpacing: "1.8px",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        color: "#dfe4e5",
                        fontSize: "14px",
                        fontWeight: 600,
                        wordBreak: "break-word",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Usage */}
        <section
          style={{
            border: "1px solid #30373a",
            background: "#0c0f10",
            padding: "28px 30px 30px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "20px",
              marginBottom: "22px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#687377",
                  fontSize: "9px",
                  letterSpacing: "2.2px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Workspace // Metrics
              </div>
              <h3
                style={{
                  margin: 0,
                  color: "#edf1f2",
                  fontSize: "22px",
                  fontWeight: 600,
                }}
              >
                Usage overview
              </h3>
            </div>

            <div
              style={{
                color: "#6f7b7f",
                fontSize: "11px",
                letterSpacing: "1px",
              }}
            >
              LIVE ACCOUNT DATA
            </div>
          </div>

          <div
            className="profile-responsive-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {[
              {
                label: "Projects",
                value: stats.totalProjects,
                icon: <FolderOpen size={21} />,
              },
              {
                label: "GitHub Projects",
                value: stats.githubProjects,
                icon: <GitBranch size={21} />,
              },
              {
                label: "ZIP Projects",
                value: stats.zipProjects,
                icon: <Archive size={21} />,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  minHeight: "145px",
                  border: "1px solid #2c3437",
                  background: "#101416",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ color: "#9da8ac" }}>{item.icon}</div>

                <div>
                  <div
                    style={{
                      color: "#edf1f2",
                      fontSize: "34px",
                      lineHeight: 1,
                      fontWeight: 600,
                      letterSpacing: "-1.5px",
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      color: "#7d888c",
                      fontSize: "11px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section
          style={{
            border: "1px solid #4a3030",
            background: "#100c0d",
            padding: "24px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                color: "#a17b7b",
                fontSize: "9px",
                letterSpacing: "2.2px",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Danger zone
            </div>
            <h3
              style={{
                margin: 0,
                color: "#e2caca",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Sign out of Knected
            </h3>
            <p
              style={{
                margin: "7px 0 0",
                color: "#856f72",
                fontSize: "12px",
              }}
            >
              Your analyzed projects remain safely stored in your workspace.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              minHeight: "42px",
              padding: "0 20px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              border: "1px solid #684242",
              background: "#241517",
              color: "#e0baba",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </section>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .profile-responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;