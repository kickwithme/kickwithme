"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Minus, Edit, RotateCcw, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SignUpConfirmationModal from '../components/SignUpConfirmationModal'
import EditClassModal from '../components/EditClassModal'
import EventCreationModal from '../components/EventCreationModal'
import EventDetailsModal from '../components/EventDetailsModal'
import { ClassInfo, ClassSignUp, Role, User, Event, CalendarEvent } from '../types'
import { classColors } from '../utils/constants'
import { creditManager, CreditEntry } from '../utils/creditManager'
import { classSchedule, daysOfWeek } from '../data/classSchedule'
import { getUsers } from '../data/users'
import { 
  START_DATE, 
  generateUniqueId, 
  isCurrentDay, 
  getDayNumber, 
  getOrdinalSuffix, 
  getWeekDates, 
  timeIndexToString, 
} from '../utils/calendarUtils'
import { defaultFocuses } from '../utils/defaultFocuses';
import { getDefaultAvailablePositions } from '../utils/classDefaults';

type CalendarProps = {
  user: User | null;
  calendarData: Record<string, ClassInfo>;
  setCalendarData: React.Dispatch<React.SetStateAction<Record<string, ClassInfo>>>;
  highlightedClass?: CreditEntry;
  currentDate: Date;
  currentWeek: number;
  setCurrentWeek: React.Dispatch<React.SetStateAction<number>>;
}

