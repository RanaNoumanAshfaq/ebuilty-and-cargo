from data_module import COURSES, INTERNSHIPS, LEARNING_LINKS
from job_engine import get_jobs, avg_salary

CAREER_ROLES = {
    "c": ["Software Engineer", "Systems Programmer", "Embedded Engineer"],
    "cpp": ["Software Engineer", "Systems Programmer", "Embedded Engineer"],
    "csharp": ["Game Developer (Unity)", ".NET Developer"],
    "python": ["Data Analyst", "ML Engineer", "Backend Developer", "Automation Engineer"],
    "java": ["Backend Developer", "Android Developer", "Enterprise Software Engineer"],
    "javascript": ["Frontend Developer", "Full Stack Developer"],
    "typescript": ["Scalable Frontend Engineer", "Web App Developer"],
    "php": ["Web Backend Developer (Legacy Systems)"],
    "html_css": ["Frontend Developer", "UI Developer"],
    "html_css_js": ["Frontend Engineer"],
    "frontend_frameworks": ["Frontend Framework Engineer"],
    "nodejs": ["Backend Developer"],
    "full_stack": ["Full Stack Developer"],
    "rest_api": ["Backend Engineer", "API Developer"],
    "ai": ["ML Engineer", "AI Researcher"],
    "machine_learning": ["ML Engineer"],
    "deep_learning": ["AI Engineer", "Neural Network Engineer"],
    "data_science": ["Data Scientist", "Data Analyst"],
    "pandas": ["Data Analyst"],
    "numpy": ["Data Analyst"],
    "statistics": ["Data Scientist"],
    "nlp": ["NLP Engineer"],
    "computer_vision": ["CV Engineer"],
    "networking": ["Cyber Security Analyst", "Network Engineer"],
    "cyber_security": ["Security Analyst", "SOC Analyst"],
    "ethical_hacking": ["Penetration Tester", "Ethical Hacker"],
    "firewall": ["Security Engineer"],
    "cryptography": ["Security Researcher"],
    "soc": ["SOC Analyst"],
    "sql": ["Backend Developer", "Data Engineer"],
    "mysql": ["Database Administrator"],
    "postgresql": ["Database Administrator"],
    "mongodb": ["NoSQL Database Engineer"],
    "database_design": ["Backend Architect"],
    "apis": ["Backend Engineer"],
    "android": ["Android Developer"],
    "ios": ["iOS Developer"],
    "flutter": ["Cross-platform App Developer"],
    "react_native": ["Mobile App Developer"],
    "unity": ["Game Developer"],
    "unreal_engine": ["Game Programmer"],
    "three_d_graphics": ["Game Engine Developer"],
    "aws": ["Cloud Engineer"],
    "azure": ["Cloud Engineer"],
    "cloud": ["Cloud Engineer"],
    "docker": ["DevOps Engineer"],
    "kubernetes": ["DevOps / SRE Engineer"],
    "ci_cd": ["DevOps Engineer"],
    "linux": ["System Administrator", "DevOps Engineer"],
    "operating_systems": ["Systems Engineer"],
    "assembly_language": ["Embedded Systems Developer"],
    "computer_architecture": ["Hardware Engineer"],
    "c_advanced": ["Systems Programmer"],
    "excel": ["Data Analyst", "Business Analyst"],
    "power_bi": ["BI Analyst"],
    "data_visualization": ["Data Analyst"],
    "business_intelligence": ["BI Developer"],
    "blockchain": ["Blockchain Developer"],
    "smart_contracts": ["Web3 Developer"],
    "iot": ["IoT Engineer"],
    "robotics": ["Robotics Engineer"],
    "ar_vr": ["XR Developer"],
    "quantum_computing": ["Research Scientist"]
}


# =========================
# COURSES
# =========================
def get_courses(subject):
    return COURSES.get(subject.lower(), [])


# =========================
# INTERNSHIPS
# =========================
def get_internships(subject):
    results = []

    for i in INTERNSHIPS:
        if subject.lower() in i["skills"]:
            results.append(i)

    return results


# =========================
# LEARNING LINKS
# =========================
def get_learning_links(subject):
    return LEARNING_LINKS.get(subject.lower(), [])


# =========================
# ROLE SUGGESTIONS
# =========================
def get_role_suggestions(subject):
    return CAREER_ROLES.get(subject.lower(), [])


# =========================
# MAIN RESPONSE ENGINE
# =========================
def generate_career_response(subject):

    courses = get_courses(subject)
    internships = get_internships(subject)
    jobs = get_jobs(subject)
    salary = avg_salary(jobs)
    learning_links = get_learning_links(subject)
    roles = get_role_suggestions(subject)

    return {
        "subject": subject,
        "courses": courses,
        "internships": internships,
        "jobs": jobs,
        "avg_salary": salary,
        "learning_links": learning_links,
        "roles": roles
    }