import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Role } from '../types'
import { Badge } from "@/components/ui/badge"
import { creditManager, CreditEntry } from '../utils/creditManager'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts'
import { Filter, FileDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const getRoleBadgeColor = (role: Role) => {
  switch (role) {
    case 'JL': return 'bg-[#4F7395]'
    case 'TI': return 'bg-[#954F5A]'
    case 'CI': return 'bg-black'
    case 'Admin': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const formatTime = (startTime: number, endTime: number) => {
  const timeIndexToString = (index: number) => {
    const hour = Math.floor(index / 4);
    const minute = (index % 4) * 15;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return `${timeIndexToString(startTime)} - ${timeIndexToString(endTime)}`;
}

type CreditSheetProps = {
  username: string;
  isAdmin: boolean;
  allUsers: User[];
  onSignupClick: (signup: CreditEntry) => void;
  currentDate: Date;
}

const categorizeClass = (classType: string): string => {
  const lowerClassType = classType.toLowerCase();
  if (lowerClassType.includes('dragon')) return 'Dragons';
  if (lowerClassType.includes('karate kid')) return 'Karate Kids';
  if (lowerClassType.includes('adult')) return 'Adults';
  if (lowerClassType.includes('demo team')) return 'Demo';
  if (lowerClassType.includes('leadership')) return 'Leadership';
  return 'Other';
}

const categoryColors = {
  Dragons: '#954F5A',
  'Karate Kids': '#4F7395',
  Adults: '#4F9563',
  Demo: '#FFA500',
  Leadership: '#800080',
  Other: '#CCCCCC'
};

export default function CreditSheet({ username, isAdmin, allUsers, onSignupClick, currentDate }: CreditSheetProps) {
  const [userCredits, setUserCredits] = useState<CreditEntry[]>([]);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

  const sortedAndFilteredCredits = userCredits
    .filter((credit) => {
      const creditDate = new Date(credit.date);
      const now = new Date();
      if (timeFilter === 'month') {
        return creditDate.getMonth() === now.getMonth() && creditDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return creditDate >= weekAgo;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  useEffect(() => {
    const updateCredits = () => {
      setUserCredits(creditManager.getLatestCredits(username));
    };

    updateCredits();
    
    // Set up an interval to check for updates every second
    const intervalId = setInterval(updateCredits, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [username]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  if (isAdmin) {
    const userData = allUsers.map((user) => ({
      name: user.username,
      role: user.role,
      deskCredits: Math.round(creditManager.getTotalDeskCredits(user.username)),
      weeklyCredits: Math.round(creditManager.getCreditsThisWeek(user.username)),
      monthlyCredits: Math.round(creditManager.getMonthlyCredits(user.username, currentYear, currentMonth)),
      totalCredits: Math.round(creditManager.getTotalCredits(user.username)),
    }));

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Admin Signup Sheet</h2>
        <Card>
          <CardHeader>
            <CardTitle>User Signups Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Desk Credits</TableHead>
                  <TableHead>Weekly Credits</TableHead>
                  <TableHead>Monthly Credits</TableHead>
                  <TableHead>Total Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((user) => (
                  <TableRow key={user.name}>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} text-white mr-2`}>
                        {user.role}
                      </Badge>
                      {user.name}
                    </TableCell>
                    <TableCell>{user.deskCredits}</TableCell>
                    <TableCell>{user.weeklyCredits}</TableCell>
                    <TableCell>{user.monthlyCredits}</TableCell>
                    <TableCell>{user.totalCredits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User Credits Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={userData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="totalCredits" fill="#8884d8" name="Total Credits" />
                <Bar dataKey="monthlyCredits" fill="#82ca9d" name="Monthly Credits" />
                <Bar dataKey="weeklyCredits" fill="#ffc658" name="Weekly Credits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  const classTypeSpread = creditManager.getClassTypeSpread(username);
  const chartData = Object.entries(classTypeSpread).reduce((acc, [classType, { assist, lead }]) => {
    const category = categorizeClass(classType);
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += Math.round(lead + assist);
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const sortedChartData = Object.values(chartData).sort((a, b) => {
    if (a.name === 'Other') return 1;
    if (b.name === 'Other') return -1;
    return 0;
  });

  const monthlyCredits = Math.round(creditManager.getMonthlyCredits(username, currentYear, currentMonth));

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold mb-4">Signup Sheet</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credit Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium">Total Credits</dt>
                <dd className="text-3xl font-bold">{Math.round(creditManager.getTotalCredits(username))}</dd>
              </div>
              <div>
                <dt className="font-medium">Desk Credits</dt>
                <dd className="text-3xl font-bold">{Math.round(creditManager.getTotalDeskCredits(username))}</dd>
              </div>
              <div>
                <dt className="font-medium">Weekly Credits</dt>
                <dd className="text-3xl font-bold">{Math.round(creditManager.getCreditsThisWeek(username))}</dd>
              </div>
              <div>
                <dt className="font-medium">Monthly Credits</dt>
                <dd className="text-3xl font-bold">{monthlyCredits}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Type Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sortedChartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value">
                  {sortedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name as keyof typeof categoryColors]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Previous Signups</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <FileDown className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}>
                    <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Time Filter</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'all' | 'month' | 'week')}>
                    <DropdownMenuRadioItem value="all">All time</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="month">This month</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="week">This week</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent class signups</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredCredits.map((credit, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {formatDate(credit.date)}, {formatTime(credit.startTime, credit.endTime)}
                  </TableCell>
                  <TableCell>{credit.classType} {credit.classVariant ? `(${credit.classVariant})` : ''}</TableCell>
                  <TableCell>{credit.position}</TableCell>
                  <TableCell>{credit.isDeskCredit ? 'Desk' : Math.round(credit.credits)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const creditDate = new Date(credit.date);
                        const weekDiff = Math.floor((creditDate.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                        onSignupClick({...credit, weekOffset: weekDiff + 1});
                      }}
                    >
                      View in Calendar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

