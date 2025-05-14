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

def get_document_paths(workspace_id: Optional[str] = None) -> List[str]:
    """
    Get document paths for a specific workspace
    
    Args:
        workspace_id (str, optional): The workspace ID
        
    Returns:
        List[str]: List of document paths
    """
    # In production, this would query your Django models
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # For demo purposes - in production, query workspace models
    document_paths = [
        os.path.join(base_dir, 'media', 'notes', 'Generative_AI_and_LLMs_0l9ocL6.pdf')
    ]
    
    print(f"Loading documents for workspace {workspace_id} from: {document_paths}")
    
    return document_paths

def get_agent(workspace_id: Optional[str] = None, model_name: str = "gpt-4o") -> RAGQAAgent:
    """
    Get or create a RAG QA Agent for the specified workspace
    
    Args:
        workspace_id (str, optional): The workspace ID
        model_name (str, optional): The model to use for the agent
        
    Returns:
        RAGQAAgent: The agent instance for the workspace
    """
    # Use 'default' for None to ensure consistent key type
    cache_key = workspace_id if workspace_id is not None else 'default'
    
    # Create and initialize agent if not in cache
    if cache_key not in _rag_agents:
        print(f"Initializing RAG QA Agent for workspace: {workspace_id}")
        
        # Get document paths for the workspace
        file_paths = get_document_paths(workspace_id)
        
        # Create new agent
        agent = RAGQAAgent(model_name=model_name)
        
        # Load documents and initialize vectorstore
        documents = agent.load_documents(file_paths)
        agent.initialize_vectorstore(documents)
        
        # Cache the agent
        _rag_agents[cache_key] = agent
        print(f"RAG QA Agent initialized and cached for workspace: {workspace_id}")
    
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
        cache_key = workspace_id if workspace_id is not None else 'default'
        if cache_key in _rag_agents:
            del _rag_agents[cache_key]
            print(f"Cleared RAG QA Agent cache for workspace: {workspace_id}")
    else:
        # Clear all workspaces
        _rag_agents = {}
        print("Cleared all RAG QA Agent caches")