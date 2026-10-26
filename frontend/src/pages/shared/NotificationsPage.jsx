import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, Check, CheckCheck, Clock, FileText, ArrowRight } from 'lucide-react';

export const NotificationsPage = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time updates regarding complaint assignments, status changes, and resolutions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-sky-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">You're all caught up!</h3>
            <p className="text-xs text-slate-400 mt-1">No notifications received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  notif.read ? 'bg-white hover:bg-slate-50/60' : 'bg-sky-50/40 hover:bg-sky-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                      notif.read ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-600'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-bold ${
                          notif.read ? 'text-slate-700' : 'text-slate-900'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>

                      {notif.complaintId && (
                        <Link
                          to={`/complaints/${notif.complaintId}`}
                          className="font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View Complaint #{notif.complaintId}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-white text-xs shrink-0 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
