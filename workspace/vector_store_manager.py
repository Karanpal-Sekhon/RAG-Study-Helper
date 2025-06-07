"""
Centralized vector store manager for workspace-scoped document retrieval.
Handles ChromaDB collections per workspace and document lifecycle management.
"""
import os
import chromadb
from typing import Union, List, Dict, Any
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
import tempfile
from pathlib import Path

# Import Django models (will be imported at runtime to avoid circular imports)
from django.conf import settings


class WorkspaceVectorStoreManager:
    """
    Manages ChromaDB collections for workspace-scoped document storage and retrieval.
    
    Each workspace gets its own collection to ensure document isolation between users.
    """
    
    def __init__(self):
        """Initialize the vector store manager with persistent ChromaDB client"""
        self.chroma_db_path = os.path.join(settings.BASE_DIR, 'chroma_db')
        self.embeddings = OpenAIEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, 
            chunk_overlap=50
        )
    
    def _get_collection_name(self, workspace_id: str) -> str:
        """Generate collection name for workspace"""
        return f"workspace_{workspace_id}"
    
    def get_or_create_vectorstore(self, workspace_id: str) -> Chroma:
        """
        Get or create a Chroma vectorstore for the specified workspace
        
        Args:
            workspace_id (str): The workspace UUID
            
        Returns:
            Chroma: Workspace-specific vectorstore instance
        """
        collection_name = self._get_collection_name(workspace_id)
        
        return Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=self.chroma_db_path
        )
    
    def extract_text_from_file(self, file_path: str) -> str:
        """
        Extract text content from uploaded files
        
        Args:
            file_path (str): Path to the uploaded file
            
        Returns:
            str: Extracted text content
        """
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.pdf':
            try:
                loader = PyPDFLoader(file_path)
                documents = loader.load()
                return '\n'.join([doc.page_content for doc in documents])
            except Exception as e:
                print(f"Error extracting PDF content: {e}")
                return "Error: Could not extract PDF content"
        
        elif file_extension in ['.txt', '.md']:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except Exception as e:
                print(f"Error reading text file: {e}")
                return "Error: Could not read text file"
        
        else:
            return f"Unsupported file type: {file_extension}"
    
    def add_file_to_workspace(self, workspace_id: str, file_obj, parent_document_obj) -> bool:
        """
        Add a specific file to workspace vectorstore
        
        Args:
            workspace_id (str): The workspace UUID
            file_obj: NoteFile or VideoFile instance
            parent_document_obj: Parent Notes or Videos instance
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Extract text from the file
            file_path = file_obj.file.path
            if not os.path.exists(file_path):
                print(f"File not found: {file_path}")
                return False
            
            text_content = self.extract_text_from_file(file_path)
            
            # Skip if no meaningful content
            if not text_content or text_content.strip() == "" or "Error:" in text_content:
                print(f"Skipping file {file_obj.id} - no valid content")
                return False
            
            # Chunk the text
            chunks = self.text_splitter.split_text(text_content)
            
            if not chunks:
                print(f"No chunks created for file {file_obj.id}")
                return False
            
            # Get workspace vectorstore
            vectorstore = self.get_or_create_vectorstore(workspace_id)
            
            # Prepare documents and metadata
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                documents.append(chunk)
                metadatas.append({
                    "workspace_id": workspace_id,
                    "document_id": str(parent_document_obj.id),  # Parent note/video ID
                    "file_id": str(file_obj.id),  # Specific file ID
                    "document_type": parent_document_obj.__class__.__name__.lower(),
                    "document_title": parent_document_obj.title,
                    "chunk_index": i,
                    "file_name": os.path.basename(file_path)
                })
                ids.append(f"{file_obj.id}_chunk_{i}")  # Use file ID for unique chunks
            
            # Add to vectorstore
            vectorstore.add_texts(
                texts=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            print(f"Added {len(chunks)} chunks for file {file_obj.id} ({os.path.basename(file_path)}) to workspace {workspace_id}")
            return True
            
        except Exception as e:
            print(f"Error adding file {file_obj.id} to vectorstore: {e}")
            return False
    
    def add_document_to_workspace(self, workspace_id: str, document_obj, file_path: str = None) -> bool:
        """
        Add a document (Note or Video) to workspace vectorstore
        
        Args:
            workspace_id (str): The workspace UUID
            document_obj: Django model instance (Notes or Videos)
            file_path (str, optional): Path to file if different from model
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get text content based on document type
            if hasattr(document_obj, 'file_text') and document_obj.file_text:
                text_content = document_obj.file_text
            elif hasattr(document_obj, 'transcription') and document_obj.transcription:
                text_content = document_obj.transcription
            elif file_path and os.path.exists(file_path):
                text_content = self.extract_text_from_file(file_path)
                # Update the model with extracted text
                if hasattr(document_obj, 'file_text'):
                    document_obj.file_text = text_content
                    document_obj.save()
                elif hasattr(document_obj, 'transcription'):
                    document_obj.transcription = text_content
                    document_obj.save()
            else:
                print(f"No text content available for document {document_obj.id}")
                return False
            
            # Skip if no meaningful content
            if not text_content or text_content.strip() == "" or "Error:" in text_content:
                print(f"Skipping document {document_obj.id} - no valid content")
                return False
            
            # Chunk the text
            chunks = self.text_splitter.split_text(text_content)
            
            if not chunks:
                print(f"No chunks created for document {document_obj.id}")
                return False
            
            # Get workspace vectorstore
            vectorstore = self.get_or_create_vectorstore(workspace_id)
            
            # Prepare documents and metadata
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                documents.append(chunk)
                metadatas.append({
                    "workspace_id": workspace_id,
                    "document_id": str(document_obj.id),
                    "file_id": str(document_obj.id),  # For direct content, use document ID as file ID
                    "document_type": document_obj.__class__.__name__.lower(),
                    "document_title": document_obj.title,
                    "chunk_index": i,
                    "file_name": os.path.basename(file_path) if file_path else "direct_content"
                })
                ids.append(f"{document_obj.id}_chunk_{i}")
            
            # Add to vectorstore
            vectorstore.add_texts(
                texts=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            print(f"Added {len(chunks)} chunks for document {document_obj.id} to workspace {workspace_id}")
            return True
            
        except Exception as e:
            print(f"Error adding document {document_obj.id} to vectorstore: {e}")
            return False
    
    def remove_file_from_workspace(self, workspace_id: str, file_id: str) -> bool:
        """
        Remove all chunks of a specific file from workspace vectorstore
        
        Args:
            workspace_id (str): The workspace UUID
            file_id (str): The file UUID to remove
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            vectorstore = self.get_or_create_vectorstore(workspace_id)
            
            # Get the underlying collection to use metadata filtering
            collection = vectorstore._collection
            
            # Find all chunks for this file
            results = collection.get(
                where={"file_id": file_id}
            )
            
            if results and results.get('ids'):
                # Delete all chunks for this file
                collection.delete(ids=results['ids'])
                print(f"Removed {len(results['ids'])} chunks for file {file_id} from workspace {workspace_id}")
                return True
            else:
                print(f"No chunks found for file {file_id} in workspace {workspace_id}")
                return False
                
        except Exception as e:
            print(f"Error removing file {file_id} from vectorstore: {e}")
            return False
    
    def remove_document_from_workspace(self, workspace_id: str, document_id: str) -> bool:
        """
        Remove all chunks of a document from workspace vectorstore
        
        Args:
            workspace_id (str): The workspace UUID
            document_id (str): The document UUID to remove
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            vectorstore = self.get_or_create_vectorstore(workspace_id)
            
            # Get the underlying collection to use metadata filtering
            collection = vectorstore._collection
            
            # Find all chunks for this document
            results = collection.get(
                where={"document_id": document_id}
            )
            
            if results and results.get('ids'):
                # Delete all chunks for this document
                collection.delete(ids=results['ids'])
                print(f"Removed {len(results['ids'])} chunks for document {document_id} from workspace {workspace_id}")
                return True
            else:
                print(f"No chunks found for document {document_id} in workspace {workspace_id}")
                return False
                
        except Exception as e:
            print(f"Error removing document {document_id} from vectorstore: {e}")
            return False
    
    def get_retriever_for_workspace(self, workspace_id: str, search_kwargs: Dict[str, Any] = None):
        """
        Get a retriever that searches only within the specified workspace
        
        Args:
            workspace_id (str): The workspace UUID
            search_kwargs (dict, optional): Additional search parameters
            
        Returns:
            VectorStoreRetriever: Workspace-specific retriever
        """
        if search_kwargs is None:
            search_kwargs = {"k": 5}
        
        vectorstore = self.get_or_create_vectorstore(workspace_id)
        
        return vectorstore.as_retriever(
            search_kwargs=search_kwargs
        )
    
    def update_document_in_workspace(self, workspace_id: str, document_obj, file_path: str = None) -> bool:
        """
        Update a document in the workspace vectorstore (remove old, add new)
        
        Args:
            workspace_id (str): The workspace UUID
            document_obj: Django model instance (Notes or Videos)
            file_path (str, optional): Path to updated file
            
        Returns:
            bool: True if successful, False otherwise
        """
        # Remove existing document
        self.remove_document_from_workspace(workspace_id, str(document_obj.id))
        
        # Add updated document
        return self.add_document_to_workspace(workspace_id, document_obj, file_path)
    
    def clear_workspace(self, workspace_id: str) -> bool:
        """
        Clear all documents from a workspace (useful when workspace is deleted)
        
        Args:
            workspace_id (str): The workspace UUID
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            collection_name = self._get_collection_name(workspace_id)
            
            # Delete the entire collection
            client = chromadb.PersistentClient(path=self.chroma_db_path)
            try:
                client.delete_collection(name=collection_name)
                print(f"Cleared workspace {workspace_id} vectorstore")
                return True
            except Exception:
                # Collection might not exist, which is fine
                print(f"Workspace {workspace_id} vectorstore was already empty")
                return True
                
        except Exception as e:
            print(f"Error clearing workspace {workspace_id}: {e}")
            return False


# Global instance for use across the application
vector_store_manager = WorkspaceVectorStoreManager()