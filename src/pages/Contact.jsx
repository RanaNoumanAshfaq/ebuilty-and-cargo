function Contact() {
  return (
    <div style={{ padding: "120px 50px" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "50px",
          fontSize: "50px",
        }}
      >
        Contact Admin
      </h1>

      <form
        style={{
          maxWidth: "700px",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Your Name"
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Destination"
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Budget"
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Number of People"
          style={inputStyle}
        />

        <textarea
          placeholder="Explain Your Travel Plan"
          rows="5"
          style={inputStyle}
        />

        <button
          style={{
            padding: "16px",
            border: "none",
            borderRadius: "10px",
            background: "#22c55e",
            color: "white",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          Send Inquiry
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "16px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

export default Contact;