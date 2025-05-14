"""
Template for implementing a new agent manager.
Replace 'template' with your agent type.
"""
from typing import Dict, Optional, List
import os

# Import your agent implementation
from agent_implementation import TemplateAgent

# Internal cache of agent instances by workspace_id
_template_agents: Dict[str, TemplateAgent] = {}

def get_resources(workspace_id: Optional[str] = None) -> List[Any]:
    """
    Get resources for a specific workspace
    
    Args:
        workspace_id (str, optional): The workspace ID
        
    Returns:
        List[Any]: List of resources
    """
    # TODO: Implement resource retrieval
    # Examples:
    # - Get document paths from Django models
    # - Get configuration data
    # - Get external API endpoints
    
    print(f"Loading resources for workspace {workspace_id}")
    
    # Placeholder resources
    resources = ["resource1", "resource2"]
    
    return resources

def get_agent(workspace_id: Optional[str] = None, model_name: str = "gpt-4o") -> TemplateAgent:
    """
    Get or create a Template Agent for the specified workspace
    
    Args:
        workspace_id (str, optional): The workspace ID
        model_name (str, optional): The model to use for the agent
        
    Returns:
        TemplateAgent: The agent instance for the workspace
    """
    # Use 'default' for None to ensure consistent key type
    cache_key = workspace_id if workspace_id is not None else 'default'
    
    # Create and initialize agent if not in cache
    if cache_key not in _template_agents:
        print(f"Initializing Template Agent for workspace: {workspace_id}")
        
        # Create new agent
        agent = TemplateAgent(model_name=model_name)
        
        # Initialize the agent
        agent.initialize(workspace_id)
        
        # Cache the agent
        _template_agents[cache_key] = agent
        print(f"Template Agent initialized and cached for workspace: {workspace_id}")
    
    return _template_agents[cache_key]

def clear_agent_cache(workspace_id: Optional[str] = None):
    """
    Clear the agent cache for a specific workspace or all workspaces
    
    Args:
        workspace_id (str, optional): The workspace ID. If None, clears all cached agents.
    """
    global _template_agents
    
    if workspace_id is not None:
        # Clear specific workspace
        cache_key = workspace_id if workspace_id is not None else 'default'
        if cache_key in _template_agents:
            del _template_agents[cache_key]
            print(f"Cleared Template Agent cache for workspace: {workspace_id}")
    else:
        # Clear all workspaces
        _template_agents = {}
        print("Cleared all Template Agent caches")