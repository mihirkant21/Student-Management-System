import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Search, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Fee, Student } from '../lib/types';

interface FeeWithDetails extends Fee {
  student_name?: string;
  student_reg_no?: string;
}

export default function Fees() {
  const [fees, setFees] = useState<FeeWithDetails[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    amount: 0,
    paid_amount: 0,
    due_date: '',
    payment_date: '',
    status: 'Unpaid',
    fee_type: 'Tuition',
    semester: 1,
    academic_year: new Date().getFullYear().toString(),
    remarks: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        supabase.from('fees').select('*').order('created_at', { ascending: false }),
        supabase.from('students').select('*'),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);

      if (feesRes.data) {
        const feesWithDetails = feesRes.data.map((fee) => {
          const student = studentsRes.data?.find((s) => s.id === fee.student_id);
          return {
            ...fee,
            student_name: student?.name,
            student_reg_no: student?.reg_no,
          };
        });
        setFees(feesWithDetails);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (fee?: Fee) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        student_id: fee.student_id || '',
        amount: fee.amount,
        paid_amount: fee.paid_amount,
        due_date: fee.due_date || '',
        payment_date: fee.payment_date || '',
        status: fee.status,
        fee_type: fee.fee_type,
        semester: fee.semester,
        academic_year: fee.academic_year,
        remarks: fee.remarks,
      });
    } else {
      setEditingFee(null);
      setFormData({
        student_id: '',
        amount: 0,
        paid_amount: 0,
        due_date: '',
        payment_date: '',
        status: 'Unpaid',
        fee_type: 'Tuition',
        semester: 1,
        academic_year: new Date().getFullYear().toString(),
        remarks: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let status = 'Unpaid';
    if (formData.paid_amount >= formData.amount) {
      status = 'Paid';
    } else if (formData.paid_amount > 0) {
      status = 'Partial';
    }

    const dataToSave = {
      ...formData,
      status,
    };

    try {
      if (editingFee) {
        const { error } = await supabase
          .from('fees')
          .update(dataToSave)
          .eq('id', editingFee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fees').insert([dataToSave]);
        if (error) throw error;
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving fee:', error);
      alert('Error saving fee. Please check all fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;

    try {
      const { error } = await supabase.from('fees').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting fee:', error);
      alert('Error deleting fee.');
    }
  };

  const filteredFees = fees.filter(
    (fee) =>
      fee.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.student_reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.fee_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalStats = () => {
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const collected = fees.reduce((sum, fee) => sum + fee.paid_amount, 0);
    const pending = total - collected;

    return { total, collected, pending };
  };

  const stats = getTotalStats();

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
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage student fees and payments</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Fee Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.total.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collected</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ${stats.collected.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                ${stats.pending.toFixed(2)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <DollarSign className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, registration number, or fee type..."
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
                  Reg No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fee Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No fee records found
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {fee.student_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.student_reg_no || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.fee_type}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${fee.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      ${fee.paid_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fee.due_date
                        ? new Date(fee.due_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fee.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : fee.status === 'Partial'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(fee)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFee ? 'Edit Fee' : 'Add Fee Record'}
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
                  Fee Type
                </label>
                <select
                  value={formData.fee_type}
                  onChange={(e) =>
                    setFormData({ ...formData, fee_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Exam">Exam</option>
                  <option value="Library">Library</option>
                  <option value="Lab">Lab</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.paid_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paid_amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  rows={2}
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
                  {editingFee ? 'Update' : 'Add'} Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
