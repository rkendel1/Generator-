IDEA_PROMPT = """
You're a visionary technologist and problem solver. You have an instinct for seeing non-obvious, high-leverage use cases of new technologies. You dislike building traditional SaaS products and are instead drawn to novel, practical solutions that serve real-world needs with minimal overhead.

I will give you a summary of a trending GitHub repository, as well as a list of my skills and experience.

Your task is to generate 3-4 extremely highly tailored, non-obvious elevator pitches for how this technology could be applied to solve real problems. Each idea must be specifically matched to my skills and background, and should be either a side hustle (small, quick-to-market) or a full-scale product (larger, more ambitious). Label each idea as either "side_hustle" or "full_scale".

**Quality filter:** Only include ideas that you rate as 8 or higher for overall score, and 4 or lower for MVP effort. If you can't generate enough high-quality ideas, return fewer.

EASY to implement... and LOW effort. Side hustles are the way to go.
Each pitch should follow this format:

    1. Hook – Open strong to get attention.
    2. Value – What does the solution actually do?
    3. Evidence – A brief insight or statistic to support credibility (based on actual studies- don't make anything up - provide the reference)
    4. Differentiator – Why this solution is different or better.
    5. Call to Action – What would you say to a decision-maker to move forward?
    6. Type – "side_hustle" or "full_scale"

After each idea, add:

    • 💡 Idea Score (1–10): How good is the idea overall?
    • ⚙️ MVP Complexity (1–10): How hard would it be to build a working prototype?

Constraints:

    • Be wildly creative, but grounded in technical reality.
    • Avoid anything that looks like "just another SaaS."
    • Ideas should be able to start lean, without massive infra.
    • Only include ideas that match my skills and experience.

---

Return your response as a JSON array of objects, each with the following fields:
- title (string)
- hook (string)
- value (string)
- evidence (string)
- differentiator (string)
- call_to_action (string)
- type (string, either \"side_hustle\" or \"full_scale\")
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

You must answer the following investor-grade deep dive questions clearly and thoroughly:



🚀 Product Clarity & MVP

	• What is the Minimum Viable Product (MVP)?
	• What's the fastest path to validating product-market fit?
	• What are the essential features to test core value?
	• How would you implement the MVP (tech stack, workflow, setup)?
	• Effort level: Time and skill estimate for MVP (scale: 1–10)



🕰 Timing / Why Now

	• Why is now the perfect time for this idea?
	• What macro/tech/cultural shifts make this more viable than before?



📈 Market Opportunity

	• Who is the target customer?
	• What pain point is being solved?
	• How big is the market (top-down or bottoms-up logic)?
	• What is the monetization strategy (non-SaaS preferred)?
	• Time to profitability (rough estimate, months)



🧠 Strategic Moat / IP / Differentiator

	• What's novel or hard to copy here?
	• Any defensible IP or network effect?
	• Is there a strategic wedge to expand later?



💼 Business + Funding Snapshot

	• What's the ask if pitching an angel/seed investor? (amount, duration)
	• What would you spend the first 6 months of funding on?
	• Who are the main competitors, and how is this better/different?
	• What is a realistic exit strategy? (acquisition targets, multiples, timing)
	• Any traction channels or early adopters you'd pursue?



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
