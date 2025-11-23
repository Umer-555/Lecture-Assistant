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
                📄 View Last Research
              </button>
            </div>
          )}
        </>
      )}

      {stage === 'researching' && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>🔬 Research in Progress</h2>
          <p style={styles.loadingText}>{statusMessage}</p>
          <div style={styles.progressBar}>
            <div style={styles.progressFill}></div>
          </div>
          <p style={styles.hint}>This may take 30-60 seconds. The graph will pause for your review.</p>
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
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h2 style={styles.loadingTitle}>📝 Generating Final Brief</h2>
          <p style={styles.loadingText}>{statusMessage}</p>
        </div>
      )}

      {stage === 'completed' && brief && (
        <BriefDisplay brief={brief} onNewResearch={handleNewResearch} />
      )}

      {stage === 'error' && (
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>⚠️ Error</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={handleNewResearch} style={styles.retryButton}>
            Try Again
          </button>
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
  loadingContainer: {
    maxWidth: '600px',
    margin: '100px auto',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #f3f3f3',
    borderTop: '6px solid #4CAF50',
    borderRadius: '50%',
    margin: '0 auto 20px',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    fontSize: '1.8rem',
    marginBottom: '15px',
    color: '#333',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '20px',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4CAF50',
    animation: 'progress 2s ease-in-out infinite',
  },
  hint: {
    fontSize: '0.9rem',
    color: '#999',
    fontStyle: 'italic',
  },
  errorContainer: {
    maxWidth: '600px',
    margin: '100px auto',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '2px solid #f44336',
  },
  errorTitle: {
    fontSize: '1.8rem',
    marginBottom: '15px',
    color: '#f44336',
  },
  errorText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '20px',
  },
  retryButton: {
    padding: '12px 24px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
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
