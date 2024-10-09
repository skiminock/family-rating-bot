export type ApiMessage = {
  message_id: number;

  from: {
    id: number;

    first_name?: string;
    last_name?: string;
    username?: string;

    is_bot: boolean;
  };

  chat: {
    id: number;
  };
};

export type User = {
  id: number;
  name: string;
  rating?: number;
};

export type Message = {
  id: number;
  userId: number;
  chatId: number;
};

export type Chat = {
  id: number;
  users: User[];
  messages: Message[];
};
