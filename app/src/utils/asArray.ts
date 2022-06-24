// https://github.com/ditojs/dito/blob/master/packages/utils/src/base.js
export const asArray = (arg: any) =>
  Array.isArray(arg) ? arg : arg !== undefined ? [arg] : []
