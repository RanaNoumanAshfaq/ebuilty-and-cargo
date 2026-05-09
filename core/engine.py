# ============================================================
#  engine.py
#  Rule-based inference engine — the brain of the AI
# ============================================================

import re
import sys
import os

# Allow importing from sibling packages
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.knowledge_base import (
    SYNONYM_MAP, INTEREST_TAGS, COURSES, CAREERS, FAQS
)


# ──────────────────────────────────────────────────────────────
# LAYER 1 — Input Classification
# ──────────────────────────────────────────────────────────────

# Trigger words that classify the intent of a user message
INTENT_PATTERNS = {
    "course_recommendation": [
        "course", "learn", "study", "subject", "recommend", "suggest",
        "classes", "learning", "tutorial", "certificate", "degree",
        "what should i study", "how to learn", "where to learn", "resources"
    ],
    "career_guidance": [
        "career", "job", "work", "profession", "future", "salary",
        "occupation", "role", "hire", "employment", "what can i become",
        "what job", "career path", "after graduation", "income", "earning"
    ],
    "faq": [
        "gpa", "internship", "scholarship", "study tips", "how to study",
        "major", "degree", "phd", "masters", "graduate", "freelance",
        "time management", "soft skills", "job market", "online course",
        "programming language", "advice", "tips", "ai tools", "chatgpt",
        "which language", "how do i", "should i", "what is", "explain",
        "tell me", "can you help", "difference between", "study better", "study technique"
    ],
    "greeting": [
        "hi", "hello", "hey", "good morning", "good afternoon",
        "good evening", "greetings", "howdy", "sup", "what's up"
    ],
    "goodbye": [
        "bye", "goodbye", "see you", "exit", "quit", "thanks",
        "thank you", "that's all", "nothing else", "no more"
    ],
    "help": [
        "help", "what can you do", "what do you do", "capabilities",
        "how does this work", "menu", "options"
    ]
}


def classify_intent(text: str) -> str:
    """
    Layer 1: Determine what the user is asking for.
    Returns one of: course_recommendation, career_guidance, faq,
                    greeting, goodbye, help, or unknown.
    """
    text_lower = text.lower().strip()

    # Check each intent's trigger words
    scores = {intent: 0 for intent in INTENT_PATTERNS}
    for intent, triggers in INTENT_PATTERNS.items():
        for trigger in triggers:
            if trigger in text_lower:
                scores[intent] += 1

    best_intent = max(scores, key=scores.get)

    # Only accept if at least one trigger matched
    if scores[best_intent] > 0:
        return best_intent
    return "unknown"


# ──────────────────────────────────────────────────────────────
# LAYER 2 — Domain Matching (interest extraction)
# ──────────────────────────────────────────────────────────────

