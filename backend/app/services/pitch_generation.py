import httpx
import asyncio
from app.db import SessionLocal
from models import Repo, Idea
from llm import generate_idea_pitches
from app.services.github import fetch_trending

LANGUAGES = ["Python", "TypeScript", "JavaScript"]


RANDY_SKILLS_SUMMARY = """
- Civic technology, political platforms, and engagement tools
- AI/ML experimentation (RAG, LLM, GenAI, gamification)
- MVP builds, product management, data analytics
- Experience with AWS, healthcare, finance, and government
- Startup founder mindset with lean, no-code/low-code biases
- Skilled at GTM strategy, stakeholder management, user adoption
- Seeks ideas that are weird, real, and fundable
"""

RANDY_RESUME = '''
Randy L. Kendel
Warwick, Rhode Island 02886 | 401-484-2831 | randy@kendelconsulting.com | linkedin.com/in/rkendel/

Product Innovator | Civic Tech Visionary | Startup Builder

Passionate leader with proven success in creating data-driven products that solve real-world problems. Deeply focused on user engagement, scalable solutions, and empowering communities through technology and civic innovation.
CORE SKILLS

Product Management | MVP Development | User Research | Data Analytics
Agile Development | Lean Methodology | Strategic Planning
Civic Tech | Political Engagement Platforms | User Adoption Strategies
Experimental Generative AI | Metrics Driven Optimization | Stakeholder Management
Data-Driven Decision Making | Monetization | Pricing Strategy | Funnel Optimization
Technical Proficiency | Business Process Optimization | Growth Experimentation
PROFESSIONAL EXPERIENCE
SUN LIFE FINANCIAL
Associate Director Sr Project Manager | Remote                                                    July 2023 - Present
Led strategic product and process optimization projects, focusing on improving customer experience and reducing operational costs to drive revenue growth.
Delivered key product innovations, collaborating with cross-functional teams to improve market positioning and enhance customer engagement. 
KUHMPEL INC
Founder | Remote (Startup)                                                                                 February 2024 - Present
Built a political engagement platform empowering constituents to share opinions and enabling officials to cast votes using hard data.
Developed cohesive user funnels to drive adoption and maximize engagement across diverse political perspectives using innovative approaches including Machine Learning, Generative AI, Advanced Analytics, Gamification, etc.

AMAZON WEB SERVICES (AWS)
Product Manager - Technical | Remote                                                           August 2022 – June 2023
Led the expansion of AWS's global eCommerce offerings, introducing new pricing strategies and market-entry mechanisms that optimized customer trust and conversions.
Worked cross-functionally with marketing and engineering to streamline product architecture and improve user experience, leading to higher customer retention and revenue growth. 

CVS HEALTH
Sr Manager, Release Train Engineer | Woonsocket, RI                     October 2019 – August 2022
Spearheaded the Digital Immunizations Program, leveraging data analytics and customer insights to optimize the user journey and improve overall engagement.
Managed a $15M budget while driving initiatives aimed at improving digital tools and customer-facing services, optimizing for both UX and monetization. 

Advisor Project - Program Management                                            August 2018 - September 2019
Played a key role in CVS's acquisition of Aetna, leading integration efforts for innovative product initiatives that contributed to revenue growth and enhanced customer experience.
Directed multi-million-dollar programs, aligning business growth strategies with product and customer-centric innovations to improve healthcare outcomes and increase customer retention.
Navigated complex stakeholder management, technology integration, and compliance challenges, ensuring seamless product delivery and scalability, while optimizing the customer journey and improving business performance.

FINTELLECT SOFTWARE INC
Founder (Startup)                                                                                                January 2016 - March 2020
Led product development for a SaaS offering focused on helping SMBs with customer engagement and reputation management, utilizing subscription and marketplace revenue models.
Implemented data-driven features, including dynamic pricing and user-experience improvements, to increase customer retention and monetization. 

KENDEL CONSULTING LLC
Principal Consultant/Owner                                                                       January 2011 - January 2019
Led product and program management initiatives, including digital transformation strategies and eCommerce optimization for clients in healthcare, retail, and financial services.


ADDITIONAL EXPERIENCE
Senior consulting and project management roles across industries including KPMG, Fidelity Investments, Dell, Blue Cross Blue Shield, CGI and the United States Air Force. Specialized in building customer-centric digital solutions and leading cross-functional teams in fast-paced environments. 

CERTIFICATIONS

Scaled Agile Framework (SAFe)
Certified Scrum Master (CSM) 
Release Train Engineer (RTE)
Lean Portfolio Management (LPM) 
SAFe Scrum Master (SSM)

EDUCATION
Bachelor of Science in Information and Computer Science (In Progress) | Park University
'''

