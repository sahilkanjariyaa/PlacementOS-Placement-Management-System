import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

export const StudentsManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [placementStatus, setPlacementStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Selected student for details modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getAllStudents({
        search,
        department,
        placementStatus,
        page,
        limit: 15,
      });
      if (res.success) {
        setStudents(res.data.students);
        setTotalPages(res.data.totalPages);
        setTotalStudents(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, department, placementStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleToggleActive = async (student) => {
    try {
      const newStatus = !student.userId?.isActive;
      await studentService.updateStudentStatus(student._id, { isActive: newStatus });
      fetchStudents();
    } catch (err) {
      console.error('Failed to update student status:', err);
    }
  };

  const handleUpdatePlacementStatus = async (studentId, status) => {
    try {
      await studentService.updateStudentStatus(studentId, { placementStatus: status });
      fetchStudents();
      if (selectedStudent && selectedStudent._id === studentId) {
        setSelectedStudent((prev) => ({ ...prev, placementStatus: status }));
      }
    } catch (err) {
      console.error('Failed to update placement status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Roster</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage registered candidates, verify academic credentials, and monitor placement statuses. ({totalStudents} Total)
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student name, email, or enrollment roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        <div>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={placementStatus}
            onChange={(e) => {
              setPlacementStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-700"
          >
            <option value="">All Placement Statuses</option>
            <option value="unplaced">Unplaced</option>
            <option value="placed">Placed</option>
            <option value="opted_out">Opted Out</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching student records..." />
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No students match your filter criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">CGPA / Backlogs</th>
                  <th className="py-3.5 px-4">Placement Status</th>
                  <th className="py-3.5 px-4">Account</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.userId?.name || 'N/A'}</div>
                      <div className="text-slate-400 text-[11px]">{st.userId?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {st.enrollmentNo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{st.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-teal-700">{st.cgpa}</span>
                      <span className="text-slate-400 text-[11px]">
                        {' '}
                        • {st.backlogs} {st.backlogs === 1 ? 'Backlog' : 'Backlogs'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={st.placementStatus} />
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(st)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          st.userId?.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Click to toggle active state"
                      >
                        {st.userId?.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(st)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                        title="View Full Profile Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Candidate Dossier: ${selectedStudent.userId?.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Enrollment Number</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudent.enrollmentNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Department & Semester</span>
                <span className="font-semibold text-slate-800">
                  {selectedStudent.department} (Sem {selectedStudent.semester})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Academic CGPA</span>
                <span className="font-bold text-teal-700 text-sm">{selectedStudent.cgpa} / 10.0</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Active Backlogs</span>
                <span className="font-bold text-slate-800">{selectedStudent.backlogs}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Contact Phone</span>
                <span className="font-semibold text-slate-800">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Placement Status</span>
                <select
                  value={selectedStudent.placementStatus}
                  onChange={(e) => handleUpdatePlacementStatus(selectedStudent._id, e.target.value)}
                  className="px-2 py-1 border border-slate-200 rounded-md font-semibold text-xs bg-white text-slate-800"
                >
                  <option value="unplaced">Unplaced</option>
                  <option value="placed">Placed</option>
                  <option value="opted_out">Opted Out</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Technical Skills & Competencies:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.skills?.length > 0 ? (
                  selectedStudent.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-brand-50 text-brand-700 font-semibold rounded-lg border border-brand-100"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No skills listed</span>
                )}
              </div>
            </div>

            {/* Resume Link */}
            {selectedStudent.resumeUrl && (
              <div className="pt-2">
                <a
                  href={selectedStudent.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Candidate Resume</span>
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
