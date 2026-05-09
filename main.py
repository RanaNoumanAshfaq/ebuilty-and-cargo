#!/usr/bin/env python3
# ============================================================
#  main.py  —  Project Entry Point
#  Launches GUI by default; falls back to CLI if no display
# ============================================================

import sys
import os

def main():
    # Check for --cli flag
    if "--cli" in sys.argv:
        from cli import main as cli_main
        cli_main()
        return

    # Try to launch GUI
    try:
        import tkinter as tk
        # Test if a display is available
        root = tk.Tk()
        root.destroy()
        # Launch full GUI
        from gui.gui import EducationAI, configure_styles
        app = EducationAI()
        configure_styles()
        app.mainloop()
    except Exception as e:
        print(f"GUI not available ({e}). Launching CLI mode...\n")
        from cli import main as cli_main
        cli_main()


if __name__ == "__main__":
    main()
