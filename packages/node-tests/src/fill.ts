if (!global.navigator) {
  Object.defineProperty(global, 'navigator', {
    value: {},
    writable: true,
    configurable: true
  });
}
