import {useEffect,useState,type MouseEvent} from 'react';
import {Link,Route,Routes} from 'react-router-dom';
import {t,useLocale} from '../features/i18n/i18n';
import {nav} from '../data/content';
import Heading from '../components/ui/Heading';
import ArrowLink from '../components/ui/ArrowLink';
import BrandLogo from '../components/brand/BrandLogo';
import HeaderTools from '../components/layout/HeaderTools';
import SiteFooter from '../components/layout/SiteFooter';
import SiteCursor from '../features/cursor/SiteCursor';
import {AudioToggle} from '../features/ocean/audio/OceanAudio';
import {PageCurtain,usePageTransition} from '../shared/navigation/PageTransition';
import {useHeaderMode} from '../components/layout/useHeaderMode';
import {useTextReveal} from '../shared/motion/useTextReveal';
import {useComfortScroll} from '../shared/navigation/useComfortScroll';
import {scrollToPageStart} from '../shared/navigation/pageScroll';
import Viewer from '../features/buoy/Viewer';
import HomePage from '../pages/home/HomePage';
import AboutPage from '../pages/about/AboutPage';
import TechnologyPage from '../pages/technology/TechnologyPage';
import BuildPage from '../pages/build/BuildPage';
import JournalPage from '../pages/journal/JournalPage';
import TeamRoster from '../pages/team/TeamRoster';

function headerReturn(event:MouseEvent<HTMLElement>,pathname:string,closeMenu:()=>void){
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
  if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
  const destination=new URL(anchor.href);
  if(destination.origin!==location.origin||destination.pathname!==pathname||location.pathname!==pathname||destination.search!==location.search)return;
  event.preventDefault();closeMenu();scrollToPageStart();
}

export default function App(){
  const activeLocale=useLocale();
  const {displayed,curtain}=usePageTransition(),{pathname}=displayed;
  const [menu,setMenu]=useState(false);
  const solidHeader=useHeaderMode(pathname);
  useTextReveal(pathname);useComfortScroll(pathname);
  useEffect(()=>{setMenu(false);window.scrollTo({top:0,behavior:'instant'})},[pathname]);
  useEffect(()=>{
    const title=nav.find(([path])=>path===pathname)?.[1]||t('Page not found');
    document.title=`${title} — AquaNode`;
    const description=pathname==='/'?t('One working buoy. pH and temperature. Explore AquaNode and its open engineering resources.'):`${title}: ${t('AquaNode water observation, current progress and engineering materials.')}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
  },[pathname,activeLocale]);
  return <>
    <a className="skip-link" href="#main">{t('Skip to content')}</a>
    <header onClickCapture={event=>headerReturn(event,pathname,()=>setMenu(false))} className={'site-header'+(pathname==='/'?' ocean-header':'')+(solidHeader?' is-solid':'')}>
      <Link className="logo" to="/" aria-label={t('AquaNode home')}><BrandLogo/></Link>
      <nav id="navigation" className={menu?'open':''} aria-label={t('Main navigation')}>{nav.map(([path,label])=><Link key={path} to={path} className={pathname===path?'active':undefined} aria-current={pathname===path?'page':undefined}>{label}</Link>)}</nav>
      <HeaderTools menu={menu} onMenu={()=>setMenu(!menu)}/>
    </header>
    <main id="main" className={pathname!=='/'?'has-compact-header':undefined} tabIndex={-1}>
      <Routes location={displayed}>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/technology" element={<TechnologyPage renderViewer={()=><Viewer/>}/>}/>
        <Route path="/build" element={<BuildPage/>}/>
        <Route path="/journal" element={<JournalPage/>}/>
        <Route path="/team" element={<TeamRoster/>}/>
        <Route path="*" element={<section className="section"><Heading as="h1">{t('This page is uncharted.')}</Heading><ArrowLink to="/">{t('Return to the overview')}</ArrowLink></section>}/>
      </Routes>
    </main>
    <SiteFooter pathname={pathname}/><AudioToggle/><PageCurtain curtain={curtain}/><SiteCursor/>
  </>;
}
