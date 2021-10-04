/* eslint-disable linebreak-style */

import './item.css';
import { makeContent, makeTitle } from '../helpers/helpers';

const showItem = (item) => {
  const view = document.createElement('div');
  view.classList.add('item');

  const title = makeTitle(item.get('title'), 'item');
  view.appendChild(title);

  const content = makeContent(
    'item',
    item.get('description'),
    item.get('dueDate'),
    item.get('priority'),
  );
  view.appendChild(content);

  return view;
};

export default showItem;
