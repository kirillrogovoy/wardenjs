export default function wardenTest() {
  setTimeout(() => {
    throw Error('test');
  }, 10);
}
