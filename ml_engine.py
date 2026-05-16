import joblib
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# ================= LOAD MODELS =================
job_model = joblib.load("models/job_model.pkl")
salary_model = joblib.load("models/salary_model.pkl")
tfidf = joblib.load("models/tfidf.pkl")

# ================= LOAD DATA =================
courses_df = pd.read_csv("datasets/courses.csv")

# ================= EMBEDDINGS =================
embedder = SentenceTransformer('all-MiniLM-L6-v2')
course_embeddings = embedder.encode(courses_df["description"].tolist())

# ================= FUNCTIONS =================

def predict_job(text):
    vec = tfidf.transform([text])
    return job_model.predict(vec)[0]

def predict_salary(text):
    vec = tfidf.transform([text])
    return salary_model.predict(vec)[0]

def recommend_course(text):
    user_emb = embedder.encode([text])
    sim = cosine_similarity(user_emb, course_embeddings)
    index = sim.argmax()
    return courses_df.iloc[index]["course"]