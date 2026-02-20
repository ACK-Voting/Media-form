'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import { eventsAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import type { Event } from '@/types';

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  eventType: 'service' | 'rehearsal' | 'meeting' | 'training' | 'special' | 'other';
}

function EventsPage() {
  const { showSuccess, showError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; eventId: string | null }>({
    isOpen: false,
    eventId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
  });
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    eventType: 'meeting',
  });

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsAPI.getAll(
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.eventType || undefined
      );
      if (response.success) {
        setEvents(response.events || []);
      }
    } catch (error: any) {
      showError('Failed to Load Events', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  // Filter events by search term
  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const now = new Date();
  const totalEvents = filteredEvents.length;
  const upcomingEvents = filteredEvents.filter((event) => new Date(event.eventDate) >= now).length;
  const pastEvents = filteredEvents.filter((event) => new Date(event.eventDate) < now).length;

  // Handle create event
  const handleCreate = async () => {
    if (!formData.title || !formData.eventDate || !formData.location) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      await eventsAPI.create(formData);
      showSuccess('Event Created', 'The event has been successfully created');
      setShowCreateModal(false);
      resetForm();
      await fetchEvents();
    } catch (error: any) {
      showError('Failed to Create Event', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit event
  const handleEdit = async () => {
    if (!editingEvent || !formData.title || !formData.eventDate || !formData.location) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      await eventsAPI.update(editingEvent._id, formData);
      showSuccess('Event Updated', 'The event has been successfully updated');
      setEditingEvent(null);
      resetForm();
      await fetchEvents();
    } catch (error: any) {
      showError('Failed to Update Event', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete event
  const handleDelete = async () => {
    if (!confirmDelete.eventId) return;

    setActionLoading(true);
    try {
      await eventsAPI.delete(confirmDelete.eventId);
      showSuccess('Event Deleted', 'The event has been successfully deleted');
      setConfirmDelete({ isOpen: false, eventId: null });
      await fetchEvents();
    } catch (error: any) {
      showError('Failed to Delete Event', error.response?.data?.message || error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate.split('T')[0],
      eventTime: event.eventTime || '',
      location: event.location || '',
      eventType: event.eventType,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      location: '',
      eventType: 'meeting',
    });
  };

  // Close modals
  const closeCreateModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setEditingEvent(null);
    resetForm();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get event type badge color
  const getEventTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      service: 'bg-purple-100 text-purple-800',
      rehearsal: 'bg-blue-100 text-blue-800',
      meeting: 'bg-green-100 text-green-800',
      training: 'bg-yellow-100 text-yellow-800',
      special: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Create New Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Events</p>
              <p className="text-3xl font-bold text-green-600">{upcomingEvents}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Past Events</p>
              <p className="text-3xl font-bold text-gray-600">{pastEvents}</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Types</option>
                <option value="service">Service</option>
                <option value="rehearsal">Rehearsal</option>
                <option value="meeting">Meeting</option>
                <option value="training">Training</option>
                <option value="special">Special</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Events List */}
        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600">No events found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || filters.startDate || filters.endDate || filters.eventType
                  ? 'Try adjusting your filters'
                  : 'Create your first event to get started'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{event.title}</h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeBadgeColor(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatDate(event.eventDate)}
                    {event.eventTime && ` at ${event.eventTime}`}
                  </div>

                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.location}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEditModal(event)} className="flex-1">
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setConfirmDelete({ isOpen: true, eventId: event._id })}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Create New Event"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Event Title *"
            placeholder="Enter event title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Time
              </label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <Input
            label="Location *"
            placeholder="Enter event location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  eventType: e.target.value as EventFormData['eventType'],
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="meeting">Meeting</option>
              <option value="service">Service</option>
              <option value="rehearsal">Rehearsal</option>
              <option value="training">Training</option>
              <option value="special">Special</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={actionLoading}>
              Create Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        isOpen={!!editingEvent}
        onClose={closeEditModal}
        title="Edit Event"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Event Title *"
            placeholder="Enter event title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Time
              </label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <Input
            label="Location *"
            placeholder="Enter event location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  eventType: e.target.value as EventFormData['eventType'],
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="meeting">Meeting</option>
              <option value="service">Service</option>
              <option value="rehearsal">Rehearsal</option>
              <option value="training">Training</option>
              <option value="special">Special</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEdit} isLoading={actionLoading}>
              Update Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, eventId: null })}
      />
    </AdminLayout>
  );
}

export default function Events() {
  return (
    <ProtectedRoute>
      <EventsPage />
    </ProtectedRoute>
  );
}
