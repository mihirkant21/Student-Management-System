import { useEffect, useState } from 'react';
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EventNotice } from '../lib/types';

interface Stats {
  totalStudents: number;
  totalDepartments: number;
  totalCourses: number;
  presentToday: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalDepartments: 0,
    totalCourses: 0,
    presentToday: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<EventNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [studentsRes, departmentsRes, coursesRes, attendanceRes, eventsRes] =
        await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase
            .from('departments')
            .select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase
            .from('attendance')
            .select('id', { count: 'exact', head: true })
            .eq('date', new Date().toISOString().split('T')[0])
            .eq('status', 'Present'),
          supabase
            .from('events_notices')
            .select('*')
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })
            .limit(5),
        ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalDepartments: departmentsRes.count || 0,
        totalCourses: coursesRes.count || 0,
        presentToday: attendanceRes.count || 0,
      });

      setUpcomingEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: Calendar,
      color: 'bg-teal-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Student Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Upcoming Events & Notices
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      event.priority === 'High'
                        ? 'bg-red-500'
                        : event.priority === 'Medium'
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()} • {event.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Active Students</span>
              <span className="font-semibold text-blue-700">
                {stats.totalStudents}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Departments</span>
              <span className="font-semibold text-green-700">
                {stats.totalDepartments}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-700">Available Courses</span>
              <span className="font-semibold text-orange-700">
                {stats.totalCourses}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <span className="text-gray-700">Attendance Rate</span>
              <span className="font-semibold text-teal-700">
                {stats.totalStudents > 0
                  ? Math.round((stats.presentToday / stats.totalStudents) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
