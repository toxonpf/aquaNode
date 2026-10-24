import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  use:{baseURL:'http://127.0.0.1:5173',headless:true,storageState:{cookies:[],origins:[{origin:'http://127.0.0.1:5173',localStorage:[{name:'aquanode.locale',value:'en'}]}]}},
  webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true},
  projects:[{name:'chromium',use:{
    browserName:'chromium',
    launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH},
  }}],
});

