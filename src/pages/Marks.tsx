import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Mark, Student, Course } from '../lib/types';

interface MarkWithDetails extends Mark {
  student_name?: string;
  course_name?: string;
}

export default function Marks() {
  const [marks, setMarks] = useState<MarkWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    internal_marks: 0,
    external_marks: 0,
    semester: 1,
    academic_year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [marksRes, studentsRes, coursesRes] = await Promise.all([
        supabase.from('marks').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*'),
        supabase.from('courses').select('*'),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);

      if (marksRes.data) {
        const marksWithDetails = marksRes.data.map((mark) => {
          const student = studentsRes.data?.find((s) => s.id === mark.student_id);
          const course = coursesRes.data?.find((c) => c.id === mark.course_id);
          return {
            ...mark,
            student_name: student?.name,
            course_name: course?.name,
          };
        });
        setMarks(marksWithDetails);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A+';
    if (total >= 80) return 'A';
    if (total >= 70) return 'B+';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 40) return 'D';
    return 'F';
  };

  const openModal = (mark?: Mark) => {
    if (mark) {
      setEditingMark(mark);
      setFormData({
        student_id: mark.student_id || '',
        course_id: mark.course_id || '',
        internal_marks: mark.internal_marks,
        external_marks: mark.external_marks,
        semester: mark.semester,
        academic_year: mark.academic_year,
      });
    } else {
      setEditingMark(null);
      setFormData({
        student_id: '',
        course_id: '',
        internal_marks: 0,
        external_marks: 0,
        semester: 1,
        academic_year: new Date().getFullYear().toString(),
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const total = formData.internal_marks + formData.external_marks;
    const grade = calculateGrade(total);

    const dataToSave = {
      ...formData,
      total_marks: total,
      grade,
    };

    try {
      if (editingMark) {
        const { error } = await supabase
          .from('marks')
          .update(dataToSave)
          .eq('id', editingMark.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('marks').insert([dataToSave]);
        if (error) throw error;
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Error saving marks. Please check all fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark record?')) return;

    try {
      const { error } = await supabase.from('marks').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting marks:', error);
      alert('Error deleting marks.');
    }
  };

  const filteredMarks = marks.filter(
    (mark) =>
      mark.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.academic_year.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marks Management</h1>
          <p className="text-gray-600 mt-1">Manage student marks and grades</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Marks
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, course, or academic year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Internal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  External
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMarks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No marks records found
                  </td>
                </tr>
              ) : (
                filteredMarks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {mark.student_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {mark.course_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mark.internal_marks}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mark.external_marks}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {mark.total_marks}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mark.grade === 'A+' || mark.grade === 'A'
                            ? 'bg-green-100 text-green-800'
                            : mark.grade === 'B+' || mark.grade === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : mark.grade === 'C' || mark.grade === 'D'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {mark.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mark.semester}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mark.academic_year}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(mark)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(mark.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMark ? 'Edit Marks' : 'Add Marks'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.reg_no})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) =>
                    setFormData({ ...formData, course_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Marks (out of 50)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.internal_marks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      internal_marks: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Marks (out of 50)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.external_marks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      external_marks: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total: {formData.internal_marks + formData.external_marks} / Grade:{' '}
                  {calculateGrade(formData.internal_marks + formData.external_marks)}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2024"
                  value={formData.academic_year}
                  onChange={(e) =>
                    setFormData({ ...formData, academic_year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingMark ? 'Update' : 'Add'} Marks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
