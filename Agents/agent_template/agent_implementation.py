"""
Template for implementing a new agent type.
Replace 'TemplateAgent' with your agent name.
"""
from typing import Optional, List, Dict, Any
import os
from base_agent import BaseAgent

class TemplateAgent(BaseAgent):
    """Template agent implementation"""
    
    def __init__(self, model_name: str = "gpt-4o"):
        """
        Initialize the agent
        
        Args:
            model_name (str): The model to use for the agent
        """
        super().__init__(model_name)
        # Add agent-specific initialization
        self.custom_attribute = None
    
    def initialize(self, workspace_id: Optional[str] = None) -> None:
        """
        Initialize the agent with workspace-specific resources
        
        Args:
            workspace_id (str, optional): The workspace ID
        """
        print(f"Initializing {self.__class__.__name__} for workspace: {workspace_id}")
        
        # TODO: Add agent-specific initialization
        # Examples:
        # - Load and process documents
        # - Initialize models, tools, or other resources
        # - Set up any workflow graphs or chains
        
        self.initialized = True
        print(f"{self.__class__.__name__} initialized successfully")
    
    def run(self, query: str) -> str:
        """
        Run the agent with a query
        
        Args:
            query (str): The query to process
            
        Returns:
            str: The agent's response
        """
        if not self.initialized:
            raise ValueError(f"{self.__class__.__name__} not initialized. Call initialize() first.")
        
        print(f"Processing query with {self.__class__.__name__}: {query}")
        
        # TODO: Add agent-specific query processing
        # Examples:
        # - Process the query with LLMs or other models
        # - Use tools or external resources
        # - Format the response
        
        # Placeholder response
        response = f"Response from {self.__class__.__name__}: {query}"
        
        return response
    
    # Add agent-specific methods as needed
    def custom_method(self) -> None:
        """Example of an agent-specific method"""
        pass


# For testing and standalone usage
if __name__ == "__main__":
    # Create and initialize agent
    agent = TemplateAgent()
    agent.initialize()
    
    # Test with a sample query
    test_query = "This is a test query"
    response = agent.run(test_query)
    
    print("\n=== Agent Response ===")
    print(response)