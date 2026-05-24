function Hero() {
  return (
    <section
      style={{
        height: "100vh",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1974&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "75px",
          fontWeight: "800",
          marginBottom: "20px",
        }}
      >
        KHAN TOURISM & GUIDE
      </h1>

      <p
        style={{
          fontSize: "24px",
          maxWidth: "850px",
          lineHeight: "1.7",
        }}
      >
        Personalized Tourism, Luxury Travel,
        Airport Pickup & Guided Tours Across Pakistan
      </p>

      <button
        onClick={() =>
          window.open(
            "https://wa.me/923001234567?text=Hello I want travel guidance",
            "_blank"
          )
        }
        style={{
          marginTop: "35px",
          padding: "16px 40px",
          borderRadius: "50px",
          border: "none",
          background: "#22c55e",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Contact Admin
      </button>
    </section>
  );
}

export default Hero;