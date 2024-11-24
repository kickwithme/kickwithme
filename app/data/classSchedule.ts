import { ClassInfo } from '../types'
import { classColors } from '../utils/constants'

const sundayClasses: Omit<ClassInfo, 'id'>[] = [
  {
    startTime: 36, // 9:00 AM
    endTime: 38, // 9:30 AM
    type: 'Dragons',
    color: classColors.dragons,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 39, // 9:45 AM
    endTime: 42, // 10:30 AM
    type: 'Karate Kids',
    subvariant: 'All Levels',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
];

const mondayClasses: Omit<ClassInfo, 'id'>[] = [
  {
    startTime: 70, // 5:30 PM
    endTime: 72, // 6:00 PM
    type: 'Dragons',
    color: classColors.dragons,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 74, // 6:15 PM
    endTime: 76, // 7:00 PM
    type: 'Karate Kids',
    subvariant: 'All Levels',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 76, // 7:00 PM
    endTime: 79, // 7:45 PM
    type: 'Adults',
    subvariant: 'Jiu-Jitsu',
    color: classColors.adults,
    lead: [],
    desk: [],
    assist: [],
  },
];

const tuesdayClasses: Omit<ClassInfo, 'id'>[] = [
  {
    startTime: 66, // 4:30 PM
    endTime: 68, // 5:00 PM
    type: 'Dragons',
    color: classColors.dragons,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 69, // 5:15 PM
    endTime: 72, // 6:00 PM
    type: 'Karate Kids',
    subvariant: 'Beginners',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 72, // 6:00 PM
    endTime: 75, // 6:45 PM
    type: 'Karate Kids',
    subvariant: 'Inter/Adv',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 75, // 6:45 PM
    endTime: 78, // 7:30 PM
    type: 'Demo Team',
    color: classColors.demo,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 78, // 7:30 PM
    endTime: 82, // 8:30 PM
    type: 'Adults',
    subvariant: 'Muay Thai',
    color: classColors.adults,
    lead: [],
    desk: [],
    assist: [],
  },
];

const wednesdayClasses: Omit<ClassInfo, 'id'>[] = [
  {
    startTime: 66, // 4:30 PM
    endTime: 69, // 5:15 PM
    type: 'Black Belt',
    color: classColors.blackBelt,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 70, // 5:30 PM
    endTime: 72, // 6:00 PM
    type: 'Dragons',
    color: classColors.dragons,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 74, // 6:15 PM
    endTime: 76, // 7:00 PM
    type: 'Karate Kids',
    subvariant: 'All Levels',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 76, // 7:00 PM
    endTime: 79, // 7:45 PM
    type: 'Adults',
    subvariant: 'Taekwondo',
    color: classColors.adults,
    lead: [],
    desk: [],
    assist: [],
  },
];

const thursdayClasses: Omit<ClassInfo, 'id'>[] = [
  {
    startTime: 66, // 4:30 PM
    endTime: 68, // 5:00 PM
    type: 'Dragons',
    color: classColors.dragons,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 69, // 5:15 PM
    endTime: 72, // 6:00 PM
    type: 'Karate Kids',
    subvariant: 'Beginners',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 72, // 6:00 PM
    endTime: 75, // 6:45 PM
    type: 'Karate Kids',
    subvariant: 'Inter/Adv',
    color: classColors.karateKids,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 75, // 6:45 PM
    endTime: 78, // 7:30 PM
    type: 'Adults',
    subvariant: 'Taekwondo',
    color: classColors.adults,
    lead: [],
    desk: [],
    assist: [],
  },
  {
    startTime: 78, // 7:30 PM
    endTime: 81, // 8:15 PM
    type: 'Leadership',
    color: classColors.leadership,
    lead: [],
    desk: [],
    assist: [],
  },
];

export const classSchedule = [
  sundayClasses,
  mondayClasses,
  tuesdayClasses,
  wednesdayClasses,
  thursdayClasses,
];

export const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

