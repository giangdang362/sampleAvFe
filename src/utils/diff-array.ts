export const getDiffArray = function <T>(
  arr1: T[],
  arr2: T[],
): { added: T[]; removed: T[] } {
  const added: T[] = [],
    removed: T[] = [];

  arr1.forEach(function (item) {
    if (arr2.indexOf(item) == -1) {
      removed.push(item);
    }
  });
  arr2.forEach(function (item) {
    if (arr1.indexOf(item) == -1) {
      added.push(item);
    }
  });

  return { added, removed };
};
