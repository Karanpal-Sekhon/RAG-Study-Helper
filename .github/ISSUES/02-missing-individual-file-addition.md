# [FEATURE] Add functionality for adding individual files to existing notesets

## Issue Description
Currently, users can only upload files when creating a new note. There's no functionality to add individual files to existing notesets/notes after they've been created. This limits the flexibility of note organization and file management.

## Priority
🟡 **Medium** - Enhances user experience and note organization

## Expected Behavior
- Users should be able to add individual files to existing notes
- File addition should be available through a clear UI action
- Added files should be integrated into the existing note display
- Vector store should automatically index newly added files

## Current Behavior
- Files can only be uploaded when creating a new note
- No option to add files to existing notes
- Users must create separate notes for additional files

## Technical Details
**Affected Components:**
- NotesSection.jsx - UI for file management
- useNotes.js hook - File addition functionality
- Backend API - File upload endpoints
- Vector store manager - File indexing

**Possible Implementation:**
- Add "Add Files" button to existing notes
- Extend `addFilesToNote` API functionality
- Update UI to show file addition interface
- Ensure proper vector indexing of new files

## Steps to Reproduce Current Limitation
1. Navigate to a workspace with existing notes
2. Try to add a file to an existing note
3. Observe that no such functionality exists
4. Current workaround: Create a new note for additional files

## Technical Investigation Needed
- [ ] Review existing `addFilesToNote` API endpoint
- [ ] Check if backend supports adding files to existing notes
- [ ] Verify vector store indexing for newly added files
- [ ] Design UI/UX for file addition workflow

## Acceptance Criteria
- [ ] Add "Add Files" button/interface to existing notes
- [ ] Implement file selection and upload for existing notes
- [ ] Ensure newly added files are properly indexed
- [ ] Update note display to show all associated files
- [ ] Maintain existing file management functionality

## UI/UX Considerations
- Clear visual indication of where to add files
- Progress indicators during file upload
- Error handling for failed uploads
- Confirmation of successful file addition

---
**Labels:** `enhancement`, `ui-improvement`, `file-management`
**Milestone:** Notes System Enhancement