# RAG-Study-Helper Agent Architecture

This document provides an overview of the agent architecture used in the RAG-Study-Helper system.

## Architecture Overview

The RAG-Study-Helper uses a multi-agent architecture with a central orchestrator and specialized agents:

```
                 ┌─────────────┐
                 │   Client    │
                 └──────┬──────┘
                        │
                        ▼
┌───────────────────────────────────────────┐
│              Multi-Agent                  │
│  ┌─────────┐  ┌────────┐  ┌──────────┐   │
│  │Preproc. │→ │Delegat.│→ │  Agent   │   │
│  │  Node   │  │  Node  │  │  Nodes   │   │
│  └─────────┘  └────────┘  └──────────┘   │
└───────────────────┬───────────────────────┘
                    │
         ┌──────────┴─────────┐
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  Agent Factory  │  │  Agent Managers │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    ▼
           ┌─────────────────┐
           │ Agent Instances │
           └─────────────────┘
```

## Component Descriptions

### Multi-Agent System
- **Purpose**: Central orchestrator that routes user queries to specialized agents
- **Implementation**: `multi-agent.py`
- **Key Functions**:
  - `preprocessing_node`: Analyzes and formats the user query
  - `delegation_node`: Determines which specialized agent should handle the query
  - `agent_nodes`: Execute the specialized agent logic for each agent type

### Agent Factory
- **Purpose**: Provides a unified interface to create and access all agent types
- **Implementation**: `agent_factory.py`
- **Key Functions**:
  - `get_agent`: Returns an agent instance of the specified type
  - `register_agent_type`: Registers a new agent type with its getter function

### Agent Managers
- **Purpose**: Manage the lifecycle of agent instances, including caching and resource management
- **Implementation**: `*_agent_manager.py` (e.g., `rag_agent_manager.py`)
- **Key Functions**:
  - `get_agent`: Creates or retrieves a cached agent instance
  - `get_document_paths`: Retrieves document paths for a specific workspace
  - `clear_agent_cache`: Manages the agent instance cache

### Agent Instances
- **Purpose**: Execute specialized tasks like QA, flashcard generation, etc.
- **Implementation**: Specialized agent classes (e.g., `RAGQAAgent` in `rag-qa-agent.py`)
- **Base Class**: `BaseAgent` in `base_agent.py`
- **Key Functions**:
  - `initialize`: Set up agent-specific resources
  - `run`: Process a query and return a response

## Workspace Integration

The architecture supports multi-workspace environments through:
- Workspace-specific document retrieval
- Agent instance caching per workspace
- Workspace context extraction from user state

## Agent Types

Currently implemented:
- **RAG QA Agent**: Answers questions about documents using Retrieval-Augmented Generation

Planned:
- **Flashcard Agent**: Generates flashcards from notes
- **Exam Agent**: Creates practice exams from notes
- **Resource Agent**: Recommends additional learning resources

## Extension Pattern

To add a new agent type:

1. Create an agent class that inherits from `BaseAgent`
2. Create a manager module for the agent type
3. Register the agent type with the `AgentFactory`
4. Add a node function in the multi-agent system

Example:
```python
# 1. Create a new agent in flashcard_agent.py
class FlashcardAgent(BaseAgent):
    # Implementation

# 2. Create a manager in flashcard_agent_manager.py
def get_agent(workspace_id=None, **kwargs):
    # Implementation

# 3. Register with the factory
AgentFactory.register_agent_type('flashcard', get_agent)

# 4. Add a node function in multi-agent.py
def flashcard_node(state):
    agent = AgentFactory.get_agent('flashcard', workspace_id)
    # Implementation
```

## Workflow Example

1. User sends a query: "What is the architecture of an encoder-decoder model?"
2. Preprocessing node formats the query
3. Delegation node routes to the RAG QA agent
4. Multi-agent system requests a RAG QA agent from the factory
5. Factory uses the manager to get or create an agent instance
6. Agent processes the query and returns a response
7. Response is formatted and returned to the user