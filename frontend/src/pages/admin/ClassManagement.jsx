import { useState, useEffect } from 'react';
import { classAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import ClassForm from '../../components/admin/ClassForm';
import './ClassManagement.css';

const ClassManagement = () => {
  const { user } = useAuth();
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
      setError('Failed to load classes');
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
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await classAPI.delete(id);
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete class');
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
      alert(err.response?.data?.error || 'Failed to save class');
    }
  };

  const canEditClass = (classItem) => {
    return isAdmin || classItem.instructorId === user?.id;
  };

  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || day;
  };

  if (loading) return <div className="loading">Loading classes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="class-management">
      <div className="page-header">
        <h1>Manage Classes</h1>
        <button onClick={handleCreate} className="btn-primary">
          + Add New Class
        </button>
      </div>

      <table className="classes-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Capacity</th>
            <th>Enrolled</th>
            <th>Schedule</th>
            <th>Actions</th>
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
                      Edit
                    </button>
                    {isAdmin && (
                      <button onClick={() => handleDelete(classItem.id)} className="btn-delete">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <ClassForm
            classData={editingClass}
            onSave={handleSave}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClassManagement;
