"""
Module for managing RAG QA Agent instances across the application
"""
from typing import Dict, Optional, List
import os
# Import with correct filename (rag-qa-agent.py)
# This requires modifying sys.path to handle hyphens in the filename
import sys
import importlib.util
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Load the module directly from the file path
spec = importlib.util.spec_from_file_location("rag_qa_agent", os.path.join(current_dir, "rag-qa-agent.py"))
rag_qa_agent = importlib.util.module_from_spec(spec)
sys.modules["rag_qa_agent"] = rag_qa_agent
spec.loader.exec_module(rag_qa_agent)

# Now we can import the RAGQAAgent class
RAGQAAgent = rag_qa_agent.RAGQAAgent

# Internal cache of agent instances by workspace_id
_rag_agents: Dict[str, RAGQAAgent] = {}

# Utility function for external cache management
def get_cached_agent_workspaces() -> List[str]:
    """
    Get list of workspace IDs that have cached agents
    
    Returns:
        List[str]: List of workspace IDs with cached agents
    """
    return list(_rag_agents.keys())

def get_workspace_document_count(workspace_id: str) -> int:
    """
    Get the count of documents in a workspace (for validation)
    
    Args:
        workspace_id (str): The workspace ID
        
    Returns:
        int: Number of documents in the workspace
    """
    try:
        # Import here to avoid circular imports
        import sys
        import os
        
        # Add the project root to Python path
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if project_root not in sys.path:
            sys.path.append(project_root)
        
        from workspace.models import Notes, Videos
        
        notes_count = Notes.objects.filter(workspace_id=workspace_id).count()
        videos_count = Videos.objects.filter(workspace_id=workspace_id).count()
        
        return notes_count + videos_count
        
    except Exception as e:
        print(f"Error getting document count for workspace {workspace_id}: {e}")
        return 0

def get_agent(workspace_id: str, model_name: str = "gpt-4o") -> RAGQAAgent:
    """
    Get or create a RAG QA Agent for the specified workspace
    
    Args:
        workspace_id (str): The workspace ID (required)
        model_name (str, optional): The model to use for the agent
        
    Returns:
        RAGQAAgent: The agent instance for the workspace
        
    Raises:
        ValueError: If workspace_id is None or empty
    """
    if not workspace_id:
        raise ValueError("workspace_id is required for RAG QA Agent")
        
    cache_key = workspace_id
    
    # Create and initialize agent if not in cache
    if cache_key not in _rag_agents:
        print(f"Creating RAG QA Agent for workspace: {workspace_id}")
        
        # Check if workspace has documents
        doc_count = get_workspace_document_count(workspace_id)
        if doc_count == 0:
            print(f"Warning: Workspace {workspace_id} has no documents. Agent may not provide meaningful responses.")
        
        # Create new agent with workspace context
        agent = RAGQAAgent(workspace_id=workspace_id, model_name=model_name)
        
        # Initialize agent for the workspace (uses vector store manager)
        agent.initialize_for_workspace()
        
        if not agent.initialized:
            print(f"Warning: RAG QA Agent failed to initialize for workspace {workspace_id}")
        
        # Cache the agent
        _rag_agents[cache_key] = agent
        print(f"RAG QA Agent cached for workspace: {workspace_id}")
    
    return _rag_agents[cache_key]

def clear_agent_cache(workspace_id: Optional[str] = None):
    """
    Clear the agent cache for a specific workspace or all workspaces
    
    Args:
        workspace_id (str, optional): The workspace ID. If None, clears all cached agents.
    """
    global _rag_agents
    
    if workspace_id is not None:
        # Clear specific workspace
        if workspace_id in _rag_agents:
            del _rag_agents[workspace_id]
            print(f"Cleared RAG QA Agent cache for workspace: {workspace_id}")
        else:
            print(f"No cached agent found for workspace: {workspace_id}")
    else:
        # Clear all workspaces
        _rag_agents = {}
        print("Cleared all RAG QA Agent caches")


def refresh_agent_for_workspace(workspace_id: str, model_name: str = "gpt-4o") -> RAGQAAgent:
    """
    Force refresh the agent for a workspace (useful when documents are updated)
    
    Args:
        workspace_id (str): The workspace ID
        model_name (str, optional): The model to use for the agent
        
    Returns:
        RAGQAAgent: The refreshed agent instance
    """
    # Clear the cached agent
    clear_agent_cache(workspace_id)
    
    # Get a new agent (this will create and cache a fresh instance)
    return get_agent(workspace_id, model_name)