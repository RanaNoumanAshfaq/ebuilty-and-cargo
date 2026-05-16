# =========================
# DATA STORAGE
# =========================

COURSES = {
    "ai": [
        {"title": "Python for AI", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Machine Learning", "provider": "Andrew Ng", "link": "https://coursera.org"}
    ],
    "data_science": [
        {"title": "Data Science Bootcamp", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "devops": [
        {"title": "DevOps Fundamentals", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Docker and Kubernetes", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "python": [
        {"title": "Python for Everybody", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Advanced Python", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "javascript": [
        {"title": "JavaScript Basics", "provider": "freeCodeCamp", "link": "https://freecodecamp.org"},
        {"title": "Modern JavaScript", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "java": [
        {"title": "Java Programming", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Spring Boot", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "c": [
        {"title": "C Programming", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "cpp": [
        {"title": "C++ Programming", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "cpp": [
        {"title": "C++ for Beginners", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "machine_learning": [
        {"title": "Machine Learning A-Z", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "deep_learning": [
        {"title": "Deep Learning Specialization", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "flutter": [
        {"title": "Flutter Development Bootcamp", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "unity": [
        {"title": "Unity Game Development", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "docker": [
        {"title": "Docker Essentials", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "kubernetes": [
        {"title": "Kubernetes for Developers", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "ci_cd": [
        {"title": "CI/CD Pipelines", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "cyber_security": [
        {"title": "Cyber Security Fundamentals", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "networking": [
        {"title": "Computer Networking", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Networking Fundamentals", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "web_development": [
        {"title": "Web Development Bootcamp", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "mobile_development": [
        {"title": "Android Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "ar_vr": [
        {"title": "AR/VR Development with Unity", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "XR Developer Course", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "iot": [
        {"title": "IoT Fundamentals", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Internet of Things with Arduino", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "cloud": [
        {"title": "AWS Cloud Practitioner", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Cloud Computing with AWS", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "csharp": [
        {"title": "C# Programming", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "Unity C# Game Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "typescript": [
        {"title": "TypeScript Basics", "provider": "Coursera", "link": "https://coursera.org"},
        {"title": "TypeScript for Web Apps", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "php": [
        {"title": "PHP for Web Development", "provider": "Udemy", "link": "https://udemy.com"},
        {"title": "PHP Backend Development", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "html_css": [
        {"title": "HTML & CSS for Beginners", "provider": "freeCodeCamp", "link": "https://freecodecamp.org"},
        {"title": "Responsive UI Design", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "html_css_js": [
        {"title": "Frontend Engineering with JavaScript", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "frontend_frameworks": [
        {"title": "React / Angular / Vue Frontend", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "nodejs": [
        {"title": "Node.js Backend Development", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "full_stack": [
        {"title": "Full Stack Web Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "rest_api": [
        {"title": "REST API Design", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "pandas": [
        {"title": "Pandas for Data Analysis", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "numpy": [
        {"title": "NumPy for Data Science", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "statistics": [
        {"title": "Statistics for Data Science", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "nlp": [
        {"title": "Natural Language Processing", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "computer_vision": [
        {"title": "Computer Vision with Python", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "ethical_hacking": [
        {"title": "Ethical Hacking", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "firewall": [
        {"title": "Firewall and Network Security", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "cryptography": [
        {"title": "Cryptography Fundamentals", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "soc": [
        {"title": "SOC Analyst Training", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "sql": [
        {"title": "SQL for Data Engineering", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "mysql": [
        {"title": "MySQL Database Administration", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "postgresql": [
        {"title": "PostgreSQL Advanced", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "mongodb": [
        {"title": "MongoDB for Developers", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "database_design": [
        {"title": "Database Design Fundamentals", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "apis": [
        {"title": "API Development with REST", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "android": [
        {"title": "Android App Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "ios": [
        {"title": "iOS App Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "react_native": [
        {"title": "React Native Mobile Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "unreal_engine": [
        {"title": "Unreal Engine Game Development", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "three_d_graphics": [
        {"title": "3D Graphics Programming", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "linux": [
        {"title": "Linux Administration", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "operating_systems": [
        {"title": "Operating Systems Concepts", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "assembly_language": [
        {"title": "Assembly Language Programming", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "computer_architecture": [
        {"title": "Computer Architecture Fundamentals", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "excel": [
        {"title": "Excel for Data Analysis", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "power_bi": [
        {"title": "Power BI for Analysts", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "data_visualization": [
        {"title": "Data Visualization with Power BI", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "business_intelligence": [
        {"title": "Business Intelligence Fundamentals", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "blockchain": [
        {"title": "Blockchain Development", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "smart_contracts": [
        {"title": "Smart Contracts with Solidity", "provider": "Udemy", "link": "https://udemy.com"}
    ],
    "robotics": [
        {"title": "Robotics Engineering", "provider": "Coursera", "link": "https://coursera.org"}
    ],
    "quantum_computing": [
        {"title": "Quantum Computing Basics", "provider": "Coursera", "link": "https://coursera.org"}
    ]
}

INTERNSHIPS = [
    {"title": "AI Intern", "company": "Google", "skills": ["ai", "python"], "link": "https://google.com"},
    {"title": "ML Intern", "company": "Microsoft", "skills": ["ai", "ml"], "link": "https://microsoft.com"},
    {"title": "DevOps Intern", "company": "Amazon", "skills": ["devops", "docker"], "link": "https://amazon.com"},
    {"title": "Python Intern", "company": "TechCorp", "skills": ["python", "data_science"], "link": "https://techcorp.com"},
    {"title": "JavaScript Intern", "company": "WebLtd", "skills": ["javascript", "web_development"], "link": "https://webltd.com"},
    {"title": "Java Intern", "company": "EnterpriseInc", "skills": ["java", "backend"], "link": "https://enterpriseinc.com"},
    {"title": "Cyber Security Intern", "company": "SecureCorp", "skills": ["cyber_security", "networking"], "link": "https://securecorp.com"},
    {"title": "AR/VR Intern", "company": "Meta", "skills": ["ar_vr", "unity"], "link": "https://meta.com"},
    {"title": "IoT Intern", "company": "Samsung", "skills": ["iot", "arduino"], "link": "https://samsung.com"},
    {"title": "Cloud Intern", "company": "AWS", "skills": ["cloud", "aws"], "link": "https://aws.amazon.com"},
    {"title": "C++ Intern", "company": "SystemSoft", "skills": ["cpp", "c"], "link": "https://systemsoft.com"},
    {"title": "Machine Learning Intern", "company": "DataLabs", "skills": ["machine_learning", "python"], "link": "https://datalabs.com"},
    {"title": "Deep Learning Intern", "company": "DeepAI", "skills": ["deep_learning", "ml"], "link": "https://deepai.com"},
    {"title": "Data Science Intern", "company": "InsightCorp", "skills": ["data_science", "statistics"], "link": "https://insightcorp.com"},
    {"title": "Ethical Hacking Intern", "company": "HackLabs", "skills": ["ethical_hacking", "cyber_security"], "link": "https://hacklabs.com"},
    {"title": "Firewall Intern", "company": "NetSecure", "skills": ["firewall", "networking"], "link": "https://netsecure.com"},
    {"title": "Cryptography Intern", "company": "CryptoLabs", "skills": ["cryptography", "security"], "link": "https://cryptolabs.com"},
    {"title": "SOC Intern", "company": "SOCWorks", "skills": ["soc", "cyber_security"], "link": "https://socworks.com"},
    {"title": "CI/CD Intern", "company": "PipelineCo", "skills": ["ci_cd", "devops"], "link": "https://pipelineco.com"},
    {"title": "Docker Intern", "company": "ContainerLabs", "skills": ["docker", "devops"], "link": "https://containerlabs.com"},
    {"title": "Kubernetes Intern", "company": "CloudOrch", "skills": ["kubernetes", "cloud"], "link": "https://cloudorch.com"},
    {"title": "Full Stack Intern", "company": "StackLabs", "skills": ["full_stack", "javascript"], "link": "https://stacklabs.com"},
    {"title": "React Intern", "company": "FrontStack", "skills": ["frontend_frameworks", "javascript"], "link": "https://frontstack.com"},
    {"title": "Node.js Intern", "company": "NodeWorks", "skills": ["nodejs", "backend"], "link": "https://nodeworks.com"},
    {"title": "API Intern", "company": "APICorp", "skills": ["apis", "rest_api"], "link": "https://apicorp.com"},
    {"title": "SQL Intern", "company": "DataBank", "skills": ["sql", "mysql"], "link": "https://databank.com"},
    {"title": "PostgreSQL Intern", "company": "PostgresPro", "skills": ["postgresql", "database_design"], "link": "https://postgrespro.com"},
    {"title": "MongoDB Intern", "company": "NoSQLNet", "skills": ["mongodb", "database_design"], "link": "https://nosqlnet.com"},
    {"title": "Android Intern", "company": "MobileX", "skills": ["android", "java"], "link": "https://mobilex.com"},
    {"title": "iOS Intern", "company": "AppWorks", "skills": ["ios", "swift"], "link": "https://appworks.com"},
    {"title": "Flutter Intern", "company": "FlutterLab", "skills": ["flutter", "dart"], "link": "https://flutterlab.com"},
    {"title": "React Native Intern", "company": "MobileSoft", "skills": ["react_native", "javascript"], "link": "https://mobilesoft.com"},
    {"title": "Unreal Engine Intern", "company": "GameStudio", "skills": ["unreal_engine", "c++"], "link": "https://gamestudio.com"},
    {"title": "Linux Intern", "company": "ServerOps", "skills": ["linux", "operating_systems"], "link": "https://serverops.com"},
    {"title": "Blockchain Intern", "company": "BlockBase", "skills": ["blockchain", "smart_contracts"], "link": "https://blockbase.com"},
    {"title": "Robotics Intern", "company": "RoboCorp", "skills": ["robotics", "embedded"], "link": "https://robocorp.com"},
    {"title": "Quantum Intern", "company": "QuantumX", "skills": ["quantum_computing", "physics"], "link": "https://quantumx.com"},
    {"title": "C# Intern", "company": "Unity", "skills": ["csharp", "unity"], "link": "https://unity.com"},
    {"title": "TypeScript Intern", "company": "TS Labs", "skills": ["typescript", "javascript"], "link": "https://tslabs.com"},
    {"title": "PHP Intern", "company": "LegacyWeb", "skills": ["php", "backend"], "link": "https://legacyweb.com"},
    {"title": "Frontend Intern", "company": "UIWorks", "skills": ["html_css", "html_css_js"], "link": "https://uiworks.com"},
    {"title": "Pandas Intern", "company": "DataLab", "skills": ["pandas", "data_science"], "link": "https://datalab.com"},
    {"title": "NumPy Intern", "company": "ArrayWorks", "skills": ["numpy", "data_science"], "link": "https://arrayworks.com"},
    {"title": "Statistics Intern", "company": "StatCorp", "skills": ["statistics", "data_science"], "link": "https://statcorp.com"},
    {"title": "NLP Intern", "company": "LinguaAI", "skills": ["nlp", "machine_learning"], "link": "https://linguaai.com"},
    {"title": "Computer Vision Intern", "company": "VisionAI", "skills": ["computer_vision", "deep_learning"], "link": "https://visionai.com"},
    {"title": "HTML/CSS Intern", "company": "DesignLab", "skills": ["html_css", "web_development"], "link": "https://designlab.com"},
    {"title": "Business Intelligence Intern", "company": "BIWorks", "skills": ["business_intelligence", "data_visualization"], "link": "https://biworks.com"},
    {"title": "3D Graphics Intern", "company": "RenderWorks", "skills": ["three_d_graphics", "unreal_engine"], "link": "https://renderworks.com"},
    {"title": "Assembly Language Intern", "company": "CoreSystems", "skills": ["assembly_language", "embedded"], "link": "https://coresystems.com"},
    {"title": "Computer Architecture Intern", "company": "ChipLab", "skills": ["computer_architecture", "hardware"], "link": "https://chiplab.com"},
    {"title": "Excel Intern", "company": "SheetWorks", "skills": ["excel", "data_visualization"], "link": "https://sheetworks.com"},
    {"title": "Power BI Intern", "company": "BIDynamics", "skills": ["power_bi", "business_intelligence"], "link": "https://bidynamics.com"}
]

LEARNING_LINKS = {
    "ai": [
        {"title": "AI For Everyone", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "Deep Learning Specialization", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "AI YouTube Channel", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "data_science": [
        {"title": "Data Science Specialization", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "Python for Data Science", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "devops": [
        {"title": "DevOps on AWS", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "Jenkins CI/CD", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "python": [
        {"title": "Python Tutorials", "platform": "YouTube", "link": "https://youtube.com"},
        {"title": "Python Certification", "platform": "Coursera", "link": "https://coursera.org"}
    ],
    "c": [
        {"title": "C Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "cpp": [
        {"title": "C++ Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "javascript": [
        {"title": "JavaScript MDN", "platform": "Mozilla", "link": "https://developer.mozilla.org"},
        {"title": "JS YouTube", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "java": [
        {"title": "Java Oracle Tutorials", "platform": "Oracle", "link": "https://oracle.com"},
        {"title": "Java YouTube", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "cyber_security": [
        {"title": "Cyber Security Course", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "Hacking Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "networking": [
        {"title": "Networking Fundamentals", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "Computer Networks YouTube", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "web_development": [
        {"title": "HTML/CSS/JS", "platform": "freeCodeCamp", "link": "https://freecodecamp.org"},
        {"title": "Web Dev YouTube", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "ar_vr": [
        {"title": "AR/VR Tutorials", "platform": "YouTube", "link": "https://youtube.com"},
        {"title": "XR Development Guide", "platform": "Unity", "link": "https://unity.com"}
    ],
    "iot": [
        {"title": "IoT Projects", "platform": "YouTube", "link": "https://youtube.com"},
        {"title": "IoT Certification", "platform": "Coursera", "link": "https://coursera.org"}
    ],
    "cloud": [
        {"title": "AWS Cloud Certification", "platform": "Coursera", "link": "https://coursera.org"},
        {"title": "AWS Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "machine_learning": [
        {"title": "Machine Learning Resources", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "deep_learning": [
        {"title": "Deep Learning Resources", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "docker": [
        {"title": "Docker Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "kubernetes": [
        {"title": "Kubernetes Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "ci_cd": [
        {"title": "CI/CD Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "flutter": [
        {"title": "Flutter Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "unity": [
        {"title": "Unity Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "csharp": [
        {"title": "C# Tutorials", "platform": "YouTube", "link": "https://youtube.com"},
        {"title": "C# for Unity", "platform": "Coursera", "link": "https://coursera.org"}
    ],
    "typescript": [
        {"title": "TypeScript Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "php": [
        {"title": "PHP Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "html_css": [
        {"title": "HTML & CSS Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "html_css_js": [
        {"title": "Frontend Engineering Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "frontend_frameworks": [
        {"title": "React / Angular / Vue Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "nodejs": [
        {"title": "Node.js Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "full_stack": [
        {"title": "Full Stack Developer Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "rest_api": [
        {"title": "REST API Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "pandas": [
        {"title": "Pandas Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "numpy": [
        {"title": "NumPy Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "statistics": [
        {"title": "Statistics Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "nlp": [
        {"title": "NLP Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "computer_vision": [
        {"title": "Computer Vision Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "ethical_hacking": [
        {"title": "Ethical Hacking Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "firewall": [
        {"title": "Firewall Security Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "cryptography": [
        {"title": "Cryptography Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "soc": [
        {"title": "SOC Analyst Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "sql": [
        {"title": "SQL Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "mysql": [
        {"title": "MySQL Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "postgresql": [
        {"title": "PostgreSQL Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "mongodb": [
        {"title": "MongoDB Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "database_design": [
        {"title": "Database Design Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "apis": [
        {"title": "API Development Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "android": [
        {"title": "Android Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "ios": [
        {"title": "iOS Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "react_native": [
        {"title": "React Native Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "unreal_engine": [
        {"title": "Unreal Engine Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "three_d_graphics": [
        {"title": "3D Graphics Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "linux": [
        {"title": "Linux Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "operating_systems": [
        {"title": "Operating Systems Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "assembly_language": [
        {"title": "Assembly Language Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "computer_architecture": [
        {"title": "Computer Architecture Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "excel": [
        {"title": "Excel Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "power_bi": [
        {"title": "Power BI Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "data_visualization": [
        {"title": "Data Visualization Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "business_intelligence": [
        {"title": "Business Intelligence Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "blockchain": [
        {"title": "Blockchain Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "smart_contracts": [
        {"title": "Smart Contracts Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "robotics": [
        {"title": "Robotics Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ],
    "quantum_computing": [
        {"title": "Quantum Computing Tutorials", "platform": "YouTube", "link": "https://youtube.com"}
    ]
}