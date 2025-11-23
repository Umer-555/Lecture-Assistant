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
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Review Draft Lecture Plan</h2>
      <p style={styles.subtitle}>Topic: {topic}</p>

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

      <div style={styles.decisionSection}>
        <h3 style={styles.sectionTitle}>Your Decision</h3>
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
          Submit Decision
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '20px',
  },
  planCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '15px',
    color: '#333',
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
    padding: '10px',
    backgroundColor: '#e8f5e9',
    borderRadius: '5px',
  },
  decisionSection: {
    marginTop: '20px',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
  },
  decisionButton: {
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    border: '2px solid #ddd',
    borderRadius: '6px',
    minHeight: '100px',
    marginBottom: '15px',
    fontFamily: 'inherit',
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
};
