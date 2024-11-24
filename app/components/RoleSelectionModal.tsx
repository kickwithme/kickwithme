import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type RoleSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (position: 'lead' | 'desk' | 'assist') => void;
}

export default function RoleSelectionModal({ isOpen, onClose, onSelect }: RoleSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button onClick={() => onSelect('lead')}>Lead</Button>
          <Button onClick={() => onSelect('desk')}>Desk</Button>
          <Button onClick={() => onSelect('assist')}>Assist</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

