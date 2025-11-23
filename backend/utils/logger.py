"""
Logger Utility - For tracking node executions
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path


class NodeLogger:
    """Logger for LangGraph node executions"""

    def __init__(self, research_id: str):
        self.research_id = research_id
        self.logs_dir = Path("logs")
        self.logs_dir.mkdir(exist_ok=True)
        self.log_file = self.logs_dir / f"{research_id}.json"
        # Load existing logs instead of starting empty
        self.logs = self._load_existing_logs()

    def log_node_execution(
        self,
        node_name: str,
        inputs: Dict[str, Any],
        output: Any,
        prompt_used: Optional[str] = None,
        model: str = "n/a",  # Changed from hardcoded Claude model
        temperature: float = 0.7,
        human_decision: Optional[str] = None,
        duration_ms: Optional[float] = None
    ):
        """
        Log a node execution

        Args:
            node_name: Name of the node
            inputs: Input data to the node
            output: Output from the node
            prompt_used: Prompt template used (if applicable)
            model: Model name used
            temperature: Temperature setting
            human_decision: Human decision at checkpoint (if applicable)
            duration_ms: Execution duration in milliseconds
        """
        log_entry = {
            "node_name": node_name,
            "timestamp": datetime.utcnow().isoformat(),
            "inputs": self._sanitize(inputs),
            "prompt_used": prompt_used,
            "model": model,
            "temperature": temperature,
            "output": self._sanitize(output),
            "human_decision": human_decision,
            "duration_ms": duration_ms
        }

        self.logs.append(log_entry)
        self._save_logs()

    def get_logs(self):
        """Get all logs for this research session"""
        return self.logs

    def _load_existing_logs(self):
        """Load existing logs from file, or return empty list"""
        if self.log_file.exists():
            try:
                with open(self.log_file, 'r') as f:
                    data = json.load(f)
                    return data.get("logs", [])
            except Exception as e:
                print(f"Error loading logs: {str(e)}")
                return []
        return []

    def _save_logs(self):
        """Save logs to file"""
        try:
            with open(self.log_file, 'w') as f:
                json.dump({
                    "research_id": self.research_id,
                    "logs": self.logs
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving logs: {str(e)}")

    def _sanitize(self, data: Any) -> Any:
        """
        Sanitize data for JSON serialization

        Args:
            data: Data to sanitize

        Returns:
            JSON-serializable data
        """
        if data is None:
            return None

        if isinstance(data, (str, int, float, bool)):
            return data

        if isinstance(data, dict):
            return {k: self._sanitize(v) for k, v in data.items()}

        if isinstance(data, (list, tuple)):
            return [self._sanitize(item) for item in data]

        # For complex objects, convert to string
        return str(data)

    @staticmethod
    def load_logs(research_id: str):
        """Load logs from file"""
        log_file = Path("logs") / f"{research_id}.json"
        if log_file.exists():
            with open(log_file, 'r') as f:
                data = json.load(f)
                return data.get("logs", [])
        return []
