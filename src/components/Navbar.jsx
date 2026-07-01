import { NavLink } from "react-router-dom";

function Navbar() {
  const baseStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "0.3s",
  };

  const activeStyle = {
    background: "rgba(56, 189, 248, 0.2)",
    color: "#38bdf8",
    fontWeight: "bold",
  };

  return (
    <nav
      style={{
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(10px)",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h2 style={{ margin: 0, color: "white" }}>KHAN TOURISM</h2>

      <div style={{ display: "flex", gap: "15px" }}>
        {["/", "/cars", "/tours", "/contact"].map((path, i) => {
          const labels = ["Home", "Cars", "Tours", "Contact"];
          return (
            <NavLink
              key={i}
              to={path}
              style={({ isActive }) =>
                isActive
                  ? { ...baseStyle, ...activeStyle }
                  : baseStyle
              }
            >
              {labels[i]}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}