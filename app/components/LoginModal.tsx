import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, role: 'JL' | 'TI' | 'CI' | 'Admin') => void;
}

const users = [
  { username: 'john', role: 'JL' as const },
  { username: 'jane', role: 'TI' as const },
  { username: 'alice', role: 'CI' as const },
  { username: 'admin', role: 'Admin' as const },
]

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [selectedUser, setSelectedUser] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.username === selectedUser)
    if (user) {
      onLogin(user.username, user.role)
    }
  }

  const getRoleBadgeColor = (role: 'JL' | 'TI' | 'CI' | 'Admin') => {
    switch (role) {
      case 'JL': return 'bg-blue-500'
      case 'TI': return 'bg-red-500'
      case 'CI': return 'bg-black'
      case 'Admin': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="user-select">Select User</Label>
            <Select onValueChange={setSelectedUser} value={selectedUser}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.username} value={user.username}>
                    <span className="flex items-center">
                      <Badge className={`${getRoleBadgeColor(user.role)} text-white mr-2`}>
                        {user.role === 'Admin' ? '*' : user.role}
                      </Badge>
                      {user.username}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={!selectedUser}>Sign In</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

