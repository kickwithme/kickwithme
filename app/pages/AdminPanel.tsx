"use client"

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUsers, updateUsers } from '../data/users'
import { User, Role } from '../types'
import { Eye, EyeOff, X, Plus } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const sortUsersByRank = (a: User, b: User) => {
  const rankOrder: Record<Role, number> = { JL: 0, TI: 1, CI: 2, Admin: 3 };
  return rankOrder[a.role] - rankOrder[b.role];
};

export default function AdminPanel() {
  const [editableUsers, setEditableUsers] = useState<User[]>([])
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    role: 'JL',
    password: '',
  })
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  useEffect(() => {
    setEditableUsers(getUsers().map(user => ({ ...user })).sort(sortUsersByRank));
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number, field: keyof User) => {
    e.preventDefault();
    const updatedUsers = [...editableUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: e.target.value };
    setEditableUsers(updatedUsers);
  };

  const handleRoleChange = (index: number, role: Role) => {
    const updatedUsers = [...editableUsers]
    updatedUsers[index] = { ...updatedUsers[index], role }
    setEditableUsers(updatedUsers)
  }

  const handleSave = () => {
    updateUsers(editableUsers)
    toast({
      title: "Changes saved",
      description: "User information has been updated successfully.",
    })
  }

  const togglePasswordVisibility = (username: string) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [username]: !prev[username]
    }))
  }

  const handleCreateUser = () => {
    if (newUser.username && newUser.role && newUser.password) {
      const createdUser: User = {
        username: newUser.username,
        role: newUser.role as Role,
        phone: '',
        email: '',
        password: newUser.password,
        signupPreferences: { lead: false, desk: false, assist: true }
      }
      const updatedUsers = [...editableUsers, createdUser].sort(sortUsersByRank)
      setEditableUsers(updatedUsers)
      updateUsers(updatedUsers)
      toast({
        title: "User created",
        description: `${createdUser.username} has been added to the system.`,
      })
      setNewUser({
        username: '',
        role: 'JL',
        password: '',
      })
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields (username, role, and password).",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setShowDeleteConfirmation(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      const updatedUsers = editableUsers.filter(u => u.username !== userToDelete.username)
      setEditableUsers(updatedUsers)
      updateUsers(updatedUsers)
      toast({
        title: "User deleted",
        description: `${userToDelete.username} has been removed from the system.`,
      })
    }
    setShowDeleteConfirmation(false)
    setUserToDelete(null)
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: Role) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JL">JL</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="CI">CI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-username">Username</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
            </div>
            <Button type="submit">Create User</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getUsers().map((user, index) => (
                <TableRow key={user.username}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={user.username}
                      onChange={(e) => handleInputChange(e, index, 'username')}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value: Role) => handleRoleChange(index, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JL">JL</SelectItem>
                        <SelectItem value="TI">TI</SelectItem>
                        <SelectItem value="CI">CI</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={user.phone || ''}
                      onChange={(e) => handleInputChange(e, index, 'phone')}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={user.email || ''}
                      onChange={(e) => handleInputChange(e, index, 'email')}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Input
                        type={passwordVisibility[user.username] ? "text" : "password"}
                        value={user.password || ''}
                        onChange={(e) => handleInputChange(e, index, 'password')}
                        className="mr-2"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePasswordVisibility(user.username)}
                      >
                        {passwordVisibility[user.username] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleSave} className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

