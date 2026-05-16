import streamlit as st
from hybrid_engine import hybrid_response

st.title("🔥 Hybrid CS Career AI System")

user_input = st.text_input("Enter your skills / interest")

if st.button("Predict Career"):

    result = hybrid_response(user_input)

    st.subheader("🧠 AI Predictions")

    st.success(f"💼 Job: {result['job']}")
    st.success(f"💰 Salary: {result['salary']}")
    st.info(f"🎓 Course: {result['course_ml']}")

    st.subheader("📚 Rule System Output")
    st.write(result["rule_output"]["message"])