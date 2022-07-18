export const shorten = (x: string, num: number): string => {
   return x.substring(0, num + 2) + ".." + x.substring(x.length-num, x.length);
}

export const toCurrency = (x: any): string  => {
  if (typeof x === 'undefined') return '';
  const val = x.toString().replace(/([a-zA-Z]|,)/g, '');
  if (!isNaN(parseInt(val, 10))) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return val;
};

export const toPct = (x: any): string => {
  if (typeof x === 'undefined' || toCurrency(x) === '') return '';
  return `${toCurrency(x).replace(/0*$/g, '').replace(/\.$/,'')}%`;
};

