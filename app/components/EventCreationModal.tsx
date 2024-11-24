import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { EventColor, Event } from '../types'
import FormattingButtons from './FormattingButtons'
import { Trash2 } from 'lucide-react'

type EventCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: () => void;
  existingEvent?: Event;
  date: string;
};

const eventTypes = [
  'Holiday',
  'Special Class',
  'Tournament',
  'Seminar',
  'Promotion',
  'Custom',
];

const colorOptions: EventColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export default function EventCreationModal({ isOpen, onClose, onSave, onDelete, existingEvent, date }: EventCreationModalProps) {
  const [eventType, setEventType] = useState(existingEvent?.type || 'Holiday');
  const [customText, setCustomText] = useState(existingEvent?.customText || '');
  const [color, setColor] = useState<EventColor>(existingEvent?.color || 'blue');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [selectedText, setSelectedText] = useState('');

  const handleSave = () => {
    const newEvent: Event = {
      id: existingEvent?.id || `event-${date}-${Math.random().toString(36).substr(2, 9)}`,
      date,
      color,
      type: eventType,
      customText: eventType === 'Custom' ? customText : undefined,
      description,
    };

    onSave(newEvent);
    onClose();
  };

  const handleFormat = (type: 'bold' | 'italic' | 'underline' | 'link', formattedText: string) => {
    setDescription(prev => {
      const start = prev.indexOf(selectedText);
      const end = start + selectedText.length;
      return prev.substring(0, start) + formattedText + prev.substring(end);
    });
  };

  const handleSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    setSelectedText(description.substring(start, end));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-type">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger id="event-type">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {eventType === 'Custom' && (
            <div>
              <Label htmlFor="custom-text">Custom Event Text</Label>
              <Input
                id="custom-text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom event text"
              />
            </div>
          )}
          <div>
            <Label htmlFor="event-color">Event Color</Label>
            <Select value={color} onValueChange={(value) => setColor(value as EventColor)}>
              <SelectTrigger id="event-color">
                <SelectValue placeholder="Select event color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((colorOption) => (
                  <SelectItem key={colorOption} value={colorOption}>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 bg-${colorOption}-500`} />
                      {colorOption.charAt(0).toUpperCase() + colorOption.slice(1)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="event-description">Event Description</Label>
            <FormattingButtons onFormat={handleFormat} selectedText={selectedText} />
            <Textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onSelect={handleSelect}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          <div className="flex justify-between">
            {existingEvent && onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            )}
            <Button onClick={handleSave} className="ml-auto">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

