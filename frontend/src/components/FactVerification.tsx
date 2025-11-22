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
    <div style={styles.container}>
      <h2 style={styles.title}>✓ Verify Key Claims</h2>
      <p style={styles.subtitle}>Topic: {topic}</p>
      <p style={styles.instruction}>
        Review the extracted claims below. Verify or reject each claim based on accuracy and relevance.
      </p>

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
        Continue with {approvedCount} Verified Claim{approvedCount !== 1 ? 's' : ''}
      </button>
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
    marginBottom: '10px',
  },
  instruction: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '20px',
  },
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
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
    marginBottom: '30px',
  },
  claimCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    transition: 'all 0.3s',
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
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderLeft: '3px solid #ddd',
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
    padding: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: 'white',
    border: '2px solid #4CAF50',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  verifyButtonActive: {
    color: 'white',
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    flex: 1,
    padding: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#f44336',
    backgroundColor: 'white',
    border: '2px solid #f44336',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  rejectButtonActive: {
    color: 'white',
    backgroundColor: '#f44336',
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
