import { env } from '@utils';
import { ChatMessage } from '@models';
import { gsheets_api } from 'zxmac.googleapis.helper';

const spreadsheetId = env.GSHEETS_API_CHAT_ID;

async function fetch(roomId: string, chatmate: string) {
  const sheetValues = await gsheets_api.read
    .getRawValues({ spreadsheetId, sheet: roomId });
  if (!sheetValues.length) return [];
  const chatmateIndex = sheetValues[0].findIndex(x => x === chatmate);
  const messages = sheetValues.splice(1)
    .map(values => {
      const data = values[chatmateIndex];
      if (data) {
        return JSON.parse(data);
      }
      return data;
    })
    .filter(x => x);
  return messages;
}

async function insert(data: ChatMessage, roomId: string, field: string) {
  const value = JSON.stringify(data);
  const result = await gsheets_api.write.insertSheetCell(spreadsheetId, roomId, field, value);
  return result;
}

async function createRoom(roomId: string) {
  try {
    const result = await gsheets_api.resource.addSheet(spreadsheetId, roomId);
    console.log('Room successfully created!', roomId);
    return !!result;
  } catch {
    console.log('Error creating room', roomId);
  }
}

export const ChatService = { fetch, insert, createRoom };