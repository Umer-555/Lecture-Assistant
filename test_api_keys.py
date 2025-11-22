#!/usr/bin/env python
"""
Test script to verify API keys are configured correctly
Run this before starting the application
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_anthropic_key():
    """Test Anthropic API key"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("❌ ANTHROPIC_API_KEY not found in .env file")
        return False

    if api_key.startswith("sk-ant-placeholder") or api_key == "your_anthropic_key_here":
        print("❌ ANTHROPIC_API_KEY is still a placeholder - replace with real key")
        return False

    if not api_key.startswith("sk-ant-"):
        print("⚠️  ANTHROPIC_API_KEY doesn't start with 'sk-ant-' - may be invalid")
        return False

    print("✓ ANTHROPIC_API_KEY found and appears valid")
    return True


def test_tavily_key():
    """Test Tavily API key"""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        print("❌ TAVILY_API_KEY not found in .env file")
        return False

    if api_key.startswith("tvly-placeholder") or api_key == "your_tavily_key_here":
        print("❌ TAVILY_API_KEY is still a placeholder - replace with real key")
        return False

    if not api_key.startswith("tvly-"):
        print("⚠️  TAVILY_API_KEY doesn't start with 'tvly-' - may be invalid")
        return False

    print("✓ TAVILY_API_KEY found and appears valid")
    return True


def main():
    print("=" * 60)
    print("API Key Configuration Test")
    print("=" * 60)
    print()

    anthropic_ok = test_anthropic_key()
    tavily_ok = test_tavily_key()

    print()
    print("=" * 60)

    if anthropic_ok and tavily_ok:
        print("✓ All API keys configured correctly!")
        print("You can now start the application.")
        return 0
    else:
        print("❌ Some API keys need attention")
        print()
        print("To fix:")
        print("1. Sign up for Anthropic API: https://console.anthropic.com/")
        print("2. Sign up for Tavily API: https://tavily.com/")
        print("3. Add your keys to the .env file")
        return 1


if __name__ == "__main__":
    exit(main())
