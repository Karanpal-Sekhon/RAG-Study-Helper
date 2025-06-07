#!/usr/bin/env python
"""
Test script for workspace-scoped RAG implementation
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from workspace.vector_store_manager import vector_store_manager
from workspace.models import Workspace, Notes
from users.models import User
from django.test import TransactionTestCase
import tempfile
from pathlib import Path

def test_vector_store_manager():
    """Test the vector store manager functionality"""
    print("\n=== Testing Vector Store Manager ===")
    
    # Test workspace creation
    test_workspace_id = "test_workspace_12345"
    
    # Test getting vectorstore for workspace
    try:
        vectorstore = vector_store_manager.get_or_create_vectorstore(test_workspace_id)
        print(f"✓ Created vectorstore for workspace {test_workspace_id}")
        print(f"✓ Collection name: workspace_{test_workspace_id}")
    except Exception as e:
        print(f"✗ Error creating vectorstore: {e}")
        return False
    
    # Test text extraction
    try:
        # Create a temporary text file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is a test document for workspace-scoped RAG testing. It contains important information about machine learning and neural networks.")
            temp_file = f.name
        
        extracted_text = vector_store_manager.extract_text_from_file(temp_file)
        print(f"✓ Text extraction successful: {extracted_text[:50]}...")
        
        # Clean up
        os.unlink(temp_file)
    except Exception as e:
        print(f"✗ Error in text extraction: {e}")
        return False
    
    print("✓ Vector store manager tests passed")
    return True

def test_agent_manager():
    """Test the agent manager functionality"""
    print("\n=== Testing Agent Manager ===")
    
    try:
        import sys
        sys.path.append('Agents')
        from Agents.rag_agent_manager import get_agent, get_workspace_document_count
        
        # Test document count function
        test_workspace_id = "test_workspace_12345"
        doc_count = get_workspace_document_count(test_workspace_id)
        print(f"✓ Document count for workspace {test_workspace_id}: {doc_count}")
        
        # Test agent creation (this will create an agent even with no documents)
        agent = get_agent(test_workspace_id)
        print(f"✓ Created agent for workspace {test_workspace_id}")
        print(f"✓ Agent initialized: {agent.initialized}")
        
    except Exception as e:
        print(f"✗ Error in agent manager: {e}")
        return False
    
    print("✓ Agent manager tests passed")
    return True

def test_multi_agent_system():
    """Test the multi-agent system with workspace context"""
    print("\n=== Testing Multi-Agent System ===")
    
    try:
        # Import multi-agent system
        import sys
        import importlib.util
        from pathlib import Path
        from langchain_core.messages import HumanMessage
        
        # Get the project root directory
        project_root = Path('.').resolve()
        
        # Import multi-agent using the method from views.py
        agents_dir = os.path.join(project_root, 'Agents')
        if agents_dir not in sys.path:
            sys.path.append(agents_dir)
        
        multi_agent_spec = importlib.util.spec_from_file_location(
            'multi_agent', 
            os.path.join(agents_dir, 'multi-agent.py')
        )
        multi_agent = importlib.util.module_from_spec(multi_agent_spec)
        sys.modules['multi_agent'] = multi_agent
        multi_agent_spec.loader.exec_module(multi_agent)
        
        # Get the graph
        graph = multi_agent.graph
        print("✓ Multi-agent system loaded")
        
        # Test with workspace context
        test_workspace_id = "test_workspace_12345"
        test_session_id = "test_session_789"
        test_query = "What is machine learning?"
        
        state = {
            "messages": [HumanMessage(content=test_query)],
            "workspace_id": test_workspace_id,
            "session_id": test_session_id
        }
        
        print(f"✓ Testing query: {test_query}")
        print(f"✓ Workspace ID: {test_workspace_id}")
        print(f"✓ Session ID: {test_session_id}")
        
        # Process the query
        result = graph.invoke(state)
        
        # Check result
        if result and "messages" in result and len(result["messages"]) > 1:
            final_response = result["messages"][-1].content
            print(f"✓ Multi-agent response received: {final_response[:100]}...")
            print("✓ Multi-agent system test passed")
        else:
            print("✗ No response received from multi-agent system")
            return False
            
    except Exception as e:
        print(f"✗ Error in multi-agent system: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def main():
    """Run all tests"""
    print("🧪 Testing Workspace-Scoped RAG Implementation")
    print("=" * 50)
    
    # Track test results
    tests = [
        ("Vector Store Manager", test_vector_store_manager),
        ("Agent Manager", test_agent_manager),
        ("Multi-Agent System", test_multi_agent_system),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"✗ {test_name} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The workspace-scoped RAG implementation is working.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")
    
    return passed == total

if __name__ == "__main__":
    main()