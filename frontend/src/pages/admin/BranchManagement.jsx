import { useState, useEffect } from 'react';
import { branchAPI, saloonAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import './BranchManagement.css';

const BranchManagement = () => {
  const { t } = useLanguage();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showSaloonModal, setShowSaloonModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingSaloon, setEditingSaloon] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [expandedBranch, setExpandedBranch] = useState(null);

  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    phone: '',
    operatingStart: '09:00',
    operatingEnd: '23:00'
  });

  const [saloonForm, setSaloonForm] = useState({
    name: '',
    capacity: ''
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await branchAPI.getAll();
      setBranches(response.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  // Branch handlers
  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchAPI.update(editingBranch.id, branchForm);
      } else {
        await branchAPI.create(branchForm);
      }
      setShowBranchModal(false);
      setEditingBranch(null);
      resetBranchForm();
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      operatingStart: branch.operatingStart || '09:00',
      operatingEnd: branch.operatingEnd || '23:00'
    });
    setShowBranchModal(true);
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm(t('branches.deleteConfirm'))) return;
    try {
      await branchAPI.delete(id);
      fetchBranches();
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const resetBranchForm = () => {
    setBranchForm({
      name: '',
      address: '',
      phone: '',
      operatingStart: '09:00',
      operatingEnd: '23:00'
    });
  };

  const openCreateBranchModal = () => {
    setEditingBranch(null);
    resetBranchForm();
    setShowBranchModal(true);
  };

  // Saloon handlers
  const handleSaloonSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...saloonForm,
        branchId: selectedBranch.id,
        capacity: saloonForm.capacity ? parseInt(saloonForm.capacity) : null
      };

      if (editingSaloon) {
        await saloonAPI.update(editingSaloon.id, data);
      } else {
        await saloonAPI.create(data);
      }
      setShowSaloonModal(false);
      setEditingSaloon(null);
      resetSaloonForm();
      fetchBranches();
    } catch (err) {
      setError(err.response?.data?.error || t('errors.general'));
    }
  };

  const handleEditSaloon = (saloon, branch) => {
    setSelectedBranch(branch);
    setEditingSaloon(saloon);
    setSaloonForm({
      name: saloon.name,
      capacity: saloon.capacity || ''
    });
    setShowSaloonModal(true);
  };

  const handleDeleteSaloon = async (id) => {
    if (!window.confirm(t('saloons.deleteConfirm'))) return;
    try {
      await saloonAPI.delete(id);
      fetchBranches();
    } catch (err) {
      setError(t('errors.general'));
    }
  };

  const resetSaloonForm = () => {
    setSaloonForm({
      name: '',
      capacity: ''
    });
  };

  const openCreateSaloonModal = (branch) => {
    setSelectedBranch(branch);
    setEditingSaloon(null);
    resetSaloonForm();
    setShowSaloonModal(true);
  };

  const toggleExpand = (branchId) => {
    setExpandedBranch(expandedBranch === branchId ? null : branchId);
  };

  if (loading) return <div className="page loading">{t('common.loading')}</div>;

  return (
    <div className="page branch-management">
      <div className="page-header">
        <h1>{t('branches.title')}</h1>
        <button className="btn-primary" onClick={openCreateBranchModal}>
          {t('branches.addBranch')}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {branches.length === 0 ? (
        <p className="empty-state">{t('branches.noBranches')}</p>
      ) : (
        <div className="branches-list">
          {branches.map((branch) => (
            <div key={branch.id} className="branch-card">
              <div className="branch-header" onClick={() => toggleExpand(branch.id)}>
                <div className="branch-info">
                  <h3>{branch.name}</h3>
                  <div className="branch-meta">
                    {branch.address && <span className="meta-item">{branch.address}</span>}
                    {branch.phone && <span className="meta-item">{branch.phone}</span>}
                    <span className="meta-item">
                      {branch.operatingStart} - {branch.operatingEnd}
                    </span>
                  </div>
                </div>
                <div className="branch-stats">
                  <span className="stat">
                    {branch._count?.saloons || 0} {t('saloons.title')}
                  </span>
                  <span className="stat">
                    {branch._count?.classes || 0} {t('classes.title')}
                  </span>
                  <span className={`expand-icon ${expandedBranch === branch.id ? 'expanded' : ''}`}>
                    &#9660;
                  </span>
                </div>
              </div>

              <div className="branch-actions">
                <button className="btn-sm btn-edit" onClick={() => handleEditBranch(branch)}>
                  {t('common.edit')}
                </button>
                <button className="btn-sm btn-delete" onClick={() => handleDeleteBranch(branch.id)}>
                  {t('common.delete')}
                </button>
              </div>

              {expandedBranch === branch.id && (
                <div className="saloons-section">
                  <div className="saloons-header">
                    <h4>{t('saloons.title')}</h4>
                    <button
                      className="btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateSaloonModal(branch);
                      }}
                    >
                      {t('saloons.addSaloon')}
                    </button>
                  </div>

                  {branch.saloons && branch.saloons.length > 0 ? (
                    <div className="saloons-grid">
                      {branch.saloons.map((saloon) => (
                        <div key={saloon.id} className="saloon-card">
                          <div className="saloon-info">
                            <span className="saloon-name">{saloon.name}</span>
                            {saloon.capacity && (
                              <span className="saloon-capacity">
                                {t('saloons.capacity')}: {saloon.capacity}
                              </span>
                            )}
                          </div>
                          <div className="saloon-actions">
                            <button
                              className="btn-xs btn-edit"
                              onClick={() => handleEditSaloon(saloon, branch)}
                            >
                              {t('common.edit')}
                            </button>
                            <button
                              className="btn-xs btn-delete"
                              onClick={() => handleDeleteSaloon(saloon.id)}
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-saloons">{t('saloons.noSaloons')}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Branch Modal */}
      <Modal
        isOpen={showBranchModal}
        onClose={() => setShowBranchModal(false)}
        title={editingBranch ? t('branches.editBranch') : t('branches.addBranch')}
      >
        <form onSubmit={handleBranchSubmit} className="branch-form">
          <div className="form-group">
            <label>{t('branches.branchName')} *</label>
            <input
              type="text"
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
              required
              placeholder={t('branches.branchName')}
            />
          </div>

          <div className="form-group">
            <label>{t('branches.address')}</label>
            <input
              type="text"
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              placeholder={t('branches.address')}
            />
          </div>

          <div className="form-group">
            <label>{t('common.phone')}</label>
            <input
              type="tel"
              value={branchForm.phone}
              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-section">
            <h4>{t('branches.operatingHours')}</h4>
            <div className="form-row">
              <div className="form-group">
                <label>{t('classes.startTime')}</label>
                <input
                  type="time"
                  value={branchForm.operatingStart}
                  onChange={(e) => setBranchForm({ ...branchForm, operatingStart: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>{t('classes.endTime')}</label>
                <input
                  type="time"
                  value={branchForm.operatingEnd}
                  onChange={(e) => setBranchForm({ ...branchForm, operatingEnd: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowBranchModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {editingBranch ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Saloon Modal */}
      <Modal
        isOpen={showSaloonModal}
        onClose={() => setShowSaloonModal(false)}
        title={editingSaloon ? t('saloons.editSaloon') : t('saloons.addSaloon')}
      >
        <form onSubmit={handleSaloonSubmit} className="saloon-form">
          {selectedBranch && (
            <div className="branch-context">
              {t('branches.title')}: <strong>{selectedBranch.name}</strong>
            </div>
          )}

          <div className="form-group">
            <label>{t('saloons.saloonName')} *</label>
            <input
              type="text"
              value={saloonForm.name}
              onChange={(e) => setSaloonForm({ ...saloonForm, name: e.target.value })}
              required
              placeholder="S1, S2, Main Hall..."
            />
          </div>

          <div className="form-group">
            <label>{t('saloons.capacity')}</label>
            <input
              type="number"
              value={saloonForm.capacity}
              onChange={(e) => setSaloonForm({ ...saloonForm, capacity: e.target.value })}
              placeholder="20"
              min="1"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowSaloonModal(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {editingSaloon ? t('common.update') : t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BranchManagement;
