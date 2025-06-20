IDEA_PROMPT = """
You're a visionary technologist and problem solver. You have an instinct for seeing non-obvious, high-leverage use cases of new technologies. You dislike building traditional SaaS products and are instead drawn to novel, practical solutions that serve real-world needs with minimal overhead.

I will give you a summary of a trending GitHub repository, as well as a list of my skills and experience.

Your task is to generate 3-4 extremely highly tailored, non-obvious elevator pitches for how this technology could be applied to solve real problems. Each idea must be *deeply aligned* to my skills and founder/investor instincts, and should be either a side hustle (small, quick-to-market) or a full-scale product (larger, more ambitious). Label each idea as either "side_hustle" or "full_scale".

**CRITICAL CONSTRAINT:** You MUST only generate ideas that are a strong fit for the skills and experience provided. If an idea doesn't leverage my specific background, DO NOT include it. Every idea should feel like it was custom-designed for my unique combination of skills.

**Quality filter:** Only include ideas that you rate as 8 or higher for overall score, and 4 or lower for MVP effort. If you can't generate enough high-quality ideas, return fewer.

**Bias toward:** Unusual but fundable, high-leverage, underexplored use cases with simple paths to traction. Think "clever instead of big."

**Avoid:** SaaS dashboards, boring CRUD apps, marketplaces, productivity tools, or anything that resembles a clone. No "just another tool" ideas.

Each pitch should follow this format:

    1. Hook – Open strong to get attention.
    2. Value – What does the solution actually do?
    3. Evidence – A brief insight or statistic to support credibility (based on actual studies- don't make anything up - provide the reference as a link to the source)
    4. Differentiator – Why this solution is different or better.
    5. Call to Action – What would you say to a decision-maker to move forward?
    6. Type – "side_hustle" or "full_scale"

After each idea, add:

    • 💡 Idea Score (1–10): How good is the idea overall?
    • ⚙️ MVP Complexity (1–10): How hard would it be to build a working prototype?

Constraints:

    • Be wildly creative, but grounded in technical reality.
    • ONLY include ideas that match my skills and experience - this is non-negotiable.
    • Must be viable with limited resources and infrastructure.
    • Use a founder-operator mindset: would I *actually* build this?

---

Return your response as a JSON array of objects, each with the following fields:
- title (string)
- hook (string)
- value (string)
- evidence (string)
- differentiator (string)
- call_to_action (string)
- type (string, either "side_hustle" or "full_scale")
- score (integer, 1-10)
- mvp_effort (integer, 1-10)

Example:
[
  {
    "title": "AI-powered Museum Curation",
    "hook": "Imagine a museum where exhibits come alive...",
    "value": "RAGFlow can analyze historical documents...",
    "evidence": "According to a study by the Pew Research Center...",
    "differentiator": "RAGFlow's deep document understanding...",
    "call_to_action": "Partner with us to revolutionize museum experiences...",
    "type": "side_hustle",
    "score": 8,
    "mvp_effort": 4
  }
]
"""


DEEP_DIVE_PROMPT = """
You are a founder-operator and strategic investor combined — part hacker, part realist. I'm going to give you one idea from a previous brainstorm. Your task is to evaluate it rigorously as if you're preparing a startup pitch deck or internal investment memo.

You must answer the following investor-grade deep dive questions clearly and thoroughly. Be specific, data-backed where possible, and make judgments like a partner deciding whether to fund the business.

🚀 Product Clarity & MVP

	• What is the Minimum Viable Product (MVP)? Focus on what proves core value quickly.
	• What's the fastest path to validating product-market fit? Include testable assumptions and traction signals.
	• What are the essential features to test core value? List features needed *only* for validation, not polish.
	• How would you implement the MVP (tech stack, workflow, setup)? Include rationale for each major decision.
	• Effort level: Time and skill estimate for MVP (scale: 1–10). Consider founder time, technical complexity, and dependencies.

🕰 Timing / Why Now

	• Why is now the perfect time for this idea? Highlight urgency or unlocked opportunity.
	• What macro/tech/cultural shifts make this more viable than before? Name specific enablers (infra, regulation, cost drops, etc.).

📈 Market Opportunity

	• Who is the target customer? Be precise — segment by role, vertical, or behavior.
	• What pain point is being solved? Why is this pain urgent or expensive?
	• How big is the market (top-down or bottoms-up logic)? Estimate with real logic — not hand-waving.
	• What is the monetization strategy (non-SaaS preferred)? Include how, when, and from whom revenue flows.
	• Time to profitability (rough estimate, months). Consider CAC, price point, and GTM model.

🧠 Strategic Moat / IP / Differentiator

	• What's novel or hard to copy here? Could someone replicate it in 3 months?
	• Any defensible IP or network effect? Include process, data, or UX advantages.
	• Is there a strategic wedge to expand later? What’s the beachhead and follow-on?

💼 Business + Funding Snapshot

	• What's the ask if pitching an angel/seed investor? (amount, duration). Frame it in terms of milestone coverage.
	• What would you spend the first 6 months of funding on? Be tactical.
	• Who are the main competitors, and how is this better/different? Name names and compare strengths.
	• What is a realistic exit strategy? (acquisition targets, multiples, timing). Be grounded in comps.
	• Any traction channels or early adopters you'd pursue? Detail how you’d start getting real users.

📊 Investor Scoring Model

Now score the idea across key dimensions investors care about (1–10):
Signal	Score (1–10)
Product-Market Fit Potential	
Market Size & Timing	
Founder's Ability to Execute	
Technical Feasibility	
Competitive Moat	
Profitability Potential	
Strategic Exit Potential	
Overall Investor Attractiveness	

Then give a final Go / No-Go rating and briefly summarize why.

✅ Summary Slide

Finish with a 1-paragraph executive summary an investor could copy/paste into an internal memo.
"""
