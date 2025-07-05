import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Moon, Sun, Palette, Star, Edit, Trash, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

type Note = {
  id: string;
  title: string;
  content: string;
  color: string;
  date: string;
  time: string;
  pinned: boolean;
};

const colorOptions = [
  { value: 'bg-blue-100 border-blue-200', label: 'Blue' },
  { value: 'bg-orange-100 border-orange-200', label: 'Orange' },
  { value: 'bg-pink-100 border-pink-200', label: 'Pink' },
  { value: 'bg-purple-100 border-purple-200', label: 'Purple' },
  { value: 'bg-green-100 border-green-200', label: 'Green' },
  { value: 'bg-amber-50 border-amber-100', label: 'Beige' },
];

export default function MyNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    color: 'bg-blue-100 border-blue-200',
    pinned: false,
  });
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const { user } = useAuth();
  const { darkMode, toggleDarkMode, theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const storedNotes = localStorage.getItem(`notes_${user.username}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes).map((note: Note) => ({
          ...note,
          date: note.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: note.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        })));
      }
    }
  }, [user]);

  const saveNotes = (updatedNotes: Note[]) => {
    if (user) {
      localStorage.setItem(`notes_${user.username}`, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setNewNote((prev) => ({ ...prev, color }));
  };

  const handleCreateNote = () => {
    const now = new Date();
    const newId = Date.now().toString();
    const newNoteItem: Note = {
      id: newId,
      title: newNote.title || 'New Note',
      content: newNote.content || 'Start typing here...',
      color: newNote.color,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      pinned: newNote.pinned,
    };

    const updatedNotes = [...notes, newNoteItem];
    saveNotes(updatedNotes);
    setShowCreateForm(false);
    setNewNote({
      title: '',
      content: '',
      color: 'bg-blue-100 border-blue-200',
      pinned: false,
    });
  };

  const handleUpdateNote = () => {
    if (!editingNote) return;

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id
        ? {
            ...note,
            title: newNote.title || note.title,
            content: newNote.content || note.content,
            color: newNote.color || note.color,
            pinned: newNote.pinned,
          }
        : note
    );

    saveNotes(updatedNotes);
    setEditingNote(null);
    setShowCreateForm(false);
    setNewNote({
      title: '',
      content: '',
      color: 'bg-blue-100 border-blue-200',
      pinned: false,
    });
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotes(updatedNotes);
    if (editingNote?.id === id) {
      setEditingNote(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowCreateForm(true);
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color,
      pinned: note.pinned,
    });
  };

  const handleAddNewNote = () => {
    setShowCreateForm(true);
    setEditingNote(null);
    setNewNote({
      title: '',
      content: '',
      color: 'bg-blue-100 border-blue-200',
      pinned: false,
    });
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingNote(null);
    setNewNote({
      title: '',
      content: '',
      color: 'bg-blue-100 border-blue-200',
      pinned: false,
    });
  };

  const togglePinNote = (id: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, pinned: !note.pinned } : note
    );
    saveNotes(updatedNotes);
  };

  const sortedNotes = [...notes].sort((a, b) =>
    a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1
  );

  const getThemeClass = () => {
    if (!darkMode) {
      return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
    switch (theme) {
      case 'blue':
        return '!bg-blue-900';
      case 'green':
        return '!bg-green-900';
      case 'black':
        return '!bg-black';
      default:
        return '!bg-purple-900';
    }
  };

  const getThemeAccent = () => {
    switch (theme) {
      case 'blue':
        return 'blue';
      case 'green':
        return 'green';
      case 'black':
        return 'gray';
      default:
        return 'purple';
    }
  };

  const themeColor = getThemeAccent();

  return (
    <div className={`min-h-screen p-6 ${getThemeClass()} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <button
              className={`rounded-full p-2 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-gray-700' : `text-${themeColor}-800 hover:bg-${themeColor}-100`}`}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Notes</h1>
            <Check className="text-blue-500" size={24} strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className={`rounded-full p-2 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-gray-700' : `text-${themeColor}-800 hover:bg-${themeColor}-100`}`}
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              >
                <Palette className="h-5 w-5" />
              </button>
              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <button
                      className={`px-2 py-1 rounded text-white ${theme === 'purple' ? 'bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                      onClick={() => {
                        setTheme('purple');
                        setShowThemeDropdown(false);
                      }}
                    >
                      Purple
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-white ${theme === 'blue' ? 'bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => {
                        setTheme('blue');
                        setShowThemeDropdown(false);
                      }}
                    >
                      Blue
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-white ${theme === 'green' ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'}`}
                      onClick={() => {
                        setTheme('green');
                        setShowThemeDropdown(false);
                      }}
                    >
                      Green
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-white ${theme === 'black' ? 'bg-black' : 'bg-black hover:bg-gray-800'}`}
                      onClick={() => {
                        setTheme('black');
                        setShowThemeDropdown(false);
                      }}
                    >
                      Black
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className={`rounded-full p-2 transition-colors duration-200 ${darkMode ? 'text-white hover:bg-gray-700' : `text-${themeColor}-800 hover:bg-${themeColor}-100`}`}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Button
              variant="default"
              size="icon"
              onClick={handleAddNewNote}
              className="rounded-full bg-blue-500 hover:bg-blue-600 shadow-md"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedNotes.map((note, index) => (
            <div
              key={note.id}
              className={`${note.color} p-5 rounded-xl shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 relative`}
              style={{
                transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
                zIndex: notes.length - index,
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinNote(note.id);
                }}
                className={`absolute top-3 left-3 p-1 rounded-full ${note.pinned ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
              >
                <Star
                  className="h-5 w-5"
                  fill={note.pinned ? 'currentColor' : 'none'}
                />
              </button>

              <div className="absolute top-3 right-3 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditNote(note);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              </div>

              <h3 className="font-bold text-xl mb-3 mt-6 text-gray-800">{note.title}</h3>
              <p className="text-gray-700 mb-4">{note.content}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{note.date}</span>
                <span>{note.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Note Modal */}
        {(showCreateForm && !editingNote) && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md relative border-0 shadow-xl">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <CardHeader>
                <CardTitle>Create New Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter title"
                      value={newNote.title}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Content</label>
                    <textarea
                      name="content"
                      placeholder="Enter content"
                      value={newNote.content}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Color</label>
                    <div className="flex gap-3">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`w-10 h-10 rounded-lg cursor-pointer ${color.value} ${
                            newNote.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          } transition-all hover:scale-110`}
                          onClick={() => handleColorSelect(color.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pin-note"
                      checked={newNote.pinned}
                      onChange={(e) => setNewNote((prev) => ({ ...prev, pinned: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="pin-note" className="text-sm font-medium text-gray-600">
                      Pin this note
                    </label>
                  </div>

                  <Button
                    className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    onClick={handleCreateNote}
                    disabled={!newNote.title && !newNote.content}
                  >
                    Create Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showCreateForm && editingNote && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md relative border-0 shadow-xl">
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              <CardHeader>
                <CardTitle>Edit Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Title</label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter title"
                      value={newNote.title}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Content</label>
                    <textarea
                      name="content"
                      placeholder="Enter content"
                      value={newNote.content}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">Color</label>
                    <div className="flex gap-3">
                      {colorOptions.map((color) => (
                        <div
                          key={color.value}
                          className={`w-10 h-10 rounded-lg cursor-pointer ${color.value} ${
                            newNote.color === color.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          } transition-all hover:scale-110`}
                          onClick={() => handleColorSelect(color.value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pin-note-edit"
                      checked={newNote.pinned}
                      onChange={(e) => setNewNote((prev) => ({ ...prev, pinned: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="pin-note-edit" className="text-sm font-medium text-gray-600">
                      Pin this note
                    </label>
                  </div>

                  <Button
                    className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    onClick={handleUpdateNote}
                    disabled={!newNote.title && !newNote.content}
                  >
                    Update Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}