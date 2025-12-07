import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Bell, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { EventNotice } from '../lib/types';

export default function Events() {
  const [events, setEvents] = useState<EventNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventNotice | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Notice',
    date: new Date().toISOString().split('T')[0],
    attachment_url: '',
    priority: 'Medium',
    created_by: 'Admin',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events_notices')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event?: EventNotice) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type,
        date: event.date,
        attachment_url: event.attachment_url,
        priority: event.priority,
        created_by: event.created_by,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        type: 'Notice',
        date: new Date().toISOString().split('T')[0],
        attachment_url: '',
        priority: 'Medium',
        created_by: 'Admin',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events_notices')
          .update(formData)
          .eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events_notices').insert([formData]);
        if (error) throw error;
      }

      setShowModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please check all fields.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event/notice?')) return;

    try {
      const { error } = await supabase.from('events_notices').delete().eq('id', id);
      if (error) throw error;
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event.');
    }
  };

  const filteredEvents =
    filterType === 'all'
      ? events
      : events.filter((event) => event.type === filterType);

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= new Date()
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
          <h1 className="text-3xl font-bold text-gray-900">Events & Notices</h1>
          <p className="text-gray-600 mt-1">
            Manage announcements, events, and notices
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create New
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('Notice')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'Notice'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Notices
          </button>
          <button
            onClick={() => setFilterType('Event')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'Event'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setFilterType('Announcement')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'Announcement'
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Announcements
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All {filterType !== 'all' ? filterType + 's' : 'Items'}
          </h2>
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No items found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        event.type === 'Event'
                          ? 'bg-blue-100'
                          : event.type === 'Notice'
                          ? 'bg-orange-100'
                          : 'bg-green-100'
                      }`}
                    >
                      {event.type === 'Event' ? (
                        <Calendar
                          className={
                            event.type === 'Event'
                              ? 'text-blue-600'
                              : event.type === 'Notice'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }
                          size={20}
                        />
                      ) : (
                        <Bell
                          className={
                            event.type === 'Event'
                              ? 'text-blue-600'
                              : event.type === 'Notice'
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }
                          size={20}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : event.priority === 'Medium'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {event.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span>{event.type}</span>
                        <span>By {event.created_by}</span>
                      </div>
                      {event.attachment_url && (
                        <a
                          href={event.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View Attachment
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <p className="font-medium text-gray-900 text-sm">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Events</span>
                <span className="font-semibold text-blue-700">
                  {events.filter((e) => e.type === 'Event').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Notices</span>
                <span className="font-semibold text-orange-700">
                  {events.filter((e) => e.type === 'Notice').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Announcements</span>
                <span className="font-semibold text-green-700">
                  {events.filter((e) => e.type === 'Announcement').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEvent ? 'Edit' : 'Create'} {formData.type}
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
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Notice">Notice</option>
                    <option value="Event">Event</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/file.pdf"
                  value={formData.attachment_url}
                  onChange={(e) =>
                    setFormData({ ...formData, attachment_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By
                </label>
                <input
                  type="text"
                  value={formData.created_by}
                  onChange={(e) =>
                    setFormData({ ...formData, created_by: e.target.value })
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
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
