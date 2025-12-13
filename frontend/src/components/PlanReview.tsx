/**
 * PlanReview Component
 * HITL Checkpoint 1: Review draft lecture plan
 */

import React, { useState } from 'react';

interface Slide {
  slide_number: number;
  title: string;
  content: string[];
  speaker_notes: string;
  visual_suggestions: string;
  citations: string[];
  duration_min: number;
}

interface DraftPlan {
  slides: Slide[];
  total_slides: number;
  total_duration: number;
  learning_objectives: string[];
}

interface PlanReviewProps {
  draftPlan: DraftPlan;
  topic: string;
  onDecision: (decision: string, customFeedback?: string) => void;
}

export default function PlanReview({ draftPlan, topic, onDecision }: PlanReviewProps) {
  const [customFeedback, setCustomFeedback] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');

  // Defensive check: ensure draftPlan has slides
  if (!draftPlan || !draftPlan.slides || !Array.isArray(draftPlan.slides)) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.gradientBackground}></div>
        <div style={styles.container}>
          <div style={styles.headerCard}>
            <h2 style={styles.title}>Error Loading Plan</h2>
            <p style={styles.subtitle}>The draft plan is in an unexpected format. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Floating particles */}
      <div style={styles.particle1}></div>
      <div style={styles.particle2}></div>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h2 style={styles.title}>Review Draft Lecture Plan</h2>
          <div style={styles.titleAccent}></div>
          <p style={styles.subtitle}>{topic}</p>
        </div>

        <div style={styles.planCard}>
          <h3 style={styles.sectionTitle}>Draft Lecture Slides</h3>
          <p style={styles.duration}>
            {draftPlan.total_slides} slides • {draftPlan.total_duration} minutes total
          </p>

          {draftPlan.learning_objectives && draftPlan.learning_objectives.length > 0 && (
            <div style={styles.objectivesBox}>
              <strong style={{fontSize: '1.1rem', color: '#2196F3'}}>Learning Objectives:</strong>
              <ul style={styles.objectivesList}>
                {draftPlan.learning_objectives.map((obj, idx) => (
                  <li key={idx}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.slidesContainer}>
            {draftPlan.slides.map((slide) => (
              <div key={slide.slide_number} style={styles.slideCard}>
                <div style={styles.slideHeader}>
                  <span style={styles.slideNumber}>Slide {slide.slide_number}</span>
                  <span style={styles.slideDuration}>{slide.duration_min} min</span>
                </div>
                <h4 style={styles.slideTitle}>{slide.title}</h4>

                <div style={styles.slideContent}>
                  <ul style={styles.contentList}>
                    {slide.content.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>

                {slide.speaker_notes && (
                  <div style={styles.speakerNotes}>
                    <strong>Speaker Notes:</strong> {slide.speaker_notes}
                  </div>
                )}

                {slide.visual_suggestions && (
                  <div style={styles.visualSuggestions}>
                    <strong>Visual:</strong> {slide.visual_suggestions}
                  </div>
                )}

                {slide.citations && slide.citations.length > 0 && (
                  <div style={styles.citations}>
                    <strong>Citations:</strong> {slide.citations.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
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
  particle1: {
    position: 'fixed',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.12) 0%, transparent 70%)',
    top: '20%',
    right: '10%',
    animation: 'float 22s ease-in-out infinite',
    zIndex: -1,
  },
  particle2: {
    position: 'fixed',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
    bottom: '15%',
    left: '8%',
    animation: 'float 20s ease-in-out infinite reverse',
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
    background: 'rgba(255, 255, 255, 0.85)',
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
    background: 'rgba(255, 255, 255, 0.85)',
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
  objectivesBox: {
    marginBottom: '25px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08), rgba(76, 175, 80, 0.08))',
    borderRadius: '12px',
    border: '1px solid rgba(33, 150, 243, 0.2)',
  },
  objectivesList: {
    marginTop: '10px',
    marginLeft: '20px',
    lineHeight: '1.8',
  },
  slidesContainer: {
    maxHeight: '600px',
    overflowY: 'auto',
    paddingRight: '10px',
  },
  slideCard: {
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    border: '1px solid rgba(76, 175, 80, 0.2)',
    transition: 'all 0.3s ease',
  },
  slideHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  slideNumber: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4CAF50',
    background: 'rgba(76, 175, 80, 0.1)',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  slideDuration: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500',
  },
  slideTitle: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '12px',
    marginTop: '0',
  },
  slideContent: {
    marginBottom: '12px',
  },
  contentList: {
    marginLeft: '20px',
    lineHeight: '1.7',
    color: '#333',
  },
  speakerNotes: {
    fontSize: '0.9rem',
    color: '#555',
    background: 'rgba(255, 193, 7, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
    borderLeft: '3px solid #FFC107',
  },
  visualSuggestions: {
    fontSize: '0.9rem',
    color: '#555',
    background: 'rgba(156, 39, 176, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    marginTop: '8px',
    borderLeft: '3px solid #9C27B0',
  },
  citations: {
    fontSize: '0.85rem',
    color: '#2196F3',
    marginTop: '8px',
    fontStyle: 'italic',
  },
  decisionCard: {
    background: 'rgba(255, 255, 255, 0.85)',
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
