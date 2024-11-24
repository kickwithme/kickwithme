import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Trash2 } from 'lucide-react'
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ClassInfo, ClassSignUp, User, Role } from '../types'
import { classColors } from '../utils/constants'
import { Checkbox } from "@/components/ui/checkbox"
import { getDefaultAvailablePositions } from '../utils/classDefaults';
import { getUsers } from '../data/users'

const getRoleBadgeColor = (role: Role) => {
  switch (role) {
    case 'JL': return 'bg-[#4F7395]'
    case 'TI': return 'bg-[#954F5A]'
    case 'CI': return 'bg-black'
    case 'Admin': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const period = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour % 12 || 12;
      options.push(`${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`);
    }
  }
  return options;
};

type EditClassModalProps = {
  isOpen: boolean;
  onClose: () => void;
  classInfo: ClassInfo;
  onSave: (updatedClass: ClassInfo) => void;
  onDelete: () => void;
  currentDate: Date;
  creditManager: any;
}

export default function EditClassModal({ isOpen, onClose, classInfo, onSave, onDelete, currentDate, creditManager }: EditClassModalProps) {
  const [editedClass, setEditedClass] = useState<ClassInfo>({
    ...classInfo,
    availablePositions: {
      lead: true,
      desk: !classInfo.type.toLowerCase().includes('black belt') && 
            !classInfo.type.toLowerCase().includes('adult') &&
            !classInfo.type.toLowerCase().includes('leadership') &&
            !classInfo.type.toLowerCase().includes('demo'),
      assist: true
    }
  })
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<'lead' | 'desk' | 'assist'>('lead')
  const [availablePositions, setAvailablePositions] = useState({
    lead: true,
    desk: true,
    assist: true
  });

  useEffect(() => {
    setEditedClass(prev => ({
      ...prev, 
      ...classInfo,
      availablePositions: {
        ...getDefaultAvailablePositions(classInfo.type),
        ...classInfo.availablePositions
      }
    }))
    setSelectedUser('')
    setSelectedPosition('lead')
    setAvailablePositions(classInfo.availablePositions)
  }, [classInfo])

  const sortUsersByRank = (a: User, b: User) => {
    // Implement your sorting logic here based on user rank
    return 0; // Replace with actual sorting logic
  };

  const sortedUsers = getUsers().sort(sortUsersByRank);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setEditedClass(prev => {
      const updatedClass = {
        ...prev,
        [name]: value,
      }
      if (name === 'type') {
        updatedClass.availablePositions = getDefaultAvailablePositions(value);
      }
      return updatedClass;
    })
  }

  const handleRemoveUser = (position: 'lead' | 'desk' | 'assist', username: string) => {
    setEditedClass(prev => {
      const updatedClass = {
        ...prev,
        [position]: prev[position].filter(user => user.username !== username)
      };

      // Remove credit
      const classDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(editedClass.id.split('-')[0]));
      creditManager.removeCredit(
        username,
        updatedClass,
        classDate.toISOString().split('T')[0]
      );

      return updatedClass;
    })
  }

  const handleAddUser = () => {
    if (selectedUser && selectedPosition && availablePositions[selectedPosition]) {
      const userToAdd = sortedUsers.find(user => user.username === selectedUser)
      if (userToAdd) {
        setEditedClass(prev => {
          const updatedClass = {
            ...prev,
            [selectedPosition]: [...prev[selectedPosition], { username: userToAdd.username, role: userToAdd.role, position: selectedPosition }]
          };

          // Add credit
          const classDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(editedClass.id.split('-')[0]));
          creditManager.addCredit(
            userToAdd.username,
            updatedClass,
            classDate.toISOString().split('T')[0],
            selectedPosition,
            userToAdd.role
          );

          return updatedClass;
        })
        setSelectedUser('')
      }
    }
  }

  const renderUserList = () => (
    ['lead', 'desk', 'assist'].map((position) => (
      <div key={position} className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`${position}-checkbox`}
            checked={availablePositions[position as keyof typeof availablePositions]}
            onCheckedChange={() => handlePositionToggle(position as 'lead' | 'desk' | 'assist')}
          />
          <Label htmlFor={`${position}-checkbox`}>{position.charAt(0).toUpperCase() + position.slice(1)}</Label>
        </div>
        {editedClass[position as keyof Pick<ClassInfo, 'lead' | 'desk' | 'assist'>].map((signup, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Button 
              onClick={() => handleRemoveUser(position as 'lead' | 'desk' | 'assist', signup.username)} 
              variant="ghost" 
              size="sm"
              className="p-0 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
            <Badge className={`${getRoleBadgeColor(signup.role)} text-white`}>
              {signup.role}
            </Badge>
            <span>{signup.username}</span>
          </div>
        ))}
      </div>
    ))
  )

  const handleDeleteClass = () => {
    // Remove credits for all users in the class
    ['lead', 'desk', 'assist'].forEach(position => {
      editedClass[position as keyof Pick<ClassInfo, 'lead' | 'desk' | 'assist'>].forEach(signup => {
        const classDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(editedClass.id.split('-')[0]));
        creditManager.removeCredit(
          signup.username,
          editedClass,
          classDate.toISOString().split('T')[0]
        );
      });
    });

    onDelete();
  }

  const handlePositionToggle = (position: 'lead' | 'desk' | 'assist') => {
    setAvailablePositions(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Class Type
            </Label>
            <Input
              id="type"
              name="type"
              value={editedClass.type}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subvariant" className="text-right">
              Class Variant
            </Label>
            <Input
              id="subvariant"
              name="subvariant"
              value={editedClass.subvariant || ''}
              onChange={handleInputChange}
              placeholder="Enter class variant (optional)"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Time
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Select
                onValueChange={(value) => handleInputChange({ target: { name: 'startTime', value: parseInt(value) } } as any)}
                value={editedClass.startTime.toString()}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Start Time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time, index) => (
                    <SelectItem key={time} value={index.toString()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>to</span>
              <Select
                onValueChange={(value) => handleInputChange({ target: { name: 'endTime', value: parseInt(value) } } as any)}
                value={editedClass.endTime.toString()}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="End Time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeOptions().map((time, index) => (
                    <SelectItem key={time} value={index.toString()}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Class Color
            </Label>
            <Select
              onValueChange={(value) => handleInputChange({ target: { name: 'color', value } } as any)}
              value={editedClass.color || ''}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-[#954F5A]">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#954F5A]"></div>
                    Red
                  </div>
                </SelectItem>
                <SelectItem value="text-[#4F7395]">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#4F7395]"></div>
                    Blue
                  </div>
                </SelectItem>
                <SelectItem value="text-[#4F9563]">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-[#4F9563]"></div>
                    Green
                  </div>
                </SelectItem>
                <SelectItem value="text-black">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-black"></div>
                    Black
                  </div>
                </SelectItem>
                <SelectItem value="text-yellow-600">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-yellow-600"></div>
                    Yellow
                  </div>
                </SelectItem>
                <SelectItem value="text-purple-600">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2 bg-purple-600"></div>
                    Purple
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-4" />
          {renderUserList()}
          <div className="space-y-2">
            <Label>Add User</Label>
            <div className="flex space-x-2">
              <Select onValueChange={setSelectedUser} value={selectedUser}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {sortedUsers.map((user) => (
                    <SelectItem key={user.username} value={user.username}>
                      {user.username} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedPosition as any} value={selectedPosition}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead" disabled={!availablePositions.lead}>Lead</SelectItem>
                  <SelectItem value="desk" disabled={!availablePositions.desk}>Desk</SelectItem>
                  <SelectItem value="assist" disabled={!availablePositions.assist}>Assist</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser}>Add</Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button onClick={handleDeleteClass} variant="destructive" size="default">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Class
          </Button>
          <Button onClick={() => onSave({...editedClass, availablePositions})}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

