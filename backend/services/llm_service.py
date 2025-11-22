"""
LLM Service - Handles interactions with LLMs (supports OpenAI and Anthropic)
"""

import os
from typing import Optional, Dict, Any

try:
    from langchain_openai import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from langchain_anthropic import ChatAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class LLMService:
    def __init__(self):
        # Try OpenAI first, then Anthropic
        openai_key = os.getenv("OPENAI_API_KEY")
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")

        if openai_key and OPENAI_AVAILABLE:
            # Use OpenAI GPT-4
            print("✓ Using OpenAI GPT-4")
            self.provider = "openai"
            self.creative_llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.7,
                max_tokens=4096,
                openai_api_key=openai_key
            )
            self.factual_llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.3,
                max_tokens=4096,
                openai_api_key=openai_key
            )

        elif anthropic_key and ANTHROPIC_AVAILABLE:
            # Use Anthropic Claude
            print("✓ Using Anthropic Claude")
            self.provider = "anthropic"
            self.creative_llm = ChatAnthropic(
                model="claude-sonnet-4-20250514",
                temperature=0.7,
                max_tokens=4096,
                anthropic_api_key=anthropic_key
            )
            self.factual_llm = ChatAnthropic(
                model="claude-sonnet-4-20250514",
                temperature=0.3,
                max_tokens=4096,
                anthropic_api_key=anthropic_key
            )

        else:
            raise ValueError(
                "No LLM API key found! Please set either:\n"
                "  - OPENAI_API_KEY (for GPT-4), or\n"
                "  - ANTHROPIC_API_KEY (for Claude)\n"
                "in your .env file"
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
