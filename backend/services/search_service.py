"""
Search Service - Handles web searches using Tavily API
"""

import os
from typing import List, Dict, Any
from tavily import TavilyClient
from urllib.parse import urlparse
import requests


class SearchService:
    def __init__(self):
        api_key = os.getenv("TAVILY_API_KEY")
        if not api_key:
            raise ValueError("TAVILY_API_KEY not found in environment")
        self.client = TavilyClient(api_key=api_key)

    def search(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Perform web search and return results

        Args:
            query: Search query string
            max_results: Maximum number of results to return

        Returns:
            List of search results with metadata
        """
        try:
            response = self.client.search(
                query=query,
                max_results=max_results,
                search_depth="advanced",
                include_domains=None,
                exclude_domains=["youtube.com", "facebook.com", "twitter.com"]
            )

            results = []
            for item in response.get("results", []):
                url = item.get("url", "")
                domain = urlparse(url).netloc

                # Calculate credibility score based on domain
                credibility_score = self._calculate_credibility(domain)

                results.append({
                    "url": url,
                    "title": item.get("title", ""),
                    "author": None,  # Tavily doesn't provide author
                    "date": None,  # Tavily doesn't provide date
                    "domain": domain,
                    "snippet": item.get("content", "")[:500],  # Limit snippet length
                    "credibility_score": credibility_score
                })

            return results

        except Exception as e:
            print(f"Search error: {str(e)}")
            return []

    def multi_search(self, queries: List[str], max_per_query: int = 3) -> List[Dict[str, Any]]:
        """
        Perform multiple searches and deduplicate results

        Args:
            queries: List of search queries
            max_per_query: Max results per query

        Returns:
            Deduplicated list of search results
        """
        all_results = []
        seen_urls = set()

        for query in queries:
            results = self.search(query, max_results=max_per_query)
            for result in results:
                if result["url"] not in seen_urls:
                    seen_urls.add(result["url"])
                    all_results.append(result)

        return all_results

    def verify_url(self, url: str) -> bool:
        """
        Verify that a URL is accessible

        Args:
            url: URL to verify

        Returns:
            True if URL is accessible, False otherwise
        """
        try:
            response = requests.head(url, timeout=5, allow_redirects=True)
            return response.status_code < 400
        except Exception:
            return False

    def _calculate_credibility(self, domain: str) -> float:
        """
        Calculate credibility score based on domain

        Args:
            domain: Domain name

        Returns:
            Credibility score (0.0 to 1.0)
        """
        # High credibility domains
        if any(ext in domain for ext in [".edu", ".gov"]):
            return 0.95

        # Known reputable sources
        reputable = [
            "wikipedia.org", "arxiv.org", "nature.com", "science.org",
            "ieee.org", "acm.org", "plos.org", "springer.com",
            "nytimes.com", "bbc.com", "reuters.com", "theguardian.com",
            "anthropic.com", "openai.com", "google.com"
        ]
        if any(rep in domain for rep in reputable):
            return 0.85

        # Medium credibility - general domains
        if ".org" in domain:
            return 0.65

        # Lower credibility
        return 0.5
