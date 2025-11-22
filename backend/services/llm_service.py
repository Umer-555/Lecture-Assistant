"""
LLM Service - Handles interactions with Claude (Anthropic)
"""

import os
from typing import Optional, Dict, Any
from langchain_anthropic import ChatAnthropic


class LLMService:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment")

        # Initialize Claude with latest model
        self.creative_llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0.7,
            max_tokens=4096,
            anthropic_api_key=api_key
        )

        self.factual_llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0.3,
            max_tokens=4096,
            anthropic_api_key=api_key
        )

    def invoke_creative(self, prompt: str) -> str:
        """
        Invoke LLM with creative temperature for synthesis tasks

        Args:
            prompt: Prompt text

        Returns:
            LLM response text
        """
        try:
            response = self.creative_llm.invoke(prompt)
            return response.content
        except Exception as e:
            raise Exception(f"LLM invocation failed: {str(e)}")

    def invoke_factual(self, prompt: str) -> str:
        """
        Invoke LLM with factual temperature for extraction tasks

        Args:
            prompt: Prompt text

        Returns:
            LLM response text
        """
        try:
            response = self.factual_llm.invoke(prompt)
            return response.content
        except Exception as e:
            raise Exception(f"LLM invocation failed: {str(e)}")

    def get_model_info(self, creative: bool = True) -> Dict[str, Any]:
        """
        Get information about the model being used

        Args:
            creative: If True, return info for creative model, else factual

        Returns:
            Dictionary with model info
        """
        llm = self.creative_llm if creative else self.factual_llm
        return {
            "model": llm.model,
            "temperature": llm.temperature,
            "max_tokens": llm.max_tokens
        }
