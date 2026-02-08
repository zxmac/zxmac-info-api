import type { GSheet } from '@models';
import { GSheetConstant } from './constants/ghseet.constant';

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return list.reduce((group: any, obj) => {
		const key = Object.entries(obj).map(([key, obj]) => ({ key, obj })).find(x => x.key == k)?.obj;
		group[key] = group[key] ?? [];
		group[key].push(obj);
		return group;
	}, {});
}
export function formatSheets(list: [][]) {
	const keys: any[] = list[0] || [];
	return list.slice(1).map(arr => {
		const obj: any = {};
		for (let i = 0; i < keys.length; i++) {
			let v: any = arr[i];
			if (v === 'FALSE') v = false;
			if (v === 'TRUE') v = true;
			obj[keys[i]] = v;
		}
		return obj;
	})
}

// export function matchSheetId(sheetId: string, paramSheetId: string) {
// 	const id1 = paramSheetId.substring(0, GSheetConstant.SLICE_ID_LNGTH);
// 	const id2 = paramSheetId.substring(GSheetConstant.SLICE_ID_LNGTH, GSheetConstant.PARAM_ID_LNGTH);
// 	return sheetId.indexOf(id1) == 0 && sheetId.indexOf(id2) == sheetId.length - GSheetConstant.SLICE_ID_LNGTH;
// }

export function sliceSheetId(sheetId: string): string {
	if (sheetId.length < GSheetConstant.PARAM_ID_LNGTH) throw Error('Invalid sheetId!');
	return `${sheetId.substring(0, GSheetConstant.SLICE_ID_LNGTH)}${sheetId.substring(sheetId.length - GSheetConstant.SLICE_ID_LNGTH, sheetId.length)}`
}

export function spliceId(...ids: string[]) {
	return ids.join(GSheetConstant.ID_SEPARATOR);
}

export function jListToObj(json: string, fn: (item: any) => any) {
	return listToObj(JSON.parse(json), fn);
}

export function listToObj(data: any[], fn: (item: any) => any) {
	return data
		.filter(fn)
		.reduce((obj, val) => {
			obj[val.key] = val.value;
			return obj;
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

export function valuesToObj(values: any[][]) {
	return values[0].reduce((obj, val) => {
		obj[val.key] = val.value;
		return obj;
	}, {});
}

export function valuesToObjList(values: any[][]) {
	return values.map(v => {
		return v.reduce((obj, val) => {
			obj[val.key] = val.value;
			return obj;
		}, {});
	});
}

export function matchSheetId(sheetId: string, paramSheetId: string) {
	const lngth = paramSheetId?.length;
	if (!(lngth === GSheetConstant.PARAM_ID_LNGTH-2 
		|| lngth === GSheetConstant.PARAM_ID_LNGTH)) return;
	const hlfLnth = lngth / 2;
	const id1 = paramSheetId.substring(0, hlfLnth);
	const id2 = paramSheetId.substring(hlfLnth, lngth);
	return sheetId.indexOf(id1) === 0 && sheetId.indexOf(id2) === sheetId.length - hlfLnth;
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