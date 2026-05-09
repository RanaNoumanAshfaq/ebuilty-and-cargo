#!/usr/bin/env python3
# ============================================================
#  cli.py
#  Education Assistant AI — Command Line Interface
#  Run this if you don't have a display / prefer terminal
# ============================================================

import sys
import os
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.engine import generate_response

# ANSI Colors
class C:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    BLUE    = "\033[94m"
    CYAN    = "\033[96m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    MAGENTA = "\033[95m"
    RED     = "\033[91m"
    GREY    = "\033[90m"
    WHITE   = "\033[97m"
    BG_DARK = "\033[40m"


def header():
    print(f"\n{C.BLUE}{'═'*60}{C.RESET}")
    print(f"{C.BOLD}{C.WHITE}  🎓 EDUCATION ASSISTANT AI{C.RESET}")
    print(f"{C.GREY}  Rule-Based Academic Guidance System{C.RESET}")
    print(f"{C.BLUE}{'═'*60}{C.RESET}\n")


def divider():
    print(f"{C.GREY}{'─'*60}{C.RESET}")


def print_courses(courses: dict):
    for interest, course_list in courses.items():
        label = interest.replace("_", " ").upper()
        print(f"\n  {C.CYAN}{C.BOLD}📚 {label} COURSES{C.RESET}")
        print(f"  {C.CYAN}{'─'*40}{C.RESET}")
        for i, course in enumerate(course_list, 1):
            level_map = {"Beginner": C.GREEN, "Intermediate": C.YELLOW, "Advanced": C.RED}
            level_color = level_map.get(course.get("level", ""), C.GREY)
            print(f"\n  {C.WHITE}{C.BOLD}{i}. {course['title']}{C.RESET} "
                  f"[{level_color}{course.get('level','')}{C.RESET}]")
            print(f"     {C.GREY}by {course['provider']}{C.RESET}")
            print(f"     {course['description']}")
            print(f"     {C.BLUE}🔗 {course.get('url','')}{C.RESET}")


def print_careers(careers: dict):
    for interest, career_list in careers.items():
        label = interest.replace("_", " ").upper()
        print(f"\n  {C.GREEN}{C.BOLD}🎯 {label} CAREERS{C.RESET}")
        print(f"  {C.GREEN}{'─'*40}{C.RESET}")
        for i, career in enumerate(career_list, 1):
            print(f"\n  {C.WHITE}{C.BOLD}{i}. {career['title']}{C.RESET} "
                  f"{C.YELLOW}| {career['avg_salary']}{C.RESET}")
            print(f"     {career['description']}")
            skills = " · ".join(career.get("skills_needed", []))
            print(f"     {C.GREY}Skills: {skills}{C.RESET}")
            growth = career.get("growth", "")
            growth_colors = {"Very High": C.GREEN, "High": C.CYAN,
                             "Moderate": C.YELLOW, "Low": C.RED}
            g_color = growth_colors.get(growth, C.GREY)
            print(f"     Growth: {g_color}{growth}{C.RESET}")


def print_response(response: dict):
    divider()

    # Print main message
    if response["message"]:
        # Format bold markers
        msg = response["message"]
        while "**" in msg:
            start = msg.index("**")
            end = msg.index("**", start + 2)
            msg = msg[:start] + C.BOLD + C.CYAN + msg[start+2:end] + C.RESET + msg[end+2:]
        print(f"\n{C.MAGENTA}🎓 EduAI:{C.RESET}\n")
        for line in msg.split("\n"):
            print(f"  {line}")

    # Print structured data
    if response.get("courses"):
        print_courses(response["courses"])

    if response.get("careers"):
        print_careers(response["careers"])

    print()


def main():
    header()
    print(f"{C.GREY}  Type your question and press Enter.{C.RESET}")
    print(f"{C.GREY}  Type 'quit' or 'exit' to close.{C.RESET}\n")

    # Show welcome
    welcome = generate_response("hello")
    print_response(welcome)

    while True:
        try:
            user_input = input(f"{C.BLUE}{C.BOLD}  You: {C.RESET}").strip()
        except (KeyboardInterrupt, EOFError):
            print(f"\n{C.GREY}  Goodbye! 👋{C.RESET}\n")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "q"):
            response = generate_response("bye")
            print_response(response)
            break

        # Thinking indicator
        print(f"  {C.GREY}thinking...{C.RESET}", end="\r")
        time.sleep(0.2)
        print("                ", end="\r")

        response = generate_response(user_input)
        print_response(response)


if __name__ == "__main__":
    main()
