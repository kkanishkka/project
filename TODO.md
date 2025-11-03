# TODO: Fix Note Saving and User Integrity Issues

## Pending Tasks
- [x] Add 'subject' field to Note model in backend/src/models/Note.js
- [x] Update createSchema in backend/src/controllers/notes.controller.js to include subject
- [x] Fix frontend NoteEditor.jsx to use note._id for editing instead of note.id
- [x] Fix NotesPage.jsx to use note._id for key instead of note.id
- [x] Ensure DataContext.jsx updateNote uses correct id (already passed as id, but confirm)
- [ ] Test note creation, editing, and user isolation

## Followup Steps
- [x] Run backend and frontend servers
- [ ] Create a note as one user, verify it saves and displays
- [ ] Switch to another user, create note, verify only their notes show
- [ ] Edit a note and confirm it updates in DB
