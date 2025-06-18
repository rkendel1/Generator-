import os
import httpx
import json
import re
import logging
from typing import List, Dict, Any
import asyncio

# Set up logging
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def call_groq(prompt: str, model: str = "llama3-8b-8192"):
    """Call Groq API with the given prompt, with retries and longer timeout."""
    logger.error(f"🔍 DEBUG: call_groq called with model={model}")
    logger.error(f"🔍 DEBUG: GROQ_API_KEY exists: {bool(GROQ_API_KEY)}")
    logger.error(f"🔍 DEBUG: Prompt length: {len(prompt)} characters")
    logger.error(f"🔍 DEBUG: First 200 chars of prompt: {prompt[:200]}...")
    
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY environment variable not set")

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                logger.error(f"🔍 DEBUG: Attempt {attempt} - Making request to Groq API...")
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                        "max_tokens": 3000
                    },
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}"}
                )
                logger.error(f"🔍 DEBUG: Response status: {response.status_code}")
                logger.error(f"🔍 DEBUG: Response headers: {dict(response.headers)}")
                response.raise_for_status()
                result = response.json()
                logger.error(f"🔍 DEBUG: Full API response: {result}")
                content = result["choices"][0]["message"]["content"]
                logger.error(f"🔍 DEBUG: Extracted content length: {len(content)}")
                logger.error(f"🔍 DEBUG: First 200 chars of content: {content[:200]}...")
                return content
        except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.RequestError) as e:
            logger.error(f"❌ ERROR in call_groq (attempt {attempt}): {e}")
            logger.error(f"❌ ERROR type: {type(e)}")
            if attempt < max_retries:
                logger.error(f"🔁 Retrying in 3 seconds...")
                await asyncio.sleep(3)
            else:
                logger.error(f"❌ All {max_retries} attempts failed.")
                raise
        except Exception as e:
            logger.error(f"❌ ERROR in call_groq (non-retryable): {e}")
            logger.error(f"❌ ERROR type: {type(e)}")
            raise

def parse_idea_response(response: str) -> List[Dict[str, Any]]:
    """Parse the LLM response to extract structured idea data"""
    ideas = []
    
    # Split response into individual ideas (numbered sections)
    idea_sections = re.split(r'\n\s*\d+\.\s*', response)
    
    for section in idea_sections[1:]:  # Skip first empty section
        if not section.strip():
            continue
            
        try:
            idea = parse_single_idea(section)
            if idea:
                ideas.append(idea)
        except Exception as e:
            print(f"Error parsing idea section: {e}")
            continue
    
    return ideas

