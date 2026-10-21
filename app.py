# pyrefly: ignore [missing-import]
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'notes.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes', methods=['GET'])
def get_notes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, content, created_at FROM notes ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    notes = []
    for row in rows:
        notes.append({
            'id': row[0],
            'content': row[1],
            'created_at': row[2]
        })
    return jsonify(notes)

@app.route('/api/notes', methods=['POST'])
def save_note():
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({'error': 'Note content is required'}), 400
    
    if len(content) > 2000:
        return jsonify({'error': 'Note content too long (max 2000 chars)'}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO notes (content) VALUES (?)', (content,))
    note_id = cursor.lastrowid
    conn.commit()
    
    cursor.execute('SELECT id, content, created_at FROM notes WHERE id = ?', (note_id,))
    row = cursor.fetchone()
    conn.close()
    
    return jsonify({
        'id': row[0],
        'content': row[1],
        'created_at': row[2]
    }), 201

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
