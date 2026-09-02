#!/usr/bin/env python3
import json
import os
import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright

CONFIG_FILE = "config.json"
APPLIED_JOBS_FILE = "applied_jobs.json"
USER_DATA_DIR = "./browser_user_data"

def load_config():
    if not os.path.exists(CONFIG_FILE):
        print(f"❌ Configuration file '{CONFIG_FILE}' not found!")
        sys.exit(1)
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_applied_jobs():
    if os.path.exists(APPLIED_JOBS_FILE):
        with open(APPLIED_JOBS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_applied_job(job_info):
    applied = load_applied_jobs()
    applied.append(job_info)
    with open(APPLIED_JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(applied, f, indent=2, ensure_ascii=False)

def main():
    config = load_config()
    search_cfg = config.get("search_settings", {})
    user_cfg = config.get("user_profile", {})
    answers = user_cfg.get("answers", {})

    keywords_list = search_cfg.get("keywords", ["Java Spring Boot"])
    location = search_cfg.get("location", "Indonesia")
    max_applications = search_cfg.get("max_applications_per_run", 5)

    print("==================================================")
    print("🚀 LinkedIn Easy Apply Automation Agent (OpenClaw)")
    print("==================================================")
    print(f"🎯 Keywords: {', '.join(keywords_list)}")
    print(f"📍 Location: {location}")
    print(f"📂 CV Path:  {user_cfg.get('cv_file_path')}")
    print("==================================================\n")

    with sync_playwright() as p:
        # Launch persistent browser context to retain login session
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=False, # Set to False so user can watch & authenticate if needed
            args=[
                "--disable-blink-features=AutomationControlled",
                "--start-maximized"
            ],
            viewport=None
        )

        page = browser_context.pages[0] if browser_context.pages else browser_context.new_page()

        # Step 1: Check Login State
        print("🔍 Checking LinkedIn Session Status...")
        page.goto("https://www.linkedin.com/feed/", wait_until="domcontentloaded")
        time.sleep(3)

        if "login" in page.url or "checkpoint" in page.url or page.locator("input#username").is_visible():
            print("\n⚠️ LinkedIn Session Not Detected!")
            print("👉 Please log in to your LinkedIn account in the opened browser window.")
            print("👉 Once logged in and viewing your LinkedIn Feed, press [ENTER] in this terminal to continue...\n")
            input("Press [ENTER] after logging into LinkedIn: ")
        else:
            print("✅ Logged in successfully to LinkedIn!\n")

        total_applied_this_session = 0

        for keyword in keywords_list:
            if total_applied_this_session >= max_applications:
                break

            print(f"\n🔎 Searching Easy Apply Jobs for: '{keyword}' in '{location}'...")
            search_url = f"https://www.linkedin.com/jobs/search/?keywords={keyword.replace(' ', '%20')}&location={location.replace(' ', '%20')}&f_AL=true"
            page.goto(search_url, wait_until="domcontentloaded")
            time.sleep(4)

            # Locate Job Cards
            job_cards = page.locator(".job-card-container, .jobs-search-results__list-item").all()
            print(f"📋 Found {len(job_cards)} Easy Apply job listings on page 1.")

            already_applied_ids = [j.get("job_id") for j in load_applied_jobs()]

            for idx, card in enumerate(job_cards):
                if total_applied_this_session >= max_applications:
                    print(f"🛑 Reached max target applications count ({max_applications}).")
                    break

                try:
                    card.scroll_into_view_if_needed()
                    card.click()
                    time.sleep(2)

                    # Extract Job Metadata
                    title_elem = page.locator(".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title")
                    company_elem = page.locator(".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name")
                    
                    job_title = title_elem.first.inner_text().strip() if title_elem.count() > 0 else "Unknown Title"
                    company_name = company_elem.first.inner_text().strip() if company_elem.count() > 0 else "Unknown Company"

                    print(f"\n[{idx+1}/{len(job_cards)}] Examining: {job_title} @ {company_name}")

                    # Check Easy Apply Button
                    easy_apply_btn = page.locator("button.jobs-apply-button").first
                    if easy_apply_btn.count() == 0 or not easy_apply_btn.is_visible():
                        print("  ⏩ Already applied or no Easy Apply button visible.")
                        continue

                    btn_text = easy_apply_btn.inner_text().strip()
                    if "Easy Apply" not in btn_text and "Lamar Mudah" not in btn_text:
                        print("  ⏩ Non-Easy Apply job. Skipping.")
                        continue

                    # Click Easy Apply
                    easy_apply_btn.click()
                    time.sleep(2)

                    print("  ✍️ Handling Easy Apply Modal Wizard...")
                    
                    # Fill Modal Steps
                    modal = page.locator(".jobs-easy-apply-modal, div[role='dialog']")
                    submitted = False
                    step_count = 0

                    while modal.is_visible() and step_count < 8:
                        step_count += 1

                        # Fill Text / Numeric Inputs
                        text_inputs = modal.locator("input[type='text'], input[type='number'], textarea").all()
                        for inp in text_inputs:
                            try:
                                label_text = ""
                                parent_label = inp.locator("xpath=ancestor::div[contains(@class,'fb-dash-form-element')]//label").first
                                if parent_label.count() > 0:
                                    label_text = parent_label.inner_text().lower()

                                current_val = inp.input_value()
                                if not current_val:
                                    # Auto-answer based on keywords
                                    ans_to_fill = "2" # Default experience
                                    if "phone" in label_text or "telepon" in label_text:
                                        ans_to_fill = user_cfg.get("phone", "+6282223259114")
                                    elif "email" in label_text:
                                        ans_to_fill = user_cfg.get("email", "bagus.wicak@outlook.com")
                                    elif "salary" in label_text or "gaji" in label_text:
                                        ans_to_fill = answers.get("salary", "10000000")
                                    elif "notice" in label_text or "pemberitahuan" in label_text:
                                        ans_to_fill = answers.get("notice_period", "1 month")

                                    inp.fill(ans_to_fill)
                            except Exception:
                                pass

                        # Check Upload CV
                        file_input = modal.locator("input[type='file']").first
                        if file_input.count() > 0 and file_input.is_visible():
                            cv_path = user_cfg.get("cv_file_path")
                            if cv_path and os.path.exists(cv_path):
                                file_input.set_input_files(cv_path)

                        # Submit / Next / Review Buttons
                        submit_btn = modal.locator("button[aria-label*='Submit'], button[aria-label*='Kirim']").first
                        review_btn = modal.locator("button[aria-label*='Review'], button[aria-label*='Tinjau']").first
                        next_btn = modal.locator("button[aria-label*='Next'], button[aria-label*='Lanjut']").first

                        if submit_btn.count() > 0 and submit_btn.is_visible():
                            submit_btn.click()
                            time.sleep(2)
                            submitted = True
                            print(f"  🎉 SUCCESS! Submitted Easy Apply for: {job_title} @ {company_name}")
                            
                            # Close post-apply popup if any
                            done_btn = modal.locator("button[aria-label*='Dismiss'], button[aria-label*='Tutup']").first
                            if done_btn.count() > 0 and done_btn.is_visible():
                                done_btn.click()
                            break

                        elif review_btn.count() > 0 and review_btn.is_visible():
                            review_btn.click()
                            time.sleep(2)

                        elif next_btn.count() > 0 and next_btn.is_visible():
                            next_btn.click()
                            time.sleep(2)
                        else:
                            break

                    if submitted:
                        total_applied_this_session += 1
                        save_applied_job({
                            "job_title": job_title,
                            "company": company_name,
                            "keyword": keyword,
                            "applied_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        })

                    # Close modal if remaining open
                    close_btn = modal.locator("button[aria-label*='Dismiss'], button[aria-label*='Batal']").first
                    if close_btn.count() > 0 and close_btn.is_visible():
                        close_btn.click()
                        time.sleep(1)

                except Exception as e:
                    print(f"  ⚠️ Error processing card {idx+1}: {e}")
                    continue

        print("\n==================================================")
        print(f"🏁 Session Completed! Applied to {total_applied_this_session} job(s).")
        print("==================================================")

if __name__ == "__main__":
    main()
