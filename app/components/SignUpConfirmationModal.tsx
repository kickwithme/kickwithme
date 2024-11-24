import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { timeIndexToString } from '../utils/calendarUtils'

type SignUpConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  classInfo: {
    startTime: number;
    endTime: number;
    type: string;
    subvariant?: string;
    lead: Array<{ username: string }>;
    desk: Array<{ username: string }>;
    assist: Array<{ username: string }>;
  } | undefined;
  user: {
    username: string;
    role: 'JL' | 'TI' | 'CI';
  } | null;
  date: Date;
}

export default function SignUpConfirmationModal({ isOpen, onClose, classInfo, user, date }: SignUpConfirmationModalProps) {
  if (!classInfo || !user) return null;

  const getRoleBadgeColor = (role: 'JL' | 'TI' | 'CI') => {
    switch (role) {
      case 'JL': return 'bg-blue-500'
      case 'TI': return 'bg-red-500'
      case 'CI': return 'bg-black'
      default: return 'bg-gray-500'
    }
  }

  const getUserPosition = () => {
    if (classInfo.lead.some(s => s.username === user.username)) return 'Lead';
    if (classInfo.desk.some(s => s.username === user.username)) return 'Desk';
    if (classInfo.assist.some(s => s.username === user.username)) return 'Assist';
    return 'Unknown';
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign Up Confirmed</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p><span className="font-semibold">Class:</span> {classInfo.type} {classInfo.subvariant && `(${classInfo.subvariant})`}</p>
          <p><span className="font-semibold">Date:</span> {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><span className="font-semibold">Time:</span> {timeIndexToString(classInfo.startTime)} - {timeIndexToString(classInfo.endTime)}</p>
          <p><span className="font-semibold">Position:</span> {getUserPosition()}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

