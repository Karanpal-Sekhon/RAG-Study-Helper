"""
This file implements agentic-RAG for our RAG agent in the multi-agent framework
"""

# Environment setup
import os
from dotenv import load_dotenv
load_dotenv()
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

# LangChain imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.tools.retriever import create_retriever_tool
from langchain import hub
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate

# LangGraph imports
from langgraph.graph import END, StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import tools_condition, ToolNode

# Type hints and models
from typing import Annotated, Literal, Sequence, List, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field


class AgentState(TypedDict):
    # The add_messages function defines how an update should be processed
    # Default is to replace. add_messages says "append"
    messages: Annotated[Sequence[BaseMessage], add_messages]


class RAGQAAgent:
    def __init__(self, model_name="gpt-4o"):
        """Initialize the RAG QA Agent with specified model"""
        self.model_name = model_name
        self.vectorstore = None
        self.retriever = None
        self.retriever_tool = None
        self.tools = None
        self.graph = None
        
    def load_documents(self, file_paths: List[str]):
        """
        Load documents from provided file paths
        
        Args:
            file_paths (list): List of paths to PDF files
            
        Returns:
            list: Loaded documents
        """
        documents = []
        for file_path in file_paths:
            print(f"Loading PDF from: {file_path}")
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
            
        return documents
        
    def initialize_vectorstore(self, documents):
        """
        Initialize the vectorstore with provided documents
        
        Args:
            documents (list): List of document objects
            
        Returns:
            retriever: The initialized retriever
        """
        text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=500, chunk_overlap=50
        )
        doc_splits = text_splitter.split_documents(documents)
        
        # Create vectorstore
        self.vectorstore = Chroma.from_documents(
            documents=doc_splits,
            collection_name="rag-chroma",
            embedding=OpenAIEmbeddings(),
        )
        self.retriever = self.vectorstore.as_retriever()
        
        # Create retriever tool
        self.retriever_tool = create_retriever_tool(
            self.retriever,
            "retrieve_info",
            "Search and return information from the provided documents",
        )
        
        self.tools = [self.retriever_tool]
        
        # Initialize graph
        self._setup_graph()
        
        return self.retriever
    
    def grade_documents(self, state):
        """
        Determines whether the retrieved documents are relevant to the question.

        Args:
            state (messages): The current state

        Returns:
            str: A decision for whether the documents are relevant or not
        """

        print("---CHECK RELEVANCE---")

        # Data model
        class grade(BaseModel):
            """Binary score for relevance check."""

            binary_score: str = Field(description="Relevance score 'yes' or 'no'")

        # LLM
        model = ChatOpenAI(temperature=0, model="gpt-4o", streaming=True)

        # LLM with tool and validation
        llm_with_tool = model.with_structured_output(grade)

        # Prompt
        prompt = PromptTemplate(
            template="""You are a grader assessing relevance of a retrieved document to a user question. \n 
            Here is the retrieved document: \n\n {context} \n\n
            Here is the user question: {question} \n
            If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n
            Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question.""",
            input_variables=["context", "question"],
        )

        # Chain
        chain = prompt | llm_with_tool

        messages = state["messages"]
        last_message = messages[-1]

        question = messages[0].content
        docs = last_message.content

        print(f"ORIGINAL QUESTION: {question}")
        print(f"RETRIEVED DOCS PREVIEW: {docs[:300]}...")

        scored_result = chain.invoke({"question": question, "context": docs})

        score = scored_result.binary_score

        if score == "yes":
            print("---DECISION: DOCS RELEVANT---")
            return "generate"

        else:
            print("---DECISION: DOCS NOT RELEVANT---")
            print(f"Score: {score}")
            return "rewrite"
    
    def agent(self, state):
        """
        Invokes the agent model to generate a response based on the current state. Given
        the question, it will decide to retrieve using the retriever tool, or simply end.

        Args:
            state (messages): The current state

        Returns:
            dict: The updated state with the agent response appended to messages
        """
        print("---CALL AGENT---")
        messages = state["messages"]
        
        # Log the current state messages
        print(f"Number of messages in state: {len(messages)}")
        for i, msg in enumerate(messages):
            print(f"Message {i}: Type={msg.type}, Content preview: {msg.content[:100]}...")
        
        # Create a specialized system message to encourage retrieval
        system_message = "You are a helpful assistant specialized in answering questions about the provided documents. Always use the retrieval tool to find relevant information before answering."
        
        # Update the model to use the specific system message
        model = ChatOpenAI(temperature=0, streaming=True, model=self.model_name)
        model = model.bind_tools(self.tools)
        
        # Add system message instruction to encourage tool use
        augmented_messages = messages.copy()
        if len(messages) == 1 and messages[0].type == "human":
            augmented_messages = [
                HumanMessage(content=f"{system_message}\n\nI need information about: {messages[0].content}")
            ]
        
        response = model.invoke(augmented_messages)
        print(f"Agent response type: {response.type}")
        print(f"Agent response preview: {response.content[:100]}...")
        
        # We return a list, because this will get added to the existing list
        return {"messages": [response]}
    
    def rewrite(self, state):
        """
        Transform the query to produce a better question.

        Args:
            state (messages): The current state

        Returns:
            dict: The updated state with re-phrased question
        """

        print("---TRANSFORM QUERY---")
        messages = state["messages"]
        question = messages[0].content

        msg = [
            HumanMessage(
                content=f""" \n 
        Look at the input and try to reason about the underlying semantic intent / meaning. \n 
        Here is the initial question:
        \n ------- \n
        {question} 
        \n ------- \n
        Formulate an improved question: """,
            )
        ]

        # Rewriter model
        model = ChatOpenAI(temperature=0, model="gpt-4-0125-preview", streaming=True)
        response = model.invoke(msg)
        print(f'IMPROVED QUESTION: {response}')
        return {"messages": [response.content]}
    
    def generate(self, state):
        """
        Generate answer

        Args:
            state (messages): The current state

        Returns:
             dict: The updated state with re-phrased question
        """
        print("---GENERATE---")
        messages = state["messages"]
        question = messages[0].content
        last_message = messages[-1]

        docs = last_message.content

        # Prompt
        prompt = hub.pull("rlm/rag-prompt")

        # LLM
        llm = ChatOpenAI(model_name=self.model_name, temperature=0, streaming=True)

        # Chain
        rag_chain = prompt | llm | StrOutputParser()

        # Run
        response = rag_chain.invoke({"context": docs, "question": question})
        return {"messages": [response]}
    
    def _setup_graph(self):
        """Setup the workflow graph"""
        # Define the graph
        workflow = StateGraph(AgentState)
        
        # Define the nodes
        workflow.add_node("agent", self.agent)
        retrieve = ToolNode([self.retriever_tool])
        workflow.add_node("retrieve", retrieve)
        workflow.add_node("rewrite", self.rewrite)
        workflow.add_node("generate", self.generate)
        
        # Add edges
        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges(
            "agent",
            tools_condition,
            {
                "tools": "retrieve",
                END: END,
            },
        )
        workflow.add_conditional_edges(
            "retrieve",
            self.grade_documents,
        )
        workflow.add_edge("generate", END)
        workflow.add_edge("rewrite", "agent")
        
        # Compile
        self.graph = workflow.compile()
    
    def run(self, query: str) -> str:
        """
        Run the RAG agent with a single user query
        
        Args:
            query (str): The user's question
            
        Returns:
            str: The final response from the agent
        """
        if not self.graph:
            raise ValueError("Graph not initialized. Load documents first.")
            
        # Create initial state with the user's query
        state = {"messages": [HumanMessage(content=query)]}
        
        # Execute the graph with the initial state
        result = self.graph.invoke(state)
        
        # Return the final message content
        return result["messages"][-1].content


# For standalone usage and demo
def run_rag_agent_demo():
    """Run a demo of the RAG QA Agent"""
    # Use absolute path to avoid path issues
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pdf_path = os.path.join(base_dir, 'media', 'notes', 'Generative_AI_and_LLMs_0l9ocL6.pdf')
    
    # Initialize the agent
    agent = RAGQAAgent(model_name="gpt-4o")
    
    # Load documents
    documents = agent.load_documents([pdf_path])
    
    # Initialize vectorstore
    agent.initialize_vectorstore(documents)
    
    # Demo with a test question
    test_question = "What is quantum chromodynamics?"
    print("\n=== RAG-QA Agent Demo ===")
    print(f"Question: {test_question}")
    print("\nProcessing...")
    
    # Run the agent
    response = agent.run(test_question)
    
    print("\n=== Response ===")
    print(response)
    
    return response


if __name__ == "__main__":
    # Run the demo
    run_rag_agent_demo()