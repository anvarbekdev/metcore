'use client';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifStore();

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (open) markAllRead(); }}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">Bildirishnomalar</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Yopish
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Bildirishnomalar yo'q
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition">
                  <p className="font-medium text-slate-800 text-sm">{n.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{n.body}</p>
                  {n.createdAt && (
                    <p className="text-slate-400 text-xs mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
