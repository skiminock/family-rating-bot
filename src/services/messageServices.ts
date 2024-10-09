import { type Chat, ApiMessage } from '../types';

const CHATS: Record<string, Chat> = {};

import { localeService } from './localeService';

export const messageService = {
  saveMessage(message: ApiMessage) {
    let isNeedUpdateDb = false;

    if (message.from.is_bot) {
      return null;
    }

    let chat = CHATS[message.chat.id];
    if (!chat) {
      // initialize chat, need update db later

      CHATS[message.chat.id] = {
        id: message.chat.id,
        users: [],
        messages: [],
      };

      chat = CHATS[message.chat.id];

      isNeedUpdateDb = true;
    }

    if (chat) {
      const user = chat.users.find((it) => it.id === message.from.id);
      if (!user) {
        const { username, first_name, last_name } = message.from;

        const name =
          (username ? `@${username}` : '') ||
          `${first_name || ''} ${last_name || ''}`.trim() ||
          localeService.unknownUser;

        const existedUser = chat.users.find((it) => it.id === message.from.id);
        if (!existedUser) {
          // new user message detected, need update db later

          chat.users.push({
            id: message.from.id,
            name,
          });

          isNeedUpdateDb = true;
        }
      }

      // write any receiving message

      if (chat.messages.length > 1_000) {
        chat.messages.shift();
      }

      chat.messages.push({
        id: message.message_id,
        userId: message.from.id,
        chatId: message.chat.id,
      });
    }

    if (isNeedUpdateDb) {
      return chat;
    }

    return null;
  },
  findUserId(chatId: number, messageId: number) {
    const chat = CHATS[chatId];

    if (chat) {
      const message = chat.messages.find((it) => it.id === messageId);

      if (message) {
        return message.userId;
      }
    }

    return null;
  },
  findUserName(chatId: number, userId: number) {
    const chat = CHATS[chatId];

    if (chat) {
      const user = chat.users.find((it) => it.id === userId);

      if (user) {
        return user.name;
      }
    }

    return localeService.unknownUser;
  },
};
