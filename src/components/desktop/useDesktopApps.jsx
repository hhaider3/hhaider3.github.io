import { lazy, useMemo } from 'react';
import {
  BookOpen,
  Briefcase,
  FileText,
  Folder,
  Globe,
  Mail,
  RadioTower,
  User,
  Wrench,
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import About from '../About';
import Experience from '../Experience';
import Projects from '../Projects';
import Skills from '../Skills';
import Publications from '../Publications';
import Contact from '../Contact';
import ResumeViewer from '../ResumeViewer';

const globeViewerComponent = lazy(() => import('../GlobeViewer'));
const motionLabComponent = lazy(() => import('../MotionLab'));
const linkedInUrl = 'https://www.linkedin.com/in/hasan-haider-52026a67/';

const useDesktopApps = () => {
  const internalApps = useMemo(() => [
    {
      id: 'about',
      title: 'About Me',
      component: About,
      icon: <User size={28} />,
      accent: 'accent-blue',
    },
    {
      id: 'experience',
      title: 'Experience',
      component: Experience,
      icon: <Briefcase size={28} />,
      accent: 'accent-amber',
    },
    {
      id: 'projects',
      title: 'Projects',
      component: Projects,
      icon: <Folder size={28} />,
      accent: 'accent-teal',
    },
    {
      id: 'skills',
      title: 'Skills',
      component: Skills,
      icon: <Wrench size={28} />,
      accent: 'accent-violet',
    },
    {
      id: 'publications',
      title: 'Publications',
      component: Publications,
      icon: <BookOpen size={28} />,
      accent: 'accent-green',
    },
    {
      id: 'contact',
      title: 'Contact',
      component: Contact,
      icon: <Mail size={28} />,
      accent: 'accent-rose',
    },
    {
      id: 'cv',
      title: 'Resume',
      component: ResumeViewer,
      icon: <FileText size={28} />,
      accent: 'accent-red',
    },
    {
      id: 'globe',
      title: 'Time Globe',
      component: globeViewerComponent,
      icon: <Globe size={28} />,
      accent: 'accent-cyan',
    },
    {
      id: 'motion',
      title: 'Motion Lab',
      component: motionLabComponent,
      icon: <RadioTower size={28} />,
      accent: 'accent-blue',
    },
  ], []);

  const externalApps = useMemo(() => [
    {
      id: 'github',
      title: 'GitHub',
      href: 'https://github.com/hhaider3',
      icon: <FaGithub size={28} />,
      accent: 'accent-slate',
    },
    {
      id: 'linkedin',
      title: 'LinkedIn',
      href: linkedInUrl,
      icon: <FaLinkedin size={28} />,
      accent: 'accent-linkedin',
    },
  ], []);

  const desktopItems = useMemo(() => [
    ...internalApps.map(item => ({ ...item, kind: 'internal' })),
    ...externalApps.map(item => ({ ...item, kind: 'external' })),
  ], [internalApps, externalApps]);

  return { desktopItems, externalApps, internalApps };
};

export default useDesktopApps;
