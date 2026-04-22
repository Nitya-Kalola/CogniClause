// src/components/SuggestionCard.jsx
import { parseSuggestion } from "../utils/parseSuggestion";

const SuggestionCard = ({ rawSuggestion }) => {
  const { issues, optimized } = parseSuggestion(rawSuggestion);

  if (!issues.length && !optimized) return null;

  return (
    <div className="suggestion-card">

      {/* Header */}
      <div className="suggestion-header">
        <span className="suggestion-icon">✨</span>
        <span className="suggestion-title">AI Suggestion</span>
      </div>

      {/* Issues Found */}
      {issues.length > 0 && (
        <div className="suggestion-section">
          <p className="section-label issues-label">⚠ Issues Found</p>
          <ol className="issues-list">
            {issues.map((issue, i) => (
              <li key={i} className="issue-item">
                {issue}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Divider */}
      <hr className="suggestion-divider" />

      {/* Optimized Clause */}
      {optimized && (
        <div className="suggestion-section">
          <p className="section-label optimized-label">✅ Optimized Clause</p>
          <p className="optimized-text">{optimized}</p>
        </div>
      )}

    </div>
  );
};

export default SuggestionCard;