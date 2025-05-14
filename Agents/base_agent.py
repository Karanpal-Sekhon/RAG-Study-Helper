"""
Base agent class for all specialized agents in the RAG-Study-Helper system.
This provides a common interface and shared functionality for all agent types.
"""
from typing import Any, Dict, List, Optional
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    """Abstract base class for all agent implementations"""
    
    def __init__(self, model_name: str = "gpt-4o"):
        """
        Initialize the base agent
        
        Args:
            model_name (str): Name of the LLM model to use
        """
        self.model_name = model_name
        self.initialized = False
    
    @abstractmethod
    def initialize(self, workspace_id: Optional[str] = None) -> None:
        """
        Initialize the agent with workspace-specific resources
        
        Args:
            workspace_id (str, optional): The workspace ID
        """
        pass
    
    @abstractmethod
    def run(self, query: str) -> str:
        """
        Run the agent with a query
        
        Args:
            query (str): The query to process
            
        Returns:
            str: The agent's response
        """
        pass
    
    def __repr__(self) -> str:
        """String representation of the agent"""
        return f"{self.__class__.__name__}(model={self.model_name}, initialized={self.initialized})"