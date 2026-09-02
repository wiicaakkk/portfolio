---
name: linkedin-easy-apply
description: "Search and automatically apply for jobs on LinkedIn Easy Apply using automated browser agent. MANDATORY: ALWAYS run the python script whenever the user asks to apply jobs, melamar kerja di linkedin, or uses command !apply or mager bantu apply or coba anda yang apply."
metadata:
  {
    "openclaw":
      {
        "emoji": "💼",
      },
  }
---

# LinkedIn Easy Apply Automation Skill

You have FULL AUTOMATION capability to auto-apply for jobs on LinkedIn via Playwright.

**CRITICAL RULE:**
DO NOT respond with text recommendations, links, or advice telling the user to click manually.
You MUST ALWAYS EXECUTE THE TOOL COMMAND FIRST whenever the user asks to apply for jobs or uses `!apply`!

## MANDATORY Tool Execution

Execute the Python script:

```bash
/root/.openclaw/skills/linkedin-easy-apply/venv/bin/python /root/.openclaw/skills/linkedin-easy-apply/easy_apply_bot.py --keyword "<keyword>" --location "Indonesia" --max 5 --headless
```

### Parameters:
- `--keyword`: Job role or technology stack requested by user (e.g. `"full stack"`, `"Java Spring Boot"`, `"Backend Engineer"`).
- `--location`: Target location (default: `"Indonesia"`).
- `--max`: Max applications count per run (default: `5`).
- `--headless`: Always pass `--headless` mode.

## Response Guidelines

- Return the stdout of the script execution to the user in clean Indonesian format with emojis.
