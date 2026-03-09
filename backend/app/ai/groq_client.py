from groq import Groq
from app.config import settings
import json
from typing import Optional

class GroqAIClient:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"
    
    def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate a response from Groq LLM"""
        try:
            messages = []
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")
    
    def generate_json_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None
    ) -> dict:
        """Generate a JSON structured response from Groq LLM"""
        response_text = self.generate_response(
            prompt,
            system_prompt,
            temperature=0.3,
            max_tokens=4096
        )
        
        try:
            # Try to extract JSON from the response
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()
            
            return json.loads(json_str)
        except json.JSONDecodeError:
            raise Exception(f"Failed to parse JSON response: {response_text}")

# Singleton instance
groq_client = GroqAIClient()
