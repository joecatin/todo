/* eslint-disable linebreak-style */
/* eslint-disable object-curly-newline */
/* eslint-disable no-shadow */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';
import { makeID } from '../views/utils';

initializeApp(firebaseConfig);
const db = getFirestore();

const populate = async () => {
  const projectsRef = collection(db, 'projects');
  await addDoc(projectsRef, {
    title: 'one',
    description: 'first dummy project',
    dueDate: Date.parse('2021-11-30'),
    priority: 'high',
    status: 'open',
    todos: [
      {
        id: makeID(),
        title: 'bin',
        description: 'take trash out',
        dueDate: Date.parse('2021-11-15'),
        priority: 'moderate',
        status: 'open',
      },
      {
        id: makeID(),
        title: 'bathroom hooks',
        description: 'buy hanger hooks for bathroom door',
        dueDate: Date.parse('2021-11-15'),
        priority: 'moderate',
        status: 'open',
      },
    ],
  });
  await addDoc(projectsRef, {
    title: 'two',
    description: 'second dummy project',
    dueDate: Date.parse('2021-12-31'),
    priority: 'medium',
    status: 'open',
    todos: [
      {
        id: makeID(),
        title: 'phone batery',
        description: 'upgrade phone batery',
        dueDate: Date.parse('2021-11-18'),
        priority: 'moderate',
        status: 'open',
      },
      {
        id: makeID(),
        title: 'Sally',
        description: 'catch up with Sally',
        dueDate: Date.parse('2021-11-30'),
        priority: 'low',
        status: 'open',
      },
    ],
  });
  await addDoc(projectsRef, {
    title: 'three',
    description: 'third dummy project',
    dueDate: Date.parse('2021-12-15'),
    priority: 'medium',
    status: 'open',
    todos: [
      {
        id: makeID(),
        title: 'kitchen',
        description: 'clear kitchen storage units',
        dueDate: Date.parse('2021-11-18'),
        priority: 'moderate',
        status: 'open',
      },
      {
        id: makeID(),
        title: 'body pump',
        description: 'go to class',
        dueDate: Date.parse('2021-11-10'),
        priority: 'moderate',
        status: 'open',
      },
    ],
  });
};

export default populate;
