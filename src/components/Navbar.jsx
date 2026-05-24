import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        background: "#0f172a",
        color: "white",
        padding: "18px 25px",
        position: "fixed",
        width: "100%",
        top: "0",
        zIndex: "1000",
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "26px",
            fontWeight: "bold",
          }}
        >
          KHAN TOURISM & GUIDE
        </h2>

        {/* Mobile Icon */}
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            fontSize: "26px",
            cursor: "pointer",
          }}
        >
          <FaBars />
        </div>
      </div>

      {/* Menu */}
      {menuOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "20px",
          }}
        >
          <Link to="/" style={linkStyle}>
            Home
          </Link>

          <Link to="/cars" style={linkStyle}>
            Cars
          </Link>

          <Link to="/tours" style={linkStyle}>
            Tours
          </Link>

          <Link to="/airport" style={linkStyle}>
            Airport Pickup
          </Link>

          <Link to="/contact" style={linkStyle}>
            Contact
          </Link>

          <Link to="/admin" style={linkStyle}>
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "18px",
};

export default Navbar;