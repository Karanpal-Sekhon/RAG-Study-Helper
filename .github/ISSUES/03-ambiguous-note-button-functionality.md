# [UX] Clarify ambiguous note creation button functionality

## Issue Description
The notes section currently has 3 different buttons for adding notes, making it unclear to users which button to use for different purposes. This creates confusion and reduces the intuitiveness of the interface.

## Priority
🟡 **Medium** - Affects user experience and interface clarity

## Expected Behavior
- Clear, distinct actions for different note creation types
- Intuitive button labels and placement
- Obvious visual hierarchy and purpose for each action
- Reduced cognitive load when choosing how to create notes

## Current Behavior
- Multiple "Add Note" type buttons exist
- Unclear differentiation between button purposes
- Users unsure which button to use for their intended action
- Confusing interface with overlapping functionality

## Technical Details
**Affected Components:**
- NotesSection.jsx - Button layout and labeling
- Dialog components - Note creation workflows
- UI/UX design - Visual hierarchy and clarity

**Current Button Analysis:**
1. Main "Add Note" button (opens dialog)
2. "Create Note" button (within dialog for text notes)
3. "Upload Files" button (within dialog for file uploads)

## Steps to Reproduce Confusion
1. Navigate to Notes section
2. Observe multiple buttons related to note creation
3. Try to determine which button to use for different purposes
4. Notice unclear button hierarchy and labeling

## Proposed Solutions
**Option 1: Consolidate Buttons**
- Keep single "Add Note" button
- Improve internal tab organization
- Clearer tab labels ("Write Note" vs "Upload Files")

**Option 2: Separate Primary Actions**
- "Write Note" button for text notes
- "Upload Files" button for file uploads
- Remove confusing intermediate dialogs

**Option 3: Improved Labeling**
- Better button descriptions
- Tooltip explanations
- Visual icons to clarify purpose

## Technical Investigation Needed
- [ ] Analyze current user flow and pain points
- [ ] Review similar applications for best practices
- [ ] Test different button arrangements
- [ ] Gather user feedback on preferred approach

## Acceptance Criteria
- [ ] Clear distinction between note creation methods
- [ ] Intuitive button labeling and placement
- [ ] Reduced number of confusing interface elements
- [ ] Improved user flow for note creation
- [ ] Maintain all existing functionality

## UI/UX Requirements
- Consistent visual design language
- Clear call-to-action hierarchy
- Accessible button descriptions
- Mobile-responsive button layout
- Icon usage for visual clarity

## Implementation Notes
Consider:
1. User testing before final implementation
2. A/B testing different button arrangements
3. Analytics to track user behavior patterns
4. Gradual rollout to gather feedback

---
**Labels:** `ux-improvement`, `ui-cleanup`, `user-experience`
**Milestone:** Notes System Enhancement