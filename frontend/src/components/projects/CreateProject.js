import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import CreateClientModal from '../clients/CreateClientModal';
import { PROJECT_STAGES, PROJECT_CHARGE_TYPES, PROJECT_STATUSES, PROJECT_PRIORITIES } from '../../constants/projectEnums';

const CreateProject = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    startDate: '',
    estimatedEndDate: '',
    location: '',
    chargeType: '',
    status: '',
    projectStage: '',
    description: '',
    budget: '',
    priority: 'MEDIUM'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  // Using shared constants from projectEnums.js

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const loadClientOptions = async (inputValue) => {
    try {
      const response = await fetch(`/api/clients/search?query=${encodeURIComponent(inputValue)}`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      const clients = await response.json();
      return clients.map(client => ({
        value: client.id,
        label: `${client.name} (${client.code})`,
        client: client
      }));
    } catch (error) {
      console.error('Error loading clients:', error);
      return [];
    }
  };

  const handleClientChange = (selectedOption) => {
    setSelectedClient(selectedOption);
    setFormData({
      ...formData,
      clientId: selectedOption ? selectedOption.value : ''
    });
  };

  const handleClientCreated = (newClient) => {
    const clientOption = {
      value: newClient.id,
      label: `${newClient.name} (${newClient.code})`,
      client: newClient
    };
    setSelectedClient(clientOption);
    setFormData(prev => ({
      ...prev,
      clientId: newClient.id
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/projects/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'clientId': formData.clientId,
          'startDate': formData.startDate,
          'estimatedEndDate': formData.estimatedEndDate,
          'location': formData.location,
          'chargeType': formData.chargeType,
          'status': formData.status,
          'projectStage': formData.projectStage,
          'description': formData.description,
          'budget': formData.budget,
          'priority': formData.priority
        }),
        credentials: 'include'
      });

      if (response.ok) {
        // Check if response is a redirect or contains project data
        const responseText = await response.text();
        if (responseText.includes('/projects/')) {
          // Parse redirect URL to get project ID
          const match = responseText.match(/\/projects\/(\d+)\/details/);
          if (match) {
            navigate(`/projects/${match[1]}/details`);
          } else {
            navigate('/projects');
          }
        } else {
          navigate('/projects');
        }
      } else {
        setError('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header-modern">
        <div>
          <h1 className="page-title-modern">Create New Project</h1>
          <p className="page-subtitle">Fill in the details below to create a new project</p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate('/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <i className="fas fa-arrow-left"></i> Back to Projects
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: '0.5rem' }}></i>
          {error}
        </div>
      )}

      <div className="project-form-container">
        <form onSubmit={handleSubmit} className="project-form-modern">
          {/* Basic Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-info-circle form-section-icon"></i>
              <h3 className="form-section-title">Basic Information</h3>
            </div>
            <div className="form-section-content">
              <div className="form-group-modern">
                <label htmlFor="name">
                  Project Name <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="e.g., Website Redesign Project"
                  className="form-input-modern"
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="client">
                  Client <span className="required-asterisk">*</span>
                </label>
                <div className="client-select-wrapper">
                  <div className="client-select-input">
                    <AsyncSelect
                      cacheOptions
                      defaultOptions
                      loadOptions={loadClientOptions}
                      onChange={handleClientChange}
                      value={selectedClient}
                      placeholder="Search and select a client..."
                      isClearable
                      required
                      styles={{
                        control: (base) => ({
                          ...base,
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          padding: '2px',
                          '&:hover': {
                            borderColor: '#cbd5e1'
                          }
                        }),
                        placeholder: (base) => ({
                          ...base,
                          color: '#9ca3af'
                        })
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-new-client"
                    onClick={() => setIsClientModalOpen(true)}
                    title="Create a new client"
                  >
                    <i className="fas fa-plus"></i> New Client
                  </button>
                </div>
                {!formData.clientId && <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0, position: 'absolute' }} required={true} />}
              </div>

              <div className="form-group-modern">
                <label htmlFor="location">
                  Location <span className="required-asterisk">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Mumbai, India"
                  className="form-input-modern"
                />
              </div>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-cog form-section-icon"></i>
              <h3 className="form-section-title">Project Details</h3>
            </div>
            <div className="form-section-content">
              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="startDate">
                    Start Date <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  />
                </div>

                <div className="form-group-modern">
                  <label htmlFor="estimatedEndDate">Estimated End Date</label>
                  <input
                    type="date"
                    id="estimatedEndDate"
                    name="estimatedEndDate"
                    value={formData.estimatedEndDate}
                    onChange={handleChange}
                    className="form-input-modern"
                  />
                </div>
              </div>

              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="chargeType">
                    Charge Type <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="chargeType"
                    name="chargeType"
                    value={formData.chargeType}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  >
                    <option value="">Select charge type</option>
                    {PROJECT_CHARGE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-modern">
                  <label htmlFor="status">
                    Project Status <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  >
                    <option value="">Select status</option>
                    {PROJECT_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="projectStage">
                    Project Lifecycle Stage <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="projectStage"
                    name="projectStage"
                    value={formData.projectStage}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  >
                    <option value="">Select lifecycle stage</option>
                    {PROJECT_STAGES.map(stage => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group-modern">
                  <label htmlFor="priority">
                    Priority <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  >
                    {PROJECT_PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information Section (Admin Only) */}
          {isAdmin && (
            <div className="form-section">
              <div className="form-section-header">
                <i className="fas fa-rupee-sign form-section-icon"></i>
                <h3 className="form-section-title">Financial Information</h3>
              </div>
              <div className="form-section-content">
                <div className="form-group-modern">
                  <label htmlFor="budget">Budget (₹)</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="form-input-modern"
                  />
                  <small className="form-help-text">Enter the total project budget in Indian Rupees</small>
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-align-left form-section-icon"></i>
              <h3 className="form-section-title">Additional Details</h3>
            </div>
            <div className="form-section-content">
              <div className="form-group-modern">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Enter project description, goals, and any additional notes..."
                  className="form-textarea-modern"
                />
                <small className="form-help-text">Optional: Provide additional context about this project</small>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-modern">
            <button
              type="submit"
              className="btn-primary-modern"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Create Project
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-outline-modern"
              onClick={() => navigate('/projects')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <CreateClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};

export default CreateProject;