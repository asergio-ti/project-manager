import { User, Conversation, Message } from '../types';
import { subMinutes, subHours, subDays } from 'date-fns';

export const currentUser: User = {
  id: 'u1',
  name: 'João Silva',
  status: 'online',
};

export const users: User[] = [
  currentUser,
  {
    id: 'u2',
    name: 'Maria Almeida',
    status: 'online',
  },
  {
    id: 'u3',
    name: 'Pedro Santos',
    status: 'away',
  },
  {
    id: 'u4',
    name: 'Ana Costa',
    status: 'offline',
  },
];

export const conversations: Conversation[] = [
  {
    id: 'c1',
    participants: [users[0], users[1]],
    unreadCount: 2,
    isGroup: false,
    name: 'Maria Almeida',
  },
  {
    id: 'c2',
    participants: [users[0], users[2]],
    unreadCount: 0,
    isGroup: false,
    name: 'Pedro Santos',
  },
  {
    id: 'c3',
    participants: [users[0], users[1], users[2], users[3]],
    unreadCount: 5,
    isGroup: true,
    name: 'Time de Inovação',
  },
];

export const messages: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1',
      content: 'Bom dia! Já dei uma olhada inicial na documentação que você enviou.',
      sender: users[1],
      timestamp: subMinutes(new Date(), 30),
      status: 'read',
    },
    {
      id: 'm2',
      content: 'Oi Maria! Que bom! O que achou?',
      sender: users[0],
      timestamp: subMinutes(new Date(), 25),
      status: 'read',
    },
    {
      id: 'm3',
      content: 'Está muito bem estruturado! Só tenho algumas sugestões de melhorias na seção de requisitos técnicos. Vou fazer uma revisão mais detalhada e te envio os comentários ainda hoje.',
      sender: users[1],
      timestamp: subMinutes(new Date(), 20),
      status: 'delivered',
    },
  ],
  c2: [
    {
      id: 'm4',
      content: 'Reunião confirmada para amanhã às 14h',
      sender: users[2],
      timestamp: subHours(new Date(), 2),
      status: 'read',
    },
  ],
  c3: [
    {
      id: 'm5',
      content: 'Pessoal, temos novidades sobre o projeto!',
      sender: users[3],
      timestamp: subDays(new Date(), 1),
      status: 'read',
    },
  ],
}; 