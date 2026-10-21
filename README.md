# Quick Note App - Flask Edition

A modern, clean Quick Note Application built with Python Flask and SQLite.

## Features

- Write and save notes instantly
- View all saved notes in a beautiful card layout
- Success/error toast notifications
- Responsive design (works on mobile & desktop)
- SQLite database for persistent storage
- Character counter with limit (2000 chars)

## Quick Start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the app

```bash
python app.py
```

### 3. Open in browser

Navigate to: http://localhost:5000

## Project Structure

```
quick-note-flask/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── notes.db              # SQLite database (auto-created)
├── static/
│   ├── css/
│   │   └── style.css     # Custom warm parchment theme
│   └── js/
│       └── main.js       # Frontend logic
└── templates/
    └── index.html        # Main page
```

## API Endpoints

| Method | Endpoint     | Description        |
|--------|-------------|--------------------|
| GET    | /api/notes   | Get all notes       |
| POST   | /api/notes   | Create a new note   |

## License

MIT
