/**
 * BriefDisplay Component
 * Display final research brief with citations
 */

import React from 'react';

interface FurtherReading {
  title: string;
  url: string;
  description: string;
}

interface Brief {
  title: string;
  introduction: string;
  summary: string;
  key_findings: string[];
  risks_unknowns: string[];
  further_reading: FurtherReading[];
  appendix?: any;
}

interface BriefDisplayProps {
  brief: Brief;
  onDownload?: () => void;
  onNewResearch?: () => void;
}

export default function BriefDisplay({ brief, onDownload, onNewResearch }: BriefDisplayProps) {
  const downloadBrief = () => {
    const content = formatBriefAsText(brief);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Animated gradient background */}
      <div style={styles.gradientBackground}></div>

      {/* Floating particles */}
      <div style={styles.particle1}></div>
      <div style={styles.particle2}></div>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{brief.title}</h1>
          <div style={styles.titleAccent}></div>
        <div style={styles.buttonGroup}>
          <button onClick={downloadBrief} style={styles.downloadButton}>
            ⇓ Download Brief
          </button>
          {onNewResearch && (
            <button onClick={onNewResearch} style={styles.newButton}>
              ⟴ New Research
            </button>
          )}
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Introduction</h2>
        <p style={styles.text}>{brief.introduction}</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Summary</h2>
        <p style={styles.text}>{brief.summary}</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Key Findings</h2>
        <ul style={styles.list}>
          {brief.key_findings.map((finding, idx) => (
            <li key={idx} style={styles.listItem}>
              {finding}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Risks & Unknowns</h2>
        <ul style={styles.list}>
          {brief.risks_unknowns.map((risk, idx) => (
            <li key={idx} style={styles.listItem}>
              {risk}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Further Reading</h2>
        <div style={styles.sourcesContainer}>
          {brief.further_reading.map((source, idx) => (
            <div key={idx} style={styles.sourceCard}>
              <div style={styles.sourceNumber}>[{idx + 1}]</div>
              <div style={styles.sourceContent}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                  {source.title}
                </a>
                <p style={styles.sourceDescription}>{source.description}</p>
                <p style={styles.sourceUrl}>{source.url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {brief.appendix && (
        <div style={styles.section}>
          <details>
            <summary style={styles.appendixSummary}>📊 Execution Trace (Optional)</summary>
            <div style={styles.appendix}>
              <p><strong>Total Sources:</strong> {brief.appendix.total_sources}</p>
              <p><strong>Claims Extracted:</strong> {brief.appendix.total_claims_extracted}</p>
              <p><strong>Verified Claims:</strong> {brief.appendix.verified_claims}</p>
            </div>
          </details>
        </div>
      )}
      </div>
    </div>
  );
}

function formatBriefAsText(brief: Brief): string {
  let text = `${brief.title}\n${'='.repeat(brief.title.length)}\n\n`;
  text += `INTRODUCTION\n${brief.introduction}\n\n`;
  text += `SUMMARY\n${brief.summary}\n\n`;
  text += `KEY FINDINGS\n`;
  brief.key_findings.forEach((f, i) => {
    text += `${i + 1}. ${f}\n`;
  });
  text += `\nRISKS & UNKNOWNS\n`;
  brief.risks_unknowns.forEach((r, i) => {
    text += `${i + 1}. ${r}\n`;
  });
  text += `\nFURTHER READING\n`;
  brief.further_reading.forEach((s, i) => {
    text += `[${i + 1}] ${s.title}\n    ${s.url}\n    ${s.description}\n\n`;
  });
  return text;
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
    width: '340px',
    height: '340px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(76, 175, 80, 0.12) 0%, transparent 70%)',
    top: '10%',
    right: '5%',
    animation: 'float 26s ease-in-out infinite',
    zIndex: -1,
  },
  particle2: {
    position: 'fixed',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
    bottom: '20%',
    left: '10%',
    animation: 'float 21s ease-in-out infinite reverse',
    zIndex: -1,
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 1,
  },
  header: {
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
    fontSize: '2.8rem',
    fontWeight: '700',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
  },
  titleAccent: {
    width: '100px',
    height: '4px',
    background: 'linear-gradient(90deg, #4CAF50, #2196F3)',
    margin: '0 auto 30px',
    borderRadius: '2px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  downloadButton: {
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  },
  newButton: {
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4CAF50',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: '2px solid #4CAF50',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)',
  },
  section: {
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#2c3e50',
    paddingBottom: '12px',
    borderBottom: '2px solid rgba(76, 175, 80, 0.2)',
  },
  text: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#444',
  },
  list: {
    marginLeft: '20px',
    lineHeight: '1.8',
  },
  listItem: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#444',
  },
  sourcesContainer: {
    marginTop: '15px',
  },
  sourceCard: {
    display: 'flex',
    marginBottom: '16px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(76, 175, 80, 0.2)',
    transition: 'all 0.3s ease',
  },
  sourceNumber: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: '15px',
    minWidth: '40px',
  },
  sourceContent: {
    flex: 1,
  },
  sourceLink: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#2196F3',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '5px',
  },
  sourceDescription: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '5px',
  },
  sourceUrl: {
    fontSize: '0.85rem',
    color: '#999',
    wordBreak: 'break-all',
  },
  appendixSummary: {
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#555',
    marginBottom: '10px',
  },
  appendix: {
    marginTop: '15px',
    padding: '20px',
    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05), rgba(33, 150, 243, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(76, 175, 80, 0.15)',
  },
};
