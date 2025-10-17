import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './KeywordManager.css';

const KeywordManager = ({ job, onClose }) => {
  const [keywords, setKeywords] = useState([]);
  const [minimumScore, setMinimumScore] = useState(5);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    weight: 1,
    category: 'skill',
    type: 'preferred'
  });

  useEffect(() => {
    fetchKeywords();
  }, [job._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchKeywords = async () => {
    try {
      const response = await api.get(`/api/bot-mimic/keywords/${job._id}`);
      if (response.data) {
        setKeywords(response.data.keywords || []);
        setMinimumScore(response.data.minimumScore || 5);
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
  };

  const addKeyword = () => {
    if (newKeyword.keyword.trim()) {
      setKeywords([...keywords, { ...newKeyword }]);
      setNewKeyword({ keyword: '', weight: 1, category: 'skill', type: 'preferred' });
    }
  };

  const removeKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const updateKeyword = (index, field, value) => {
    const updatedKeywords = [...keywords];
    updatedKeywords[index] = { ...updatedKeywords[index], [field]: value };
    setKeywords(updatedKeywords);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving keywords:', { keywords, minimumScore });
      const response = await api.post(`/api/bot-mimic/keywords/job/${job._id}`, {
        keywords,
        minimumScore
      });
      console.log('Keywords saved successfully:', response.data);
      alert('Keywords saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving keywords:', error);
      console.error('Error response:', error.response?.data);
      alert('Error saving keywords: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: '#007bff',
      soft_skill: '#28a745',
      education: '#ffc107',
      experience: '#17a2b8',
      certification: '#6f42c1'
    };
    return colors[category] || '#6c757d';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content keyword-manager">
        <div className="modal-header">
          <h2>Manage Keywords for {job.title}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          <div className="keyword-settings">
            <div className="form-group">
              <label>Minimum Score for Shortlisting</label>
              <input
                type="number"
                min="1"
                max="10"
                value={minimumScore}
                onChange={(e) => setMinimumScore(parseInt(e.target.value))}
                className="score-input"
              />
              <small>Applications need to score at least this much to be shortlisted</small>
            </div>
          </div>

          <div className="add-keyword-section">
            <h3>Add New Keyword</h3>
            <div className="add-keyword-form">
              <input
                type="text"
                placeholder="Enter keyword (e.g., React, JavaScript, Leadership)"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                className="keyword-input"
              />
              <select
                value={newKeyword.category}
                onChange={(e) => setNewKeyword({ ...newKeyword, category: e.target.value })}
                className="category-select"
              >
                <option value="skill">Skill</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
                <option value="experience">Experience</option>
                <option value="certification">Certification</option>
                <option value="language">Language</option>
                <option value="other">Other</option>
              </select>
              <select
                value={newKeyword.type}
                onChange={(e) => setNewKeyword({ ...newKeyword, type: e.target.value })}
                className="type-select"
              >
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
                <option value="negative">Negative</option>
              </select>
              <input
                type="number"
                min="1"
                max="10"
                value={newKeyword.weight}
                onChange={(e) => setNewKeyword({ ...newKeyword, weight: parseInt(e.target.value) })}
                className="weight-input"
                title="Weight (1-10)"
              />
              <button onClick={addKeyword} className="add-btn">
                Add
              </button>
            </div>
          </div>

          <div className="keywords-list">
            <h3>Current Keywords ({keywords.length})</h3>
            {keywords.length === 0 ? (
              <p className="no-keywords">No keywords added yet. Add some keywords to enable automated shortlisting.</p>
            ) : (
              <div className="keywords-grid">
                {keywords.map((keyword, index) => (
                  <div key={index} className="keyword-item">
                    <div className="keyword-content">
                      <span 
                        className="keyword-text"
                        style={{ borderLeftColor: getCategoryColor(keyword.category) }}
                      >
                        {keyword.keyword}
                      </span>
                      <span className="keyword-category">{keyword.category}</span>
                      <span className="keyword-type">{keyword.type}</span>
                      <span className="keyword-weight">Weight: {keyword.weight}</span>
                    </div>
                    <div className="keyword-actions">
                      <select
                        value={keyword.category}
                        onChange={(e) => updateKeyword(index, 'category', e.target.value)}
                        className="category-edit"
                      >
                        <option value="skill">Skill</option>
                        <option value="technology">Technology</option>
                        <option value="education">Education</option>
                        <option value="experience">Experience</option>
                        <option value="certification">Certification</option>
                        <option value="language">Language</option>
                        <option value="other">Other</option>
                      </select>
                      <select
                        value={keyword.type || 'preferred'}
                        onChange={(e) => updateKeyword(index, 'type', e.target.value)}
                        className="type-edit"
                      >
                        <option value="required">Required</option>
                        <option value="preferred">Preferred</option>
                        <option value="negative">Negative</option>
                      </select>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={keyword.weight}
                        onChange={(e) => updateKeyword(index, 'weight', parseInt(e.target.value))}
                        className="weight-edit"
                        title="Weight"
                      />
                      <button 
                        onClick={() => removeKeyword(index)}
                        className="remove-btn"
                        title="Remove keyword"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="keyword-info">
            <h4>How Keyword Shortlisting Works:</h4>
            <ul>
              <li>Keywords are searched in the candidate's application details, skills, and resume</li>
              <li>Each keyword has a weight (1-10) that contributes to the total score</li>
              <li>Candidates must meet the minimum score to be automatically shortlisted</li>
              <li>Technical roles use this automated system, non-technical roles are manually reviewed</li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={onClose} className="btn-secondary">
            ✕ Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? '⏳ Saving...' : '💾 Save Keywords'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordManager;
