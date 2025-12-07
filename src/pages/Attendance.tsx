import { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Check, X as XIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Attendance, Student, Course } from '../lib/types';

interface AttendanceWithDetails extends Attendance {
  student_name?: string;
  course_name?: string;
}

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCourse, setSelectedCourse] = useState('');
  const [markingMode, setMarkingMode] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: string; id?: string }>
  >({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedCourse) {
      loadAttendanceForDate();
    }
  }, [selectedDate, selectedCourse]);

  const loadData = async () => {
    try {
      const [attendanceRes, studentsRes, coursesRes] = await Promise.all([
        supabase.from('attendance').select('*').order('date', { ascending: false }),
        supabase.from('students').select('*').eq('status', 'Active'),
        supabase.from('courses').select('*'),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);

      if (attendanceRes.data) {
        const attendanceWithDetails = attendanceRes.data.map((att) => {
          const student = studentsRes.data?.find((s) => s.id === att.student_id);
          const course = coursesRes.data?.find((c) => c.id === att.course_id);
          return {
            ...att,
            student_name: student?.name,
            course_name: course?.name,
          };
        });
        setAttendance(attendanceWithDetails);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async () => {
    try {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', selectedDate)
        .eq('course_id', selectedCourse);

      const map: Record<string, { status: string; id?: string }> = {};
      data?.forEach((att) => {
        if (att.student_id) {
          map[att.student_id] = { status: att.status, id: att.id };
        }
      });
      setAttendanceMap(map);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const startMarkingAttendance = () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }
    setMarkingMode(true);
  };

  const toggleAttendance = (studentId: string) => {
    setAttendanceMap((prev) => {
      const current = prev[studentId]?.status || 'Absent';
      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status: current === 'Present' ? 'Absent' : 'Present',
        },
      };
    });
  };

  const saveAttendance = async () => {
    try {
      for (const student of students) {
        const status = attendanceMap[student.id]?.status || 'Absent';
        const existingId = attendanceMap[student.id]?.id;

        if (existingId) {
          await supabase
            .from('attendance')
            .update({
              status,
              date: selectedDate,
              course_id: selectedCourse,
            })
            .eq('id', existingId);
        } else {
          await supabase.from('attendance').insert({
            student_id: student.id,
            course_id: selectedCourse,
            date: selectedDate,
            status,
          });
        }
      }

      setMarkingMode(false);
      loadData();
      loadAttendanceForDate();
      alert('Attendance saved successfully');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    }
  };

  const getAttendanceStats = () => {
    const courseAttendance = attendance.filter(
      (att) => att.course_id === selectedCourse
    );
    const total = courseAttendance.length;
    const present = courseAttendance.filter((att) => att.status === 'Present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, percentage };
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
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

          <div className="flex items-end">
            {!markingMode ? (
              <button
                onClick={startMarkingAttendance}
                disabled={!selectedCourse}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Mark Attendance
              </button>
            ) : (
              <button
                onClick={saveAttendance}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={20} />
                Save Attendance
              </button>
            )}
          </div>
        </div>

        {selectedCourse && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Classes</p>
              <p className="text-2xl font-bold text-blue-900">
                {getAttendanceStats().total}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Present</p>
              <p className="text-2xl font-bold text-green-900">
                {getAttendanceStats().present}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">
                Attendance Rate
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {getAttendanceStats().percentage}%
              </p>
            </div>
          </div>
        )}
      </div>

      {markingMode && selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mark Attendance for {selectedDate}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const isPresent = attendanceMap[student.id]?.status === 'Present';
              return (
                <div
                  key={student.id}
                  onClick={() => toggleAttendance(student.id)}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isPresent
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.reg_no}</p>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isPresent ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {isPresent ? (
                      <Check className="text-white" size={18} />
                    ) : (
                      <XIcon className="text-white" size={18} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!markingMode && selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Attendance History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendance
                  .filter((att) => att.course_id === selectedCourse)
                  .slice(0, 20)
                  .map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(att.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {att.student_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {att.course_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            att.status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : att.status === 'Late'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {att.remarks || '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
