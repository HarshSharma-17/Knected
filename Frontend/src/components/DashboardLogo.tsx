

const DashboardLogo = () => {
  return (
    <>
      <div className="dashboard-logo">
        <img
          src="/knected-k-logo.png"
          alt="Knected"
        />
      </div>

      <style>{`
        .dashboard-logo {
          position: absolute;
          top: 12px;
          left: 28px;
          z-index: 50;

          width: 64px;
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: center;

          pointer-events: none;
        }

        .dashboard-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        @media (max-width: 760px) {
          .dashboard-logo {
            top: 10px;
            left: 16px;
            width: 52px;
            height: 52px;
          }
        }
      `}</style>
    </>
  );
};

export default DashboardLogo;