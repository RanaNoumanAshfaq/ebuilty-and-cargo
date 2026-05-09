# ============================================================
#  gui.py
#  Education Assistant AI — Tkinter GUI
#  Design: Dark academic / editorial aesthetic
# ============================================================

import sys
import os
import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import time
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.engine import generate_response

# ──────────────────────────────────────────────────────────────
# THEME / DESIGN TOKENS
# ──────────────────────────────────────────────────────────────
THEME = {
    "bg_dark":        "#0f1117",   # deep navy-black background
    "bg_panel":       "#161b27",   # slightly lighter panels
    "bg_input":       "#1e2538",   # input field background
    "bg_bubble_user": "#2a3a6b",   # user message bubble
    "bg_bubble_bot":  "#1a2235",   # bot message bubble
    "accent":         "#4f9cf9",   # electric blue accent
    "accent_green":   "#3dd68c",   # success / career green
    "accent_amber":   "#f4a832",   # warning / highlight amber
    "accent_purple":  "#a78bfa",   # FAQ / info purple
    "text_primary":   "#e8eaf6",   # main text
    "text_secondary": "#8892a4",   # muted text
    "text_heading":   "#ffffff",   # bright headings
    "border":         "#2a3350",   # subtle borders
    "tag_course":     "#1e3a5f",   # course tag background
    "tag_career":     "#1a3a2a",   # career tag background
    "font_heading":   ("Georgia", 16, "bold"),
    "font_body":      ("Consolas", 11),
    "font_small":     ("Consolas", 9),
    "font_title":     ("Georgia", 22, "bold"),
    "font_label":     ("Consolas", 10, "bold"),
}

# ──────────────────────────────────────────────────────────────
# MAIN APP
# ──────────────────────────────────────────────────────────────

