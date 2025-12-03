import { useState, useEffect } from 'react';

// Types
export interface School {
  id: number;
  name: string;
  city: string;
  district: string;
  contact_person: string;
  contact_phone: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Mock Data
const MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@ankatravel.com', role: 'admin' }
];

let MOCK_SCHOOLS: School[] = [
  { id: 1, name: 'Atatürk Anadolu Lisesi', city: 'Ankara', district: 'Çankaya', contact_person: 'Ahmet Yılmaz', contact_phone: '05551112233' },
  { id: 2, name: 'Fen Lisesi', city: 'İstanbul', district: 'Kadıköy', contact_person: 'Ayşe Demir', contact_phone: '05332223344' },
  { id: 3, name: 'Cumhuriyet Ortaokulu', city: 'İzmir', district: 'Karşıyaka', contact_person: 'Mehmet Öz', contact_phone: '05445556677' },
];

// Mock API Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Methods
export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string, user: User }> => {
      await delay(800); // Simulate network latency
      // Mock login logic
      if (email && password) {
        return {
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(7),
          user: MOCK_USERS[0]
        };
      }
      throw new Error('Invalid credentials');
    }
  },
  schools: {
    list: async (): Promise<School[]> => {
      await delay(500);
      return [...MOCK_SCHOOLS];
    },
    create: async (school: Omit<School, 'id'>): Promise<School> => {
      await delay(600);
      const newSchool = { ...school, id: MOCK_SCHOOLS.length + 1 };
      MOCK_SCHOOLS = [...MOCK_SCHOOLS, newSchool];
      return newSchool;
    }
  }
};
