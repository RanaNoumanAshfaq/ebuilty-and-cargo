import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression

# LOAD DATASET
df = pd.read_csv("datasets/jobs.csv")

print("Dataset Loaded")

# TF-IDF
tfidf = TfidfVectorizer()

X = tfidf.fit_transform(df["skills"])

# JOB MODEL
y_job = df["job_role"]

job_model = RandomForestClassifier()

job_model.fit(X, y_job)

print("Job Model Trained")

# SALARY MODEL
y_salary = df["salary"]

salary_model = LinearRegression()

salary_model.fit(X, y_salary)

print("Salary Model Trained")

# SAVE MODELS
joblib.dump(job_model, "models/job_model.pkl")

joblib.dump(salary_model, "models/salary_model.pkl")

joblib.dump(tfidf, "models/tfidf.pkl")

print("All Models Saved")