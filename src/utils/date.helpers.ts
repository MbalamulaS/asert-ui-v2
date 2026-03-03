import moment, { parseZone } from 'moment';

/**
 * add days to date
 * @param lastDate: Date - a date string to add date to
 * @param unitCount: number - the unit of time to add to the date
 * @param units: string - the unit of time to add to the date
 * @returns: Date - a date string
 */
export const addDate = (lastDate: string, unitCount = 1, units = 'days') => {
  // @ts-ignore
  const startingDate = moment(lastDate, 'YYYY-MM-DD').add(unitCount, units);
  return startingDate.format('YYYY-MM-DD').toString();
};

export const subtractDate = (
  lastDate: string,
  unitCount = 1,
  units = 'days',
) => {
  // @ts-ignore
  const startingDate = moment(lastDate, 'YYYY-MM-DD').subtract(
    unitCount,
    units,
  );
  return startingDate.format('YYYY-MM-DD').toString();
};

/**
 * formats date to a specified format
 * Example formats:
 * '2019-06-01': YYYY-MM-DD
 * 'June 1st, 2019': MMMM Do, YYYY
 * 'June \'19': MMMM 'YY
 * '6/1/2019': M/D/YYYY
 * @param date: Date
 * @param format: string
 * @return Date
 */
export const dateFormat = (date: Date, format?: string) =>
  format ? moment(date).format(format) : moment(date).format('MMMM D, YYYY');
