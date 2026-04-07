import React, { useState, useEffect } from 'react';
import { Book, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

export default function StudentDashboard() {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-books', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setMyBooks(data);
        setLoading(false);
      });
  }, []);

  const activeIssues = myBooks.filter((t: any) => t.status === 'issued');
  const history = myBooks.filter((t: any) => t.status === 'returned');

  if (loading) return <div className="p-8 text-center">Loading your library...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Library Dashboard</h1>

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-amber-600" />
          <h2 className="text-xl font-bold text-slate-900">Currently Issued</h2>
        </div>
        
        {activeIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeIssues.map((transaction: any) => (
              <div key={transaction.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                
                <div className="relative">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{transaction.book.title}</h3>
                  <p className="text-slate-500 text-sm mb-4">{transaction.book.author}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Issued on:</span>
                      <span className="font-medium">{formatDate(transaction.issueDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Due date:</span>
                      <span className={cn(
                        "font-bold",
                        new Date(transaction.dueDate) < new Date() ? "text-red-600" : "text-amber-600"
                      )}>
                        {formatDate(transaction.dueDate)}
                      </span>
                    </div>
                  </div>

                  {new Date(transaction.dueDate) < new Date() && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      OVERDUE - Please return ASAP
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-500">You don't have any books issued at the moment.</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <History className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Reading History</h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Book</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Issued</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Returned</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{t.book.title}</p>
                    <p className="text-xs text-slate-500">{t.book.author}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(t.issueDate)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatDate(t.returnDate)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Returned
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">No history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const History = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
