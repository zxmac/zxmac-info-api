import { newExc } from "../helpers/error-handler";
import * as gsheets_api from "./client-gsheets-api";

export async function addSheet(spreadsheetId: string, sheetTitle: string, fields: string = '') {
  try {
    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
                // gridProperties: {
                //   rowCount,
                //   columnCount,
                // },
              },
            },
          },
        ],
      },
      fields
    };
    const response = await gsheets_api.resource.addSheet(request);
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] addSheet error', e);
  }
}

export async function deleteSheet(spreadsheetId: string, sheetId: number) {
  try {
    const request = {
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteSheet: {
              sheetId,
            },
          },
        ],
      },
    };
    const response = await gsheets_api.resource.deleteSheet(request);
    return response.data;
  } catch (e) {
    throw newExc('[GSHEETS_API] deleteSheet error', e);
  }
}
