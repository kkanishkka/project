import React, { useState } from "react";
import { useData } from "../contexts/DataContext";
import NoteEditor from "../components/NoteEditor";
import NoteCard from "../components/NoteCard";
import VoiceInput from "../components/VoiceInput";
import { Plus, Search, Filter, SortAsc, Grid, List, Mic, Brain } from "lucide-react";

const NotesPage = () => {
  const { notes } = useData();
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  const subjects = [...new Set(notes.map((note) => note.subject))];

  // Filtering notes
  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !filterSubject || note.subject === filterSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        case "subject":
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

  // Note editing
  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingNote(null);
  };

  const handleVoiceText = (text) => {
    setEditingNote({ content: text });
    setShowEditor(true);
    setShowVoiceInput(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Notes
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage, organize, and summarize your learning materials
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
           <button
  onClick={() => setShowVoiceInput(true)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
>
  <Mic className="h-4 w-4" />
  <span>Voice Note</span>
</button>

            <button
              onClick={() => setShowEditor(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Subject filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="subject">Subject</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes List */}
        {filteredNotes.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredNotes.map((note) => (
              <div key={note._id} className="space-y-2">
                <NoteCard
                  note={note}
                  viewMode={viewMode}
                  onEdit={handleEditNote}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || filterSubject ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchTerm || filterSubject
                ? "Try adjusting your search or filter criteria"
                : "Create your first note to get started with your learning journey"}
            </p>
            <button
              onClick={() => setShowEditor(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Note
            </button>
          </div>
        )}

        {/* Editors */}
        {showEditor && <NoteEditor note={editingNote} onClose={handleCloseEditor} />}
        {showVoiceInput && (
          <VoiceInput
            onClose={() => setShowVoiceInput(false)}
            onVoiceText={handleVoiceText}
          />
        )}
      </div>
    </div>
  );
};

export default NotesPage;
