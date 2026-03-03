import { 
  validate, typeToKeys, SHEET_REGEX, 
  mapToKeys, mapToObjects, mapToValues 
} from "./gsheets-api.common";

export * as read from "./read-gsheets-api";
export * as write from "./write-gsheets-api";
export * as resource from "./resource-gsheets-api";
export * as access from "./access-gsheets-api";
export { 
  gsheets_config as config, 
  gsheets_options as options 
} from "./access-gsheets-api";

export const util = {
  typeToKeys,
  validate,
  mapToKeys,
  mapToObjects,
  mapToValues
};

export const constant = {
  SHEET_REGEX
};