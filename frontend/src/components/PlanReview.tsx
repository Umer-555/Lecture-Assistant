/**
 * PlanReview Component
 * HITL Checkpoint 1: Review draft lecture plan
 */

import React, { useState } from 'react';

interface Section {
  title: string;
  duration_min: number;
  topics: string[];
  learning_objectives?: string[];
}

interface DraftPlan {
  sections: Section[];
  total_duration: number;
  focus_areas: string[];
}

interface PlanReviewProps {
  draftPlan: DraftPlan;
  topic: string;
  onDecision: (decision: string, customFeedback?: string) => void;
}

export default function PlanReview({ draftPlan, topic, onDecision }: PlanReviewProps) {
  const [customFeedback, setCustomFeedback] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');

  const decisions = [
    { value: 'approve', label: '✓ Approve', color: '#4CAF50' },
    { value: 'emphasize_practical', label: '⚡ Emphasize Practical Examples', color: '#FF9800' },
    { value: 'focus_ethics', label: '⚖️ Focus on Ethics', color: '#9C27B0' },
    { value: 'restructure', label: '↻ Restructure Plan', color: '#2196F3' },
    { value: 'rework_completely', label: '⟲ Rework Completely', color: '#f44336' },
  ];

  const handleSubmit = () => {
    if (selectedDecision) {
      onDecision(selectedDecision, customFeedback || undefined);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Animated gradient background */}
      <div style={styles.gradientBackground}></div>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h2 style={styles.title}>Review Draft Lecture Plan</h2>
          <div style={styles.titleAccent}></div>
          <p style={styles.subtitle}>{topic}</p>
        </div>

        <div style={styles.planCard}>
        <h3 style={styles.sectionTitle}>Proposed Structure</h3>
        <p style={styles.duration}>Total Duration: {draftPlan.total_duration} minutes</p>

        {draftPlan.sections.map((section, idx) => (
          <div key={idx} style={styles.section}>
            <div style={styles.sectionHeader}>
              <strong>{section.title}</strong>
              <span style={styles.time}>{section.duration_min} min</span>
            </div>
            <ul style={styles.topicList}>
              {section.topics.map((topic, tidx) => (
                <li key={tidx}>{topic}</li>
              ))}
            </ul>
            {section.learning_objectives && (
              <div style={styles.objectives}>
                <em>Objectives:</em>
                <ul>
                  {section.learning_objectives.map((obj, oidx) => (
                    <li key={oidx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}

        {draftPlan.focus_areas && draftPlan.focus_areas.length > 0 && (
          <div style={styles.focusAreas}>
            <strong>Focus Areas:</strong> {draftPlan.focus_areas.join(', ')}
          </div>
        )}
      </div>

      <div style={styles.decisionCard}>
        <h3 style={styles.decisionTitle}>Your Decision</h3>
        <div style={styles.buttonGrid}>
          {decisions.map((decision) => (
            <button
              key={decision.value}
              onClick={() => setSelectedDecision(decision.value)}
              style={{
                ...styles.decisionButton,
                backgroundColor: selectedDecision === decision.value ? decision.color : '#f5f5f5',
                color: selectedDecision === decision.value ? 'white' : '#333',
                border: `2px solid ${decision.color}`,
              }}
            >
              {decision.label}
            </button>
          ))}
        </div>

        <textarea
          value={customFeedback}
          onChange={(e) => setCustomFeedback(e.target.value)}
          placeholder="Optional: Add specific feedback or suggestions..."
          style={styles.textarea}
        />

        <button
          onClick={handleSubmit}
          disabled={!selectedDecision}
          style={selectedDecision ? styles.submitButton : { ...styles.submitButton, ...styles.submitButtonDisabled }}
        >
          Submit Decision →
        </button>
      </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'auto',
    paddingBottom: '40px',
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
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  headerCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: '700',
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
    fontSize: '1.2rem',
    color: '#555',
    fontWeight: '500',
  },
  planCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    marginBottom: '15px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  duration: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '15px',
  },
  section: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #ddd',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '1.1rem',
  },
  time: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  topicList: {
    marginLeft: '20px',
    marginTop: '5px',
  },
  objectives: {
    marginTop: '10px',
    fontSize: '0.95rem',
    color: '#555',
  },
  focusAreas: {
    marginTop: '15px',
    padding: '15px',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1))',
    borderRadius: '12px',
    border: '1px solid rgba(76, 175, 80, 0.2)',
  },
  decisionCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  decisionTitle: {
    fontSize: '1.6rem',
    marginBottom: '20px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  decisionButton: {
    padding: '14px',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    fontSize: '1rem',
    border: '2px solid rgba(76, 175, 80, 0.2)',
    borderRadius: '12px',
    minHeight: '100px',
    marginBottom: '20px',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  },
  submitButtonDisabled: {
    background: 'linear-gradient(135deg, #ccc 0%, #bbb 100%)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
};
