import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

import 'dotenv/config';

import { localeService } from './services/localeService';
import { messageService } from './services/messageServices';
import { chatService } from './services/chatService';
import { getParametrizedString } from './utils';
import { type User } from './types';

function createReactionMessage(
  chatId: number,
  fromUserId: number,
  toUserId: number,
  isUpvote: boolean,
) {
  const fromUser = messageService.findUserName(chatId, fromUserId);
  const toUser = messageService.findUserName(chatId, toUserId);

  return getParametrizedString(
    isUpvote ? localeService.messageUpvote : localeService.messageDownvote,
    {
      fromUser,
      toUser,
    },
  );
}

function createStatsMessage(chatId: number) {
  let result = `${localeService.tableName}\n`;

  const chat = chatService.get(chatId);

  if (chat) {
    if (!chat.users.length) {
      result += localeService.tableEmpty;
      return result;
    }

    const compareFn = (a: User, b: User) => (b.rating ?? 0) - (a.rating ?? 0);
    const sortedUsers = chat.users.sort(compareFn);

    sortedUsers.forEach((user, index) => {
      const ratingTitle =
        (localeService.ratings as Record<string, string>)[user.rating ?? ''] ??
        '?';
      const ratingNumber = user.rating ? ` (${user.rating})` : '';

      result += `${index + 1}. ${user.name} - ${ratingTitle}${ratingNumber}\n`;
    });

    return result;
  }

  return null;
}

const bot = new Telegraf(process.env.BOT_TOKEN ?? '');

bot.on(message('text'), async (ctx) => {
  try {
    const chat = messageService.saveMessage(ctx.update.message);

    if (chat) {
      chatService.add(chat);
    }
  } catch (error) {
    console.log('bot handle message error', error);
  }

  if (ctx.message.text === '/stats') {
    const statsMessage = createStatsMessage(ctx.update.message.chat.id);

    if (statsMessage) {
      await ctx.telegram.sendMessage(ctx.update.message.chat.id, statsMessage);
    }
  }
});

bot.reaction('👍', async (ctx) => {
  try {
    const FLAG = true;

    const toUserId = messageService.findUserId(
      ctx.update.message_reaction.chat.id,
      ctx.update.message_reaction.message_id,
    );

    const fromUserId = ctx.update.message_reaction.user?.id ?? 0;
    if (toUserId && toUserId !== fromUserId) {
      chatService.vote(ctx.update.message_reaction.chat.id, toUserId, FLAG);

      const reactionMessage = createReactionMessage(
        ctx.update.message_reaction.chat.id,
        fromUserId,
        toUserId,
        FLAG,
      );
      await ctx.telegram.sendMessage(
        ctx.update.message_reaction.chat.id,
        reactionMessage,
      );
    }
  } catch (error) {
    console.log('bot handle reaction error', error);
  }
});

bot.reaction('👎', async (ctx) => {
  try {
    const FLAG = false;

    const toUserId = messageService.findUserId(
      ctx.update.message_reaction.chat.id,
      ctx.update.message_reaction.message_id,
    );

    const fromUserId = ctx.update.message_reaction.user?.id ?? 0;
    if (toUserId && toUserId !== fromUserId) {
      chatService.vote(ctx.update.message_reaction.chat.id, toUserId, FLAG);

      const reactionMessage = createReactionMessage(
        ctx.update.message_reaction.chat.id,
        fromUserId,
        toUserId,
        FLAG,
      );
      await ctx.telegram.sendMessage(
        ctx.update.message_reaction.chat.id,
        reactionMessage,
      );
    }
  } catch (error) {
    console.log('bot handle reaction error', error);
  }
});

console.log('launch bot!');
bot.launch({ allowedUpdates: ['message', 'message_reaction'] });

// Enable graceful stop

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