def preprocess(text: str) -> str:
    """Lowercase, strip punctuation, normalize whitespace."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)  # remove punctuation
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_interests(text: str) -> list:
    """
    Layer 2: Map user words to canonical interest tags.
    Returns a list of matched canonical tags (deduplicated, ordered by confidence).
    Strategy: check multi-word synonyms first, then single words.
    """
    cleaned = preprocess(text)
    found = {}  # tag → count (confidence proxy)

    # Pass 1: Multi-word phrases (e.g., "machine learning", "data science")
    for phrase, canonical in SYNONYM_MAP.items():
        if " " in phrase and phrase in cleaned:
            found[canonical] = found.get(canonical, 0) + 2  # higher weight

    # Pass 2: Single-word synonyms
    words = cleaned.split()
    for word in words:
        if word in SYNONYM_MAP:
            canonical = SYNONYM_MAP[word]
            found[canonical] = found.get(canonical, 0) + 1

    # Pass 3: Direct tag matches (user types the exact tag name)
    for tag in INTEREST_TAGS:
        tag_clean = tag.replace("_", " ")
        if tag_clean in cleaned or tag in words:
            found[tag] = found.get(tag, 0) + 3  # highest confidence

    # Sort by confidence descending, return tag names
    sorted_tags = sorted(found, key=found.get, reverse=True)
    return sorted_tags  # may be empty if no matches found


# ──────────────────────────────────────────────────────────────
# LAYER 3 — Output Selection
# ──────────────────────────────────────────────────────────────

def get_courses(interests: list, max_per_interest: int = 3) -> dict:
    """
    Layer 3a: Look up courses for matched interests.
    Returns dict: {interest_tag: [course_dict, ...]}
    """
    result = {}
    for tag in interests[:3]:  # top 3 interests max
        if tag in COURSES:
            result[tag] = COURSES[tag][:max_per_interest]
    return result


def get_careers(interests: list, max_per_interest: int = 3) -> dict:
    """
    Layer 3b: Look up career paths for matched interests.
    Returns dict: {interest_tag: [career_dict, ...]}
    """
    result = {}
    for tag in interests[:3]:
        if tag in CAREERS:
            result[tag] = CAREERS[tag][:max_per_interest]
    return result


def get_faq_answer(text: str) -> dict | None:
    """
    Layer 3c: Find best matching FAQ entry.
    Uses keyword hit-counting to rank FAQ matches.
    Returns the best matching FAQ dict or None.
    """
    cleaned = preprocess(text)
    words = set(cleaned.split())

    best_score = 0
    best_faq = None

    for faq in FAQS:
        score = sum(1 for kw in faq["keywords"] if kw in cleaned or kw in words)
        if score > best_score:
            best_score = score
            best_faq = faq

    if best_score > 0:
        return best_faq
    return None


# ──────────────────────────────────────────────────────────────
# Main Response Generator  (combines all layers)
# ──────────────────────────────────────────────────────────────

def generate_response(user_input: str) -> dict:
    """
    Full pipeline:
      1. Classify intent
      2. Extract interests (if relevant)
      3. Look up outputs
      4. Return structured response dict

    Response dict structure:
      {
        "intent": str,
        "interests": [str],
        "courses": {tag: [course_dict]},       # for course intent
        "careers": {tag: [career_dict]},        # for career intent
        "faq": faq_dict | None,                 # for faq intent
        "message": str,                         # plain-text message
        "type": "courses" | "careers" | "faq" | "greeting" | "help" | "unknown"
      }
    """
    response = {
        "intent": "",
        "interests": [],
        "courses": {},
        "careers": {},
        "faq": None,
        "message": "",
        "type": ""
    }

    if not user_input or not user_input.strip():
        response["type"] = "unknown"
        response["message"] = "Please type your question or what you'd like to explore."
        return response

    intent = classify_intent(user_input)
    response["intent"] = intent

    # ── Greeting ──
    if intent == "greeting":
        response["type"] = "greeting"
        response["message"] = (
            "Hello! 👋 I'm your Education Assistant AI.\n\n"
            "I can help you with:\n"
            "• 📚 Course recommendations based on your interests\n"
            "• 🎯 Career path guidance\n"
            "• ❓ Academic FAQs (GPA, internships, scholarships, study tips...)\n\n"
            "Try asking something like:\n"
            "  -> 'I am interested in programming and data science'\n"
            "  -> 'What careers suit someone who likes design?'\n"
            "  -> 'How do I get an internship with no experience?'"
        )
        return response

    # ── Help ──
    if intent == "help":
        response["type"] = "help"
        response["message"] = (
            "Here's what I can do:\n\n"
            "📚 **Course Recommendations**\n"
            "  Tell me your interests and I'll suggest real online courses.\n"
            "  Example: 'I like AI and mathematics' or 'Recommend web development courses'\n\n"
            "🎯 **Career Guidance**\n"
            "  Describe your interests and I'll show matching career paths with salary info.\n"
            "  Example: 'What jobs can I get with a background in cybersecurity?'\n\n"
            "❓ **Academic FAQs**\n"
            "  Ask anything about student life, studying, and career decisions.\n"
            "  Example: 'How important is GPA?', 'Which programming language should I learn first?'\n\n"
            "You can combine these too — just type naturally!"
        )
        return response

    # ── Goodbye ──
    if intent == "goodbye":
        response["type"] = "goodbye"
        response["message"] = (
            "Thanks for using Education Assistant AI! 🎓\n"
            "Best of luck with your studies and career journey. "
            "Feel free to come back anytime. Goodbye! 👋"
        )
        return response

    # ── FAQ: Try FAQ first regardless of intent if keywords match strongly ──
    faq = get_faq_answer(user_input)

    # ── Course Recommendation ──
    if intent == "course_recommendation":
        interests = extract_interests(user_input)
        response["interests"] = interests
        if interests:
            courses = get_courses(interests)
            response["courses"] = courses
            response["type"] = "courses"
            tags_str = ", ".join(i.replace("_", " ").title() for i in interests[:3])
            response["message"] = f"Here are course recommendations based on your interests: **{tags_str}**"
        else:
            # No interests detected — try to answer as FAQ or ask for clarification
            if faq:
                response["faq"] = faq
                response["type"] = "faq"
                response["message"] = faq["answer"]
            else:
                response["type"] = "unknown"
                response["message"] = (
                    "I'd love to recommend courses, but I couldn't identify a specific subject area from your message.\n\n"
                    "Try being more specific, like:\n"
                    "• 'Recommend courses in programming'\n"
                    "• 'I want to learn data science and mathematics'\n"
                    "• 'Courses for web development'"
                )
        return response

    # ── Career Guidance ──
    if intent == "career_guidance":
        interests = extract_interests(user_input)
        response["interests"] = interests
        if interests:
            careers = get_careers(interests)
            response["careers"] = careers
            response["type"] = "careers"
            tags_str = ", ".join(i.replace("_", " ").title() for i in interests[:3])
            response["message"] = f"Here are career paths that align with your interests: **{tags_str}**"
        else:
            if faq:
                response["faq"] = faq
                response["type"] = "faq"
                response["message"] = faq["answer"]
            else:
                response["type"] = "unknown"
                response["message"] = (
                    "I can guide you on career paths, but I need to know your interests first.\n\n"
                    "Try:\n"
                    "• 'What careers are available for someone interested in AI?'\n"
                    "• 'I like design and business — what jobs suit me?'\n"
                    "• 'Career paths in cybersecurity'"
                )
        return response

    # ── FAQ Intent ──
    if intent == "faq":
        if faq:
            response["faq"] = faq
            response["type"] = "faq"
            response["message"] = faq["answer"]
        else:
            # Try extracting interests anyway and offer courses/careers
            interests = extract_interests(user_input)
            if interests:
                response["interests"] = interests
                response["courses"] = get_courses(interests, max_per_interest=2)
                response["careers"] = get_careers(interests, max_per_interest=2)
                response["type"] = "combined"
                response["message"] = "I found relevant information based on your question:"
            else:
                response["type"] = "unknown"
                response["message"] = (
                    "I'm not sure how to answer that specific question yet. "
                    "Try rephrasing or ask about:\n"
                    "• A subject you're interested in\n"
                    "• A career you're curious about\n"
                    "• A student challenge (GPA, internships, time management...)"
                )
        return response

    # ── Unknown ── (fallback: try everything)
    interests = extract_interests(user_input)
    response["interests"] = interests

    if faq:
        response["faq"] = faq
        response["type"] = "faq"
        response["message"] = faq["answer"]
        return response

    if interests:
        response["courses"] = get_courses(interests)
        response["careers"] = get_careers(interests)
        response["type"] = "combined"
        tags_str = ", ".join(i.replace("_", " ").title() for i in interests[:3])
        response["message"] = f"Based on your message, here's what I found related to: **{tags_str}**"
        return response

    # Absolute fallback
    response["type"] = "unknown"
    response["message"] = (
        "I couldn't quite understand your request. Here are some things I can help with:\n\n"
        "• Type an interest: 'I like programming' or 'I enjoy biology'\n"
        "• Ask for career advice: 'What jobs can I get with data science skills?'\n"
        "• Ask an academic question: 'How do I prepare for exams?'\n"
        "• Type 'help' to see all my capabilities."
    )
    return response
