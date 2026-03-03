import { head, put } from "@vercel/blob";
import axios from "axios";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upload(filename: string, data: any, options?: { allowOverwrite?: boolean }) {
  await put(filename, data, {
    access: 'private',
    allowOverwrite: options?.allowOverwrite ?? false
  });
  return true;
}

async function download(filename: string) {
  const blob = await head(filename);
  
  const response = await axios.get(blob.downloadUrl, { 
    responseType: 'stream',
     headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
    }
  });
  
  return { blob, response };
}

async function metadata(filename: string) {
  const blob = await head(filename);
  return blob;
}

export default {
  upload,
  download,
  metadata
}