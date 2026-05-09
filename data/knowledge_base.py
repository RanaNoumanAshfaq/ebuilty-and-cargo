# ============================================================
#  knowledge_base.py
#  All rule-based data: courses, careers, FAQs, synonyms
# ============================================================

# ------------------------------------------------------------------
# 1. INTEREST TAXONOMY  (canonical interest tags)
# ------------------------------------------------------------------
INTEREST_TAGS = [
    "programming", "mathematics", "data_science", "artificial_intelligence",
    "web_development", "cybersecurity", "networking", "databases",
    "biology", "chemistry", "physics", "medicine",
    "business", "finance", "economics", "management",
    "design", "art", "media", "communication",
    "psychology", "sociology", "education", "law",
    "engineering", "robotics", "electronics", "mechanical",
    "literature", "history", "philosophy", "languages",
    "environment", "agriculture", "architecture", "sports"
]

# ------------------------------------------------------------------
# 2. SYNONYM MAP  (raw user words → canonical interest tags)
# ------------------------------------------------------------------
SYNONYM_MAP = {
    # Programming / CS
    "coding": "programming", "code": "programming", "python": "programming",
    "java": "programming", "c++": "programming", "software": "programming",
    "development": "programming", "developer": "programming",
    "scripting": "programming", "algorithms": "programming",

    # Mathematics
    "math": "mathematics", "maths": "mathematics", "calculus": "mathematics",
    "algebra": "mathematics", "statistics": "mathematics", "stats": "mathematics",
    "probability": "mathematics", "geometry": "mathematics",

    # Data Science
    "data": "data_science", "analytics": "data_science", "analysis": "data_science",
    "machine learning": "artificial_intelligence", "ml": "artificial_intelligence",
    "deep learning": "artificial_intelligence", "dl": "artificial_intelligence",
    "neural": "artificial_intelligence", "nlp": "artificial_intelligence",

    # AI
    "ai": "artificial_intelligence", "artificial intelligence": "artificial_intelligence",
    "chatbot": "artificial_intelligence", "automation": "artificial_intelligence",
    "computer vision": "artificial_intelligence",

    # Web
    "web": "web_development", "html": "web_development", "css": "web_development",
    "javascript": "web_development", "react": "web_development",
    "frontend": "web_development", "backend": "web_development",
    "fullstack": "web_development", "website": "web_development",

    # Security
    "security": "cybersecurity", "hacking": "cybersecurity", "cyber": "cybersecurity",
    "ethical hacking": "cybersecurity", "network security": "cybersecurity",
    "penetration": "cybersecurity",

    # Networking
    "network": "networking", "cisco": "networking", "protocols": "networking",
    "internet": "networking", "tcp": "networking", "ip": "networking",

    # Databases
    "database": "databases", "sql": "databases", "mysql": "databases",
    "postgresql": "databases", "mongodb": "databases", "nosql": "databases",
    "db": "databases",

    # Sciences
    "bio": "biology", "life science": "biology", "genetics": "biology",
    "microbiology": "biology", "biochemistry": "biology",
    "chem": "chemistry", "organic": "chemistry", "lab": "chemistry",
    "physics": "physics", "quantum": "physics", "mechanics": "physics",
    "medical": "medicine", "health": "medicine", "clinical": "medicine",
    "doctor": "medicine", "nursing": "medicine", "pharmacy": "medicine",

    # Business
    "business": "business", "entrepreneurship": "business", "startup": "business",
    "marketing": "business", "sales": "business", "commerce": "business",
    "finance": "finance", "accounting": "finance", "investment": "finance",
    "banking": "finance", "stocks": "finance", "fintech": "finance",
    "economy": "economics", "macro": "economics", "micro": "economics",
    "management": "management", "leadership": "management", "hr": "management",
    "project management": "management", "operations": "management",

    # Design / Arts
    "design": "design", "ui": "design", "ux": "design", "graphic": "design",
    "photoshop": "design", "figma": "design", "illustration": "design",
    "art": "art", "drawing": "art", "painting": "art", "creative": "art",
    "media": "media", "video": "media", "photography": "media",
    "film": "media", "journalism": "media", "content": "media",
    "communication": "communication", "writing": "communication",
    "public speaking": "communication", "presentation": "communication",

    # Social Sciences
    "psychology": "psychology", "mental health": "psychology", "behavior": "psychology",
    "counseling": "psychology", "therapy": "psychology",
    "sociology": "sociology", "social": "sociology", "culture": "sociology",
    "teaching": "education", "pedagogy": "education", "curriculum": "education",
    "law": "law", "legal": "law", "rights": "law", "justice": "law",

    # Engineering
    "engineering": "engineering", "civil": "engineering",
    "robot": "robotics", "robotics": "robotics", "automation": "robotics",
    "electronics": "electronics", "circuits": "electronics", "arduino": "electronics",
    "mechanical": "mechanical", "machines": "mechanical", "manufacturing": "mechanical",

    # Humanities
    "literature": "literature", "novel": "literature", "poetry": "literature",
    "history": "history", "historical": "history",
    "philosophy": "philosophy", "ethics": "philosophy", "logic": "philosophy",
    "language": "languages", "linguistics": "languages", "english": "languages",
    "spanish": "languages", "arabic": "languages", "french": "languages",

    # Misc
    "environment": "environment", "climate": "environment", "ecology": "environment",
    "agriculture": "agriculture", "farming": "agriculture", "food": "agriculture",
    "architecture": "architecture", "building": "architecture", "urban": "architecture",
    "sports": "sports", "fitness": "sports", "exercise": "sports",
}

