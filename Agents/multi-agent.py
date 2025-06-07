from typing import Literal, Optional, Annotated, Sequence
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END 
from langgraph.graph.message import add_messages
from langgraph.types import Command
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
import os
from dotenv import load_dotenv
load_dotenv()

# Import the agent factory
from agent_factory import AgentFactory

# Define agent names
members = ['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent']
options = members + ['FINISH']
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
# System prompts
delegation_prompt = (
    "You are a supervisor of a team of workers in a chat app. You are managing the following agents: "
    f"{members}. Given the following user request, respond with the appropriate agent to perform a task. "
    "Each agent has a specific role. The 'rag_qa_agent' agent is responsible for answering questions about their noteset, "
    "the 'flashcard_agent' agent is responsible for creating flashcards from notes, the 'exam_agent' agent is responsible for creating exams from notes, "
    "and the 'resource_agent' agent is responsible for providing additional resources. "
    "Each agent will perform a task and respond with their results and status. When finished, respond with FINISH."
)

preprocessing_prompt = (
    "You are a preprocessing agent. Your job is to analyze the user query and extract key information. "
    "Format the user query to clearly identify what the user is asking for, what materials they're referencing, "
    "and any specific parameters for the request."
)

# Define our extended state that includes workspace and session context
class WorkspaceMessagesState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    workspace_id: Optional[str]
    session_id: Optional[str]

class Router(TypedDict):
    next: Literal['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent', 'FINISH']

# Create LLM instances
llm = ChatOpenAI(model='gpt-3.5-turbo')  # Using cheaper model for routing
agent_llm = ChatOpenAI(model='gpt-4')  # Using more powerful model for agents

def extract_workspace_id(state: WorkspaceMessagesState) -> Optional[str]:
    """
    Extract workspace ID from the message state
    
    Args:
        state (WorkspaceMessagesState): The current message state
        
    Returns:
        Optional[str]: The workspace ID or None
    """
    # Extract workspace_id from the state
    return state.get("workspace_id")

def extract_session_id(state: WorkspaceMessagesState) -> Optional[str]:
    """
    Extract session ID (thread_id) from the message state
    
    Args:
        state (WorkspaceMessagesState): The current message state
        
    Returns:
        Optional[str]: The session ID or None
    """
    # Extract session_id from the state
    return state.get("session_id")

# Node functions
def preprocessing_node(state: WorkspaceMessagesState) -> WorkspaceMessagesState:
    """Process the user query for clarity and parameter extraction"""
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.type == "human":
        system_message = SystemMessage(content=preprocessing_prompt)
        response = llm.invoke([system_message, last_message])
        return {"messages": messages + [response]}
    return state

def delegation_node(state: WorkspaceMessagesState) -> Command[Literal['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent', '__end__']]: 
    """Route to the appropriate agent based on the query"""
    messages = [
        {"role": "system", "content": delegation_prompt},
    ] + state['messages']

    response = llm.with_structured_output(Router).invoke(messages)
    goto = response['next']
    if goto == "FINISH":
        goto = END # type: ignore

    return Command(goto=goto)

