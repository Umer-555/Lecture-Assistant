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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{brief.title}</h1>
        <div style={styles.buttonGroup}>
          <button onClick={downloadBrief} style={styles.downloadButton}>
            📥 Download Brief
          </button>
          {onNewResearch && (
            <button onClick={onNewResearch} style={styles.newButton}>
              🔄 New Research
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
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'white',
  },
  header: {
    marginBottom: '30px',
    borderBottom: '3px solid #4CAF50',
    paddingBottom: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1a1a1a',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  downloadButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4CAF50',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  newButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: 'white',
    border: '2px solid #4CAF50',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
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
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #ddd',
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
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#666',
    marginBottom: '10px',
  },
  appendix: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
  },
};