# ------------------------------------------------------------------
# 3. COURSE KNOWLEDGE BASE  (interest → list of course dicts)
# ------------------------------------------------------------------
COURSES = {
    "programming": [
        {"title": "CS50: Introduction to Computer Science", "provider": "Harvard / edX",
         "level": "Beginner", "url": "https://cs50.harvard.edu/",
         "description": "The most popular intro CS course. Covers C, Python, SQL, and web basics."},
        {"title": "Python for Everybody", "provider": "University of Michigan / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/python",
         "description": "A 5-course specialization covering Python from scratch to databases."},
        {"title": "Data Structures and Algorithms", "provider": "UC San Diego / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/data-structures-algorithms",
         "description": "Core CS fundamentals: arrays, trees, graphs, sorting, and dynamic programming."},
        {"title": "Object-Oriented Programming in Java", "provider": "Duke / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/object-oriented-programming",
         "description": "Deep dive into OOP principles, design patterns, and Java."},
        {"title": "The Missing Semester of CS Education", "provider": "MIT",
         "level": "Intermediate", "url": "https://missing.csail.mit.edu/",
         "description": "Shell, Git, Vim, debugging — practical skills most courses skip."},
    ],
    "mathematics": [
        {"title": "Mathematics for Machine Learning", "provider": "Imperial College / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/mathematics-machine-learning",
         "description": "Linear algebra, multivariate calculus, and PCA — the math behind ML."},
        {"title": "Introduction to Probability", "provider": "MIT OCW",
         "level": "Beginner", "url": "https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/",
         "description": "Foundational probability theory with real-world applications."},
        {"title": "Linear Algebra", "provider": "MIT OCW (Gilbert Strang)",
         "level": "Beginner", "url": "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
         "description": "The legendary Gilbert Strang course. Essential for CS and data science."},
        {"title": "Calculus 1A: Differentiation", "provider": "MIT / edX",
         "level": "Beginner", "url": "https://www.edx.org/course/calculus-1a-differentiation",
         "description": "Intuitive approach to differentiation with rigorous foundations."},
        {"title": "Statistics and Probability", "provider": "Khan Academy",
         "level": "Beginner", "url": "https://www.khanacademy.org/math/statistics-probability",
         "description": "Free, self-paced coverage of all core statistics topics."},
    ],
    "data_science": [
        {"title": "IBM Data Science Professional Certificate", "provider": "IBM / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
         "description": "10-course certificate: Python, SQL, data visualization, ML, and capstone."},
        {"title": "Google Data Analytics Certificate", "provider": "Google / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
         "description": "Industry-recognized certificate covering the full data analysis workflow."},
        {"title": "Applied Data Science with Python", "provider": "University of Michigan / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/data-science-python",
         "description": "Pandas, matplotlib, scikit-learn, NLP, and social network analysis."},
        {"title": "Data Visualization with Tableau", "provider": "UC Davis / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/data-visualization",
         "description": "Build interactive dashboards and visual stories with real data."},
    ],
    "artificial_intelligence": [
        {"title": "Machine Learning Specialization", "provider": "Andrew Ng / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/machine-learning-introduction",
         "description": "The gold standard intro to ML: regression, classification, neural nets."},
        {"title": "Deep Learning Specialization", "provider": "deeplearning.ai / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/deep-learning",
         "description": "CNNs, RNNs, optimization, and practical deep learning projects."},
        {"title": "CS229: Machine Learning", "provider": "Stanford / YouTube",
         "level": "Advanced", "url": "https://cs229.stanford.edu/",
         "description": "Stanford's rigorous ML course with full mathematical treatment."},
        {"title": "Fast.ai: Practical Deep Learning", "provider": "fast.ai",
         "level": "Intermediate", "url": "https://course.fast.ai/",
         "description": "Top-down approach — train state-of-the-art models in the first lesson."},
        {"title": "AI for Everyone", "provider": "Andrew Ng / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/ai-for-everyone",
         "description": "Non-technical introduction to AI concepts, strategy, and impact."},
    ],
    "web_development": [
        {"title": "The Odin Project", "provider": "The Odin Project (Free)",
         "level": "Beginner", "url": "https://www.theodinproject.com/",
         "description": "Full-stack curriculum: HTML, CSS, JavaScript, Node.js, and React."},
        {"title": "Full Stack Open", "provider": "University of Helsinki (Free)",
         "level": "Intermediate", "url": "https://fullstackopen.com/",
         "description": "Modern web development: React, Node, GraphQL, TypeScript, CI/CD."},
        {"title": "Meta Front-End Developer Certificate", "provider": "Meta / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
         "description": "Official Meta certificate: HTML, CSS, React, and UI/UX principles."},
        {"title": "CS50's Web Programming with Python and JavaScript", "provider": "Harvard / edX",
         "level": "Intermediate", "url": "https://cs50.harvard.edu/web/",
         "description": "Django, JavaScript, SQL, and scalability — Harvard quality, free."},
    ],
    "cybersecurity": [
        {"title": "Google Cybersecurity Certificate", "provider": "Google / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/google-cybersecurity",
         "description": "8-course certificate: threat analysis, SIEM tools, Python for security."},
        {"title": "Introduction to Cybersecurity", "provider": "Cisco / NetAcad (Free)",
         "level": "Beginner", "url": "https://www.netacad.com/courses/cybersecurity",
         "description": "Fundamentals of digital safety, threat types, and basic defense."},
        {"title": "CompTIA Security+ Prep", "provider": "Professor Messer (Free)",
         "level": "Intermediate", "url": "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/",
         "description": "Complete prep for the industry-standard Security+ certification."},
        {"title": "Ethical Hacking Bootcamp", "provider": "TCM Security / Udemy",
         "level": "Intermediate", "url": "https://academy.tcm-sec.com/",
         "description": "Penetration testing, reconnaissance, exploitation, and reporting."},
    ],
    "networking": [
        {"title": "Cisco CCNA: Introduction to Networks", "provider": "Cisco / NetAcad (Free)",
         "level": "Beginner", "url": "https://www.netacad.com/courses/networking",
         "description": "Industry-standard networking fundamentals from Cisco."},
        {"title": "The Bits and Bytes of Computer Networking", "provider": "Google / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/computer-networking",
         "description": "TCP/IP, DNS, DHCP, and network troubleshooting — Google-designed."},
        {"title": "Computer Networks", "provider": "Princeton / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/learn/computer-networks",
         "description": "Deep dive into network protocols, architecture, and the internet."},
    ],
    "databases": [
        {"title": "Databases: Relational Databases and SQL", "provider": "Stanford / edX",
         "level": "Beginner", "url": "https://www.edx.org/course/databases-5-sql",
         "description": "Stanford's concise and rigorous SQL and relational model course."},
        {"title": "SQL for Data Science", "provider": "UC Davis / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/sql-for-data-science",
         "description": "Practical SQL for filtering, joining, and aggregating data."},
        {"title": "MongoDB University (Free)", "provider": "MongoDB",
         "level": "Beginner", "url": "https://learn.mongodb.com/",
         "description": "Official free courses on NoSQL, aggregation pipelines, and Atlas."},
    ],
    "biology": [
        {"title": "Introduction to Biology", "provider": "MIT OCW",
         "level": "Beginner", "url": "https://ocw.mit.edu/courses/7-016-introductory-biology-fall-2018/",
         "description": "Genetics, molecular biology, evolution, and cell biology — MIT quality."},
        {"title": "Genetics and Evolution", "provider": "Duke / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/genetics-evolution",
         "description": "Core genetics: Mendelian inheritance, mutation, and natural selection."},
        {"title": "Bioinformatics Specialization", "provider": "UC San Diego / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/specializations/bioinformatics",
         "description": "Computational biology: sequence alignment, phylogenetics, genome assembly."},
    ],
    "chemistry": [
        {"title": "Introduction to Chemistry", "provider": "Duke / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/intro-chemistry",
         "description": "Atomic structure, bonding, reactions, and stoichiometry."},
        {"title": "Chemistry: Concept Development and Application", "provider": "Rice / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/chemistry",
         "description": "Conceptual approach to chemistry — ideal for self-learners."},
        {"title": "Organic Chemistry", "provider": "MIT OCW",
         "level": "Intermediate", "url": "https://ocw.mit.edu/courses/5-12-organic-chemistry-i-spring-2003/",
         "description": "Full MIT organic chemistry course with problem sets."},
    ],
    "physics": [
        {"title": "8.01 Classical Mechanics", "provider": "MIT OCW",
         "level": "Beginner", "url": "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
         "description": "The legendary MIT intro physics — kinematics, forces, energy, momentum."},
        {"title": "How Things Work: An Introduction to Physics", "provider": "UVA / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/how-things-work",
         "description": "Physics through everyday objects — no heavy math required."},
        {"title": "Quantum Mechanics for Everyone", "provider": "Georgetown / edX",
         "level": "Beginner", "url": "https://www.edx.org/course/quantum-mechanics-for-everyone",
         "description": "Accessible introduction to quantum theory without advanced math."},
    ],
    "medicine": [
        {"title": "Anatomy: Musculoskeletal and Integumentary Systems", "provider": "Duke / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/anatomy-musculoskeletal-integumentary",
         "description": "Medical-quality anatomy course from Duke University."},
        {"title": "Health for All Through Primary Health Care", "provider": "Johns Hopkins / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/health-for-all",
         "description": "Global health systems, primary care, and health equity."},
        {"title": "Epidemiology: The Basic Science of Public Health", "provider": "UNC / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/epidemiology",
         "description": "Disease patterns, causation, and public health research methods."},
    ],
    "business": [
        {"title": "Business Foundations Specialization", "provider": "Wharton / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/wharton-business-foundations",
         "description": "Wharton's intro to marketing, operations, finance, and accounting."},
        {"title": "Entrepreneurship: Launching an Innovative Business", "provider": "Maryland / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/entrepreneurship",
         "description": "From idea to launch: testing, pitching, and scaling a startup."},
    ],
    "finance": [
        {"title": "Financial Markets", "provider": "Yale (Robert Shiller) / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/financial-markets-global",
         "description": "Nobel laureate Shiller's course on stocks, bonds, and financial risk."},
        {"title": "Introduction to Corporate Finance", "provider": "Wharton / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/wharton-finance",
         "description": "Time value of money, valuation, capital budgeting — Wharton quality."},
    ],
    "design": [
        {"title": "Google UX Design Certificate", "provider": "Google / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/professional-certificates/google-ux-design",
         "description": "7-course certificate: research, wireframing, prototyping in Figma."},
        {"title": "Graphic Design Specialization", "provider": "CalArts / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/graphic-design",
         "description": "Typography, composition, image-making — foundational graphic design."},
        {"title": "UI/UX Design with Figma", "provider": "Udemy / various",
         "level": "Beginner", "url": "https://www.udemy.com/topic/figma/",
         "description": "Hands-on design: components, auto-layout, prototyping in Figma."},
    ],
    "psychology": [
        {"title": "Introduction to Psychology", "provider": "Yale / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/introduction-psychology",
         "description": "The famous Yale course covering perception, development, and social psych."},
        {"title": "The Science of Well-Being", "provider": "Yale / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/the-science-of-well-being",
         "description": "Happiness research and evidence-based practices — most popular Coursera course ever."},
    ],
    "engineering": [
        {"title": "Introduction to Engineering Mechanics", "provider": "Georgia Tech / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/engineering-mechanics-statics",
         "description": "Statics and forces — the foundation of all engineering programs."},
        {"title": "Engineering Project Management", "provider": "Rice / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/specializations/engineering-project-management",
         "description": "Scope, schedule, cost, and risk management for engineers."},
    ],
    "economics": [
        {"title": "The Economics of Money and Banking", "provider": "Columbia / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/learn/money-banking",
         "description": "Monetary systems, banking, and macroeconomic policy."},
        {"title": "Microeconomics Principles", "provider": "Illinois / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/microeconomics-principles",
         "description": "Supply, demand, market structures, and consumer behavior."},
    ],
    "management": [
        {"title": "Leadership and Emotional Intelligence", "provider": "ISB / Coursera",
         "level": "Beginner", "url": "https://www.coursera.org/learn/leadership-emotional-intelligence",
         "description": "Self-awareness, empathy, and leadership in organizations."},
        {"title": "Project Management Professional (PMP) Prep", "provider": "PMI / Coursera",
         "level": "Intermediate", "url": "https://www.coursera.org/professional-certificates/google-project-management",
         "description": "Google's PM certificate covering Agile, Scrum, and project lifecycle."},
    ],
}

