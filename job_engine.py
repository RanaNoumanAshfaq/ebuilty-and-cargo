import re
import pandas as pd

# Load dataset
jobs = pd.read_csv("datasets/jobs.csv")


# =========================
# FAKE JOB DETECTOR
# =========================
def is_fake_job(job):
    if job["salary"] > 500000 and "online" in job["location"].lower():
        return True

    if "urgent" in str(job["description"]).lower():
        return True

    if job["salary"] <= 0:
        return True

    return False


# =========================
# JOB SEARCH TERM NORMALIZATION
# =========================

def get_search_terms(subject):
    subject = subject.lower().strip()
    terms = {subject}
    terms.add(subject.replace("_", " "))
    terms.add(subject.replace(" ", "_"))

    if subject == "cpp":
        terms.add("c++")
    elif subject == "csharp":
        terms.add("c#")
    elif subject == "nodejs":
        terms.add("node.js")
        terms.add("node js")
        terms.add("node")
    elif subject == "html_css_js":
        terms.add("html css js")
        terms.add("html/css/js")
    elif subject == "html_css":
        terms.add("html css")
    elif subject == "frontend_frameworks":
        terms.update({"react", "angular", "vue", "frontend"})
    elif subject == "react_native":
        terms.add("react native")
    elif subject == "ci_cd":
        terms.add("ci/cd")
        terms.add("ci cd")
    elif subject == "apis":
        terms.update({"api", "rest api"})
    elif subject == "machine_learning":
        terms.add("machine learning")
    elif subject == "deep_learning":
        terms.add("deep learning")
    elif subject == "computer_vision":
        terms.add("computer vision")
    elif subject == "cyber_security":
        terms.add("cyber security")
    elif subject == "ethical_hacking":
        terms.add("ethical hacking")
    elif subject == "database_design":
        terms.add("database design")
        terms.add("database administration")
    elif subject == "smart_contracts":
        terms.add("smart contracts")
    elif subject == "unreal_engine":
        terms.add("unreal engine")
    elif subject == "three_d_graphics":
        terms.add("3d graphics")
        terms.add("three d graphics")
    elif subject == "operating_systems":
        terms.add("operating systems")
    elif subject == "assembly_language":
        terms.add("assembly language")
    elif subject == "computer_architecture":
        terms.add("computer architecture")
    elif subject == "power_bi":
        terms.add("power bi")
    elif subject == "data_visualization":
        terms.add("data visualization")
    elif subject == "business_intelligence":
        terms.add("business intelligence")

    return [t for t in terms if t]


def matches_search_term(term, text):
    term = term.lower()
    if term == "c":
        return bool(re.search(r"\bc\b", text))

    if re.search(r"[^A-Za-z0-9_ ]", term) or " " in term:
        return term in text

    return bool(re.search(r"\b" + re.escape(term) + r"\b", text))


# =========================
# FILTER JOBS BY SUBJECT
# =========================
# =========================
def get_jobs(subject):
    filtered = []
    terms = get_search_terms(subject)

    for _, job in jobs.iterrows():
        title = str(job["title"]).lower()
        description = str(job["description"]).lower()

        if any(matches_search_term(term, title) or matches_search_term(term, description) for term in terms):
            job_dict = job.to_dict()

            if not is_fake_job(job_dict):
                filtered.append(job_dict)

    return filtered


# =========================
# SALARY ANALYZER
# =========================
def avg_salary(job_list):
    if not job_list:
        return 0

    return sum(j["salary"] for j in job_list) / len(job_list)