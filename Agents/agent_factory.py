"""
Agent factory module for creating and managing all agent types.
This provides a unified interface for accessing all specialized agents.
"""
from typing import Dict, Optional, Type, Any
from base_agent import BaseAgent

# Import agent managers
from rag_agent_manager import get_agent as get_rag_agent

class AgentFactory:
    """Factory class for creating and managing agent instances"""
    
    # Registry of agent types and their getter functions
    _agent_registry = {
        'rag_qa': get_rag_agent,
        # Add more agent types as they are implemented
        # 'flashcard': get_flashcard_agent,
        # 'exam': get_exam_agent,
        # 'resource': get_resource_agent,
    }
    
    @classmethod
    def get_agent(cls, agent_type: str, workspace_id: Optional[str] = None, **kwargs) -> Any:
        """
        Get an agent instance of the specified type
        
        Args:
            agent_type (str): The type of agent to get
            workspace_id (str, optional): The workspace ID
            **kwargs: Additional arguments to pass to the agent constructor
            
        Returns:
            Any: The agent instance
            
        Raises:
            ValueError: If the agent type is not registered
        """
        if agent_type not in cls._agent_registry:
            registered_types = ", ".join(cls._agent_registry.keys())
            raise ValueError(f"Unknown agent type: {agent_type}. Registered types: {registered_types}")
        
        # Get the agent using the registered getter function
        agent_getter = cls._agent_registry[agent_type]
        return agent_getter(workspace_id=workspace_id, **kwargs)
    
    @classmethod
    def register_agent_type(cls, agent_type: str, agent_getter) -> None:
        """
        Register a new agent type
        
        Args:
            agent_type (str): The type name for the agent
            agent_getter: Function that returns an agent instance
        """
        cls._agent_registry[agent_type] = agent_getter
        print(f"Registered agent type: {agent_type}")
    
    @classmethod
    def get_registered_types(cls) -> list:
        """
        Get a list of all registered agent types
        
        Returns:
            list: List of registered agent type names
        """
        return list(cls._agent_registry.keys())