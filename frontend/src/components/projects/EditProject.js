import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { PROJECT_STAGES, PROJECT_CHARGE_TYPES, PROJECT_STATUSES, PROJECT_PRIORITIES } from '../../constants/projectEnums';

const EditProject = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    projectNumber: '',
    clientId: '',
    startDate: '',
    estimatedEndDate: '',
    location: '',
    chargeType: '',
    status: '',
    projectStage: '',
    lifecycleStages: [], // New field for custom stages
    description: '',
    budget: '',
    totalFee: '',
    targetProfitMargin: '',
    priority: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  // Using shared constants from projectEnums.js

  useEffect(() => {
    // Redirect non-admin users
    if (!isAdmin) {
      navigate('/projects');
      return;
    }
    fetchProject();
  }, [id, isAdmin, navigate]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/edit`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.projectUpdateDto) {
          const dto = data.projectUpdateDto;
          setFormData({
            name: dto.name || '',
            projectNumber: dto.projectNumber || '',
            clientId: dto.clientId || '',
            startDate: dto.startDate ? dto.startDate.substring(0, 10) : '',
            estimatedEndDate: dto.estimatedEndDate ? dto.estimatedEndDate.substring(0, 10) : '',
            location: dto.location || '',
            chargeType: dto.chargeType || '',
            status: dto.status || '',
            projectStage: dto.projectStage || '',
            lifecycleStages: dto.lifecycleStages || [], // Populate custom stages
            description: dto.description || '',
            budget: dto.budget ? dto.budget.toString() : '',
            totalFee: dto.totalFee ? dto.totalFee.toString() : '',
            targetProfitMargin: dto.targetProfitMargin ? (parseFloat(dto.targetProfitMargin) * 100).toString() : '20',
            priority: dto.priority || ''
          });

          if (data.client) {
            setSelectedClient({
              value: data.client.id,
              label: `${data.client.name} (${data.client.code})`,
              client: data.client
            });
          }
        }
      } else {
        setError('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

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

  const handleLifecycleStagesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      lifecycleStages: selectedOptions ? selectedOptions.map(option => option.value) : []
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Prepare the body data
      const bodyData = new URLSearchParams({
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
        'totalFee': formData.totalFee,
        'targetProfitMargin': formData.targetProfitMargin ? (parseFloat(formData.targetProfitMargin) / 100).toString() : '',
        'priority': formData.priority
      });

      // Append lifecycle stages if any are selected
      if (formData.lifecycleStages && formData.lifecycleStages.length > 0) {
        formData.lifecycleStages.forEach(stage => {
          bodyData.append('lifecycleStages', stage);
        });
      }

      const response = await fetch(`/api/projects/${id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: bodyData,
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/projects/${id}/details`);
      } else {
        setError('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error && !formData.name) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div className="main-content">
      <h1 className="page-title">Edit Project</h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Project Name *:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Enter project name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectNumber">Project Number:</label>
            <input
              type="text"
              id="projectNumber"
              name="projectNumber"
              value={formData.projectNumber || 'Auto-generated'}
              disabled
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
            />
            <small className="form-help">Auto-generated project identifier (cannot be edited)</small>
          </div>

          <div className="form-group">
            <label htmlFor="client">Client *:</label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadClientOptions}
              onChange={handleClientChange}
              value={selectedClient}
              placeholder="Search for a client..."
              isClearable
              required
            />
            {!formData.clientId && <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0, position: 'absolute' }} required={true} />}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedEndDate">Estimated End Date:</label>
              <input
                type="date"
                id="estimatedEndDate"
                name="estimatedEndDate"
                value={formData.estimatedEndDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *:</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter project location"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="chargeType">Charge Type *:</label>
              <select
                id="chargeType"
                name="chargeType"
                value={formData.chargeType}
                onChange={handleChange}
                required
              >
                <option value="">Select charge type</option>
                {PROJECT_CHARGE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Project Status *:</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
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

          <div className="form-group">
            <label htmlFor="lifecycleStages">Project Stages *:</label>
            <Select
              isMulti
              name="lifecycleStages"
              options={PROJECT_STAGES}
              value={PROJECT_STAGES.filter(option => formData.lifecycleStages.includes(option.value))}
              onChange={handleLifecycleStagesChange}
              placeholder="Select project stages..."
              className="basic-multi-select"
              classNamePrefix="select"
            />
            <small className="form-help">Select the stages for this project. These will be used in Resource Planning.</small>
            {formData.lifecycleStages.length === 0 && <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0, position: 'absolute' }} required={true} />}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectStage">Current Stage *</label>
              <select
                id="projectStage"
                name="projectStage"
                value={formData.projectStage}
                onChange={handleChange}
                required
              >
                <option value="">Select current stage</option>
                {/* Only show selected stages if custom stages are defined, otherwise show all */}
                {(formData.lifecycleStages.length > 0
                  ? PROJECT_STAGES.filter(stage => formData.lifecycleStages.includes(stage.value))
                  : PROJECT_STAGES
                ).map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Project Priority:</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="">Select priority</option>
                {PROJECT_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {
            isAdmin && (
              <>
                <div className="form-group">
                  <label htmlFor="budget">Budget (₹):</label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <small className="form-help">Enter budget amount in Indian Rupees (optional)</small>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="totalFee">Total Fee (₹):</label>
                    <input
                      type="number"
                      id="totalFee"
                      name="totalFee"
                      value={formData.totalFee}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <small className="form-help">Total fee charged to client</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="targetProfitMargin">Target Profit Margin (%):</label>
                    <input
                      type="number"
                      id="targetProfitMargin"
                      name="targetProfitMargin"
                      value={formData.targetProfitMargin}
                      onChange={handleChange}
                      placeholder="20"
                      step="1"
                      min="0"
                      max="100"
                    />
                    <small className="form-help">Default: 20%</small>
                  </div>
                </div>
              </>
            )
          }

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter project description (optional)"
            />
          </div>

          <div className="project-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Project'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate(`/projects/${id}/details`)}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form >
      </div >
    </div >
  );
};

export default EditProject;