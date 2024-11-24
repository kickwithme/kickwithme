"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Calendar from './pages/Calendar'
import CreditSheet from './pages/CreditSheet'
import AdminPanel from './pages/AdminPanel'
import { User, UserSignup, ClassInfo, Role } from './types'
import { creditManager, CreditEntry } from './utils/creditManager'
import { Settings } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster"
import ProfilePopup from './components/ProfilePopup'
import { users, getUsers } from './data/users';

export default function MartialArtsApp() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState<'calendar' | 'creditSheet' | 'adminPanel' | 'profile'>('calendar')
  const [calendarData, setCalendarData] = useState<Record<string, ClassInfo>>({})
  const [highlightedClass, setHighlightedClass] = useState<CreditEntry | undefined>(undefined);
  const [currentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const getRoleBadgeColor = (role: 'JL' | 'TI' | 'CI' | 'Admin') => {
    switch (role) {
      case 'JL': return 'bg-[#4F7395]'
      case 'TI': return 'bg-[#954F5A]'
      case 'CI': return 'bg-black'
      case 'Admin': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const jumpToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const nextSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilNextSunday);
    const weekDiff = Math.floor((nextSunday.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setCurrentWeek(weekDiff);
  };

  const handleLogin = (username: string, role: Role) => {
    const usersData = getUsers();
    const user = usersData.find(u => u.username === username);
    if (user) {
      setUser(user);
    }
  }

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      return { 
        ...prev, 
        ...updatedUser,
        signupPreferences: updatedUser.signupPreferences || prev.signupPreferences
      };
    });
  };

  useEffect(() => {
    jumpToCurrentWeek();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">Martial Arts Studio</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-2">
              <span>Signed in as</span>
              <Badge className={`${getRoleBadgeColor(user.role)} text-white`} variant="secondary">
                {user.role === 'Admin' ? '*' : user.role}
              </Badge>
              <span>{user.username}</span>
              <Button variant="outline" className="ml-4" onClick={() => setUser(null)}>Sign Out</Button>
              <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsProfileOpen(true)}>
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Sign In</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {getUsers().map((user) => (
                  <DropdownMenuItem key={user.username} onSelect={() => handleLogin(user.username, user.role)}>
                    <Badge 
                      className={`${
                        user.role === 'JL' ? 'bg-[#4F7395]' : 
                        user.role === 'TI' ? 'bg-[#954F5A]' : 
                        getRoleBadgeColor(user.role)
                      } text-white mr-2`}
                    >
                      {user.role === 'Admin' ? '*' : user.role}
                    </Badge>
                    {user.username}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex justify-start items-center mb-4">
        <Button
          variant={currentPage === 'calendar' ? 'default' : 'outline'}
          onClick={() => setCurrentPage('calendar')}
          className="mr-2"
        >
          Calendar
        </Button>
        <Button
          variant={currentPage === 'creditSheet' ? 'default' : 'outline'}
          onClick={() => setCurrentPage('creditSheet')}
          className="mr-2"
        >
          Credit Sheet
        </Button>
        {user?.role === 'Admin' && (
          <>
            <div className="flex items-center">
              <div className="w-px h-6 bg-gray-300 mx-2" />
            </div>
            <Button
              variant={currentPage === 'adminPanel' ? 'default' : 'outline'}
              onClick={() => setCurrentPage('adminPanel')}
            >
              Admin Panel
            </Button>
          </>
        )}
      </div>

      {currentPage === 'calendar' ? (
        <Calendar 
          user={user} 
          calendarData={calendarData}
          setCalendarData={setCalendarData}
          highlightedClass={highlightedClass}
          currentDate={currentDate}
          currentWeek={currentWeek}
          setCurrentWeek={setCurrentWeek}
        />
      ) : currentPage === 'creditSheet' ? (
        <CreditSheet 
          username={user?.username || ''}
          isAdmin={user?.role === 'Admin'}
          allUsers={getUsers()}
          currentDate={currentDate}
          onSignupClick={(credit) => {
            setHighlightedClass(credit);
            setCurrentWeek(credit.weekOffset);
            setCurrentPage('calendar');
          }}
        />
      ) : currentPage === 'adminPanel' ? (
        <AdminPanel />
      ) : null}
      <ProfilePopup
        user={user}
        onUpdateUser={handleUpdateUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <Toaster />
    </div>
  )
}

