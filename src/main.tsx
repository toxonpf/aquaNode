import './app/styles';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import App from './app/App';
import {OceanAudioProvider} from './features/ocean/audio/OceanAudio';

gsap.registerPlugin(ScrollTrigger);
createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><OceanAudioProvider><App/></OceanAudioProvider></BrowserRouter></React.StrictMode>,
);
