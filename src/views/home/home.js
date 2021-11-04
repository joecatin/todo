/* eslint-disable linebreak-style */
// import project from '../../components/project/default-project';
import projects from '../../components/project/default-projects';
import showProject from '../project/project';
import './home.css';

const Home = () => {
  const home = document.createElement('div');
  home.id = 'home';

  projects.forEach((project) => home.appendChild(showProject(project)));
  // home.appendChild(showProject(project));
  // home.appendChild(showProject(project));
  // home.appendChild(showProject(project));
  // home.appendChild(showProject(project));
  // home.appendChild(showProject(project));

  return home;
};

export default Home;
