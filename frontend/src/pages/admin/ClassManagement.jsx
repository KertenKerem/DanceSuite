import { useState, useEffect } from 'react';
import { classAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Modal from '../../components/Modal';
import ClassForm from '../../components/admin/ClassForm';
import './ClassManagement.css';

const ClassManagement = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClass(null);
    setShowModal(true);
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('classes.deleteConfirm'))) return;

    try {
      await classAPI.delete(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      alert(t('errors.general'));
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingClass) {
        const response = await classAPI.update(editingClass.id, formData);
        setClasses(classes.map(c => c.id === editingClass.id ? response.data : c));
      } else {
        const response = await classAPI.create(formData);
        setClasses([...classes, response.data]);
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.error || t('errors.general'));
    }
  };

  const canEditClass = (classItem) => {
    return isAdmin || classItem.instructorId === user?.id;
  };

  const getDayName = (day) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return t(`classes.days.${dayKeys[day]}`) || day;
  };

  if (loading) return <div className="loading">{t('common.loading')}</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="class-management">
      <div className="page-header">
        <h1>{t('classes.manageTitle')}</h1>
        <button onClick={handleCreate} className="btn-primary">
          + {t('classes.addClass')}
        </button>
      </div>

      <table className="classes-table">
        <thead>
          <tr>
            <th>{t('common.name')}</th>
            <th>{t('classes.description')}</th>
            <th>{t('classes.capacity')}</th>
            <th>{t('classes.enrolled')}</th>
            <th>{t('classes.schedule')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((classItem) => (
            <tr key={classItem.id}>
              <td>{classItem.name}</td>
              <td>{classItem.description?.substring(0, 50)}...</td>
              <td>{classItem.maxCapacity}</td>
              <td>{classItem._count?.enrollments || 0}</td>
              <td>
                {classItem.schedules?.map((s, i) => (
                  <div key={i} className="schedule-item">
                    {getDayName(s.dayOfWeek)}: {s.startTime} - {s.endTime}
                  </div>
                ))}
              </td>
              <td>
                {canEditClass(classItem) && (
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(classItem)} className="btn-edit">
                      {t('common.edit')}
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(classItem.id)} className="btn-delete">
                        {t('common.delete')}
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClass ? t('classes.editClass') : t('classes.addClass')}
      >
        <ClassForm
          classData={editingClass}
          onSave={handleSave}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ClassManagement;