# Fill missing interests with a generic fallback
for tag in INTEREST_TAGS:
    if tag not in COURSES:
        COURSES[tag] = [
            {"title": f"Introduction to {tag.replace('_', ' ').title()}",
             "provider": "Various (search Coursera/edX)",
             "level": "Beginner",
             "url": f"https://www.coursera.org/search?query={tag.replace('_', '+')}",
             "description": f"Search Coursera or edX for beginner courses in {tag.replace('_', ' ')}."}
        ]

# ------------------------------------------------------------------
# 4. CAREER KNOWLEDGE BASE  (interest → career paths)
# ------------------------------------------------------------------
CAREERS = {
    "programming": [
        {"title": "Software Engineer", "avg_salary": "$110,000/yr",
         "description": "Build applications, systems, and tools. Core role in every tech company.",
         "skills_needed": ["OOP", "Data Structures", "Version Control", "Problem Solving"],
         "growth": "Very High"},
        {"title": "Backend Developer", "avg_salary": "$105,000/yr",
         "description": "Design APIs, databases, and server-side logic for web and mobile apps.",
         "skills_needed": ["Python/Node/Java", "SQL", "REST APIs", "Cloud"],
         "growth": "High"},
        {"title": "DevOps Engineer", "avg_salary": "$115,000/yr",
         "description": "Bridge development and operations — CI/CD, Docker, Kubernetes.",
         "skills_needed": ["Linux", "Docker", "CI/CD", "Cloud Platforms"],
         "growth": "Very High"},
    ],
    "mathematics": [
        {"title": "Actuary", "avg_salary": "$105,000/yr",
         "description": "Use statistics and probability to assess financial risk for insurance companies.",
         "skills_needed": ["Probability", "Statistics", "Excel", "Business Acumen"],
         "growth": "High"},
        {"title": "Quantitative Analyst", "avg_salary": "$130,000/yr",
         "description": "Build mathematical models for trading, pricing, and risk in finance.",
         "skills_needed": ["Calculus", "Linear Algebra", "Programming", "Statistics"],
         "growth": "High"},
        {"title": "Mathematician / Researcher", "avg_salary": "$95,000/yr",
         "description": "Pure or applied research in academia or government labs.",
         "skills_needed": ["Proof Writing", "Advanced Calculus", "Research Methods"],
         "growth": "Moderate"},
    ],
    "data_science": [
        {"title": "Data Scientist", "avg_salary": "$120,000/yr",
         "description": "Extract insights from data using statistics, ML, and visualization.",
         "skills_needed": ["Python", "SQL", "Statistics", "Machine Learning", "Visualization"],
         "growth": "Very High"},
        {"title": "Data Analyst", "avg_salary": "$80,000/yr",
         "description": "Clean, query, and visualize data to support business decisions.",
         "skills_needed": ["SQL", "Excel", "Tableau/Power BI", "Statistics"],
         "growth": "High"},
        {"title": "Business Intelligence Analyst", "avg_salary": "$90,000/yr",
         "description": "Build dashboards and reports that drive strategic decisions.",
         "skills_needed": ["SQL", "Power BI", "Data Modeling", "Communication"],
         "growth": "High"},
    ],
    "artificial_intelligence": [
        {"title": "ML Engineer", "avg_salary": "$130,000/yr",
         "description": "Deploy, scale, and maintain machine learning models in production.",
         "skills_needed": ["Python", "TensorFlow/PyTorch", "MLOps", "Cloud"],
         "growth": "Very High"},
        {"title": "AI Research Scientist", "avg_salary": "$150,000/yr",
         "description": "Push the boundaries of AI at research labs like DeepMind or OpenAI.",
         "skills_needed": ["Mathematics", "Deep Learning", "Research", "Python"],
         "growth": "Very High"},
        {"title": "NLP Engineer", "avg_salary": "$125,000/yr",
         "description": "Build language models, chatbots, and text analysis systems.",
         "skills_needed": ["Python", "Transformers", "Linguistics", "PyTorch"],
         "growth": "Very High"},
    ],
    "web_development": [
        {"title": "Frontend Developer", "avg_salary": "$95,000/yr",
         "description": "Build user interfaces with HTML, CSS, and JavaScript frameworks.",
         "skills_needed": ["HTML/CSS", "JavaScript", "React/Vue", "UI/UX basics"],
         "growth": "High"},
        {"title": "Full Stack Developer", "avg_salary": "$110,000/yr",
         "description": "Work across both frontend and backend to build complete web applications.",
         "skills_needed": ["JavaScript", "Node.js", "SQL", "React", "APIs"],
         "growth": "Very High"},
        {"title": "WordPress / Freelance Developer", "avg_salary": "$60,000-$120,000/yr",
         "description": "Build websites for clients independently — flexible income potential.",
         "skills_needed": ["HTML/CSS", "PHP/JS", "Client Communication", "SEO"],
         "growth": "Moderate"},
    ],
    "cybersecurity": [
        {"title": "Cybersecurity Analyst", "avg_salary": "$100,000/yr",
         "description": "Monitor systems, detect threats, and respond to security incidents.",
         "skills_needed": ["SIEM Tools", "Networking", "Threat Analysis", "Python"],
         "growth": "Very High"},
        {"title": "Penetration Tester (Ethical Hacker)", "avg_salary": "$110,000/yr",
         "description": "Legally hack into systems to find vulnerabilities before attackers do.",
         "skills_needed": ["Kali Linux", "Networking", "Scripting", "Social Engineering"],
         "growth": "Very High"},
        {"title": "Security Engineer", "avg_salary": "$120,000/yr",
         "description": "Design and implement secure systems, firewalls, and encryption.",
         "skills_needed": ["Cryptography", "Networking", "Cloud Security", "Programming"],
         "growth": "Very High"},
    ],
    "networking": [
        {"title": "Network Engineer", "avg_salary": "$90,000/yr",
         "description": "Design, implement, and manage company network infrastructure.",
         "skills_needed": ["Cisco", "TCP/IP", "Routing & Switching", "Firewalls"],
         "growth": "Moderate"},
        {"title": "Cloud Network Architect", "avg_salary": "$130,000/yr",
         "description": "Design cloud networking solutions on AWS, Azure, or GCP.",
         "skills_needed": ["AWS/Azure", "VPNs", "Load Balancing", "Security"],
         "growth": "Very High"},
    ],
    "databases": [
        {"title": "Database Administrator (DBA)", "avg_salary": "$95,000/yr",
         "description": "Manage, tune, backup, and secure organizational databases.",
         "skills_needed": ["SQL", "Oracle/PostgreSQL", "Performance Tuning", "Backup"],
         "growth": "Moderate"},
        {"title": "Data Engineer", "avg_salary": "$115,000/yr",
         "description": "Build data pipelines and infrastructure that power analytics teams.",
         "skills_needed": ["Python", "SQL", "Spark", "ETL", "Cloud"],
         "growth": "Very High"},
    ],
    "biology": [
        {"title": "Biologist / Research Scientist", "avg_salary": "$80,000/yr",
         "description": "Conduct laboratory or field research in genetics, ecology, or cell biology.",
         "skills_needed": ["Lab Techniques", "Data Analysis", "Scientific Writing"],
         "growth": "Moderate"},
        {"title": "Bioinformatician", "avg_salary": "$100,000/yr",
         "description": "Analyze genomic and biological data using computational methods.",
         "skills_needed": ["Python/R", "Genomics", "Statistics", "Linux"],
         "growth": "High"},
        {"title": "Pharmacologist", "avg_salary": "$90,000/yr",
         "description": "Study how drugs interact with biological systems.",
         "skills_needed": ["Biochemistry", "Lab Skills", "Clinical Knowledge"],
         "growth": "Moderate"},
    ],
    "chemistry": [
        {"title": "Chemist", "avg_salary": "$80,000/yr",
         "description": "Research, develop, or test chemical products and processes.",
         "skills_needed": ["Lab Techniques", "Analytical Skills", "Safety Protocols"],
         "growth": "Moderate"},
        {"title": "Chemical Engineer", "avg_salary": "$105,000/yr",
         "description": "Scale chemical processes from lab to industrial production.",
         "skills_needed": ["Thermodynamics", "Process Design", "Math", "CAD"],
         "growth": "Moderate"},
    ],
    "physics": [
        {"title": "Physicist / Researcher", "avg_salary": "$120,000/yr",
         "description": "Work in academia or national labs on fundamental or applied physics.",
         "skills_needed": ["Mathematics", "Programming", "Research Methods"],
         "growth": "Moderate"},
        {"title": "Aerospace Engineer", "avg_salary": "$118,000/yr",
         "description": "Design aircraft, spacecraft, and propulsion systems.",
         "skills_needed": ["Physics", "Mathematics", "CAD", "Fluid Mechanics"],
         "growth": "Moderate"},
    ],
    "medicine": [
        {"title": "Physician / Doctor", "avg_salary": "$200,000+/yr",
         "description": "Diagnose and treat patients in clinical settings.",
         "skills_needed": ["Medical Degree", "Clinical Skills", "Empathy", "Decision Making"],
         "growth": "High"},
        {"title": "Public Health Officer", "avg_salary": "$75,000/yr",
         "description": "Design and implement health programs for communities and populations.",
         "skills_needed": ["Epidemiology", "Health Policy", "Communication"],
         "growth": "High"},
    ],
    "business": [
        {"title": "Business Analyst", "avg_salary": "$85,000/yr",
         "description": "Bridge business needs and technical solutions in organizations.",
         "skills_needed": ["Requirements Gathering", "SQL", "Communication", "Excel"],
         "growth": "High"},
        {"title": "Product Manager", "avg_salary": "$120,000/yr",
         "description": "Define product vision, prioritize features, and coordinate teams.",
         "skills_needed": ["Strategy", "Communication", "Technical Literacy", "Analytics"],
         "growth": "Very High"},
        {"title": "Entrepreneur", "avg_salary": "Variable",
         "description": "Build and scale your own company — highest risk, highest reward.",
         "skills_needed": ["Leadership", "Sales", "Finance", "Resilience"],
         "growth": "High"},
    ],
    "finance": [
        {"title": "Financial Analyst", "avg_salary": "$85,000/yr",
         "description": "Analyze financial data and build models to guide investment decisions.",
         "skills_needed": ["Excel", "Financial Modeling", "Accounting", "Communication"],
         "growth": "High"},
        {"title": "Investment Banker", "avg_salary": "$150,000+/yr",
         "description": "Advise on mergers, acquisitions, and capital markets transactions.",
         "skills_needed": ["Financial Modeling", "Valuation", "Networking", "Work Ethic"],
         "growth": "Moderate"},
        {"title": "FinTech Developer", "avg_salary": "$120,000/yr",
         "description": "Build financial software — payments, banking apps, trading platforms.",
         "skills_needed": ["Programming", "Finance Knowledge", "Security", "APIs"],
         "growth": "Very High"},
    ],
    "design": [
        {"title": "UX/UI Designer", "avg_salary": "$90,000/yr",
         "description": "Research user needs and design interfaces that are intuitive and beautiful.",
         "skills_needed": ["Figma", "User Research", "Prototyping", "Visual Design"],
         "growth": "High"},
        {"title": "Graphic Designer", "avg_salary": "$55,000/yr",
         "description": "Create visual content for brands, publications, and digital media.",
         "skills_needed": ["Adobe Suite", "Typography", "Color Theory", "Creativity"],
         "growth": "Moderate"},
        {"title": "Product Designer", "avg_salary": "$110,000/yr",
         "description": "Own the full design process from research to high-fidelity mockups.",
         "skills_needed": ["Figma", "Systems Thinking", "Research", "Prototyping"],
         "growth": "High"},
    ],
    "psychology": [
        {"title": "Clinical Psychologist", "avg_salary": "$90,000/yr",
         "description": "Assess and treat mental health disorders in clinical settings.",
         "skills_needed": ["Therapy Techniques", "Research", "Empathy", "Ethics"],
         "growth": "High"},
        {"title": "UX Researcher", "avg_salary": "$105,000/yr",
         "description": "Apply psychological methods to understand user behavior in tech products.",
         "skills_needed": ["Research Methods", "Interviews", "Data Analysis", "Communication"],
         "growth": "High"},
        {"title": "Human Resources Manager", "avg_salary": "$80,000/yr",
         "description": "Manage recruitment, culture, and employee wellbeing in organizations.",
         "skills_needed": ["People Skills", "Conflict Resolution", "Employment Law"],
         "growth": "Moderate"},
    ],
    "economics": [
        {"title": "Economist", "avg_salary": "$105,000/yr",
         "description": "Analyze economic data and advise policy at government or private level.",
         "skills_needed": ["Econometrics", "Statistics", "R/Python", "Policy Analysis"],
         "growth": "Moderate"},
        {"title": "Policy Analyst", "avg_salary": "$70,000/yr",
         "description": "Research and advise on public policy at government or think tanks.",
         "skills_needed": ["Research", "Writing", "Quantitative Skills", "Communication"],
         "growth": "Moderate"},
    ],
    "management": [
        {"title": "Project Manager", "avg_salary": "$95,000/yr",
         "description": "Plan, execute, and close projects on time and within budget.",
         "skills_needed": ["Agile/Scrum", "Communication", "Risk Management", "Leadership"],
         "growth": "High"},
        {"title": "Operations Manager", "avg_salary": "$80,000/yr",
         "description": "Optimize day-to-day operations and processes in an organization.",
         "skills_needed": ["Process Improvement", "Analytics", "Leadership", "Excel"],
         "growth": "High"},
    ],
    "engineering": [
        {"title": "Civil Engineer", "avg_salary": "$90,000/yr",
         "description": "Design and oversee construction of infrastructure: roads, bridges, buildings.",
         "skills_needed": ["CAD", "Structural Analysis", "Project Management", "Math"],
         "growth": "Moderate"},
        {"title": "Mechanical Engineer", "avg_salary": "$95,000/yr",
         "description": "Design mechanical systems, machines, and manufacturing processes.",
         "skills_needed": ["CAD", "Thermodynamics", "Materials Science", "Math"],
         "growth": "Moderate"},
    ],
    "electronics": [
        {"title": "Embedded Systems Engineer", "avg_salary": "$100,000/yr",
         "description": "Program microcontrollers and hardware for IoT and consumer devices.",
         "skills_needed": ["C/C++", "Arduino/STM32", "PCB Design", "RTOS"],
         "growth": "High"},
        {"title": "Electrical Engineer", "avg_salary": "$100,000/yr",
         "description": "Design electrical systems for power, communications, or consumer products.",
         "skills_needed": ["Circuit Analysis", "MATLAB", "CAD", "Physics"],
         "growth": "Moderate"},
    ],
    "robotics": [
        {"title": "Robotics Engineer", "avg_salary": "$110,000/yr",
         "description": "Design and program robots for manufacturing, healthcare, and exploration.",
         "skills_needed": ["ROS", "Python/C++", "Control Systems", "Mechanical Design"],
         "growth": "Very High"},
        {"title": "Automation Engineer", "avg_salary": "$95,000/yr",
         "description": "Automate industrial and business processes using robotics and software.",
         "skills_needed": ["PLC Programming", "Robotics", "Process Knowledge"],
         "growth": "High"},
    ],
    "art": [
        {"title": "Animator / Motion Designer", "avg_salary": "$65,000/yr",
         "description": "Create animations for film, games, advertising, and digital media.",
         "skills_needed": ["After Effects", "Blender", "Storytelling", "Drawing"],
         "growth": "Moderate"},
        {"title": "Game Artist", "avg_salary": "$70,000/yr",
         "description": "Design characters, environments, and assets for video games.",
         "skills_needed": ["3D Modeling", "Texturing", "Concept Art", "Game Engines"],
         "growth": "Moderate"},
    ],
    "media": [
        {"title": "Content Creator / YouTuber", "avg_salary": "Variable",
         "description": "Produce videos, podcasts, or written content for online audiences.",
         "skills_needed": ["Video Editing", "SEO", "Consistency", "Personal Brand"],
         "growth": "High"},
        {"title": "Journalist / Writer", "avg_salary": "$55,000/yr",
         "description": "Report, investigate, and publish stories for news and media outlets.",
         "skills_needed": ["Writing", "Research", "Interviewing", "Ethics"],
         "growth": "Low"},
    ],
    "communication": [
        {"title": "Marketing Manager", "avg_salary": "$80,000/yr",
         "description": "Plan and execute marketing campaigns across channels.",
         "skills_needed": ["SEO/SEM", "Analytics", "Copywriting", "Strategy"],
         "growth": "High"},
        {"title": "Public Relations Specialist", "avg_salary": "$65,000/yr",
         "description": "Manage reputation and communications for organizations.",
         "skills_needed": ["Writing", "Media Relations", "Crisis Communication"],
         "growth": "Moderate"},
    ],
    "education": [
        {"title": "Teacher / Educator", "avg_salary": "$55,000/yr",
         "description": "Teach and inspire students at primary, secondary, or higher education level.",
         "skills_needed": ["Subject Expertise", "Communication", "Patience", "Planning"],
         "growth": "Moderate"},
        {"title": "Instructional Designer", "avg_salary": "$75,000/yr",
         "description": "Design online courses, training programs, and learning experiences.",
         "skills_needed": ["LMS Tools", "Content Creation", "Learning Theory", "Multimedia"],
         "growth": "High"},
    ],
    "law": [
        {"title": "Lawyer / Advocate", "avg_salary": "$120,000/yr",
         "description": "Represent clients, draft contracts, and advise on legal matters.",
         "skills_needed": ["Legal Research", "Writing", "Argumentation", "Ethics"],
         "growth": "Moderate"},
        {"title": "Compliance Officer", "avg_salary": "$85,000/yr",
         "description": "Ensure organizations follow laws, regulations, and internal policies.",
         "skills_needed": ["Regulatory Knowledge", "Risk Assessment", "Communication"],
         "growth": "High"},
    ],
    "literature": [
        {"title": "Author / Writer", "avg_salary": "Variable",
         "description": "Write fiction, non-fiction, or screenplays for publication.",
         "skills_needed": ["Craft", "Discipline", "Research", "Marketing"],
         "growth": "Moderate"},
        {"title": "Editor", "avg_salary": "$60,000/yr",
         "description": "Edit manuscripts, articles, and content for clarity and quality.",
         "skills_needed": ["Grammar", "Style", "Attention to Detail", "Communication"],
         "growth": "Low"},
    ],
    "history": [
        {"title": "Historian / Researcher", "avg_salary": "$65,000/yr",
         "description": "Research and document historical events in academia or institutions.",
         "skills_needed": ["Research", "Writing", "Critical Analysis", "Archiving"],
         "growth": "Low"},
        {"title": "Museum Curator", "avg_salary": "$55,000/yr",
         "description": "Manage and interpret collections for museums and cultural institutions.",
         "skills_needed": ["Art/History Knowledge", "Research", "Public Engagement"],
         "growth": "Low"},
    ],
    "philosophy": [
        {"title": "Ethics Consultant", "avg_salary": "$70,000/yr",
         "description": "Advise organizations on ethical decisions — increasingly needed in AI/tech.",
         "skills_needed": ["Ethics Frameworks", "Critical Thinking", "Communication"],
         "growth": "Moderate"},
        {"title": "AI Ethics Researcher", "avg_salary": "$95,000/yr",
         "description": "Research the moral implications of AI systems and policies.",
         "skills_needed": ["Philosophy", "AI Literacy", "Research", "Writing"],
         "growth": "High"},
    ],
    "languages": [
        {"title": "Translator / Interpreter", "avg_salary": "$55,000/yr",
         "description": "Convert written or spoken content between languages.",
         "skills_needed": ["Bilingual Fluency", "Subject Knowledge", "Attention to Detail"],
         "growth": "Moderate"},
        {"title": "Computational Linguist", "avg_salary": "$100,000/yr",
         "description": "Work on NLP tools, speech recognition, and language models.",
         "skills_needed": ["Linguistics", "Python", "Machine Learning"],
         "growth": "High"},
    ],
    "environment": [
        {"title": "Environmental Scientist", "avg_salary": "$75,000/yr",
         "description": "Study environmental problems and develop solutions for pollution and climate.",
         "skills_needed": ["Research", "Data Analysis", "Field Work", "Policy Knowledge"],
         "growth": "High"},
        {"title": "Sustainability Consultant", "avg_salary": "$80,000/yr",
         "description": "Help organizations reduce their environmental impact.",
         "skills_needed": ["Environmental Law", "Data", "Communication", "Project Management"],
         "growth": "High"},
    ],
    "agriculture": [
        {"title": "Agricultural Scientist", "avg_salary": "$65,000/yr",
         "description": "Research crop improvement, soil science, and sustainable farming.",
         "skills_needed": ["Biology", "Research", "Field Work", "Data Analysis"],
         "growth": "Moderate"},
        {"title": "AgriTech Developer", "avg_salary": "$90,000/yr",
         "description": "Build software and IoT systems for smart farming and food supply chains.",
         "skills_needed": ["Programming", "IoT", "Agriculture Knowledge"],
         "growth": "High"},
    ],
    "architecture": [
        {"title": "Architect", "avg_salary": "$90,000/yr",
         "description": "Design buildings and spaces that are safe, functional, and beautiful.",
         "skills_needed": ["AutoCAD/Revit", "Structural Knowledge", "Creativity", "Laws"],
         "growth": "Moderate"},
        {"title": "Urban Planner", "avg_salary": "$80,000/yr",
         "description": "Plan land use and development for cities and communities.",
         "skills_needed": ["GIS", "Policy", "Community Engagement", "Design"],
         "growth": "Moderate"},
    ],
    "sports": [
        {"title": "Sports Coach / Trainer", "avg_salary": "$45,000/yr",
         "description": "Train athletes and teams to improve performance.",
         "skills_needed": ["Sports Expertise", "Communication", "Exercise Science"],
         "growth": "Moderate"},
        {"title": "Sports Data Analyst", "avg_salary": "$70,000/yr",
         "description": "Analyze player and team performance data to drive decisions.",
         "skills_needed": ["Statistics", "Python/R", "Sports Knowledge", "Visualization"],
         "growth": "High"},
    ],
    "sociology": [
        {"title": "Social Worker", "avg_salary": "$55,000/yr",
         "description": "Support individuals and families facing social challenges.",
         "skills_needed": ["Empathy", "Case Management", "Communication", "Ethics"],
         "growth": "High"},
        {"title": "Policy Researcher", "avg_salary": "$65,000/yr",
         "description": "Conduct research to inform social policy decisions.",
         "skills_needed": ["Research Methods", "Writing", "Statistics"],
         "growth": "Moderate"},
    ],
    "mechanical": [
        {"title": "Mechanical Design Engineer", "avg_salary": "$95,000/yr",
         "description": "Design mechanical components for automotive, aerospace, or consumer products.",
         "skills_needed": ["CAD (SolidWorks/CATIA)", "FEA", "Thermodynamics", "GD&T"],
         "growth": "Moderate"},
        {"title": "Manufacturing Engineer", "avg_salary": "$85,000/yr",
         "description": "Optimize production processes for quality, speed, and cost.",
         "skills_needed": ["Lean Manufacturing", "CAD", "Quality Control", "Statistics"],
         "growth": "Moderate"},
    ],
}

