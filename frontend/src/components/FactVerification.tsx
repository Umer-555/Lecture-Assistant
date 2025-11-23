/**
 * FactVerification Component
 * HITL Checkpoint 2: Verify extracted claims
 */

import React, { useState } from 'react';

interface Claim {
  text: string;
  quote: string;
  source_url: string;
  source_title: string;
  confidence: string;
}

interface FactVerificationProps {
  claims: Claim[];
  topic: string;
  onVerify: (approvedIndices: number[], rejectedIndices: number[]) => void;
}

export default function FactVerification({ claims, topic, onVerify }: FactVerificationProps) {
  const [claimStatus, setClaimStatus] = useState<{ [key: number]: 'approved' | 'rejected' | null }>(
    {}
  );

  const handleToggle = (index: number, status: 'approved' | 'rejected') => {
    setClaimStatus((prev) => ({
      ...prev,
      [index]: prev[index] === status ? null : status,
    }));
  };

  const handleSubmit = () => {
    const approved: number[] = [];
    const rejected: number[] = [];

    Object.entries(claimStatus).forEach(([idx, status]) => {
      if (status === 'approved') {
        approved.push(parseInt(idx));
      } else if (status === 'rejected') {
        rejected.push(parseInt(idx));
      }
    });

    onVerify(approved, rejected);
  };

  const approvedCount = Object.values(claimStatus).filter((s) => s === 'approved').length;
  const rejectedCount = Object.values(claimStatus).filter((s) => s === 'rejected').length;

  return (
    <div style={styles.pageContainer}>
      {/* Animated gradient background */}
      <div style={styles.gradientBackground}></div>

      <div style={styles.container}>
        <div style={styles.headerCard}>
          <h2 style={styles.title}>Verify Key Claims</h2>
          <div style={styles.titleAccent}></div>
          <p style={styles.subtitle}>{topic}</p>
          <p style={styles.instruction}>
            Review the extracted claims below. Verify or reject each claim based on accuracy and relevance.
          </p>
        </div>

        <div style={styles.stats}>
        <span style={styles.statApproved}>✓ Approved: {approvedCount}</span>
        <span style={styles.statRejected}>✗ Rejected: {rejectedCount}</span>
        <span style={styles.statPending}>○ Pending: {claims.length - approvedCount - rejectedCount}</span>
      </div>

      <div style={styles.claimsContainer}>
        {claims.map((claim, idx) => {
          const status = claimStatus[idx];
          return (
            <div
              key={idx}
              style={{
                ...styles.claimCard,
                borderLeft: status === 'approved'
                  ? '5px solid #4CAF50'
                  : status === 'rejected'
                  ? '5px solid #f44336'
                  : '5px solid #ddd',
                backgroundColor: status === 'approved'
                  ? '#f1f8f4'
                  : status === 'rejected'
                  ? '#fff3f3'
                  : 'white',
              }}
            >
              <div style={styles.claimHeader}>
                <span style={styles.claimNumber}>Claim #{idx + 1}</span>
                <span
                  style={{
                    ...styles.confidence,
                    color: claim.confidence === 'high' ? '#4CAF50' : claim.confidence === 'medium' ? '#FF9800' : '#f44336',
                  }}
                >
                  {claim.confidence} confidence
                </span>
              </div>

              <p style={styles.claimText}>{claim.text}</p>

              <div style={styles.quote}>
                <strong>Quote:</strong> "{claim.quote}"
              </div>

              <div style={styles.source}>
                <strong>Source:</strong>{' '}
                <a href={claim.source_url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                  {claim.source_title}
                </a>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={() => handleToggle(idx, 'approved')}
                  style={
                    status === 'approved'
                      ? { ...styles.verifyButton, ...styles.verifyButtonActive }
                      : styles.verifyButton
                  }
                >
                  ✓ Verify
                </button>
                <button
                  onClick={() => handleToggle(idx, 'rejected')}
                  style={
                    status === 'rejected'
                      ? { ...styles.rejectButton, ...styles.rejectButtonActive }
                      : styles.rejectButton
                  }
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        style={approvedCount > 0 ? styles.submitButton : { ...styles.submitButton, ...styles.submitButtonDisabled }}
        disabled={approvedCount === 0}
      >
        Continue with {approvedCount} Verified Claim{approvedCount !== 1 ? 's' : ''} →
      </button>
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
    marginBottom: '15px',
    fontWeight: '500',
  },
  instruction: {
    fontSize: '1rem',
    color: '#666',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  statApproved: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statRejected: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  statPending: {
    color: '#666',
    fontWeight: 'bold',
  },
  claimsContainer: {
    marginBottom: '20px',
  },
  claimCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  claimHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  claimNumber: {
    fontWeight: 'bold',
    color: '#333',
  },
  confidence: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  claimText: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1a1a1a',
  },
  quote: {
    fontSize: '0.95rem',
    fontStyle: 'italic',
    color: '#555',
    marginBottom: '10px',
    padding: '12px',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))',
    borderLeft: '4px solid rgba(76, 175, 80, 0.5)',
    borderRadius: '8px',
  },
  source: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '15px',
  },
  link: {
    color: '#2196F3',
    textDecoration: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  verifyButton: {
    flex: 1,
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid #4CAF50',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
  },
  verifyButtonActive: {
    color: 'white',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
  },
  rejectButton: {
    flex: 1,
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#f44336',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid #f44336',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.2)',
  },
  rejectButtonActive: {
    color: 'white',
    background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
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
