import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Event } from '../types'
import ReactMarkdown from 'react-markdown'

type EventDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
};

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.type === 'Custom' ? event.customText : event.type}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 space-y-4">
          <p className="text-sm text-gray-500">Date: {new Date(event.date).toLocaleDateString()}</p>
          {event.description && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />,
                }}
              >
                {event.description}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

