# [BUG] Manual text notes not indexed for AI agent Q&A

## Issue Description
When users create manual text notes (not file uploads), the AI agent does not seem to have access to this content during Q&A sessions. The notes appear to be saved successfully but are not being processed by the vector store system for RAG functionality.

## Priority
🔴 **High** - This affects core AI functionality

## Expected Behavior
- Manual text notes should be automatically indexed into the vector store
- AI agents should be able to access and reference text note content during Q&A
- Chat responses should include information from both uploaded files AND manually created text notes

## Current Behavior
- Text notes are saved to the database successfully
- AI agents only seem to reference uploaded file content
- Manual text notes are not accessible during chat sessions

## Technical Details
**Affected Components:**
- Notes creation API (`/api/workspace/{id}/create_note`)
- Vector store indexing system
- RAG agent retrieval process

**Possible Root Cause:**
- Text notes may not be getting indexed into ChromaDB after creation
- Vector store manager might only process file uploads, not text content
- Missing trigger to index text notes after creation

## Steps to Reproduce
1. Navigate to a workspace
2. Go to Notes section
3. Create a new text note with manual content
4. Switch to Chat section
5. Ask a question about the content from the text note
6. Observe that AI doesn't reference the manual note content

## Technical Investigation Needed
- [ ] Check if `vector_store_manager.py` processes text notes
- [ ] Verify if notes creation endpoint triggers vector indexing
- [ ] Review RAG agent retrieval to ensure it searches all indexed content
- [ ] Check ChromaDB collections to see if text notes are stored

## Acceptance Criteria
- [ ] Manual text notes are automatically indexed after creation
- [ ] AI agents can reference text note content in responses
- [ ] Vector store contains both file content and manual text notes
- [ ] Q&A functionality works equally for files and text notes

## Implementation Notes
May require:
1. Adding vector indexing trigger after text note creation
2. Updating `vector_store_manager.py` to handle text content
3. Ensuring RAG agents retrieve from all content types
4. Testing indexing and retrieval functionality

---
**Labels:** `bug`, `high-priority`, `ai-functionality`, `vector-store`
**Milestone:** Notes System Integration