export default function Calendar({ user, calendarData, setCalendarData, highlightedClass, currentDate, currentWeek, setCurrentWeek }: CalendarProps) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState<{ dayIndex: number; classIndex: number; classId: string } | null>(null)
  const [showEditClassModal, setShowEditClassModal] = useState(false)
  const [weekFocuses, setWeekFocuses] = useState<Record<number, string>>(defaultFocuses);
  const [visualWeek, setVisualWeek] = useState(1);
  const [loopPoints, setLoopPoints] = useState<number[]>([]);
  const [events, setEvents] = useState<CalendarEvent>({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (currentWeek === 0) {
      jumpToCurrentWeek();
    }
  }, []);

  const jumpToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilNextSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const nextSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilNextSunday);
    const weekDiff = Math.floor((nextSunday.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    setCurrentWeek(weekDiff);
    updateVisualWeek(weekDiff);
  };

  const updateVisualWeek = (week: number) => {
    setVisualWeek(prevVisualWeek => {
      if (loopPoints.length === 0) {
        return week + 1;
      }

      const sortedLoopPoints = [...loopPoints].sort((a, b) => a - b);
      let newVisualWeek = week + 1;

      for (let i = 0; i < sortedLoopPoints.length; i++) {
        if (week >= sortedLoopPoints[i]) {
          const cycleStart = i > 0 ? sortedLoopPoints[i-1] : 0;
          const cycleLength = sortedLoopPoints[i] - cycleStart;
          const weeksAfterLastLoop = week - sortedLoopPoints[i];
          newVisualWeek = (weeksAfterLastLoop % cycleLength) + 1;
          
          if (weeksAfterLastLoop >= cycleLength) {
            newVisualWeek += Math.floor(weeksAfterLastLoop / cycleLength) * cycleLength;
          }
        } else {
          break;
        }
      }

      return newVisualWeek;
    });
  };

  useEffect(() => {
    const newClasses: Record<string, ClassInfo> = {};
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + i);
      if (date >= START_DATE) {
        classSchedule[i].forEach((classInfo, index) => {
          const id = generateUniqueId(date, index);
          if (calendarData[id]) {
            newClasses[id] = calendarData[id];
          } else {
            newClasses[id] = { 
              ...classInfo, 
              id, 
              lead: [], 
              desk: [], 
              assist: [], 
              availablePositions: getDefaultAvailablePositions(classInfo.type)
            };
          }
        });
      }
    }
    setCalendarData(prev => ({...prev, ...newClasses}));
  }, [currentWeek, currentDate, setCalendarData]);

  useEffect(() => {
    if (highlightedClass) {
      const highlightedDate = new Date(highlightedClass.date);
      const weekDiff = Math.floor((highlightedDate.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      setCurrentWeek(weekDiff);
      updateVisualWeek(weekDiff);

      // Scroll to the highlighted class
      setTimeout(() => {
        const highlightedElement = document.querySelector('.bg-yellow-100');
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedClass, currentDate, setCurrentWeek]);

  const navigateWeek = (direction: number) => {
    const newWeek = currentWeek + direction;
    if (newWeek >= 0) {
      setCurrentWeek(newWeek);
      updateVisualWeek(newWeek);
    }
  };

  const handleResetWeek = () => {
    if (!loopPoints.includes(currentWeek)) {
      setLoopPoints(prev => {
        const newLoopPoints = [...prev, currentWeek].sort((a, b) => a - b);
        updateVisualWeek(currentWeek);
        return newLoopPoints;
      });
    } else {
      // If it's already a loop point, just update the visual week
      updateVisualWeek(currentWeek);
    }
  }

  const handleRemoveLoopPoint = () => {
    setLoopPoints(prev => prev.filter(point => point !== currentWeek));
    updateVisualWeek(currentWeek);
  }

  const isUserSignedUp = (classId: string) => {
    if (!user) return false
    const classInfo = calendarData[classId]
    return classInfo && (
      (classInfo.lead?.some(s => s.username === user.username)) ||
      (classInfo.desk?.some(s => s.username === user.username)) ||
      (classInfo.assist?.some(s => s.username === user.username))
    )
  }

  const isClassDeleted = (classId: string) => {
    return calendarData[classId] === null;
  }

  const addUserToClass = (classId: string, position: 'lead' | 'desk' | 'assist') => {
    if (!user) return

    setCalendarData(prev => {
      const newCalendarData = { ...prev }
      const classInfo = newCalendarData[classId]
      if (!classInfo) return prev

      const signUp: ClassSignUp = { username: user.username, role: user.role, position }
      
      // Initialize arrays if they don't exist
      if (!Array.isArray(classInfo.lead)) classInfo.lead = [];
      if (!Array.isArray(classInfo.desk)) classInfo.desk = [];
      if (!Array.isArray(classInfo.assist)) classInfo.assist = [];

      // Remove user from all positions in this class
      classInfo.lead = classInfo.lead.filter(s => s.username !== user.username);
      classInfo.desk = classInfo.desk.filter(s => s.username !== user.username);
      classInfo.assist = classInfo.assist.filter(s => s.username !== user.username);

      // Add user to the selected position
      classInfo[position].push(signUp);

      // Update available positions
      classInfo.availablePositions[position] = classInfo[position].length < 3;

      return newCalendarData
    })

    const [daysSinceStart, classIndex] = classId.split('-').map(Number);
    const classDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + daysSinceStart);
    const classInfo = calendarData[classId];
    if (classInfo) {
      creditManager.addCredit(
        user.username,
        classInfo,
        classDate.toISOString().split('T')[0],
        position,
        user.role
      );
    }

    setShowConfirmationModal(true)
  }

  const removeUserFromClass = (classId: string) => {
    if (!user) return

    setCalendarData(prev => {
      const newCalendarData = { ...prev }
      const classInfo = newCalendarData[classId]
      if (!classInfo) return prev

      // Remove user from all positions in this class
      if (Array.isArray(classInfo.lead)) classInfo.lead = classInfo.lead.filter(s => s.username !== user.username);
      if (Array.isArray(classInfo.desk)) classInfo.desk = classInfo.desk.filter(s => s.username !== user.username);
      if (Array.isArray(classInfo.assist)) classInfo.assist = classInfo.assist.filter(s => s.username !== user.username);

      // Update available positions
      classInfo.availablePositions.lead = classInfo.lead.length < 3;
      classInfo.availablePositions.desk = classInfo.desk.length < 3;
      classInfo.availablePositions.assist = classInfo.assist.length < 3;

      // Remove credit
      const [daysSinceStart, classIndex] = classId.split('-').map(Number);
      const classDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + daysSinceStart);
      creditManager.removeCredit(user.username, classInfo, classDate.toISOString().split('T')[0]);

      return newCalendarData
    })
  }

  const handleClassSignUp = (dayIndex: number, classIndex: number, position?: 'lead' | 'desk' | 'assist') => {
    if (!user) return

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + dayIndex);
    const classId = generateUniqueId(date, classIndex);

    if (isDateInPast(date) && user.role !== 'Admin' && user.role !== 'CI') {
      // Optionally, you can show a message to the user that they can't sign up for past classes
      console.log("Cannot sign up for past classes");
      return;
    }

    setSelectedClass({ dayIndex, classIndex, classId })

    if (user.role === 'Admin') {
      setShowEditClassModal(true)
    } else if (isUserSignedUp(classId)) {
      removeUserFromClass(classId)
    } else if (user.role === 'JL') {
      addUserToClass(classId, 'assist')
    } else if (position) {
      addUserToClass(classId, position)
    }
  }

  const handleWeekFocusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeekFocuses(prev => ({
      ...prev,
      [currentWeek]: e.target.value
    }))
  }

  const isDateInPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getRoleBadgeColor = (role: Role): string => {
    switch (role) {
      case 'JL': return 'bg-[#4F7395]'
      case 'TI': return 'bg-[#954F5A]'
      case 'CI': return 'bg-black'
      case 'Admin': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const handleAddEvent = (date: string) => {
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleSaveEvent = (event: Event) => {
    setEvents(prev => ({
      ...prev,
      [event.date]: event
    }));
  };

  const handleDeleteEvent = (date: string) => {
    setEvents(prev => {
      const newEvents = { ...prev };
      delete newEvents[date];
      return newEvents;
    });
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const renderEventBanner = (date: string) => {
    const event = events[date];
    if (!event) return null;

    return (
      <div
        className={`w-full p-1 mb-2 text-center text-sm font-semibold text-white bg-${event.color}-500 rounded-lg shadow cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation();
          if (user?.role === 'Admin') {
            setSelectedDate(date);
            setShowEventModal(true);
          } else {
            handleEventClick(event);
          }
        }}
      >
        {event.type === 'Custom' ? event.customText : event.type}
      </div>
    );
  };

  const renderClassCard = (classInfo: ClassInfo) => (
    <>
      <p className={`text-sm font-semibold ${classInfo.color}`}>
        {timeIndexToString(classInfo.startTime)} - {timeIndexToString(classInfo.endTime)}
      </p>
      <p className={`text-lg font-bold ${classInfo.color}`}>
        {classInfo.type}
        {classInfo.subvariant && <span className="text-sm font-normal ml-2">({classInfo.subvariant})</span>}
      </p>
      <div className="mt-2 space-y-1">
        {classInfo.availablePositions.lead && (
          <div className="text-xs">
            <span className="font-semibold">Lead:</span> 
            {(classInfo.lead || []).map(s => (
              <span key={s.username} className="ml-1">
                <Badge className={`${getRoleBadgeColor(s.role)} text-white text-[10px] mr-1`}>
                  {s.role}
                </Badge>
                {s.username}
              </span>
            ))}
          </div>
        )}
        {classInfo.availablePositions.desk && (
          <div className="text-xs">
            <span className="font-semibold">Desk:</span> 
            {(classInfo.desk || []).map(s => (
              <span key={s.username} className="ml-1">
                <Badge className={`${getRoleBadgeColor(s.role)} text-white text-[10px] mr-1`}>
                  {s.role}
                </Badge>
                {s.username}
              </span>
            ))}
          </div>
        )}
        {classInfo.availablePositions.assist && (
          <div className="text-xs">
            <span className="font-semibold">Assist:</span> 
            {(classInfo.assist || []).map(s => (
              <span key={s.username} className="ml-1">
                <Badge className={`${getRoleBadgeColor(s.role)} text-white text-[10px] mr-1`}>
                  {s.role}
                </Badge>
                {s.username}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div>
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-semibold mx-4">{getWeekDates(currentDate, currentWeek)}</h2>
          <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} className="ml-2">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="text-xl font-medium whitespace-nowrap flex items-center">
          {user?.role === 'Admin' && (
            loopPoints.includes(currentWeek) ? (
              <Button variant="ghost" size="sm" onClick={handleRemoveLoopPoint} className="mr-2">
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleResetWeek} className="mr-2">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )
          )}
          <span>Week {visualWeek} Focus:</span>
          <span className="ml-2">
            {user?.role === 'Admin' ? (
              <input
                type="text"
                value={weekFocuses[currentWeek] || ''}
                onChange={handleWeekFocusChange}
                className="border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                style={{ width: `${Math.max((weekFocuses[currentWeek] || '').length, 10) * 8}px` }}
              />
            ) : (
              weekFocuses[currentWeek] || ''
            )}
          </span>
        </h3>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        {daysOfWeek.map((day, dayIndex) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + dayIndex)
          const dateString = date.toISOString().split('T')[0];
          return (
            <div key={dayIndex} className={`space-y-2 ${isCurrentDay(currentDate, currentWeek, dayIndex) ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
              <h4 className="text-lg font-semibold text-center p-2 relative">
                {day} <span className="text-gray-400 ml-1">{getDayNumber(currentDate, currentWeek, dayIndex)}{getOrdinalSuffix(getDayNumber(currentDate, currentWeek, dayIndex))}</span>
                {user?.role === 'Admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 transform -translate-y-1/2"
                    onClick={() => handleAddEvent(dateString)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </h4>
              {renderEventBanner(dateString)}
              {date >= START_DATE && classSchedule[dayIndex].map((classInfo, classIndex) => {
                const classId = generateUniqueId(date, classIndex)
                const currentClass = calendarData[classId]
                
                if (isClassDeleted(classId) && user?.role !== 'Admin') {
                  return null // Don't render deleted classes for non-admin users
                }

                return (
                  <Card 
                    key={classId} 
                    className={`relative overflow-hidden group ${dayIndex % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer ${
                      isUserSignedUp(classId) && currentClass ? `ring-2 ring-${currentClass.color.split('-')[1].replace('600', '500')}` : ''
                    } ${
                      highlightedClass &&
                      highlightedClass.date === date.toISOString().split('T')[0] &&
                      highlightedClass.startTime === currentClass.startTime &&
                      highlightedClass.classType === currentClass.type
                        ? 'bg-yellow-100'
                        : ''
                    }`}
                    onClick={() => handleClassSignUp(dayIndex, classIndex)}
                  >
                    <CardContent className="p-4">
                      {isClassDeleted(classId) ? (
                        user?.role === 'Admin' && (
                          <div className="flex items-center justify-center h-full">
                            <Button variant="ghost" size="sm">
                              <Plus className="h-6 w-6" />
                            </Button>
                          </div>
                        )
                      ) : currentClass ? (
                        <>
                          {renderClassCard(currentClass)}
                          {user && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {(user.role === 'Admin' || user.role === 'CI' || !isDateInPast(date)) && (
                                <>
                                  {user.role === 'Admin' ? (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex); }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  ) : isUserSignedUp(classId) ? (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex); }}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    user.role === 'JL' ? (
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex); }}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    ) : (
                                      <div className="flex flex-col space-y-2">
                                        {currentClass.availablePositions.lead && user.signupPreferences?.lead && (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex, 'lead'); }}
                                          >
                                            Lead
                                          </Button>
                                        )}
                                        {currentClass.availablePositions.desk && user.signupPreferences?.desk && (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex, 'desk'); }}
                                          >
                                            Desk
                                          </Button>
                                        )}
                                        {currentClass.availablePositions.assist && user.signupPreferences?.assist && (
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => { e.stopPropagation(); handleClassSignUp(dayIndex, classIndex, 'assist'); }}
                                          >
                                            Assist
                                          </Button>
                                        )}
                                      </div>
                                    )
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )
        })}
      </div>

      {selectedClass && (
        <SignUpConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          classInfo={calendarData[selectedClass.classId]}
          user={user}
          date={new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + selectedClass.dayIndex)}
        />
      )}

      {selectedClass && (
        <EditClassModal
          isOpen={showEditClassModal}
          onClose={() => setShowEditClassModal(false)}
          classInfo={calendarData[selectedClass.classId] || {
            id: selectedClass.classId,
            startTime: 0,
            endTime: 0,
            type: '',
            color: classColors[0],
            lead: [],
            desk: [],
            assist: [],
            availablePositions: {lead: true, desk: true, assist: true}
          }}
          onSave={(updatedClass) => {
            setCalendarData(prev => ({
              ...prev,
              [updatedClass.id]: updatedClass
            }))
            setShowEditClassModal(false)
          }}
          onDelete={() => {
            setCalendarData(prev => ({
              ...prev,
              [selectedClass.classId]: null // Mark as deleted
            }))
            setShowEditClassModal(false)
          }}
          allUsers={getUsers()}
          currentDate={currentDate}
          creditManager={creditManager}
        />
      )}

      {selectedDate && (
        <EventCreationModal
          isOpen={showEventModal}
          onClose={() => setShowEventModal(false)}
          onSave={handleSaveEvent}
          onDelete={() => handleDeleteEvent(selectedDate)}
          existingEvent={events[selectedDate]}
          date={selectedDate}
        />
      )}

      {selectedEvent && (
        <EventDetailsModal
          isOpen={showEventDetailsModal}
          onClose={() => setShowEventDetailsModal(false)}
          event={selectedEvent}
        />
      )}
    </div>
  )
}

