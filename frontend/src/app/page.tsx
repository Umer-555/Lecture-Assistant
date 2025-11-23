'use client';

/**
 * Main Page Component
 * Orchestrates the entire research workflow with HITL checkpoints
 */

import React, { useState, useEffect } from 'react';
import ResearchInput from '../components/ResearchInput';
import PlanReview from '../components/PlanReview';
import FactVerification from '../components/FactVerification';
import BriefDisplay from '../components/BriefDisplay';
import { researchApi } from '../services/api';

type WorkflowStage = 'input' | 'researching' | 'plan_review' | 'fact_verification' | 'generating' | 'completed' | 'error';

export default function Home() {
  const [stage, setStage] = useState<WorkflowStage>('input');
  const [researchId, setResearchId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [checkpointData, setCheckpointData] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasSavedResearch, setHasSavedResearch] = useState<boolean>(false);

  // Check for saved research on mount
  useEffect(() => {
    const savedResearch = localStorage.getItem('lastResearch');
    setHasSavedResearch(!!savedResearch);
  }, []);

  // Poll for status updates
  useEffect(() => {
    if (!researchId || stage === 'completed' || stage === 'error') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await researchApi.getStatus(researchId);

        if (status.status === 'awaiting_human') {
          // Fetch checkpoint data
          const checkpoint = await researchApi.getCheckpoint(researchId);
          setCheckpointData(checkpoint.data);

          if (checkpoint.checkpoint_name === 'plan_review') {
            setStage('plan_review');
          } else if (checkpoint.checkpoint_name === 'fact_verification') {
            setStage('fact_verification');
          }

          clearInterval(pollInterval);
        } else if (status.status === 'completed') {
          // Fetch final brief
          const briefResponse = await researchApi.getBrief(researchId);
          setBrief(briefResponse.brief);
          setStage('completed');
          clearInterval(pollInterval);
        } else if (status.status === 'error') {
          setError(status.error || 'An error occurred');
          setStage('error');
          clearInterval(pollInterval);
        } else {
          // Still running
          setStatusMessage(getStatusMessage(status.status));
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // Don't stop polling on transient errors
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [researchId, stage]);

  const handleStartResearch = async (topicInput: string) => {
    setTopic(topicInput);
    setStage('researching');
    setError(null);
    setStatusMessage('Starting research...');

    try {
      const response = await researchApi.startResearch(topicInput);
      setResearchId(response.research_id);
      setStatusMessage('Researching and analyzing sources...');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start research');
      setStage('error');
    }
  };

  const handlePlanDecision = async (decision: string, customFeedback?: string) => {
    if (!researchId) return;

    setStage('researching');
    setStatusMessage('Processing your feedback...');

    try {
      await researchApi.respondToCheckpoint(researchId, decision, customFeedback);
      setCheckpointData(null);
      setStatusMessage('Continuing research...');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit feedback');
      setStage('error');
    }
  };

  const handleFactVerification = async (approvedIndices: number[], rejectedIndices: number[]) => {
    if (!researchId) return;

    setStage('generating');
    setStatusMessage('Generating final brief...');

    try {
      await researchApi.respondToCheckpoint(
        researchId,
        'verify',
        undefined,
        approvedIndices,
        rejectedIndices
      );
      setCheckpointData(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit verification');
      setStage('error');
    }
  };

  const handleNewResearch = () => {
    // Save current research to localStorage if completed
    if (stage === 'completed' && brief && researchId) {
      localStorage.setItem('lastResearch', JSON.stringify({
        researchId,
        topic,
        brief,
        timestamp: new Date().toISOString()
      }));
      setHasSavedResearch(true);
    }

    setStage('input');
    setResearchId(null);
    setTopic('');
    setCheckpointData(null);
    setBrief(null);
    setError(null);
    setStatusMessage('');
  };

  const handleViewLastResearch = () => {
    const savedData = localStorage.getItem('lastResearch');
    if (savedData) {
      try {
        const { researchId: savedId, topic: savedTopic, brief: savedBrief } = JSON.parse(savedData);
        setResearchId(savedId);
        setTopic(savedTopic);
        setBrief(savedBrief);
        setStage('completed');
      } catch (err) {
        console.error('Failed to load saved research:', err);
      }
    }
  };

  return (
    <div style={styles.container}>
      {stage === 'input' && (
        <>
          <ResearchInput onStartResearch={handleStartResearch} isLoading={false} />
          {hasSavedResearch && (
            <div style={styles.savedResearchContainer}>
              <button onClick={handleViewLastResearch} style={styles.viewLastButton}>
                ◂ View Last Research
              </button>
            </div>
          )}
        </>
      )}

      {stage === 'researching' && (
        <div style={styles.loadingPage}>
          <div style={styles.gradientBackground}></div>
          <div style={styles.loadingGlassCard}>
            <div style={styles.spinnerWrapper}>
              <div style={styles.spinner}></div>
              <div style={styles.spinnerGlow}></div>
            </div>
            <h2 style={styles.loadingTitle}>Research in Progress</h2>
            <p style={styles.loadingText}>{statusMessage}</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            <p style={styles.hint}>The workflow will pause at checkpoints for your review</p>
          </div>
        </div>
      )}

      {stage === 'plan_review' && checkpointData && (
        <PlanReview
          draftPlan={checkpointData.draft_plan}
          topic={topic}
          onDecision={handlePlanDecision}
        />
      )}

      {stage === 'fact_verification' && checkpointData && (
        <FactVerification
          claims={checkpointData.claims}
          topic={topic}
          onVerify={handleFactVerification}
        />
      )}

      {stage === 'generating' && (
        <div style={styles.loadingPage}>
          <div style={styles.gradientBackground}></div>
          <div style={styles.loadingGlassCard}>
            <div style={styles.spinnerWrapper}>
              <div style={styles.spinner}></div>
              <div style={styles.spinnerGlow}></div>
            </div>
            <h2 style={styles.loadingTitle}>Generating Final Brief</h2>
            <p style={styles.loadingText}>{statusMessage}</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>
        </div>
      )}

      {stage === 'completed' && brief && (
        <BriefDisplay brief={brief} onNewResearch={handleNewResearch} />
      )}

      {stage === 'error' && (
        <div style={styles.loadingPage}>
          <div style={styles.gradientBackground}></div>
          <div style={styles.errorCard}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Something Went Wrong</h2>
            <p style={styles.errorText}>{error}</p>
            <button onClick={handleNewResearch} style={styles.retryButton}>
              Try Again →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'running':
      return 'Analyzing sources and extracting insights...';
    default:
      return 'Processing...';
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  loadingPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  loadingGlassCard: {
    maxWidth: '500px',
    width: '100%',
    margin: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '50px 40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  spinnerWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '30px',
  },
  spinner: {
    width: '70px',
    height: '70px',
    border: '5px solid rgba(76, 175, 80, 0.1)',
    borderTop: '5px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    position: 'relative',
    zIndex: 2,
  },
  spinnerGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90px',
    height: '90px',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
    zIndex: 1,
  },
  loadingTitle: {
    fontSize: '2rem',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  loadingText: {
    fontSize: '1.05rem',
    color: '#555',
    marginBottom: '30px',
    fontWeight: '400',
  },
  progressBar: {
    width: '100%',
    height: '6px',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
    animation: 'progress 2s ease-in-out infinite',
    borderRadius: '3px',
  },
  hint: {
    fontSize: '0.95rem',
    color: '#777',
    fontWeight: '400',
  },
  errorCard: {
    maxWidth: '500px',
    width: '100%',
    margin: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '50px 40px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  errorTitle: {
    fontSize: '2rem',
    marginBottom: '15px',
    color: '#f44336',
    fontWeight: '700',
  },
  errorText: {
    fontSize: '1.05rem',
    color: '#555',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
  retryButton: {
    padding: '14px 28px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  },
  savedResearchContainer: {
    maxWidth: '600px',
    margin: '20px auto',
    textAlign: 'center',
  },
  viewLastButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#2196F3',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};
