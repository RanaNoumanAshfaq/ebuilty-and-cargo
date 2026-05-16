from semantic_engine import predict_job, predict_salary, recommend_course

def rule_engine(user_input):
    return {
        "message": f"You entered: {user_input}",
        "courses": {},
        "careers": {}
    }

def hybrid_response(user_input):

    # 🧠 SEMANTIC AI
    job = predict_job(user_input)
    salary = predict_salary(user_input)
    course_ml = recommend_course(user_input)

    # 📚 RULE ENGINE
    rule_output = rule_engine(user_input)

    return {
        "job": job,
        "salary": salary,
        "course_ml": course_ml,
        "rule_output": rule_output
    }
