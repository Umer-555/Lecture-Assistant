/**
 * ResearchInput Component
 * Input form for lecture topic
 */

import React, { useState } from 'react';

interface ResearchInputProps {
  onStartResearch: (topic: string) => void;
  isLoading: boolean;
}

export default function ResearchInput({ onStartResearch, isLoading }: ResearchInputProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStartResearch(topic);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Lecture Assistant</h1>
      <p style={styles.subtitle}>
        AI-powered research assistant for lecture preparation with human oversight
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter lecture topic (e.g., Model Context Protocol and Anthropic's innovations)"
          style={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          disabled={isLoading || !topic.trim()}
        >
          {isLoading ? 'Researching...' : 'Start Research'}
        </button>
      </form>

      {isLoading && (
        <div style={styles.loadingText}>
          🔍 Researching your topic...
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '15px',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '1.1rem',
    color: '#4CAF50',
    textAlign: 'center',
  },
};
