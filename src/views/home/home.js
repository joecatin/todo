/* eslint-disable linebreak-style */
import project from '../../components/project/default-project';
import showProject from '../project/project';
import './home.css';

const Home = () => {
  const home = document.createElement('div');
  home.id = 'home';

  home.appendChild(showProject(project));

  return home;
};

export default Home;
