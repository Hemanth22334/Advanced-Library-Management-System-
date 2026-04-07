import React from 'react';
import { Book as BookIcon, User, Tag, Layers, Trash2, Edit } from 'lucide-react';
import { cn } from '../lib/utils';

interface BookCardProps {
  book: any;
  isAdmin: boolean;
  onIssue?: (book: any) => void;
  onDelete?: (id: number) => void;
  onEdit?: (book: any) => void;
}

export default function BookCard({ book, isAdmin, onIssue, onDelete, onEdit }: any) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {book.imageUrl ? (
          <img 
            src={book.imageUrl} 
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <BookIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
            book.quantity > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {book.quantity > 0 ? `${book.quantity} Available` : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">{book.title}</h3>
          <div className="flex items-center text-slate-500 text-sm">
            <User className="w-3.5 h-3.5 mr-1.5" />
            <span className="line-clamp-1">{book.author}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded">
            <Tag className="w-3 h-3 mr-1" />
            {book.category}
          </div>
        </div>

        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button 
                onClick={() => onEdit?.(book)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
              <button 
                onClick={() => onDelete?.(book.id)}
                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              disabled={book.quantity <= 0}
              onClick={() => onIssue?.(book)}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
            >
              Request Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
