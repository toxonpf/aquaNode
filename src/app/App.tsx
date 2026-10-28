import {useCallback,useEffect,useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {Link,Route,Routes} from 'react-router-dom';
import {t,useLocale} from '../features/i18n/i18n';
import {nav} from '../data/content';
import Heading from '../components/ui/Heading';
import ArrowLink from '../components/ui/ArrowLink';
import BrandLogo from '../components/brand/BrandLogo';
import HeaderTools from '../components/layout/HeaderTools';
import SiteFooter from '../components/layout/SiteFooter';
import FlexibleArrow from '../components/ui/FlexibleArrow';
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
import MapPage from '../pages/map/MapPage';

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
  const [menuClosing,setMenuClosing]=useState(false);
  const menuTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const releaseMenu=useRef<()=>void>(()=>{});
  const closeMenu=useCallback(()=>{
    setMenuClosing(true);
    if(menuTimer.current)clearTimeout(menuTimer.current);
    menuTimer.current=setTimeout(()=>{setMenu(false);setMenuClosing(false)},matchMedia('(prefers-reduced-motion:reduce)').matches?0:340);
  },[]);
  const toggleMenu=()=>{
    if(menu&&!menuClosing){closeMenu();return}
    if(menuTimer.current)clearTimeout(menuTimer.current);
    setMenuClosing(false);setMenu(true);
  };
  const solidHeader=useHeaderMode(pathname);
  // `pathname` changes only after the curtain covers the source page. Release
  // its menu lock before the destination's text entrance is prepared.
  useLayoutEffect(()=>{releaseMenu.current();if(menuTimer.current)clearTimeout(menuTimer.current);setMenu(false);setMenuClosing(false);window.scrollTo({top:0,behavior:'instant'})},[pathname]);
  useTextReveal(pathname);useComfortScroll(pathname);
  useEffect(()=>()=>{if(menuTimer.current)clearTimeout(menuTimer.current)},[]);
  useEffect(()=>{
    if(!menu)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const roots=[...document.querySelectorAll<HTMLElement>('main,footer')].map(node=>({node,inert:node.inert}));
    roots.forEach(({node})=>node.inert=true);
    let released=false;
    const unlock=()=>{if(released)return;released=true;document.body.style.overflow=previous;roots.forEach(({node,inert})=>node.inert=inert)};
    releaseMenu.current=unlock;
    const close=()=>{closeMenu();document.querySelector<HTMLButtonElement>('.menu-button')?.focus()};
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close()}
      if(event.key==='Tab'){
        const items=[...document.querySelectorAll<HTMLElement>('.site-header a,.site-header button')].filter(node=>node.getClientRects().length&&!node.hasAttribute('disabled'));
        const target=event.shiftKey?items.at(-1):items[0],edge=event.shiftKey?items[0]:items.at(-1);
        if(document.activeElement===edge){event.preventDefault();target?.focus()}
      }
    };
    const outside=(event:PointerEvent)=>{if(event.target instanceof Element&&!event.target.closest('.site-header'))closeMenu()};
    const resize=()=>{if(innerWidth>1180)setMenu(false)};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);window.addEventListener('resize',resize);
    return()=>{unlock();document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',resize)};
  },[menu,closeMenu]);
  useEffect(()=>{
    const title=pathname==='/map'?t('Observation map'):nav.find(([path])=>path===pathname)?.[1]||t('Page not found');
    document.title=`${title} — AquaNode`;
    const description=pathname==='/'?t('One working buoy. pH and temperature. Explore AquaNode and its open engineering resources.'):`${title}: ${t('AquaNode water observation, current progress and engineering materials.')}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
  },[pathname,activeLocale]);
  return <>
    <a className="skip-link" href="#main">{t('Skip to content')}</a>
    <header onClickCapture={event=>headerReturn(event,pathname,closeMenu)} className={'site-header'+(pathname==='/'?' ocean-header':'')+(solidHeader?' is-solid':'')+(menu?' is-menu-open':'')}>
      <Link className="logo" to="/" aria-label={t('AquaNode home')}><BrandLogo/></Link>
      <nav id="navigation" className={menu?'open'+(menuClosing?' is-closing':''):''} data-caption={t('EXPLORE AQUANODE')} data-footnote={t('A small node. A world to understand.')} aria-label={t('Main navigation')}>{nav.map(([path,label],index)=><Link key={path} to={path} className={pathname===path?'active':undefined} aria-current={pathname===path?'page':undefined} style={{'--menu-order':index} as React.CSSProperties}><span className="header-nav-number" aria-hidden="true">0{index+1}</span><span>{label}</span><FlexibleArrow direction="up-right"/></Link>)}</nav>
      <HeaderTools menu={menu&&!menuClosing} onMenu={toggleMenu}/>
    </header>
    <main id="main" className={pathname!=='/'?'has-compact-header':undefined} tabIndex={-1}>
      <Routes location={displayed}>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/technology" element={<TechnologyPage renderViewer={()=><Viewer/>}/>}/>
        <Route path="/build" element={<BuildPage/>}/>
        <Route path="/journal" element={<JournalPage/>}/>
        <Route path="/team" element={<TeamRoster/>}/>
        <Route path="/map" element={<MapPage/>}/>
        <Route path="*" element={<section className="section"><Heading as="h1">{t('This page is uncharted.')}</Heading><ArrowLink to="/">{t('Return to the overview')}</ArrowLink></section>}/>
      </Routes>
    </main>
    <SiteFooter pathname={pathname}/><AudioToggle/><PageCurtain curtain={curtain}/><SiteCursor/>
  </>;
}
