import { User } from '../types'

let users: User[] = [
  { username: 'john', role: 'JL', phone: '', email: '', password: 'password123', signupPreferences: { lead: false, desk: false, assist: true } },
  { username: 'jane', role: 'TI', phone: '', email: '', password: 'password456', signupPreferences: { lead: true, desk: true, assist: true } },
  { username: 'alice', role: 'CI', phone: '', email: '', password: 'password789', signupPreferences: { lead: true, desk: true, assist: true } },
  { username: 'admin', role: 'Admin', phone: '', email: '', password: 'adminpass', signupPreferences: { lead: true, desk: true, assist: true } },
];

export const getUsers = () => users;

export const updateUsers = (newUsers: User[]) => {
  users = newUsers;
};

