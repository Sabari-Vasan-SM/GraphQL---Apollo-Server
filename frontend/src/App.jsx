import React from 'react'
import './App.css'
import StudentsList from './StudentsList'
import AddStudent from './AddStudent'

export default function App() {
  console.log('App component rendering');
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-content">
          <div className="hero-section">
            <h1 className="hero-title">🎓 Student Manager</h1>
            <p className="hero-subtitle">Manage your students with GraphQL and Apollo</p>
          </div>
        </div>
      </header>
      
      <main className="app-content">
        <div className="main-grid">
          <div className="card fade-in">
            <AddStudent />
          </div>
          <div className="card fade-in">
            <StudentsList />
          </div>
        </div>
      </main>
    </div>
  )
}
