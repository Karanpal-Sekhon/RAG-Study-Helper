"""
Test script for the retriever in rag-qa-agent.py
"""
import os
from dotenv import load_dotenv
load_dotenv()
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')

# Use absolute path to avoid path issues
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys
sys.path.append(base_dir)

# Import the retriever from rag-qa-agent
# We need to account for Python import mechanisms
import importlib.util
spec = importlib.util.spec_from_file_location("rag_qa_agent", os.path.join(base_dir, "Agents", "rag-qa-agent.py"))
rag_qa_agent = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rag_qa_agent)

# Get the retriever and retriever_tool from the module
retriever = rag_qa_agent.retriever
retriever_tool = rag_qa_agent.retriever_tool

def test_retriever(query):
    """Test the retriever with a query"""
    print(f"\nQuery: {query}")
    print("\nTesting direct retriever:")
    documents = retriever.invoke(query)
    print(f"Retrieved {len(documents)} documents")
    for i, doc in enumerate(documents[:3]):  # Show first 3 docs
        print(f"\nDocument {i+1}:")
        print(f"Content: {doc.page_content[:200]}...")
    
    print("\nTesting retriever tool:")
    tool_result = retriever_tool.invoke(query)
    print(f"\nTool result: {tool_result[:500]}...")

if __name__ == "__main__":
    # Test queries
    test_queries = [
        "Explain the architecture of an encoder-decoder model",
        "What are the key components of a Large Language Model?",
        "How do transformers use attention mechanisms?",
        "What is generative AI?"
    ]
    
    for query in test_queries:
        test_retriever(query)