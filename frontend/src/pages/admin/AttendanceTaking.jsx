import { useState, useEffect } from 'react';
import { classAPI, attendanceAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AttendanceTaking.css';

const AttendanceTaking = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('take');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Report state
  const [reportData, setReportData] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    instructorId: '',
    studentId: '',
    classId: '',
    status: ''
  });
  const [instructors, setInstructors] = useState([]);
  const [reportStudents, setReportStudents] = useState([]);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedDate && activeTab === 'take') {
      fetchAttendance();
    }
  }, [selectedClass, selectedDate, activeTab]);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReportFilterOptions();
    }
  }, [activeTab]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      const filteredClasses = isAdmin
        ? response.data
        : response.data.filter(c => c.instructorId === user?.id);
      setClasses(filteredClasses);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const classResponse = await classAPI.getById(selectedClass);
      const classData = classResponse.data;
      const enrolledStudents = classData.enrollments || [];
      setStudents(enrolledStudents);

      const attendanceResponse = await attendanceAPI.getByClass(selectedClass, selectedDate);
      const attendanceMap = {};
      attendanceResponse.data.forEach(record => {
        attendanceMap[record.enrollmentId] = record;
      });
      setAttendance(attendanceMap);
    } catch (err) {
      setStudents([]);
      setAttendance({});
    }
  };

  const handleStatusChange = (enrollmentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], status, enrollmentId }
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach(enrollment => {
      newAttendance[enrollment.id] = {
        ...attendance[enrollment.id],
        status,
        enrollmentId: enrollment.id
      };
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      for (const enrollmentId of Object.keys(attendance)) {
        const record = attendance[enrollmentId];
        if (record.status) {
          await attendanceAPI.mark({
            enrollmentId,
            date: selectedDate,
            status: record.status,
            notes: record.notes || ''
          });
        }
      }
      setSuccess(t('success.saved'));
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setSaving(false);
    }
  };

  const loadReportFilterOptions = async () => {
    try {
      const [instructorsRes, studentsRes] = await Promise.all([
        userAPI.getAll('INSTRUCTOR'),
        userAPI.getAll('STUDENT')
      ]);
      setInstructors(instructorsRes.data);
      setReportStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (reportFilters.startDate) params.startDate = reportFilters.startDate;
      if (reportFilters.endDate) params.endDate = reportFilters.endDate;
      if (reportFilters.instructorId) params.instructorId = reportFilters.instructorId;
      if (reportFilters.studentId) params.studentId = reportFilters.studentId;
      if (reportFilters.classId) params.classId = reportFilters.classId;
      if (reportFilters.status) params.status = reportFilters.status;

      const res = await attendanceAPI.getReport(params);
      setReportData(res.data);
    } catch (err) {
      setError(t('errors.general'));
    } finally {
      setLoading(false);
    }
  };

  const exportReportToPDF = () => {
    if (!reportData) {
      console.error('No report data available');
      alert(t('errors.general'));
      return;
    }

    try {
      const doc = new jsPDF({
        compress: true,
        putOnlyUsedFonts: true
      });

      // Use courier font for better Unicode support
      doc.setFont('courier');
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(18);
      doc.setFont('courier', 'bold');
      const title = t('attendance.attendanceReport');
      doc.text(title, pageWidth / 2, 22, { align: 'center' });

      // Date range
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const generatedLabel = t('accounting.generatedOn');
      const periodLabel = t('accounting.period');
      const locale = language === 'tr' ? 'tr-TR' : 'en-US';
      let dateText = generatedLabel + ': ' + new Date().toLocaleDateString(locale);
      if (reportFilters.startDate || reportFilters.endDate) {
        dateText += ' | ' + periodLabel + ': ';
        if (reportFilters.startDate) dateText += new Date(reportFilters.startDate).toLocaleDateString(locale);
        dateText += ' - ';
        if (reportFilters.endDate) dateText += new Date(reportFilters.endDate).toLocaleDateString(locale);
      }
      doc.text(dateText, pageWidth / 2, 32, { align: 'center' });

      let yPos = 48;

      // Summary Section
      doc.setFontSize(13);
      doc.setFont('courier', 'bold');
      doc.text(t('accounting.summary'), 14, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      doc.text(t('attendance.totalRecords') + ': ' + reportData.summary.totalRecords, 14, yPos);
      yPos += 5;
      doc.text(t('attendance.attendanceRate') + ': ' + reportData.summary.attendanceRate + '%', 14, yPos);
      yPos += 5;
      doc.text(t('attendance.present') + ': ' + reportData.summary.statusCounts.PRESENT, 14, yPos);
      yPos += 5;
      doc.text(t('attendance.absent') + ': ' + reportData.summary.statusCounts.ABSENT, 14, yPos);
      yPos += 5;
      doc.text(t('attendance.late') + ': ' + reportData.summary.statusCounts.LATE, 14, yPos);
      yPos += 5;
      doc.text(t('attendance.excused') + ': ' + reportData.summary.statusCounts.EXCUSED, 14, yPos);
      yPos += 12;

      // Class Summary
      if (reportData.classSummary.length > 0) {
        doc.setFontSize(13);
        doc.setFont('courier', 'bold');
        doc.text(t('attendance.classSummary'), 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [[
            t('classes.class'),
            t('users.instructor'),
            t('attendance.total'),
            t('attendance.attendanceRate')
          ]],
          body: reportData.classSummary.map(cls => [
            cls.name,
            cls.instructor,
            cls.total,
            cls.attendanceRate + '%'
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [168, 85, 247],
            font: 'courier',
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 8,
            font: 'courier'
          },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Student Summary
      if (reportData.studentSummary.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 22;
        }

        doc.setFontSize(13);
        doc.setFont('courier', 'bold');
        doc.text(t('attendance.studentSummary'), 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [[
            t('users.student'),
            t('attendance.total'),
            t('attendance.present'),
            t('attendance.absent'),
            t('attendance.attendanceRate')
          ]],
          body: reportData.studentSummary.map(student => [
            student.name,
            student.total,
            student.present,
            student.absent,
            student.attendanceRate + '%'
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [168, 85, 247],
            font: 'courier',
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 7,
            font: 'courier'
          },
          margin: { left: 14, right: 14 }
        });

        yPos = doc.lastAutoTable.finalY + 15;
      }

      // Detailed Records
      if (reportData.records.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 22;
        }

        doc.setFontSize(13);
        doc.setFont('courier', 'bold');
        doc.text(t('attendance.detailedRecords'), 14, yPos);
        yPos += 5;

        const locale = language === 'tr' ? 'tr-TR' : 'en-US';
        autoTable(doc, {
          startY: yPos,
          head: [[
            t('common.date'),
            t('users.student'),
            t('classes.class'),
            t('common.status')
          ]],
          body: reportData.records.map(record => [
            new Date(record.date).toLocaleDateString(locale),
            record.student.name,
            record.class.name,
            t(`attendance.${record.status.toLowerCase()}`)
          ]),
          theme: 'grid',
          headStyles: {
            fillColor: [168, 85, 247],
            font: 'courier',
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 7,
            font: 'courier'
          },
          margin: { left: 14, right: 14 }
        });
      }

      // Save PDF
      const fileName = `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(t('errors.general') + ': ' + error.message);
    }
  };

  if (loading && activeTab === 'take') return <div className="loading">{t('common.loading')}</div>;

  return (
    <div className="attendance-taking">
      <h1>{t('attendance.title')}</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'take' ? 'active' : ''}`}
          onClick={() => setActiveTab('take')}
        >
          {t('attendance.takeAttendance')}
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          {t('attendance.reports')}
        </button>
      </div>

      {activeTab === 'take' && (
        <>
          <div className="attendance-controls">
        <div className="control-group">
          <label>{t('attendance.selectClass')}:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">{t('classes.selectClass')}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>{t('common.date')}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <>
          <div className="quick-actions">
            <button onClick={() => handleMarkAll('PRESENT')} className="btn-quick">
              {t('attendance.markAllPresent')}
            </button>
            <button onClick={() => handleMarkAll('ABSENT')} className="btn-quick btn-absent">
              {t('attendance.markAllAbsent')}
            </button>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>{t('payments.student')}</th>
                <th>{t('attendance.present')}</th>
                <th>{t('attendance.absent')}</th>
                <th>{t('attendance.late')}</th>
                <th>{t('attendance.excused')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td>{enrollment.user?.firstName} {enrollment.user?.lastName}</td>
                  {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map(status => (
                    <td key={status}>
                      <input
                        type="radio"
                        name={`attendance-${enrollment.id}`}
                        checked={attendance[enrollment.id]?.status === status}
                        onChange={() => handleStatusChange(enrollment.id, status)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            onClick={handleSave}
            className="btn-save"
            disabled={saving}
          >
            {saving ? t('common.saving') : t('attendance.saveAttendance')}
          </button>
        </>
      )}

      {selectedClass && students.length === 0 && (
        <p className="no-data">{t('attendance.noStudents')}</p>
      )}
        </>
      )}

      {activeTab === 'reports' && (
        <div className="reports-content">
          <div className="card">
            <h2>{t('attendance.reportFilters')}</h2>
            <div className="report-filters">
              <div className="filter-row">
                <div className="form-group">
                  <label>{t('accounting.startDate')}</label>
                  <input
                    type="date"
                    value={reportFilters.startDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('accounting.endDate')}</label>
                  <input
                    type="date"
                    value={reportFilters.endDate}
                    onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter-row">
                <div className="form-group">
                  <label>{t('users.instructor')}</label>
                  <select
                    value={reportFilters.instructorId}
                    onChange={(e) => setReportFilters({ ...reportFilters, instructorId: e.target.value })}
                  >
                    <option value="">{t('accounting.allInstructors')}</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('users.student')}</label>
                  <select
                    value={reportFilters.studentId}
                    onChange={(e) => setReportFilters({ ...reportFilters, studentId: e.target.value })}
                  >
                    <option value="">{t('accounting.allStudents')}</option>
                    {reportStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('classes.class')}</label>
                  <select
                    value={reportFilters.classId}
                    onChange={(e) => setReportFilters({ ...reportFilters, classId: e.target.value })}
                  >
                    <option value="">{t('accounting.allClasses')}</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('common.status')}</label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters({ ...reportFilters, status: e.target.value })}
                  >
                    <option value="">{t('attendance.allStatuses')}</option>
                    <option value="PRESENT">{t('attendance.present')}</option>
                    <option value="ABSENT">{t('attendance.absent')}</option>
                    <option value="LATE">{t('attendance.late')}</option>
                    <option value="EXCUSED">{t('attendance.excused')}</option>
                  </select>
                </div>
              </div>

              <div className="filter-actions">
                <button className="btn-primary" onClick={fetchReport}>
                  {t('accounting.generateReport')}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setReportFilters({
                    startDate: '',
                    endDate: '',
                    instructorId: '',
                    studentId: '',
                    classId: '',
                    status: ''
                  })}
                >
                  {t('accounting.clearFilters')}
                </button>
              </div>
            </div>
          </div>

          {reportData && (
            <>
              <div className="card">
                <div className="report-header">
                  <h2>{t('accounting.reportSummary')}</h2>
                  <button className="btn-primary" onClick={exportReportToPDF}>
                    {t('accounting.exportPDF')}
                  </button>
                </div>

                <div className="summary-cards">
                  <div className="summary-card">
                    <h3>{t('attendance.totalRecords')}</h3>
                    <p className="amount">{reportData.summary.totalRecords}</p>
                  </div>
                  <div className="summary-card">
                    <h3>{t('attendance.attendanceRate')}</h3>
                    <p className="amount positive">{reportData.summary.attendanceRate}%</p>
                  </div>
                  <div className="summary-card">
                    <h3>{t('attendance.present')}</h3>
                    <p className="amount positive">{reportData.summary.statusCounts.PRESENT}</p>
                  </div>
                  <div className="summary-card">
                    <h3>{t('attendance.absent')}</h3>
                    <p className="amount negative">{reportData.summary.statusCounts.ABSENT}</p>
                  </div>
                </div>
              </div>

              {reportData.classSummary.length > 0 && (
                <div className="card">
                  <h2>{t('attendance.classSummary')}</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('classes.class')}</th>
                        <th>{t('users.instructor')}</th>
                        <th>{t('attendance.total')}</th>
                        <th>{t('attendance.present')}</th>
                        <th>{t('attendance.absent')}</th>
                        <th>{t('attendance.attendanceRate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.classSummary.map((cls) => (
                        <tr key={cls.id}>
                          <td>{cls.name}</td>
                          <td>{cls.instructor}</td>
                          <td>{cls.total}</td>
                          <td className="positive">{cls.present}</td>
                          <td className="negative">{cls.absent}</td>
                          <td>{cls.attendanceRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.studentSummary.length > 0 && (
                <div className="card">
                  <h2>{t('attendance.studentSummary')}</h2>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('users.student')}</th>
                        <th>{t('attendance.total')}</th>
                        <th>{t('attendance.present')}</th>
                        <th>{t('attendance.absent')}</th>
                        <th>{t('attendance.late')}</th>
                        <th>{t('attendance.excused')}</th>
                        <th>{t('attendance.attendanceRate')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.studentSummary.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.total}</td>
                          <td className="positive">{student.present}</td>
                          <td className="negative">{student.absent}</td>
                          <td>{student.late}</td>
                          <td>{student.excused}</td>
                          <td>{student.attendanceRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="card">
                <h2>{t('attendance.detailedRecords')}</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('common.date')}</th>
                      <th>{t('users.student')}</th>
                      <th>{t('classes.class')}</th>
                      <th>{t('users.instructor')}</th>
                      <th>{t('common.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map((record) => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        <td>{record.student.name}</td>
                        <td>{record.class.name}</td>
                        <td>{record.class.instructor}</td>
                        <td>
                          <span className={`status-badge ${record.status.toLowerCase()}`}>
                            {t(`attendance.${record.status.toLowerCase()}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.records.length === 0 && (
                  <p className="no-data">{t('attendance.noRecords')}</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceTaking;
