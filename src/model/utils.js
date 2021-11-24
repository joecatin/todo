/* eslint-disable linebreak-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable eol-last */
/* eslint-disable no-use-before-define */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-bitwise */
/* eslint-disable no-await-in-loop */

import { fetchProjects } from './firestore';

export const sort = (arr, by, desc = true) => {
  switch (desc) {
    case true: { arr.sort((a, b) => a[by] - b[by]); break; }
    case false: { arr.sort((a, b) => b[by] - a[by]); break; }
    default: console.log('sort: something went wrong.');
  }

  return arr;
};

export const getProjectIdByProp = async (key, value) => {
  const projects = await fetchProjects();

  return projects.filter((project) => project[key] === value)[0].id;
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// export const sortedIndex = (array, value) => {
//   let low = 0;
//   let high = array.length;

//   while (low < high) {
//     const mid = low + high >>> 1;
//     console.log(array[mid]);
//     console.log(value);
//     console.log(array[mid] < value);
//     if (array[mid] < value) low = mid + 1;
//     else high = mid;
//   }
//   return low;
// };

export const sortedIndex = (array, value, desc = false) => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    const mid = low + high >>> 1;
    switch (desc) {
      case true: { if (array[mid] < value) { low = mid + 1; } else { high = mid; } break; }
      case false: { if (array[mid] > value) { low = mid + 1; } else { high = mid; } break; }
      default: console.log('sortedIndex: something went wrong.');
    }
  }

  return low;
};

export const insertInSortedArray = (array, value) => {
  const index = sortedIndex(array, value);
  array[index] = value;

  return array;
};
