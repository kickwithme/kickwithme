"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { User } from '../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

type ProfilePopupProps = {
  user: User | null;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilePopup({ user, onUpdateUser, isOpen, onClose }: ProfilePopupProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [signupPreferences, setSignupPreferences] = useState({
    lead: true,
    desk: true,
    assist: true
  })

  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setName(user.username || '')
      setPhone(user.phone || '')
      setEmail(user.email || '')
      setSignupPreferences(user.signupPreferences || { lead: true, desk: true, assist: true })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateUser({ 
      username: name, 
      phone, 
      email,
      signupPreferences: user?.role === 'TI' || user?.role === 'CI' ? signupPreferences : undefined
    })
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully.",
    })
    onClose()
  }

  const handleCheckboxChange = (preference: 'lead' | 'desk' | 'assist') => {
    setSignupPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }))
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>
          {(user.role === 'TI' || user.role === 'CI') && (
            <div className="space-y-2">
              <Label>Signup Preferences</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lead-checkbox"
                    checked={signupPreferences.lead}
                    onCheckedChange={() => handleCheckboxChange('lead')}
                  />
                  <Label htmlFor="lead-checkbox">Lead</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="desk-checkbox"
                    checked={signupPreferences.desk}
                    onCheckedChange={() => handleCheckboxChange('desk')}
                  />
                  <Label htmlFor="desk-checkbox">Desk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="assist-checkbox"
                    checked={signupPreferences.assist}
                    onCheckedChange={() => handleCheckboxChange('assist')}
                  />
                  <Label htmlFor="assist-checkbox">Assist</Label>
                </div>
              </div>
            </div>
          )}
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

