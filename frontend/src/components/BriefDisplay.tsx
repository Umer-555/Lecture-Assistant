/**
 * BriefDisplay Component
 * Display final research brief with citations
 */

import React from 'react';

interface Slide {
  slide_number: number;
  title: string;
  content: string[];
  speaker_notes: string;
  visual_suggestions: string;
  citations: string[];
  duration_min: number;
}

interface Reference {
  number: number;
  title: string;
  url: string;
  description: string;
}

interface Brief {
  title: string;
  author: string;
  date: string;
  slides: Slide[];
  references: Reference[];
  total_slides: number;
  markdown_export?: string;
}

interface BriefDisplayProps {
  brief: Brief;
  onDownload?: () => void;
  onNewResearch?: () => void;
}

export default function BriefDisplay({ brief, onDownload, onNewResearch }: BriefDisplayProps) {
  // Defensive check: ensure brief has slides and references
  if (!brief || !brief.slides || !Array.isArray(brief.slides) || !brief.references || !Array.isArray(brief.references)) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.gradientBackground}></div>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Error Loading Slides</h1>
            <p style={{color: '#666', marginTop: '20px'}}>The presentation data is in an unexpected format. Please try regenerating.</p>
            {onNewResearch && (
              <button onClick={onNewResearch} style={styles.newButton}>
                ⟴ Start New Research
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const downloadMarkdown = () => {
    const content = brief.markdown_export || formatSlidesAsMarkdown(brief);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/\s+/g, '_')}_slides.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadText = () => {
    const content = formatSlidesAsText(brief);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brief.title.replace(/\s+/g, '_')}_slides.txt`;
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
          <p style={styles.metadata}>{brief.author} • {brief.date}</p>
          <p style={styles.slideCount}>{brief.total_slides} slides ready for download</p>
          <div style={styles.buttonGroup}>
            <button onClick={downloadMarkdown} style={styles.downloadButton}>
              ⇓ Download Markdown
            </button>
            <button onClick={downloadText} style={styles.downloadButton}>
              ⇓ Download Text
            </button>
            {onNewResearch && (
              <button onClick={onNewResearch} style={styles.newButton}>
                ⟴ New Research
              </button>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Lecture Slides Preview</h2>
          <div style={styles.slidesContainer}>
            {brief.slides.map((slide) => (
              <div key={slide.slide_number} style={styles.slideCard}>
                <div style={styles.slideHeader}>
                  <span style={styles.slideNumber}>Slide {slide.slide_number}</span>
                  <span style={styles.slideDuration}>{slide.duration_min} min</span>
                </div>
                <h3 style={styles.slideTitle}>{slide.title}</h3>

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

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>References</h2>
          <div style={styles.sourcesContainer}>
            {brief.references.map((ref) => (
              <div key={ref.number} style={styles.sourceCard}>
                <div style={styles.sourceNumber}>[{ref.number}]</div>
                <div style={styles.sourceContent}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                    {ref.title}
                  </a>
                  <p style={styles.sourceDescription}>{ref.description}</p>
                  <p style={styles.sourceUrl}>{ref.url}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSlidesAsMarkdown(brief: Brief): string {
  let md = `# ${brief.title}\n\n`;
  md += `**${brief.author}**  \n`;
  md += `${brief.date}  \n`;
  md += `${brief.total_slides} slides\n\n`;
  md += `---\n\n`;

  brief.slides.forEach((slide) => {
    md += `## Slide ${slide.slide_number}: ${slide.title}\n\n`;
    md += `**Duration:** ${slide.duration_min} minutes\n\n`;
    md += `### Content\n\n`;
    slide.content.forEach((point) => {
      md += `- ${point}\n`;
    });
    md += `\n`;

    if (slide.speaker_notes) {
      md += `**Speaker Notes:** ${slide.speaker_notes}\n\n`;
    }

    if (slide.visual_suggestions) {
      md += `**Visual Suggestions:** ${slide.visual_suggestions}\n\n`;
    }

    if (slide.citations && slide.citations.length > 0) {
      md += `**Citations:** ${slide.citations.join(', ')}\n\n`;
    }

    md += `---\n\n`;
  });

  md += `## References\n\n`;
  brief.references.forEach((ref) => {
    md += `[${ref.number}] **${ref.title}**  \n`;
    md += `${ref.description}  \n`;
    md += `${ref.url}\n\n`;
  });

  return md;
}

function formatSlidesAsText(brief: Brief): string {
  let text = `${brief.title}\n${'='.repeat(brief.title.length)}\n\n`;
  text += `${brief.author}\n`;
  text += `${brief.date}\n`;
  text += `${brief.total_slides} slides\n\n`;
  text += `${'='.repeat(60)}\n\n`;

  brief.slides.forEach((slide) => {
    text += `SLIDE ${slide.slide_number}: ${slide.title}\n`;
    text += `Duration: ${slide.duration_min} minutes\n\n`;
    text += `Content:\n`;
    slide.content.forEach((point, idx) => {
      text += `  ${idx + 1}. ${point}\n`;
    });
    text += `\n`;

    if (slide.speaker_notes) {
      text += `Speaker Notes: ${slide.speaker_notes}\n\n`;
    }

    if (slide.visual_suggestions) {
      text += `Visual: ${slide.visual_suggestions}\n\n`;
    }

    if (slide.citations && slide.citations.length > 0) {
      text += `Citations: ${slide.citations.join(', ')}\n\n`;
    }

    text += `${'-'.repeat(60)}\n\n`;
  });

  text += `REFERENCES\n${'='.repeat(60)}\n\n`;
  brief.references.forEach((ref) => {
    text += `[${ref.number}] ${ref.title}\n`;
    text += `    ${ref.description}\n`;
    text += `    ${ref.url}\n\n`;
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
    margin: '0 auto 20px',
    borderRadius: '2px',
  },
  metadata: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '8px',
  },
  slideCount: {
    fontSize: '1.1rem',
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: '25px',
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
  slidesContainer: {
    maxHeight: '700px',
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
    fontSize: '1.2rem',
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
};