class EducationAI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Education Assistant AI")
        self.geometry("1050x750")
        self.minsize(800, 600)
        self.configure(bg=THEME["bg_dark"])

        # State
        self.chat_history = []
        self._typing_after = None

        self._build_layout()
        self._show_welcome()

    # ──────────────────────────────────────
    # Layout Construction
    # ──────────────────────────────────────

    def _build_layout(self):
        """Build the 3-column layout: sidebar | chat | info panel."""

        # ── Root grid ──
        self.columnconfigure(0, weight=0)  # sidebar
        self.columnconfigure(1, weight=1)  # chat (expands)
        self.columnconfigure(2, weight=0)  # info panel
        self.rowconfigure(0, weight=1)

        self._build_sidebar()
        self._build_chat_area()
        self._build_info_panel()

    # ── SIDEBAR ──────────────────────────
    def _build_sidebar(self):
        sidebar = tk.Frame(self, bg=THEME["bg_panel"], width=200)
        sidebar.grid(row=0, column=0, sticky="nsew")
        sidebar.grid_propagate(False)

        # Logo area
        logo_frame = tk.Frame(sidebar, bg=THEME["bg_panel"], pady=20)
        logo_frame.pack(fill="x")

        tk.Label(logo_frame, text="🎓", font=("Segoe UI Emoji", 28),
                 bg=THEME["bg_panel"], fg=THEME["accent"]).pack()
        tk.Label(logo_frame, text="EduAI", font=THEME["font_title"],
                 bg=THEME["bg_panel"], fg=THEME["text_heading"]).pack()
        tk.Label(logo_frame, text="Academic Assistant",
                 font=THEME["font_small"], bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"]).pack()

        # Divider
        tk.Frame(sidebar, bg=THEME["border"], height=1).pack(fill="x", padx=15, pady=5)

        # Quick action buttons
        tk.Label(sidebar, text="QUICK ACTIONS",
                 font=("Consolas", 8, "bold"), bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"]).pack(anchor="w", padx=15, pady=(10, 5))

        quick_actions = [
            ("📚  Course Recs", "recommend courses for programming"),
            ("🎯  Career Paths", "what careers suit someone who likes AI"),
            ("📊  Data Science", "I want to learn data science"),
            ("💼  Internships", "how do I get an internship"),
            ("📈  Job Market", "which careers have the best job market"),
            ("🎓  Study Tips", "how to study better for exams"),
            ("💰  Scholarships", "how can I find scholarships"),
            ("🤖  AI & ML", "courses for artificial intelligence"),
        ]

        for label, query in quick_actions:
            btn = tk.Button(
                sidebar, text=label, anchor="w",
                font=("Consolas", 10), bg=THEME["bg_panel"],
                fg=THEME["text_primary"], relief="flat",
                activebackground=THEME["bg_input"],
                activeforeground=THEME["accent"],
                cursor="hand2", padx=15, pady=4,
                command=lambda q=query: self._quick_query(q)
            )
            btn.pack(fill="x")
            btn.bind("<Enter>", lambda e, b=btn: b.config(bg=THEME["bg_input"], fg=THEME["accent"]))
            btn.bind("<Leave>", lambda e, b=btn: b.config(bg=THEME["bg_panel"], fg=THEME["text_primary"]))

        # Divider
        tk.Frame(sidebar, bg=THEME["border"], height=1).pack(fill="x", padx=15, pady=10)

        # Stats frame at bottom
        stats_frame = tk.Frame(sidebar, bg=THEME["bg_panel"])
        stats_frame.pack(fill="x", padx=15, pady=5, side="bottom")

        tk.Label(stats_frame, text="SYSTEM INFO",
                 font=("Consolas", 8, "bold"), bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"]).pack(anchor="w")
        tk.Label(stats_frame, text="Type: Rule-Based AI",
                 font=THEME["font_small"], bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"]).pack(anchor="w")
        tk.Label(stats_frame, text="Lang: Python",
                 font=THEME["font_small"], bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"]).pack(anchor="w")

        self.msg_count_label = tk.Label(stats_frame, text="Messages: 0",
                 font=THEME["font_small"], bg=THEME["bg_panel"],
                 fg=THEME["text_secondary"])
        self.msg_count_label.pack(anchor="w")

    # ── CHAT AREA ────────────────────────
    def _build_chat_area(self):
        chat_wrapper = tk.Frame(self, bg=THEME["bg_dark"])
        chat_wrapper.grid(row=0, column=1, sticky="nsew")
        chat_wrapper.columnconfigure(0, weight=1)
        chat_wrapper.rowconfigure(0, weight=1)
        chat_wrapper.rowconfigure(1, weight=0)

        # Chat display (canvas + scrollbar)
        chat_frame = tk.Frame(chat_wrapper, bg=THEME["bg_dark"])
        chat_frame.grid(row=0, column=0, sticky="nsew")
        chat_frame.columnconfigure(0, weight=1)
        chat_frame.rowconfigure(0, weight=1)

        self.canvas = tk.Canvas(chat_frame, bg=THEME["bg_dark"],
                                highlightthickness=0, bd=0)
        scrollbar = ttk.Scrollbar(chat_frame, orient="vertical",
                                  command=self.canvas.yview)
        self.canvas.configure(yscrollcommand=scrollbar.set)

        scrollbar.grid(row=0, column=1, sticky="ns")
        self.canvas.grid(row=0, column=0, sticky="nsew")

        self.messages_frame = tk.Frame(self.canvas, bg=THEME["bg_dark"])
        self.canvas_window = self.canvas.create_window(
            (0, 0), window=self.messages_frame, anchor="nw"
        )

        self.messages_frame.bind("<Configure>", self._on_frame_configure)
        self.canvas.bind("<Configure>", self._on_canvas_configure)
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)

        # ── Typing indicator ──
        self.typing_frame = tk.Frame(chat_wrapper, bg=THEME["bg_dark"], height=30)
        self.typing_frame.grid(row=1, column=0, sticky="ew", padx=10)
        self.typing_label = tk.Label(self.typing_frame, text="",
                                     font=("Consolas", 9, "italic"),
                                     bg=THEME["bg_dark"], fg=THEME["text_secondary"])
        self.typing_label.pack(side="left")

        # ── Input area ──
        input_outer = tk.Frame(chat_wrapper, bg=THEME["bg_panel"], pady=12)
        input_outer.grid(row=2, column=0, sticky="ew")
        input_outer.columnconfigure(0, weight=1)

        input_inner = tk.Frame(input_outer, bg=THEME["bg_input"],
                               highlightbackground=THEME["border"],
                               highlightthickness=1)
        input_inner.pack(fill="x", padx=12, pady=0)
        input_inner.columnconfigure(0, weight=1)

        self.input_var = tk.StringVar()
        self.input_field = tk.Entry(
            input_inner, textvariable=self.input_var,
            font=("Consolas", 12), bg=THEME["bg_input"],
            fg=THEME["text_primary"], relief="flat",
            insertbackground=THEME["accent"],
            bd=10
        )
        self.input_field.grid(row=0, column=0, sticky="ew")
        self.input_field.bind("<Return>", self._on_send)
        self.input_field.bind("<KeyRelease>", self._on_key_release)

        send_btn = tk.Button(
            input_inner, text="Send  ↵",
            font=("Consolas", 10, "bold"),
            bg=THEME["accent"], fg=THEME["bg_dark"],
            activebackground="#3a7fd9",
            activeforeground=THEME["bg_dark"],
            relief="flat", bd=0, padx=14, pady=8,
            cursor="hand2",
            command=self._on_send
        )
        send_btn.grid(row=0, column=1, padx=(0, 0))

        # Hint text
        hint = tk.Label(input_outer,
                        text="↑ Ask about courses, careers, or any academic question",
                        font=("Consolas", 8), bg=THEME["bg_panel"],
                        fg=THEME["text_secondary"])
        hint.pack(pady=(4, 0))

    # ── INFO PANEL ───────────────────────
    def _build_info_panel(self):
        self.info_panel = tk.Frame(self, bg=THEME["bg_panel"], width=260)
        self.info_panel.grid(row=0, column=2, sticky="nsew")
        self.info_panel.grid_propagate(False)
        self.info_panel.columnconfigure(0, weight=1)

        # Header
        header = tk.Frame(self.info_panel, bg=THEME["bg_panel"], pady=15)
        header.pack(fill="x")
        tk.Label(header, text="ℹ  Details",
                 font=THEME["font_heading"],
                 bg=THEME["bg_panel"], fg=THEME["text_heading"]).pack(padx=15, anchor="w")

        tk.Frame(self.info_panel, bg=THEME["border"], height=1).pack(fill="x", padx=10)

        # Scrollable content area
        self.info_canvas = tk.Canvas(self.info_panel, bg=THEME["bg_panel"],
                                     highlightthickness=0)
        info_scrollbar = ttk.Scrollbar(self.info_panel, orient="vertical",
                                       command=self.info_canvas.yview)
        self.info_canvas.configure(yscrollcommand=info_scrollbar.set)

        info_scrollbar.pack(side="right", fill="y")
        self.info_canvas.pack(side="left", fill="both", expand=True)

        self.info_content = tk.Frame(self.info_canvas, bg=THEME["bg_panel"])
        self.info_canvas_window = self.info_canvas.create_window(
            (0, 0), window=self.info_content, anchor="nw"
        )

        self.info_content.bind("<Configure>", lambda e: self.info_canvas.configure(
            scrollregion=self.info_canvas.bbox("all")))
        self.info_canvas.bind("<Configure>", lambda e: self.info_canvas.itemconfig(
            self.info_canvas_window, width=e.width))

        # Default content
        self._show_info_default()

    # ──────────────────────────────────────
    # Canvas Scroll Helpers
    # ──────────────────────────────────────

    def _on_frame_configure(self, event=None):
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def _on_canvas_configure(self, event):
        self.canvas.itemconfig(self.canvas_window, width=event.width)

    def _on_mousewheel(self, event):
        self.canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

    def _scroll_to_bottom(self):
        self.canvas.update_idletasks()
        self.canvas.yview_moveto(1.0)

    # ──────────────────────────────────────
    # Welcome Message
    # ──────────────────────────────────────

    def _show_welcome(self):
        self._add_bot_message(
            "Hello! 👋 I'm your **Education Assistant AI**.\n\n"
            "I can help you with:\n"
            "  📚 Course recommendations (tell me your interests)\n"
            "  🎯 Career path guidance (what jobs match your skills)\n"
            "  ❓ Academic FAQs (GPA, internships, study tips...)\n\n"
            "Type your question below, or click a quick action →"
        )

    # ──────────────────────────────────────
    # Message Rendering
    # ──────────────────────────────────────

    def _add_user_message(self, text: str):
        outer = tk.Frame(self.messages_frame, bg=THEME["bg_dark"])
        outer.pack(fill="x", padx=12, pady=(6, 2))

        # Right-aligned bubble
        bubble_wrapper = tk.Frame(outer, bg=THEME["bg_dark"])
        bubble_wrapper.pack(side="right")

        bubble = tk.Frame(bubble_wrapper, bg=THEME["bg_bubble_user"],
                          padx=14, pady=10)
        bubble.pack(side="right")

        label = tk.Label(bubble, text=text, wraplength=420,
                         font=("Consolas", 11), bg=THEME["bg_bubble_user"],
                         fg=THEME["text_primary"], justify="left")
        label.pack()

        # Sender label
        tk.Label(outer, text="You",
                 font=("Consolas", 8, "bold"), bg=THEME["bg_dark"],
                 fg=THEME["accent"]).pack(side="right", padx=5, pady=(0, 2))

        self._scroll_to_bottom()

    def _add_bot_message(self, text: str, response_data: dict = None):
        outer = tk.Frame(self.messages_frame, bg=THEME["bg_dark"])
        outer.pack(fill="x", padx=12, pady=(2, 6))

        # Bot avatar
        avatar = tk.Label(outer, text="🎓", font=("Segoe UI Emoji", 14),
                          bg=THEME["bg_dark"], fg=THEME["accent"])
        avatar.pack(side="left", anchor="n", padx=(0, 8), pady=4)

        content_wrapper = tk.Frame(outer, bg=THEME["bg_dark"])
        content_wrapper.pack(side="left", fill="x", expand=True)

        # Sender label
        tk.Label(content_wrapper, text="EduAI",
                 font=("Consolas", 8, "bold"), bg=THEME["bg_dark"],
                 fg=THEME["accent_purple"]).pack(anchor="w")

        # Main text bubble
        bubble = tk.Frame(content_wrapper, bg=THEME["bg_bubble_bot"],
                          padx=14, pady=10)
        bubble.pack(fill="x")

        self._render_markdown_text(bubble, text)

        # Render structured data cards if present
        if response_data:
            self._render_cards(content_wrapper, response_data)

        self._scroll_to_bottom()

    def _render_markdown_text(self, parent, text: str):
        """Simple markdown-like rendering: **bold**, bullet points."""
        lines = text.split("\n")
        for line in lines:
            if not line.strip():
                tk.Label(parent, text="", bg=parent.cget("bg"), height=0).pack(anchor="w")
                continue

            # Bold detection
            if "**" in line:
                self._render_bold_line(parent, line)
            elif line.strip().startswith("•") or line.strip().startswith("✅") \
                    or line.strip().startswith("❌") or line.strip().startswith("🔥") \
                    or line.strip().startswith("📈") or line.strip().startswith("⚡"):
                tk.Label(parent, text=line, font=("Consolas", 10),
                         bg=parent.cget("bg"), fg=THEME["text_primary"],
                         wraplength=500, justify="left", anchor="w").pack(anchor="w")
            else:
                tk.Label(parent, text=line, font=("Consolas", 10),
                         bg=parent.cget("bg"), fg=THEME["text_primary"],
                         wraplength=500, justify="left", anchor="w").pack(anchor="w")

    def _render_bold_line(self, parent, line: str):
        """Render a line containing **bold** markers as mixed labels."""
        frame = tk.Frame(parent, bg=parent.cget("bg"))
        frame.pack(anchor="w", fill="x")
        parts = line.split("**")
        for i, part in enumerate(parts):
            if not part:
                continue
            is_bold = (i % 2 == 1)
            lbl = tk.Label(
                frame, text=part,
                font=("Consolas", 10, "bold" if is_bold else "normal"),
                bg=parent.cget("bg"),
                fg=THEME["accent"] if is_bold else THEME["text_primary"],
                wraplength=0
            )
            lbl.pack(side="left")

    def _render_cards(self, parent, response_data: dict):
        """Render course/career cards below the text bubble."""
        rtype = response_data.get("type", "")

        # COURSE CARDS
        if response_data.get("courses"):
            for interest, course_list in response_data["courses"].items():
                section_label = interest.replace("_", " ").upper()
                self._section_header(parent, f"📚 {section_label} COURSES",
                                     THEME["accent"])
                for course in course_list:
                    self._course_card(parent, course)

        # CAREER CARDS
        if response_data.get("careers"):
            for interest, career_list in response_data["careers"].items():
                section_label = interest.replace("_", " ").upper()
                self._section_header(parent, f"🎯 {section_label} CAREERS",
                                     THEME["accent_green"])
                for career in career_list:
                    self._career_card(parent, career)

    def _section_header(self, parent, text, color):
        frame = tk.Frame(parent, bg=THEME["bg_dark"], pady=4)
        frame.pack(fill="x", padx=0, pady=(8, 2))
        tk.Label(frame, text=text, font=("Consolas", 9, "bold"),
                 bg=THEME["bg_dark"], fg=color).pack(anchor="w")
        tk.Frame(frame, bg=color, height=1).pack(fill="x", pady=(2, 0))

    def _course_card(self, parent, course: dict):
        card = tk.Frame(parent, bg=THEME["tag_course"],
                        padx=12, pady=10, relief="flat")
        card.pack(fill="x", pady=2)
        card.columnconfigure(0, weight=1)

        # Title + level
        top = tk.Frame(card, bg=THEME["tag_course"])
        top.pack(fill="x")

        title_lbl = tk.Label(top, text=course["title"],
                             font=("Consolas", 10, "bold"),
                             bg=THEME["tag_course"], fg=THEME["accent"],
                             wraplength=380, justify="left")
        title_lbl.pack(side="left", anchor="w")

        level_colors = {"Beginner": "#3dd68c", "Intermediate": "#f4a832", "Advanced": "#f46b6b"}
        level_color = level_colors.get(course.get("level", "Beginner"), "#8892a4")
        level_lbl = tk.Label(top, text=f" {course.get('level', '')} ",
                             font=("Consolas", 8, "bold"),
                             bg=level_color, fg="#0f1117")
        level_lbl.pack(side="right", anchor="n")

        # Provider
        tk.Label(card, text=f"by {course['provider']}",
                 font=("Consolas", 9), bg=THEME["tag_course"],
                 fg=THEME["text_secondary"]).pack(anchor="w")

        # Description
        tk.Label(card, text=course["description"],
                 font=("Consolas", 9), bg=THEME["tag_course"],
                 fg=THEME["text_primary"], wraplength=480,
                 justify="left").pack(anchor="w", pady=(4, 6))

        # Link button
        url = course.get("url", "")
        if url:
            link_btn = tk.Button(
                card, text=f"🔗  Open Course",
                font=("Consolas", 9, "bold"),
                bg=THEME["accent"], fg=THEME["bg_dark"],
                activebackground="#3a7fd9", activeforeground=THEME["bg_dark"],
                relief="flat", padx=8, pady=3,
                cursor="hand2",
                command=lambda u=url: webbrowser.open(u)
            )
            link_btn.pack(anchor="w")

    def _career_card(self, parent, career: dict):
        card = tk.Frame(parent, bg=THEME["tag_career"],
                        padx=12, pady=10)
        card.pack(fill="x", pady=2)

        # Title + salary
        top = tk.Frame(card, bg=THEME["tag_career"])
        top.pack(fill="x")

        tk.Label(top, text=career["title"],
                 font=("Consolas", 10, "bold"),
                 bg=THEME["tag_career"], fg=THEME["accent_green"]).pack(side="left")

        tk.Label(top, text=career["avg_salary"],
                 font=("Consolas", 9, "bold"),
                 bg=THEME["tag_career"], fg=THEME["accent_amber"]).pack(side="right")

        # Description
        tk.Label(card, text=career["description"],
                 font=("Consolas", 9), bg=THEME["tag_career"],
                 fg=THEME["text_primary"], wraplength=480,
                 justify="left").pack(anchor="w", pady=(4, 4))

        # Skills
        skills = career.get("skills_needed", [])
        if skills:
            skills_frame = tk.Frame(card, bg=THEME["tag_career"])
            skills_frame.pack(anchor="w", pady=(0, 4))
            tk.Label(skills_frame, text="Skills: ",
                     font=("Consolas", 8, "bold"),
                     bg=THEME["tag_career"], fg=THEME["text_secondary"]).pack(side="left")
            tk.Label(skills_frame, text=" · ".join(skills),
                     font=("Consolas", 8),
                     bg=THEME["tag_career"], fg=THEME["text_secondary"],
                     wraplength=400, justify="left").pack(side="left")

        # Growth badge
        growth = career.get("growth", "")
        if growth:
            growth_colors = {
                "Very High": "#3dd68c", "High": "#4f9cf9",
                "Moderate": "#f4a832", "Low": "#f46b6b"
            }
            color = growth_colors.get(growth, "#8892a4")
            tk.Label(card, text=f"Growth: {growth}",
                     font=("Consolas", 8, "bold"),
                     bg=color, fg="#0f1117").pack(anchor="w")

    # ──────────────────────────────────────
    # Info Panel Updates
    # ──────────────────────────────────────

    def _clear_info_panel(self):
        for widget in self.info_content.winfo_children():
            widget.destroy()

    def _show_info_default(self):
        self._clear_info_panel()
        tips = [
            ("💡 TIP", "Type naturally — I understand phrases like 'I enjoy coding' or 'I like AI'"),
            ("🔗 LINKS", "Course cards include direct links to open courses in your browser"),
            ("🎯 CAREERS", "Career cards show salary ranges and required skills"),
            ("❓ FAQS", "Ask anything about student life, exams, internships, and more"),
            ("🔄 COMBINE", "Try 'I like programming and design — what jobs suit me?'"),
        ]
        for title, body in tips:
            frame = tk.Frame(self.info_content, bg=THEME["bg_panel"], padx=12, pady=8)
            frame.pack(fill="x", pady=2)
            tk.Label(frame, text=title, font=("Consolas", 8, "bold"),
                     bg=THEME["bg_panel"], fg=THEME["accent_amber"]).pack(anchor="w")
            tk.Label(frame, text=body, font=("Consolas", 9),
                     bg=THEME["bg_panel"], fg=THEME["text_secondary"],
                     wraplength=210, justify="left").pack(anchor="w", pady=(2, 0))

    def _update_info_panel(self, response_data: dict):
        """Show detected interests and intent in the info panel."""
        self._clear_info_panel()

        # Intent badge
        intent_map = {
            "courses": ("📚 Course Query", THEME["accent"]),
            "careers": ("🎯 Career Query", THEME["accent_green"]),
            "faq": ("❓ FAQ Query", THEME["accent_purple"]),
            "combined": ("🔀 Combined Query", THEME["accent_amber"]),
            "greeting": ("👋 Greeting", THEME["text_secondary"]),
            "help": ("💡 Help", THEME["text_secondary"]),
            "unknown": ("❔ Unknown", THEME["text_secondary"]),
        }
        rtype = response_data.get("type", "unknown")
        label, color = intent_map.get(rtype, ("Query", THEME["text_secondary"]))

        badge_frame = tk.Frame(self.info_content, bg=THEME["bg_panel"], padx=12, pady=10)
        badge_frame.pack(fill="x")
        tk.Label(badge_frame, text="INTENT DETECTED",
                 font=("Consolas", 8, "bold"),
                 bg=THEME["bg_panel"], fg=THEME["text_secondary"]).pack(anchor="w")
        tk.Label(badge_frame, text=label, font=("Consolas", 11, "bold"),
                 bg=THEME["bg_panel"], fg=color).pack(anchor="w")

        # Interests
        interests = response_data.get("interests", [])
        if interests:
            tk.Frame(self.info_content, bg=THEME["border"], height=1).pack(fill="x", padx=10)
            int_frame = tk.Frame(self.info_content, bg=THEME["bg_panel"], padx=12, pady=10)
            int_frame.pack(fill="x")
            tk.Label(int_frame, text="INTERESTS FOUND",
                     font=("Consolas", 8, "bold"),
                     bg=THEME["bg_panel"], fg=THEME["text_secondary"]).pack(anchor="w")
            for i in interests[:5]:
                tag_lbl = tk.Label(int_frame,
                                   text=f"  → {i.replace('_', ' ').title()}",
                                   font=("Consolas", 10),
                                   bg=THEME["bg_panel"], fg=THEME["text_primary"])
                tag_lbl.pack(anchor="w")

        # Course count
        courses = response_data.get("courses", {})
        if courses:
            total = sum(len(v) for v in courses.values())
            tk.Frame(self.info_content, bg=THEME["border"], height=1).pack(fill="x", padx=10)
            c_frame = tk.Frame(self.info_content, bg=THEME["bg_panel"], padx=12, pady=8)
            c_frame.pack(fill="x")
            tk.Label(c_frame, text=f"📚 {total} courses returned",
                     font=("Consolas", 10, "bold"),
                     bg=THEME["bg_panel"], fg=THEME["accent"]).pack(anchor="w")

        # Career count
        careers = response_data.get("careers", {})
        if careers:
            total = sum(len(v) for v in careers.values())
            tk.Frame(self.info_content, bg=THEME["border"], height=1).pack(fill="x", padx=10)
            cr_frame = tk.Frame(self.info_content, bg=THEME["bg_panel"], padx=12, pady=8)
            cr_frame.pack(fill="x")
            tk.Label(cr_frame, text=f"🎯 {total} careers returned",
                     font=("Consolas", 10, "bold"),
                     bg=THEME["bg_panel"], fg=THEME["accent_green"]).pack(anchor="w")

    # ──────────────────────────────────────
    # Send / Input Handling
    # ──────────────────────────────────────

    def _on_key_release(self, event):
        """Live character count in typing indicator."""
        text = self.input_var.get()
        if text:
            self.typing_label.config(text=f"{len(text)} chars")
        else:
            self.typing_label.config(text="")

    def _on_send(self, event=None):
        user_text = self.input_var.get().strip()
        if not user_text:
            return

        self.input_var.set("")
        self.typing_label.config(text="")
        self._add_user_message(user_text)
        self.chat_history.append({"role": "user", "text": user_text})

        # Update message count
        count = len([m for m in self.chat_history if m["role"] == "user"])
        self.msg_count_label.config(text=f"Messages: {count}")

        # Simulate typing delay on a thread (keeps UI responsive)
        threading.Thread(target=self._process_response,
                         args=(user_text,), daemon=True).start()

    def _process_response(self, user_text: str):
        """Run engine on background thread, update UI safely via after()."""
        # Show typing indicator
        self.after(0, lambda: self.typing_label.config(
            text="EduAI is thinking...", fg=THEME["accent"]))

        time.sleep(0.4)  # natural delay

        response = generate_response(user_text)

        # Schedule UI update on main thread
        self.after(0, lambda: self._deliver_response(response))

    def _deliver_response(self, response: dict):
        self.typing_label.config(text="", fg=THEME["text_secondary"])
        self._add_bot_message(response["message"], response)
        self._update_info_panel(response)
        self.chat_history.append({"role": "bot", "data": response})

    def _quick_query(self, query: str):
        """Trigger a pre-built query from sidebar buttons."""
        self.input_var.set(query)
        self._on_send()


# ──────────────────────────────────────────────────────────────
# Style configuration
# ──────────────────────────────────────────────────────────────

def configure_styles():
    style = ttk.Style()
    style.theme_use("default")
    style.configure("Vertical.TScrollbar",
                    background=THEME["bg_panel"],
                    troughcolor=THEME["bg_dark"],
                    arrowcolor=THEME["text_secondary"],
                    borderwidth=0)


# ──────────────────────────────────────────────────────────────
# Entry Point
# ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = EducationAI()
    configure_styles()
    app.mainloop()
