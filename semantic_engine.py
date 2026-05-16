import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# LOAD DATA
df = pd.read_csv("datasets/jobs.csv")

# SEMANTIC MODEL
model = SentenceTransformer('all-MiniLM-L6-v2')

# CREATE EMBEDDINGS
embeddings = model.encode(df["description"].tolist())

def predict_job(text):
    user_vec = model.encode([text])
    sim = cosine_similarity(user_vec, embeddings)
    return df.iloc[sim.argmax()]["job"]

def predict_salary(text):
    user_vec = model.encode([text])
    sim = cosine_similarity(user_vec, embeddings)
    return df.iloc[sim.argmax()]["salary"]

def recommend_course(text):
    user_vec = model.encode([text])
    sim = cosine_similarity(user_vec, embeddings)
    return df.iloc[sim.argmax()]["course"]