# Fill any missing career entries
for tag in INTEREST_TAGS:
    if tag not in CAREERS:
        CAREERS[tag] = [
            {"title": f"Professional in {tag.replace('_', ' ').title()}",
             "avg_salary": "Varies",
             "description": f"There are many career paths in {tag.replace('_', ' ')}. Research specific roles on LinkedIn or Glassdoor.",
             "skills_needed": ["Domain Knowledge", "Communication", "Problem Solving"],
             "growth": "Moderate"}
        ]

# ------------------------------------------------------------------
# 5. FAQ KNOWLEDGE BASE
# ------------------------------------------------------------------
FAQS = [
    # GPA / Grades
    {"keywords": ["gpa", "grade", "marks", "cgpa", "percentage", "fail", "pass"],
     "question": "How important is GPA for my career?",
     "answer": (
         "GPA matters differently depending on your path:\n\n"
         "• **Academia / Research**: High GPA (3.5+) is important for PhD programs and scholarships.\n"
         "• **Top Tech Companies**: GPA is screened initially (often 3.0+ cutoff), but projects and skills matter more.\n"
         "• **Entrepreneurship**: GPA is largely irrelevant — execution and skills are everything.\n"
         "• **General Rule**: A strong portfolio, internships, and real projects can outweigh a mediocre GPA in most industries.\n\n"
         "Focus on learning deeply, building projects, and gaining practical experience alongside your grades."
     )},

    # How to choose a major
    {"keywords": ["major", "degree", "field", "choose", "which course", "what to study", "subject", "department"],
     "question": "How do I choose the right major or field of study?",
     "answer": (
         "Choosing a major involves three key factors:\n\n"
         "1. **Interests**: What topics make you lose track of time? Start there.\n"
         "2. **Strengths**: What are you naturally good at? Math? Writing? Design?\n"
         "3. **Market Demand**: Which fields have strong job markets in your region?\n\n"
         "A useful exercise: write down 3 things you enjoy doing and 3 problems you want to solve. "
         "The intersection often points toward the right field.\n\n"
         "Remember: You don't have to choose forever. Many professionals work outside their original major. "
         "Skills transfer more than degrees do."
     )},

    # Internship
    {"keywords": ["internship", "intern", "experience", "job experience", "work experience"],
     "question": "How do I get an internship with no experience?",
     "answer": (
         "Everyone starts with no experience — here's how to break the cycle:\n\n"
         "1. **Build projects**: A GitHub with 3–5 real projects is worth more than a blank resume.\n"
         "2. **Start small**: Apply to startups, local companies, or NGOs — less competition, more learning.\n"
         "3. **Cold email**: Research companies you admire, write a genuine 3-sentence email, attach your portfolio.\n"
         "4. **Use your university**: Career centers, professor connections, and alumni networks are underused.\n"
         "5. **Contribute to open source**: Public contributions signal genuine skill to employers.\n\n"
         "Apply to 20–30 places, expect 1–3 replies. That's normal — it's a numbers game early on."
     )},

    # Career change
    {"keywords": ["change career", "switch field", "career change", "new field", "transition", "different field"],
     "question": "How do I switch to a completely different career field?",
     "answer": (
         "Career transitions are very common and absolutely achievable. Here's a realistic path:\n\n"
         "1. **Identify transferable skills**: Communication, analysis, project management cross every field.\n"
         "2. **Bridge education**: Online certificates (Coursera, edX) let you learn while working.\n"
         "3. **Build proof**: Create projects in your new field to show ability, not just intent.\n"
         "4. **Network intentionally**: Join communities, attend meetups, talk to people doing what you want to do.\n"
         "5. **Target transition-friendly companies**: Many startups care more about skills than degree.\n\n"
         "Average career transition takes 6–18 months of deliberate preparation."
     )},

    # Scholarship
    {"keywords": ["scholarship", "funding", "financial aid", "bursary", "grant", "tuition", "fees", "money"],
     "question": "How can I find scholarships for my studies?",
     "answer": (
         "Here are the best places to search for scholarships:\n\n"
         "• **Your own university**: Check the financial aid office first — many go unclaimed.\n"
         "• **Government portals**: Most countries have national scholarship databases (HEC in Pakistan, DAAD in Germany, etc.).\n"
         "• **Scholarshipdb.net**: Aggregates international scholarships.\n"
         "• **Coursera Financial Aid**: Free access to most Coursera courses if you apply for aid.\n"
         "• **Google, Microsoft, Chevron, and others**: Tech companies offer diversity and merit scholarships.\n\n"
         "Tips: Apply early, write genuine personal statements, and apply to many — even 'reach' ones."
     )},

    # Online vs degree
    {"keywords": ["online course", "online degree", "certificate", "self-taught", "bootcamp", "worth it", "recognized"],
     "question": "Are online courses and certificates worth it compared to a formal degree?",
     "answer": (
         "It depends on the field:\n\n"
         "• **Tech / Data / Design**: Online certificates (Google, IBM, Meta on Coursera) are widely respected. "
         "Many companies hire based on portfolio and skills, not degree name.\n"
         "• **Medicine / Law / Engineering**: Formal degrees and licensing are required. Online courses supplement but don't replace.\n"
         "• **Business / Management**: A mix works well — MBA is valuable, but hands-on experience and certifications can substitute for some roles.\n\n"
         "The bottom line: **skills + portfolio > certificate name** in most modern tech and creative fields."
     )},

    # Programming to start
    {"keywords": ["first language", "learn programming", "start coding", "which language", "programming language", "begin coding"],
     "question": "Which programming language should I learn first?",
     "answer": (
         "**Python** is the best first language for most people. Here's why:\n\n"
         "• Clean, readable syntax — reads almost like English.\n"
         "• Extremely versatile: web, data science, AI, automation, scripting.\n"
         "• Massive community, tons of free resources.\n"
         "• Used by Google, NASA, Instagram, Netflix, and thousands of companies.\n\n"
         "**Exceptions**:\n"
         "• Want to build mobile apps? → Swift (iOS) or Kotlin (Android)\n"
         "• Want to build websites? → HTML/CSS then JavaScript\n"
         "• Interested in embedded systems? → C or C++\n\n"
         "Start with Python, get confident, then branch out based on where you want to go."
     )},

    # Study techniques
    {"keywords": ["study", "how to study", "learn faster", "memorize", "exam", "preparation", "technique", "method", "better", "effective"],
     "question": "What are the most effective study techniques?",
     "answer": (
         "Evidence-based techniques that actually work:\n\n"
         "1. **Active Recall**: Test yourself instead of re-reading. Use flashcards (Anki).\n"
         "2. **Spaced Repetition**: Review material at increasing intervals — day 1, day 3, day 7.\n"
         "3. **The Feynman Technique**: Explain the concept simply as if teaching a 12-year-old. Gaps in explanation = gaps in understanding.\n"
         "4. **Pomodoro Method**: 25 minutes of focused work, 5-minute break. Repeat.\n"
         "5. **Interleaving**: Mix up different topics instead of blocking one subject at a time.\n\n"
         "Avoid: passive re-reading, highlighting without thinking, and cramming the night before."
     )},

    # Research / PhD
    {"keywords": ["research", "phd", "masters", "postgraduate", "thesis", "dissertation", "graduate school", "academia"],
     "question": "Should I pursue a Master's or PhD? How do I get into research?",
     "answer": (
         "Key questions to ask yourself:\n\n"
         "• **Do you want to go deep into a specific problem?** → PhD might be right.\n"
         "• **Do you want better industry credentials?** → Master's is more efficient.\n"
         "• **Do you want to work in industry soon?** → Strong undergrad + portfolio may be enough.\n\n"
         "**To start research as an undergrad**:\n"
         "1. Email professors in your area of interest — most are happy to have motivated students.\n"
         "2. Read papers on Google Scholar in your field.\n"
         "3. Apply for summer research programs (REU in the US, UROP at MIT, etc.).\n\n"
         "For funded PhDs, your research output and recommendation letters matter more than GPA alone."
     )},

    # Time management
    {"keywords": ["time management", "busy", "overwhelmed", "balance", "stress", "deadlines", "procrastination", "productivity"],
     "question": "How do I manage my time better as a student?",
     "answer": (
         "Three systems that work for students:\n\n"
         "1. **Weekly Planning**: Every Sunday, plan the week. Assign study blocks for each subject.\n"
         "2. **Priority Matrix**: Categorize tasks as Urgent/Important, Important/Not Urgent, etc. Do important before urgent-only.\n"
         "3. **2-Minute Rule**: If a task takes less than 2 minutes, do it now. Stops small tasks from piling up.\n\n"
         "Common traps:\n"
         "• Over-scheduling (leave buffer time between tasks)\n"
         "• Confusing busyness with productivity\n"
         "• Not sleeping enough — sleep deprivation kills retention and problem-solving ability.\n\n"
         "Tools: Notion, Todoist, or even a simple paper planner work well."
     )},

    # Soft skills
    {"keywords": ["soft skills", "communication skills", "interpersonal", "teamwork", "leadership skills", "presentation"],
     "question": "How can I improve my soft skills?",
     "answer": (
         "Soft skills are the most underrated career investment. Here's how to build them:\n\n"
         "• **Communication**: Join a public speaking club (Toastmasters), write regularly, practice presenting.\n"
         "• **Teamwork**: Take on group projects, contribute to open-source, volunteer on teams.\n"
         "• **Leadership**: Lead a student club, organize events, mentor peers.\n"
         "• **Critical Thinking**: Read widely across disciplines, debate ideas, write essays.\n\n"
         "The best way to build soft skills is through real situations — not courses. Put yourself in scenarios where these skills are required."
     )},

    # Job market
    {"keywords": ["job market", "employment", "hired", "get a job", "find job", "career prospects", "demand"],
     "question": "Which careers have the best job market and future prospects?",
     "answer": (
         "Careers with the strongest demand in the next decade (based on current trends):\n\n"
         "🔥 **Very High Demand**: AI/ML Engineer, Cybersecurity Analyst, Data Scientist, Cloud Engineer, Full Stack Developer\n"
         "📈 **High Demand**: UX Designer, Project Manager, Business Analyst, Biomedical Engineer, Instructional Designer\n"
         "⚡ **Emerging**: AI Ethics Researcher, AgriTech Developer, Sustainability Consultant, Quantum Computing Researcher\n\n"
         "Key insight: Roles that combine **domain knowledge + data/AI skills** are the most resilient to automation."
     )},

    # Freelancing
    {"keywords": ["freelance", "freelancing", "remote work", "work from home", "independent", "upwork", "fiverr"],
     "question": "How do I start freelancing as a student?",
     "answer": (
         "You can start freelancing with surprisingly little experience:\n\n"
         "1. **Pick one service**: Don't try to offer everything. Start with one: web design, writing, data entry, video editing.\n"
         "2. **Build 2–3 samples**: Create them yourself if needed — fictional clients are fine for a portfolio.\n"
         "3. **Start on platforms**: Upwork and Fiverr have lower barriers for beginners. Set competitive prices initially.\n"
         "4. **Collect reviews**: First 3–5 reviews are hardest. Do excellent work, communicate proactively.\n"
         "5. **Reinvest**: Use early income to upgrade your skills and tools.\n\n"
         "Most successful freelancers specialize deeply rather than offering generic services."
     )},

    # General academic advice
    {"keywords": ["advice", "tips", "success", "student tips", "academic success", "university tips"],
     "question": "What are the most important pieces of advice for a university student?",
     "answer": (
         "The advice most students wish they'd received earlier:\n\n"
         "1. **Build things outside class**: Projects, apps, essays — your portfolio defines you more than your transcript.\n"
         "2. **Talk to professors**: Office hours are almost always empty. Professors can open enormous doors.\n"
         "3. **Network early**: The people in your class today are your future colleagues and clients.\n"
         "4. **Fail faster**: Try things, expect failure, learn quickly. Comfort is the enemy of growth.\n"
         "5. **Read books, not just textbooks**: The most important ideas in your field live in books, not slides.\n"
         "6. **Take care of your health**: Sleep, exercise, and relationships are not sacrifices — they're performance multipliers."
     )},

    # AI in education
    {"keywords": ["ai", "chatgpt", "artificial intelligence", "tools", "ai tools", "automation"],
     "question": "How should I use AI tools in my studies?",
     "answer": (
         "AI tools like ChatGPT are powerful study companions when used correctly:\n\n"
         "✅ **Good uses**:\n"
         "• Ask it to explain concepts in simpler terms\n"
         "• Generate practice problems and quiz yourself\n"
         "• Debug your code and understand the fix\n"
         "• Get feedback on your writing (then rewrite yourself)\n\n"
         "❌ **Bad uses**:\n"
         "• Submitting AI-generated work as your own\n"
         "• Using it to avoid thinking — you'll learn nothing\n"
         "• Trusting it blindly — AI hallucinates facts\n\n"
         "Think of AI as a very knowledgeable tutor: consult it, but do the thinking yourself."
     )},
]
