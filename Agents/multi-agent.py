from typing import Literal, Optional
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState, StateGraph, START, END 
from langgraph.types import Command
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
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

class Router(TypedDict):
    next: Literal['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent', 'FINISH']

# Create LLM instances
llm = ChatOpenAI(model='gpt-3.5-turbo')  # Using cheaper model for routing
agent_llm = ChatOpenAI(model='gpt-4')  # Using more powerful model for agents

def extract_workspace_id(state: MessagesState) -> Optional[str]:
    """
    Extract workspace ID from the message state
    
    In a production environment, this would use metadata or session information
    For now, we'll return None (default workspace)
    
    Args:
        state (MessagesState): The current message state
        
    Returns:
        Optional[str]: The workspace ID or None
    """
    # This is a placeholder for where you would extract workspace information
    # from user metadata, conversation context, or Django session
    return None

# Node functions
def preprocessing_node(state: MessagesState) -> MessagesState:
    """Process the user query for clarity and parameter extraction"""
    messages = state["messages"]
    last_message = messages[-1]
    
    if last_message.type == "human":
        system_message = SystemMessage(content=preprocessing_prompt)
        response = llm.invoke([system_message, last_message])
        return {"messages": messages + [response]}
    return state

def delegation_node(state: MessagesState) -> Command[Literal['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent', '__end__']]: 
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
def rag_qa_node(state: MessagesState) -> MessagesState:
    """Answer questions using RAG from user's notes"""
    messages = state["messages"]
    last_message = messages[-1]
    
    # Extract workspace context
    workspace_id = extract_workspace_id(state)
    
    # Get the RAG agent for this workspace
    rag_agent = AgentFactory.get_agent('rag_qa', workspace_id=workspace_id)
    
    # Extract the query from the last message
    query = last_message.content
    print(f"Processing query with RAG QA Agent: {query}")
    
    # Run the RAG agent
    response = rag_agent.run(query)
    
    # Format the response with agent prefix
    return {"messages": messages + [AIMessage(content=f"[RAG QA Agent]: {response}")]}

def flashcard_node(state: MessagesState) -> MessagesState:
    """Generate flashcards from user's notes"""
    messages = state["messages"]
    last_message = messages[-1]
    
    system_prompt = (
        "You are a flashcard generation assistant. Create effective flashcards "
        "based on the user's notes and request."
    )
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Flashcard Agent]: {response.content}")]}

def exam_node(state: MessagesState) -> MessagesState:
    """Generate practice exam questions"""
    messages = state["messages"]
    last_message = messages[-1]
    
    system_prompt = (
        "You are an exam generation assistant. Create appropriate exam questions "
        "and answers based on the user's notes and request."
    )
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Exam Agent]: {response.content}")]}

def resource_node(state: MessagesState) -> MessagesState:
    """Generate additional learning resources"""
    messages = state["messages"]
    last_message = messages[-1]
    
    system_prompt = (
        "You are a resource generation assistant. Recommend additional learning resources "
        "based on the user's topic and learning goals."
    )
    
    response = agent_llm.invoke([
        SystemMessage(content=system_prompt),
        last_message
    ])
    
    return {"messages": messages + [AIMessage(content=f"[Resource Agent]: {response.content}")]}

# Build the graph
builder = StateGraph(MessagesState)

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
    # Example usage for RAG QA querying
    user_query = "What is the architecture of an encoder-decoder model?"
    messages = [HumanMessage(content=user_query)]
    
    print(f"\n=== Processing Query ===")
    print(f"Query: {user_query}")
    
    # Invoke the graph with the user query
    result = graph.invoke({"messages": messages})
    
    # Print the final response from the agents
    print("\n=== Agent Response ===")
    print(result["messages"][-1].content)