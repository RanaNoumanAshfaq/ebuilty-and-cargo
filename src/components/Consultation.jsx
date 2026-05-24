function Consultation() {
  return (
    <section
      style={{
        padding: "100px 60px",
        background: "#f8fafc",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "45px",
          marginBottom: "60px",
        }}
      >
        How Our System Works
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>1. Contact Admin</h3>
          <p>
            User first contacts admin and explains travel needs.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>2. Travel Guidance</h3>
          <p>
            Admin suggests best travel plan according to budget.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>3. Car Recommendation</h3>
          <p>
            Economy, luxury and family cars suggested according to needs.
          </p>
        </div>

        <div style={cardStyle}>
          <h3>4. Booking Confirmation</h3>
          <p>
            Driver, guide and pickup plan finalized after approval.
          </p>
        </div>
      </div>
    </section>
  );
}

const cardStyle = {
  background: "white",
  padding: "35px",
  borderRadius: "20px",
  boxShadow: "0px 10px 30px rgba(0,0,0,0.08)",
};

export default Consultation;