# Agent node functions
def rag_qa_node(state: WorkspaceMessagesState) -> WorkspaceMessagesState:
    """Answer questions using workspace-specific RAG from user's notes"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Extract workspace and session context
    workspace_id = extract_workspace_id(state)
    session_id = extract_session_id(state)
    
    if not workspace_id:
        error_msg = "Error: No workspace context provided for RAG query"
        print(error_msg)
        return {"messages": messages + [AIMessage(content=f"[RAG QA Agent]: {error_msg}")]}
    
    try:
        # Get the workspace-specific RAG agent
        rag_agent = AgentFactory.get_agent('rag_qa', workspace_id=workspace_id)
        
        # Extract the query from the last message
        query = last_message.content
        print(f"Processing query with RAG QA Agent for workspace {workspace_id}, session {session_id}: {query}")
        
        # Run the RAG agent
        response = rag_agent.run(query)
        
        # Format the response with agent prefix
        return {"messages": messages + [AIMessage(content=f"[RAG QA Agent]: {response}")]}
        
    except Exception as e:
        error_msg = f"Error processing RAG query for workspace {workspace_id}: {str(e)}"
        print(error_msg)
        return {"messages": messages + [AIMessage(content=f"[RAG QA Agent]: I'm sorry, I encountered an error while searching your documents. Please try again.")]}

def flashcard_node(state: WorkspaceMessagesState) -> WorkspaceMessagesState:
    """Generate flashcards from workspace-specific user's notes"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Extract workspace context
    workspace_id = extract_workspace_id(state)
    session_id = extract_session_id(state)
    
    workspace_context = f" for workspace {workspace_id}" if workspace_id else ""
    
    system_prompt = (
        f"You are a flashcard generation assistant{workspace_context}. Create effective flashcards "
        "based on the user's notes and request. Focus on the key concepts and important information "
        "that would be valuable for studying."
    )
    
    print(f"Processing flashcard request for workspace {workspace_id}, session {session_id}")
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Flashcard Agent]: {response.content}")]}

def exam_node(state: WorkspaceMessagesState) -> WorkspaceMessagesState:
    """Generate practice exam questions from workspace-specific content"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Extract workspace context
    workspace_id = extract_workspace_id(state)
    session_id = extract_session_id(state)
    
    workspace_context = f" for workspace {workspace_id}" if workspace_id else ""
    
    system_prompt = (
        f"You are an exam generation assistant{workspace_context}. Create appropriate exam questions "
        "and answers based on the user's notes and request. Include a variety of question types "
        "(multiple choice, short answer, essay) and provide detailed answer explanations."
    )
    
    print(f"Processing exam generation request for workspace {workspace_id}, session {session_id}")
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Exam Agent]: {response.content}")]}

def resource_node(state: WorkspaceMessagesState) -> WorkspaceMessagesState:
    """Generate additional learning resources based on workspace content"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Extract workspace context
    workspace_id = extract_workspace_id(state)
    session_id = extract_session_id(state)
    
    workspace_context = f" for workspace {workspace_id}" if workspace_id else ""
    
    system_prompt = (
        f"You are a resource generation assistant{workspace_context}. Recommend additional learning resources "
        "based on the user's topic and learning goals. Suggest relevant books, articles, videos, "
        "online courses, and other educational materials that complement their current study materials."
    )
    
    print(f"Processing resource recommendation request for workspace {workspace_id}, session {session_id}")
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Resource Agent]: {response.content}")]}

# Build the graph
builder = StateGraph(WorkspaceMessagesState)

# Add nodes
builder.add_node("preprocessing", preprocessing_node)
builder.add_node("delegation", delegation_node)
builder.add_node("rag_qa_agent", rag_qa_node)
builder.add_node("flashcard_agent", flashcard_node)
builder.add_node("exam_agent", exam_node)
builder.add_node("resource_agent", resource_node)

# Add edges
builder.add_edge(START, "preprocessing")
builder.add_edge("preprocessing", "delegation")
builder.add_edge("rag_qa_agent", END)
builder.add_edge("flashcard_agent", END)
builder.add_edge("exam_agent", END)
builder.add_edge("resource_agent", END)

# Build the graph
graph = builder.compile()

if __name__ == "__main__":
    # Example usage for workspace-specific RAG QA querying
    user_query = "What is the architecture of an encoder-decoder model?"
    test_workspace_id = "test_workspace_123"
    test_session_id = "test_session_456"
    
    messages = [HumanMessage(content=user_query)]
    
    print(f"\n=== Processing Query ===")
    print(f"Query: {user_query}")
    print(f"Workspace ID: {test_workspace_id}")
    print(f"Session ID: {test_session_id}")
    
    # Create state with workspace and session context
    state = {
        "messages": messages,
        "workspace_id": test_workspace_id,
        "session_id": test_session_id
    }
    
    # Invoke the graph with the user query and context
    result = graph.invoke(state)
    
    # Print the final response from the agents
    print("\n=== Agent Response ===")
    print(result["messages"][-1].content)