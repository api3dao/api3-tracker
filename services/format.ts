export const shorten = (x: string, num: number): string => {
   return x.substring(0, num + 2) + ".." + x.substring(x.length-num, x.length);
}
