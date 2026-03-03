import { gsheetsApi } from "./access-gsheets-api";

interface GetRangeParams {
  spreadsheetId: string;
  range?: string;
}

interface GetFieldParams {
  spreadsheetId: string;
  fields?: string;
}

interface AppendParams {
  spreadsheetId: string;
  range: string; // Start from A1 to append to the next available row
  valueInputOption: string; // How the input data should be interpreted
  requestBody: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: any[], // The data to append as an array of arrays
  };
  flag?: boolean;
}

interface UpdateParams {
  spreadsheetId: string;
  range: string;
  valueInputOption: string; // How the input data should be interpreted
  requestBody: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values: any[][]
  };
}

interface BatchUpdateAddSheetParams {
  spreadsheetId: string;
  resource: {
    requests: {
      addSheet: {
        properties: {
          title: string;
        };
      };
    }[];
  };
  fields: string;
}

interface BatchUpdateDeleteSheetParams {
  spreadsheetId: string;
  resource: {
    requests: {
      deleteSheet: {
        sheetId: number;
      };
    }[];
  };
}

interface BatchUpdateDeleteDimensionParams {
  spreadsheetId: string;
  resource: {
    requests: {
      deleteDimension: {
        range: {
          sheetId: number;
          dimension: string;
          startIndex: number;
          endIndex: number;
        };
      };
    }[];
  };
}

async function retry(res: { status: number }) {
  if (res?.status === 401) {
    console.log('GSHEETSAPI: access retry');
    await gsheetsApi(true);    
    return true;
  }
  return false;
}

export const range = {
  get: async (params: GetRangeParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.values.get(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  },
  append: async (params: AppendParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.values.append(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  },
  update: async (params: UpdateParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.values.update(params);
    };
    const res = await fn();
    if (await retry(res)) {
      return await fn();
    }
    return res;
  }
};

export const field = {
  get: async (params: GetFieldParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.get(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  }
};

export const resource = {
  addSheet: async (params: BatchUpdateAddSheetParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.batchUpdate(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  },
  deleteSheet: async (params: BatchUpdateDeleteSheetParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.batchUpdate(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  },
  deleteDimension: async (params: BatchUpdateDeleteDimensionParams) => {
    const fn = async () => {
      const gsheets = await gsheetsApi();
      return await gsheets.spreadsheets.batchUpdate(params);
    };
    const res = await fn();
    if (await retry(res)) return await fn();
    return res;
  }
};