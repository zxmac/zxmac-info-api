import { FormToolService } from '@services';

export function formToJson(text: string, keys: string) {
  const arrKeys = keys.split(',');
  return FormToolService.convertToJson(text, arrKeys);
}