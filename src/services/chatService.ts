import { type Chat } from '../types';

import fs from 'fs';
import path from 'path';

type ChatsState = Record<string, Pick<Chat, 'id' | 'users'>>;

const CHATS_DB_PATH = path.resolve(__dirname, '../../db/chats.json');

export const chatService = {
  add(chat: Chat) {
    const dataRaw = fs.readFileSync(CHATS_DB_PATH, 'utf8');

    let DB: ChatsState = {};
    try {
      DB = JSON.parse(dataRaw) as ChatsState;
    } catch {
      // no need to handle
    }

    if (!DB[chat.id]) {
      DB[chat.id] = {
        id: chat.id,
        users: chat.users,
      };

      fs.writeFileSync(CHATS_DB_PATH, JSON.stringify(DB), 'utf8');

      return DB[chat.id];
    }

    const dbChatUsers = DB[chat.id].users;
    const newChatUsers = chat.users.filter(
      (user) => !dbChatUsers.find((dbUser) => dbUser.id === user.id),
    );
    if (newChatUsers.length) {
      DB[chat.id] = {
        ...DB[chat.id],
        users: [...DB[chat.id].users, ...newChatUsers],
      };

      fs.writeFileSync(CHATS_DB_PATH, JSON.stringify(DB), 'utf8');

      return DB[chat.id];
    }

    return null;
  },
  vote(chatId: number, userId: number, isUpvote: boolean) {
    const dataRaw = fs.readFileSync(CHATS_DB_PATH, 'utf8');

    let DB: ChatsState = {};
    try {
      DB = JSON.parse(dataRaw) as ChatsState;
    } catch {
      // no need to handle
    }

    if (!DB[chatId]) {
      return;
    }

    const user = (DB[chatId].users || []).find((it) => it.id === userId);
    if (!user) {
      return;
    }

    const prevRating = user.rating ?? 0.1;
    const newRating = isUpvote ? prevRating - 0.1 : prevRating + 0.1;
    const safeRating = Math.min(Math.max(0.1, newRating), 1);
    const realSafeRating = Number(safeRating.toFixed(1));

    DB[chatId] = {
      ...DB[chatId],
      users: DB[chatId].users.map((it) => {
        if (it.id === userId) {
          return {
            ...it,
            rating: realSafeRating,
          };
        }
        return it;
      }),
    };

    fs.writeFileSync(CHATS_DB_PATH, JSON.stringify(DB), 'utf8');

    return {
      ...user,
      rating: realSafeRating,
    };
  },
  get(chatId: number) {
    const dataRaw = fs.readFileSync(CHATS_DB_PATH, 'utf8');

    let DB: ChatsState = {};
    try {
      DB = JSON.parse(dataRaw) as ChatsState;
    } catch {
      // no need to handle
    }

    if (!DB[chatId]) {
      return;
    }

    return DB[chatId];
  },
};
