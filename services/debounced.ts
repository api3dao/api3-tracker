export const Debounced = {
  queue: new Map<string, number>(),
  saveInterval: 500, // 10 seconds

  start: (id: string, callback: Function, ms: number | undefined) => {
    const msValue = ms || 500;
    const timeoutId = Debounced.queue.get(id);
    clearTimeout(timeoutId);
    const timeout: any = setTimeout(() => {
      callback();
      Debounced.queue.delete(id);
    }, msValue);
    Debounced.queue.set(id, timeout as number);
  },
};

export default Debounced;
