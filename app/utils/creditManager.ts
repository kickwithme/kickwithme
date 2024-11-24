import { UserSignup, ClassInfo, Role } from '../types';

export interface CreditEntry {
  username: string;
  role: Role;
  classType: string;
  classVariant?: string;
  date: string;
  startTime: number;
  endTime: number;
  position: 'lead' | 'desk' | 'assist';
  credits: number;
  isDeskCredit: boolean;
}

class CreditManager {
  private credits: Record<string, CreditEntry[]> = {};

  private calculateCredits(position: 'lead' | 'desk' | 'assist'): number {
    switch (position) {
      case 'lead':
        return 2;
      case 'assist':
        return 1;
      case 'desk':
        return 1;
      default:
        return 0;
    }
  }

  addCredit(username: string, classInfo: ClassInfo, date: string, position: 'lead' | 'desk' | 'assist', userRole: Role): void {
    if (!this.credits[username]) {
      this.credits[username] = [];
    }

    const creditEntry: CreditEntry = {
      username,
      role: userRole,
      classType: classInfo.type,
      classVariant: classInfo.subvariant,
      date,
      startTime: classInfo.startTime,
      endTime: classInfo.endTime,
      position,
      isDeskCredit: position === 'desk',
      credits: this.calculateCredits(position),
    };

    this.credits[username].push(creditEntry);
  }

  removeCredit(username: string, classInfo: ClassInfo, date: string): void {
    if (this.credits[username]) {
      this.credits[username] = this.credits[username].filter(
        entry => !(
          entry.classType === classInfo.type &&
          entry.date === date &&
          entry.startTime === classInfo.startTime &&
          entry.endTime === classInfo.endTime
        )
      );
    }
  }

  getUserCredits(username: string): CreditEntry[] {
    return this.credits[username] || [];
  }

  getTotalCredits(username: string): number {
    return this.getUserCredits(username).reduce((total, entry) => total + (entry.isDeskCredit ? 0 : entry.credits), 0);
  }

  getTotalDeskCredits(username: string): number {
    return this.getUserCredits(username).filter(entry => entry.isDeskCredit).length;
  }

  getDeskCreditsThisMonth(username: string): number {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return this.getUserCredits(username).filter(
      entry => new Date(entry.date) >= firstDayOfMonth && entry.position === 'desk'
    ).length;
  }

  getCreditsThisWeek(username: string): number {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return this.getUserCredits(username).filter(
      entry => new Date(entry.date) >= firstDayOfWeek && !entry.isDeskCredit
    ).reduce((total, entry) => total + entry.credits, 0);
  }

  getClassTypeSpread(username: string): Record<string, { assist: number; lead: number }> {
    const spread: Record<string, { assist: number; lead: number }> = {};
    this.getUserCredits(username).forEach(entry => {
      if (!entry.isDeskCredit) {
        if (!spread[entry.classType]) {
          spread[entry.classType] = { assist: 0, lead: 0 };
        }
        if (entry.position === 'assist') {
          spread[entry.classType].assist += 1;
        } else if (entry.position === 'lead') {
          spread[entry.classType].lead += 1;
        }
      }
    });
    return spread;
  }

  getMonthlyCredits(username: string, year: number, month: number): number {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);
    return this.getUserCredits(username).filter(
      entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startOfMonth && entryDate <= endOfMonth && !entry.isDeskCredit;
      }
    ).reduce((total, entry) => total + entry.credits, 0);
  }

  getLatestCredits(username: string): CreditEntry[] {
    return this.credits[username] || [];
  }
}

export const creditManager = new CreditManager();

