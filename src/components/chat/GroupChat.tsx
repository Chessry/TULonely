import React from 'react';
import { Room } from '../../types';
import { BoardComments } from './BoardComments';

interface GroupChatProps {
  room: Room;
}

/**
 * GroupChat now renders BoardComments (Facebook / X style real-time comments and Q&A)
 */
export const GroupChat: React.FC<GroupChatProps> = ({ room }) => {
  return <BoardComments room={room} />;
};

export default GroupChat;
