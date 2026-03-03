/* eslint-disable @typescript-eslint/no-explicit-any */
import type { GSheet } from "../models";

export function filterSheet(list: GSheet[], groupId: string): GSheet[] {
  return list.filter(x => x && x.groupId === groupId);
}

export function findData(list: GSheet[], key: string, paramKey: string = ''): string {
  const data: GSheet | undefined = list.find((x) => x.key === key);
  if (paramKey && data) return (data as any)[paramKey];
  return data ? data.value : 'N/A';
}

export function filterData(list: GSheet[], key: string): string[] {
  return list.filter((x: GSheet) => x.key === key).map((x: GSheet) => x.value);
}

export function groupData(list: GSheet[], k: string = 'key') {
  return list.reduce((group: any, obj) => {
    const key = Object.entries(obj).map(([key, obj]) => ({ key, obj })).find(x => x.key == k)?.obj;
    group[key] = group[key] ?? [];
    group[key].push(obj);
    return group;
  }, {});
}

export function filterObjKeys(obj: any) {
  return Object.keys(obj).filter(x => ['string', 'number', 'boolean'].includes(typeof obj[x]));
}

export function objToValues(obj: any, withKeys: boolean = true) {
  const keys = filterObjKeys(obj);
  const values = keys.map(key => obj[key]);
  return withKeys ? [keys, values] : [values];
}

export function listToValues(list: any[]) {
  const keys = filterObjKeys(list[0]);
  return [keys, ...list.flatMap(item => objToValues(item, false))];
}

export function cssToObj(css: string) {
  return css.split(';').filter(x => x)  
    .map(x => {
      const v = x.split(':');
      const key = v[0].trim().split('-').map((word, index) => {
        if (index === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join('');
      return { key, value: v[1].trim() };
    })
    .reduce((o, v) => {
      const parsedValue = Number(v.value);
      o[v.key] = isNaN(parsedValue) ? v.value : parsedValue;
      return o;
    }, {} as any);
}