async def run_nightly_pipeline():
    session = SessionLocal()
    try:
        all_repos = []
        for lang in LANGUAGES:
            print(f"🔍 Fetching trending repos for {lang}...")
            repos = await fetch_trending(lang)
            all_repos.extend(repos)
        print(f"✨ Total repos to process: {len(all_repos)}")
        for idx, repo_data in enumerate(all_repos):
            print(f"[{idx+1}/{len(all_repos)}] Processing repo: {repo_data['name']}")
            existing_repo = session.query(Repo).filter_by(name=repo_data["name"]).first()
            if existing_repo:
                repo = existing_repo
            else:
                repo = Repo(
                    name=repo_data["name"],
                    url=repo_data["url"],
                    summary=repo_data.get("description", "")[:500] or "No description provided.",
                    language=repo_data.get("language", "Unknown"),
                )
                session.add(repo)
                session.commit()  # Commit the repo immediately so it always appears in the DB/UI
            # Robust idea generation with retries
            max_attempts = 5
            for attempt in range(1, max_attempts + 1):
                try:
                    print(f"    Attempt {attempt} to generate ideas...")
                    result = await generate_idea_pitches(repo.summary)
                    raw_blob = result.get('raw')
                    ideas = result.get('ideas', [])
                    if ideas and isinstance(ideas, list) and any(i.get('title') for i in ideas):
                        for idea in ideas:
                            mvp_effort = idea.get("mvp_effort")
                            if not isinstance(mvp_effort, int):
                                mvp_effort = None
                            score = idea.get("score")
                            if not isinstance(score, int):
                                score = None
                            session.add(Idea(
                                repo_id=repo.id,
                                title=idea.get("title", ""),
                                hook=idea.get("hook", ""),
                                value=idea.get("value", ""),
                                evidence=idea.get("evidence", ""),
                                differentiator=idea.get("differentiator", ""),
                                call_to_action=idea.get("call_to_action", ""),
                                score=score,
                                mvp_effort=mvp_effort,
                                llm_raw_response=raw_blob
                            ))
                        session.commit()
                        print(f"    ✔️ Ideas saved for: {repo.name} (count: {len(ideas)})")
                        break
                    else:
                        # Save the blob even if parsing fails, for debugging
                        session.add(Idea(
                            repo_id=repo.id,
                            title=f"[ERROR] No ideas parsed (see llm_raw_response)",
                            hook=None,
                            value=None,
                            evidence=None,
                            differentiator=None,
                            call_to_action=None,
                            score=None,
                            mvp_effort=None,
                            llm_raw_response=raw_blob
                        ))
                        session.commit()
                        print(f"    [WARN] No ideas returned. Saved raw blob for debugging.")
                except Exception as idea_err:
                    print(f"    [ERROR] Failed to generate ideas for {repo.name} (attempt {attempt}): {idea_err}")
                await asyncio.sleep(3)  # Short delay between attempts
            else:
                print(f"    ❌ Failed to generate ideas for {repo.name} after {max_attempts} attempts.")
            print("    ⏳ Waiting 1 second before next repo...")
            await asyncio.sleep(1)
        print("🎉 All ideas generated and saved!")
    except Exception as err:
        print(f"[CRITICAL] Pipeline failed: {err}")
    finally:
        session.close()

if __name__ == "__main__":
    asyncio.run(run_nightly_pipeline())