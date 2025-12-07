import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Department, Course } from '../lib/types';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'departments' | 'courses'>('departments');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'department' | 'course'>('department');
  const [editingItem, setEditingItem] = useState<Department | Course | null>(null);

  const [deptFormData, setDeptFormData] = useState({
    name: '',
    code: '',
    head: '',
    description: '',
  });

  const [courseFormData, setCourseFormData] = useState({
    name: '',
    code: '',
    department_id: '',
    semester: 1,
    credits: 3,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [departmentsRes, coursesRes] = await Promise.all([
        supabase.from('departments').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
      ]);

      if (departmentsRes.data) setDepartments(departmentsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDepartmentModal = (dept?: Department) => {
    setModalType('department');
    if (dept) {
      setEditingItem(dept);
      setDeptFormData({
        name: dept.name,
        code: dept.code,
        head: dept.head,
        description: dept.description,
      });
    } else {
      setEditingItem(null);
      setDeptFormData({ name: '', code: '', head: '', description: '' });
    }
    setShowModal(true);
  };

  const openCourseModal = (course?: Course) => {
    setModalType('course');
    if (course) {
      setEditingItem(course);
      setCourseFormData({
        name: course.name,
        code: course.code,
        department_id: course.department_id || '',
        semester: course.semester,
        credits: course.credits,
      });
    } else {
      setEditingItem(null);
      setCourseFormData({ name: '', code: '', department_id: '', semester: 1, credits: 3 });
    }
    setShowModal(true);
  };

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('departments')
          .update(deptFormData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('departments').insert([deptFormData]);
        if (error) throw error;
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department. Please check all fields.');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('courses')
          .update(courseFormData)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('courses').insert([courseFormData]);
        if (error) throw error;
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course. Please check all fields.');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure? This will also delete related courses.')) return;
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Error deleting department.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Error deleting course.');
    }
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return 'N/A';
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Departments & Courses</h1>
          <p className="text-gray-600 mt-1">Manage academic departments and courses</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'departments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'courses'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Courses
        </button>
      </div>

      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openDepartmentModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="text-blue-600" size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDepartmentModal(dept)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {dept.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">Code: {dept.code}</p>
                {dept.head && (
                  <p className="text-sm text-gray-600 mb-2">Head: {dept.head}</p>
                )}
                {dept.description && (
                  <p className="text-sm text-gray-600">{dept.description}</p>
                )}
              </div>
            ))}
          </div>

          {departments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No departments found. Add your first department.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openCourseModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Course
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Course Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No courses found
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {course.code}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {course.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getDepartmentName(course.department_id)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Semester {course.semester}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {course.credits}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openCourseModal(course)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
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
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'Edit' : 'Add'}{' '}
                {modalType === 'department' ? 'Department' : 'Course'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {modalType === 'department' ? (
              <form onSubmit={handleDepartmentSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptFormData.name}
                    onChange={(e) =>
                      setDeptFormData({ ...deptFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptFormData.code}
                    onChange={(e) =>
                      setDeptFormData({ ...deptFormData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <input
                    type="text"
                    value={deptFormData.head}
                    onChange={(e) =>
                      setDeptFormData({ ...deptFormData, head: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={deptFormData.description}
                    onChange={(e) =>
                      setDeptFormData({ ...deptFormData, description: e.target.value })
                    }
                    rows={3}
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
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseFormData.name}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseFormData.code}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, code: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={courseFormData.department_id}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        department_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={courseFormData.semester}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        semester: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={courseFormData.credits}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        credits: parseInt(e.target.value),
                      })
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
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
