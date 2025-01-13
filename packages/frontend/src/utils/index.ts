export const sleep = async (time: number = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1);
    }, time);
  });
};
