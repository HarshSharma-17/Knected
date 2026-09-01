import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Knected</div>

        <div style={styles.navLinks}>
          <button style={styles.navButton}>Dashboard</button>

          <button
            style={styles.navButton}
            onClick={() => navigate("/graph")}
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

      {/* Main Content */}
      <main style={styles.container}>

        {/* Welcome Section */}
        <section style={styles.welcome}>
          <div>
            <p style={styles.smallText}>WELCOME BACK 👋</p>

            <h1 style={styles.heading}>
              Understand your code.
              <br />
              <span style={styles.highlight}>Visually.</span>
            </h1>

            <p style={styles.description}>
              Analyze your projects and explore their dependencies
              through an interactive visual graph.
            </p>
          </div>
        </section>

        {/* Analysis Options */}
        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            Analyze a Project
          </h2>

          <div style={styles.cards}>

            {/* GitHub Card */}
            <div style={styles.card}>

              <div style={styles.iconBox}>
                🔗
              </div>

              <h3 style={styles.cardTitle}>
                GitHub Repository
              </h3>

              <p style={styles.cardText}>
                Enter a GitHub repository URL and let Knected
                analyze its code dependencies automatically.
              </p>

              <button
                style={styles.primaryButton}
                onClick={() =>
                  alert("GitHub analysis UI coming next!")
                }
              >
                Analyze GitHub →
              </button>

            </div>

            {/* ZIP Card */}
            <div style={styles.card}>

              <div style={styles.iconBox}>
                📦
              </div>

              <h3 style={styles.cardTitle}>
                Upload ZIP
              </h3>

              <p style={styles.cardText}>
                Upload your project as a ZIP file and visualize
                how the files are connected.
              </p>

              <button
                style={styles.secondaryButton}
                onClick={() =>
                  alert("ZIP upload UI coming next!")
                }
              >
                Upload Project →
              </button>

            </div>

          </div>

        </section>

        {/* Statistics */}
        <section style={styles.section}>

          <h2 style={styles.sectionTitle}>
            Your Activity
          </h2>

          <div style={styles.stats}>

            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>
                Projects Analyzed
              </span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>
                GitHub Projects
              </span>
            </div>

            <div style={styles.statCard}>
              <span style={styles.statNumber}>0</span>
              <span style={styles.statLabel}>
                ZIP Projects
              </span>
            </div>

          </div>

        </section>

        {/* Recent Projects */}
        <section style={styles.section}>

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              Recent Projects
            </h2>

            <button
              style={styles.viewButton}
              onClick={() => navigate("/project-details")}
            >
              View All
            </button>
          </div>

          <div style={styles.emptyState}>

            <div style={styles.emptyIcon}>
              📂
            </div>

            <h3 style={styles.emptyTitle}>
              No projects yet
            </h3>

            <p style={styles.emptyText}>
              Analyze your first GitHub repository or upload
              a ZIP project to see it here.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

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
  },

  container: {
    width: "86%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "55px 0",
  },

  welcome: {
    marginBottom: "50px",
  },

  smallText: {
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "12px",
  },

  heading: {
    fontSize: "48px",
    lineHeight: "1.15",
    margin: "0 0 18px",
  },

  highlight: {
    color: "#6366f1",
  },

  description: {
    maxWidth: "620px",
    fontSize: "17px",
    lineHeight: "1.6",
    color: "#6b7280",
  },

  section: {
    marginBottom: "45px",
  },

  sectionTitle: {
    fontSize: "23px",
    marginBottom: "20px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
  },

  iconBox: {
    fontSize: "30px",
    marginBottom: "18px",
  },

  cardTitle: {
    fontSize: "21px",
    marginBottom: "10px",
  },

  cardText: {
    color: "#6b7280",
    lineHeight: "1.6",
    minHeight: "75px",
  },

  primaryButton: {
    marginTop: "15px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "9px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  secondaryButton: {
    marginTop: "15px",
    padding: "12px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
    padding: "24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "7px",
  },

  statNumber: {
    fontSize: "30px",
    fontWeight: "700",
  },

  statLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "600",
  },

  emptyState: {
    background: "#ffffff",
    border: "1px dashed #d1d5db",
    borderRadius: "18px",
    padding: "55px 20px",
    textAlign: "center" as const,
  },

  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },

  emptyTitle: {
    fontSize: "19px",
    marginBottom: "8px",
  },

  emptyText: {
    color: "#6b7280",
    maxWidth: "450px",
    margin: "0 auto",
    lineHeight: "1.5",
  },
};

export default Dashboard;