def parse_single_idea(section: str) -> Dict[str, Any] | None:
    """Parse a single idea section"""
    idea = {
        "title": "",
        "hook": "",
        "value": "",
        "evidence": "",
        "differentiator": "",
        "call_to_action": "",
        "score": 5,
        "mvp_effort": 5
    }
    
    # Extract title (first line or after "Title:")
    lines = section.strip().split('\n')
    if lines:
        first_line = lines[0].strip()
        if first_line and not first_line.startswith(('Hook', 'Value', 'Evidence')):
            idea["title"] = first_line
    
    # Extract structured fields
    current_field = None
    current_content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check for field headers
        if line.startswith('Hook'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            current_field = 'hook'
            current_content = []
        elif line.startswith('Value'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            current_field = 'value'
            current_content = []
        elif line.startswith('Evidence'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            current_field = 'evidence'
            current_content = []
        elif line.startswith('Differentiator'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            current_field = 'differentiator'
            current_content = []
        elif line.startswith('Call to Action'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            current_field = 'call_to_action'
            current_content = []
        elif line.startswith('💡 Idea Score'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            # Extract score
            score_match = re.search(r'(\d+)/10', line)
            if score_match:
                idea["score"] = int(score_match.group(1))
        elif line.startswith('⚙️ MVP Complexity'):
            if current_field and current_content:
                idea[current_field] = '\n'.join(current_content).strip()
            # Extract MVP effort
            effort_match = re.search(r'(\d+)/10', line)
            if effort_match:
                idea["mvp_effort"] = int(effort_match.group(1))
        else:
            # Content for current field
            if current_field:
                current_content.append(line)
    
    # Save last field content
    if current_field and current_content:
        idea[current_field] = '\n'.join(current_content).strip()
    
    # Validate that we have at least a title
    if not idea["title"]:
        return None
        
    return idea

def parse_deep_dive_response(response: str) -> Dict[str, Any]:
    """Parse the deep dive LLM response into structured data"""
    logger.info(f"🔍 DEBUG: parse_deep_dive_response called with response length: {len(response)}")
    logger.info(f"🔍 DEBUG: Response content: {response}")
    
    deep_dive = {
        "product_clarity": {},
        "timing": {},
        "market_opportunity": {},
        "strategic_moat": {},
        "business_funding": {},
        "investor_scoring": {},
        "summary": ""
    }
    
    current_section = None
    current_content = []
    
    lines = response.split('\n')
    logger.info(f"🔍 DEBUG: Split into {len(lines)} lines")
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Check for section headers
        if '🚀 Product Clarity & MVP' in line:
            logger.info(f"🔍 DEBUG: Found Product Clarity section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'product_clarity'
            current_content = []
        elif '🕰 Timing / Why Now' in line:
            logger.info(f"🔍 DEBUG: Found Timing section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'timing'
            current_content = []
        elif '📈 Market Opportunity' in line:
            logger.info(f"🔍 DEBUG: Found Market Opportunity section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'market_opportunity'
            current_content = []
        elif '🧠 Strategic Moat / IP / Differentiator' in line:
            logger.info(f"🔍 DEBUG: Found Strategic Moat section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'strategic_moat'
            current_content = []
        elif '💼 Business + Funding Snapshot' in line:
            logger.info(f"🔍 DEBUG: Found Business Funding section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'business_funding'
            current_content = []
        elif '📊 Investor Scoring Model' in line:
            logger.info(f"🔍 DEBUG: Found Investor Scoring section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'investor_scoring'
            current_content = []
        elif '✅ Summary Slide' in line:
            logger.info(f"🔍 DEBUG: Found Summary section at line {i}")
            if current_section and current_content:
                deep_dive[current_section] = '\n'.join(current_content).strip()
            current_section = 'summary'
            current_content = []
        else:
            # Content for current section
            if current_section:
                current_content.append(line)
    
    # Save last section content
    if current_section and current_content:
        deep_dive[current_section] = '\n'.join(current_content).strip()
    
    logger.info(f"🔍 DEBUG: Final parsed deep_dive: {deep_dive}")
    return deep_dive

async def generate_idea_pitches(repo_description: str) -> List[Dict[str, Any]]:
    """Generate idea pitches for a repository"""
    from prompts import IDEA_PROMPT
    
    prompt = f"{IDEA_PROMPT}\n\nRepository Description: {repo_description}\n\nGenerate 10 ideas:"
    
    try:
        response = await call_groq(prompt)
        if response is None:
            return [{"error": "Idea generation failed: No response from LLM."}]
        ideas = parse_idea_response(response)

        if not ideas:
            return [{"error": "Idea generation failed: No ideas returned from LLM."}]

        return ideas
    except Exception as e:
        if isinstance(e, httpx.ReadTimeout):
            print(f"[ERROR] LLM call timed out: {e}")
            return [{"error": "Idea generation failed: LLM call timed out."}]
        print(f"Error generating ideas: {e}")
        return [{"error": f"Idea generation failed: {str(e)}"}]

async def generate_deep_dive(idea_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a deep dive analysis for an idea"""
    from prompts import DEEP_DIVE_PROMPT
    
    logger.error(f"🔍 DEBUG: generate_deep_dive called with idea_data: {idea_data}")
    
    # Create a comprehensive prompt with idea details
    idea_summary = f"""
Title: {idea_data.get('title', 'Unknown')}
Hook: {idea_data.get('hook', 'N/A')}
Value: {idea_data.get('value', 'N/A')}
Evidence: {idea_data.get('evidence', 'N/A')}
Differentiator: {idea_data.get('differentiator', 'N/A')}
Call to Action: {idea_data.get('call_to_action', 'N/A')}
Score: {idea_data.get('score', 5)}/10
MVP Effort: {idea_data.get('mvp_effort', 5)}/10
"""
    
    prompt = f"{DEEP_DIVE_PROMPT}\n\nIdea to analyze:\n{idea_summary}\n\nPlease provide a comprehensive deep dive analysis:"
    logger.error(f"🔍 DEBUG: Full prompt length: {len(prompt)}")
    
    try:
        logger.error(f"🔍 DEBUG: Calling Groq API...")
        response = await call_groq(prompt)
        if response is None:
            return {
                "error": "Failed to generate deep dive: No response from LLM.",
                "product_clarity": "Analysis failed",
                "timing": "Analysis failed",
                "market_opportunity": "Analysis failed",
                "strategic_moat": "Analysis failed",
                "business_funding": "Analysis failed",
                "investor_scoring": "Analysis failed",
                "summary": "Deep dive analysis could not be completed."
            }
        logger.error(f"🔍 DEBUG: Raw LLM response: {response}")
        logger.error(f"🔍 DEBUG: Got response from Groq, length: {len(response)}")
        logger.error(f"🔍 DEBUG: Response starts with: {response[:500]}...")
        
        deep_dive = parse_deep_dive_response(response)
        logger.error(f"🔍 DEBUG: Parsed deep_dive result: {deep_dive}")
        return deep_dive
    except Exception as e:
        logger.error(f"❌ ERROR in generate_deep_dive: {e}")
        logger.error(f"❌ ERROR type: {type(e)}")
        return {
            "error": f"Failed to generate deep dive: {str(e)}",
            "product_clarity": "Analysis failed",
            "timing": "Analysis failed",
            "market_opportunity": "Analysis failed",
            "strategic_moat": "Analysis failed",
            "business_funding": "Analysis failed",
            "investor_scoring": "Analysis failed",
            "summary": "Deep dive analysis could not be completed."
        }
