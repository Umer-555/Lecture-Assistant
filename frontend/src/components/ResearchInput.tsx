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
      {/* Animated gradient background */}
      <div style={styles.gradientBackground}></div>

      {/* Floating particles effect */}
      <div style={styles.particle1}></div>
      <div style={styles.particle2}></div>
      <div style={styles.particle3}></div>

      {/* Main glass card */}
      <div style={styles.glassCard}>
        <h1 style={styles.title}>Lecture Assistant</h1>
        <div style={styles.titleAccent}></div>
        <p style={styles.subtitle}>
          AI-powered research with human oversight
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your lecture topic..."
              style={styles.input}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
            disabled={isLoading || !topic.trim()}
          >
            {isLoading ? (
              <span>⟳ Researching...</span>
            ) : (
              <span>Start Research →</span>
            )}
          </button>
        </form>

        {isLoading && (
          <div style={styles.loadingText}>
            Analyzing sources and gathering insights...
          </div>
        )}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 50%, #4CAF50 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 15s ease infinite',
    zIndex: -1,
  },
  particle1: {
    position: 'fixed',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, transparent 70%)',
    top: '10%',
    left: '10%',
    animation: 'float 20s ease-in-out infinite',
    zIndex: -1,
  },
  particle2: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
    bottom: '5%',
    right: '5%',
    animation: 'float 25s ease-in-out infinite reverse',
    zIndex: -1,
  },
  particle3: {
    position: 'fixed',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.12) 0%, transparent 70%)',
    top: '50%',
    right: '20%',
    animation: 'float 18s ease-in-out infinite',
    zIndex: -1,
  },
  glassCard: {
    maxWidth: '600px',
    width: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '60px 50px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '15px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
  },
  titleAccent: {
    width: '80px',
    height: '4px',
    background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
    margin: '0 auto 20px',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#555',
    textAlign: 'center',
    marginBottom: '40px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '18px 20px',
    fontSize: '1.05rem',
    border: '2px solid rgba(76, 175, 80, 0.2)',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxSizing: 'border-box',
  },
  button: {
    padding: '18px 32px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonDisabled: {
    background: 'linear-gradient(135deg, #ccc 0%, #bbb 100%)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  loadingText: {
    marginTop: '24px',
    fontSize: '1rem',
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
    animation: 'pulse 2s ease-in-out infinite',
  },
};
