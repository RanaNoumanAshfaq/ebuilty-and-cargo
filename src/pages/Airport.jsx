function Airport() {
  return (
    <div
      style={{
        padding: "120px 50px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "55px" }}>
        Airport Pickup Service
      </h1>

      <p
        style={{
          marginTop: "25px",
          fontSize: "22px",
          maxWidth: "800px",
          marginInline: "auto",
        }}
      >
        International and local travelers can pre-book
        airport pickup with professional drivers waiting
        on arrival.
      </p>

      <button
        style={{
          marginTop: "40px",
          padding: "16px 40px",
          borderRadius: "50px",
          border: "none",
          background: "#22c55e",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Contact For Pickup
      </button>
    </div>
  );
}

export default Airport;