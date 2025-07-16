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
  - `get_workspace_document_count`: Retrieves document count for validation
  - `clear_agent_cache`: Manages the agent instance cache
  - `refresh_agent_for_workspace`: Force refresh cached agent when documents change

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
- **RAG QA Agent**: Answers questions about documents using Retrieval-Augmented Generation with LangGraph workflow

Placeholder implementations in multi-agent system:
- **Flashcard Agent**: Generates flashcards from notes (basic implementation)
- **Exam Agent**: Creates practice exams from notes (basic implementation)
- **Resource Agent**: Recommends additional learning resources (basic implementation)

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

## File Structure

```
Agents/
├── README.md                   # This file
├── base_agent.py              # Abstract base class for all agents
├── agent_factory.py           # Factory for creating/managing agents
├── multi-agent.py             # Multi-agent orchestrator with LangGraph
├── rag-qa-agent.py            # RAG QA agent implementation
├── rag_agent_manager.py       # RAG agent instance manager
├── test_retriever.py          # Testing utilities for retriever
└── agent_template/            # Templates for new agent types
    ├── README.md
    ├── agent_implementation.py
    └── agent_manager.py
```

## Key Features

- **Workspace-aware**: All agents support workspace-specific contexts
- **Caching**: Agents are cached per workspace for performance
- **LangGraph Integration**: RAG QA agent uses LangGraph for advanced workflows
- **Extensible**: Template-based system for adding new agent types
- **Vector Store Integration**: RAG agents integrate with workspace vector stores

## RAG QA Agent Workflow

The RAG QA agent uses a sophisticated LangGraph workflow with the following nodes:

1. **Agent Node**: Determines if retrieval is needed and invokes retriever tool
2. **Retrieve Node**: Searches workspace documents using vector similarity
3. **Grade Documents Node**: Evaluates if retrieved documents are relevant
4. **Generate Node**: Creates final answer using retrieved context
5. **Rewrite Node**: Reformulates query if documents aren't relevant

The workflow includes feedback loops for query refinement and ensures high-quality responses by validating document relevance before generating answers.

## Workflow Example

1. User sends a query: "What is the architecture of an encoder-decoder model?"
2. Preprocessing node formats the query and extracts workspace context
3. Delegation node routes to the RAG QA agent based on query type
4. Multi-agent system requests a RAG QA agent from the factory
5. Factory uses the manager to get or create a cached agent instance
6. RAG agent runs its LangGraph workflow (retrieval → grading → generation)
7. Response is formatted and returned to the user