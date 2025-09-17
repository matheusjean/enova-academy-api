jest.setTimeout(20000);

const origLog = console.log;
const origWarn = console.warn;
if (process.env.TEST_VERBOSE !== 'true') {
  console.log = (..._args: any[]) => {};
  console.warn = (..._args: any[]) => {};
}
afterAll(() => {
  console.log = origLog;
  console.warn = origWarn;
});
