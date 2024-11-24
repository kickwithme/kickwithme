import { Role } from '../types'

export const START_DATE = new Date(2023, 10, 1); // November 1st, 2023

export function generateUniqueId(date: Date, classIndex: number): string {
  const timeDiff = date.getTime() - START_DATE.getTime();
  const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));
  return `${daysSinceStart}-${classIndex}`;
}

export function isCurrentDay(currentDate: Date, currentWeek: number, dayIndex: number): boolean {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + dayIndex)
  return date.toDateString() === currentDate.toDateString()
}

export function getDayNumber(currentDate: Date, currentWeek: number, dayIndex: number): number {
  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * currentWeek) + dayIndex)
  return date.getDate()
}

export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

export function getWeekDates(currentDate: Date, weekOffset: number): string {
  const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + (7 * weekOffset))
  const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 4)
  return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
}

export function timeIndexToString(index: number): string {
  const hour = Math.floor(index / 4);
  const minute = (index % 4) * 15;
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function getRoleBadgeColor(role: Role): string {
  switch (role) {
    case 'JL': return 'bg-[#4F7395]'
    case 'TI': return 'bg-[#954F5A]'
    case 'CI': return 'bg-black'
    case 'Admin': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

