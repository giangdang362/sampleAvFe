import {
  createParser,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsStringLiteral,
} from "nuqs";
import { AI_SEARCH_FILTER_TYPE, PAGE_SIZE_OPTIONS } from "./common";
import { format } from "date-fns/format";
import { parse } from "date-fns/parse";

export const parseAsPageSize = parseAsNumberLiteral(PAGE_SIZE_OPTIONS);
export const parseAsPage = createParser({
  ...parseAsInteger,
  parse: (value) => {
    const page = parseAsInteger.parse(value);
    return page !== null && page > 0 ? page : null;
  },
});

export const parseAsDate = (formatStr: string) =>
  createParser({
    parse: (value) => {
      const parsedValue = parse(value, formatStr, new Date());
      return isNaN(parsedValue.getTime()) ? null : parsedValue;
    },
    serialize: (value) => format(value, formatStr),
    eq: (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  });

export const parseAsAiSearchFilterType = parseAsStringLiteral(
  AI_SEARCH_FILTER_TYPE,
);
