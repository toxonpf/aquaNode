import {test,expect,type Page} from '@playwright/test';

const frames=(page:Page)=>page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('aquanode:cursor-style','1'))});

test('larger cursor stretches behind movement in all directions and rests without a tail',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/team');
  const cursor=page.locator('.site-cursor'),tail=cursor.locator('.site-cursor-tail');
  await page.mouse.move(760,320);
  await expect(cursor).toHaveAttribute('data-mode','default');
  expect(await cursor.locator('.site-cursor-tip').getAttribute('r')).toBe('3.2');
  for(const [dx,dy] of [[110,0],[-110,0],[0,110],[0,-110],[85,85],[-85,85],[-85,-85],[85,-85]]){
    await page.mouse.move(760,320);await expect(tail).toHaveCSS('opacity','0');
    await page.mouse.move(760+dx,320+dy,{steps:7});await frames(page);
    const motion=await cursor.evaluate(node=>{
      const path=node.querySelector<SVGPathElement>('.site-cursor-current')!,end=path.getPointAtLength(path.getTotalLength());
      const matrix=new DOMMatrix(node.querySelector('.site-cursor-tip')!.getAttribute('transform')!.match(/matrix\(([^)]+)\)/)![1].split(' ').map(Number));
      return {x:end.x-64,y:end.y-64,opacity:Number(getComputedStyle(node.querySelector('.site-cursor-tail')!).opacity),xx:matrix.a,xy:matrix.b,yy:matrix.d};
    });
    expect(motion.opacity).toBeGreaterThan(.15);
    if(dx)expect(motion.x*Math.sign(dx)).toBeLessThan(-3);
    if(dy)expect(motion.y*Math.sign(dy)).toBeLessThan(-3);
    if(dx)expect(motion.xx).toBeGreaterThan(1.01);
    if(dy)expect(motion.yy).toBeGreaterThan(1.01);
    if(dx&&dy)expect(Math.abs(motion.xy)).toBeGreaterThan(.01);
  }
  await expect(tail).toHaveCSS('opacity','0');
  await expect(cursor).toHaveAttribute('data-visible','true');
  const resting=await cursor.locator('.site-cursor-current').getAttribute('d');
  await page.waitForTimeout(150);
  expect(await cursor.locator('.site-cursor-current').getAttribute('d')).toBe(resting);
});

test('3D drag restores two wave-connected heads without rotating or deforming them',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:1440,height:1000});await page.goto('/technology');
  const canvas=page.locator('canvas');await expect(canvas).toBeVisible();
  await expect(page.locator('.page-curtain')).not.toHaveAttribute('data-active','true');
  await canvas.scrollIntoViewIfNeeded();
  const box=(await canvas.boundingBox())!,x=box.x+box.width*.5,y=box.y+box.height*.55;
  const cursor=page.locator('.site-cursor');
  await page.mouse.move(x,y);await expect(cursor).toHaveAttribute('data-mode','drag');
  const heads=cursor.locator('.site-cursor-drag-head');await expect(heads).toHaveCount(2);
  const handles=await heads.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('d')));
  await expect(cursor.locator('.site-cursor-drag')).toHaveCSS('opacity','0.9');
  await expect(cursor.locator('.site-cursor-tip')).toHaveCSS('opacity','0');
  await page.evaluate(()=>{
    const samples={running:true,height:0,width:0};(window as any).__dragWave=samples;
    const capture=()=>{
      const box=document.querySelector<SVGPathElement>('.site-cursor-drag-line')!.getBBox();
      samples.height=Math.max(samples.height,box.height);samples.width=Math.max(samples.width,box.width);
      if(samples.running)requestAnimationFrame(capture);
    };capture();
  });
  await page.mouse.down();
  for(const [dx,dy] of [[70,0],[70,75],[-60,75],[-60,-65],[0,0]]){
    await page.mouse.move(x+dx,y+dy,{steps:6});await frames(page);
    await expect(cursor).toHaveAttribute('data-mode','drag');
    expect(await heads.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('d')))).toEqual(handles);
    expect(await cursor.locator('.site-cursor-drag').evaluate(node=>getComputedStyle(node).transform)).toBe('none');
    const geometry=await heads.evaluateAll(nodes=>nodes.map(node=>{
      const matrix=(node as SVGGraphicsElement).transform.baseVal.consolidate()!.matrix;
      const rect=(node as SVGGraphicsElement).getBBox();
      return {a:matrix.a,b:matrix.b,c:matrix.c,d:matrix.d,x:matrix.e,y:matrix.f,width:rect.width,height:rect.height};
    }));
    for(const head of geometry){
      expect(head.a).toBe(1);expect(head.d).toBe(1);expect(head.b).toBe(0);expect(head.c).toBe(0);
      expect(head.y).toBe(0);expect(Math.abs(head.x)).toBeGreaterThanOrEqual(22);expect(Math.abs(head.x)).toBeLessThanOrEqual(37);
      expect(head.width).toBe(9.5);expect(head.height).toBe(10);
    }
    const bridge=await cursor.locator('.site-cursor-drag-line').evaluate(node=>{
      const line=node as SVGPathElement,start=line.getPointAtLength(0),end=line.getPointAtLength(line.getTotalLength());
      const heads=node.parentElement!.querySelectorAll<SVGGraphicsElement>('.site-cursor-drag-head');
      return {left:start.x,right:end.x,startY:start.y,endY:end.y,height:line.getBBox().height,headLeft:heads[0].transform.baseVal.consolidate()!.matrix.e,headRight:heads[1].transform.baseVal.consolidate()!.matrix.e};
    });
    expect(bridge.left).toBeCloseTo(64+bridge.headLeft,2);expect(bridge.right).toBeCloseTo(64+bridge.headRight,2);
    expect(bridge.startY).toBe(64);expect(bridge.endY).toBe(64);
    expect(await cursor.locator('.site-cursor-head').evaluateAll(nodes=>nodes.every(node=>Number(getComputedStyle(node).opacity)<.01))).toBe(true);
  }
  const stretch=await page.evaluate(()=>{const samples=(window as any).__dragWave;samples.running=false;return {height:samples.height,width:samples.width}});
  expect(stretch.height).toBeGreaterThan(5);expect(stretch.width).toBeGreaterThan(46);
  await page.mouse.up();await expect(cursor.locator('.site-cursor-tail')).toHaveCSS('opacity','0');
  await expect(cursor.locator('.site-cursor-tip')).toHaveCSS('opacity','0');
  await expect(cursor.locator('.site-cursor-drag')).toHaveCSS('opacity','0.9');
  await page.screenshot({path:'test-results/cursor-drag-rest.png'});
  expect(errors).toEqual([]);
});

test('directional button heads never rotate and the first segment stays behind the nose',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/technology');
  await expect(page.locator('canvas')).toBeVisible();
  const cursor=page.locator('.site-cursor');
  await page.locator('.site-header .logo').hover();
  await expect(cursor.locator('.site-cursor-tail')).toHaveCSS('opacity','1');
  await expect(cursor.locator('.site-cursor-tip')).toHaveCSS('opacity','0');
  await page.waitForTimeout(800);
  await expect(cursor.locator('.site-cursor-tail')).toHaveCSS('opacity','1');
  expect(await cursor.locator('.site-cursor-current').evaluate(node=>(node as SVGPathElement).getTotalLength())).toBeGreaterThan(40);
  for(const [name,bearing,sign] of [['Rotate buoy left','left',1],['Rotate buoy right','right',-1],['Rotate buoy left','left',1]] as const){
    const button=page.getByRole('button',{name,exact:true});
    await button.hover();
    const head=cursor.locator(`.site-cursor-head[data-bearing=${bearing}]`);
    await expect.poll(()=>head.evaluate(node=>Number(getComputedStyle(node).opacity))).toBeGreaterThan(.98);
    const original=await head.getAttribute('d'),box=(await button.boundingBox())!;
    for(const [dx,dy] of [[-5,-3],[5,3],[-5,3],[5,-3]]){
      await page.mouse.move(box.x+box.width/2+dx,box.y+box.height/2+dy,{steps:3});await frames(page);
      expect(await head.getAttribute('d')).toBe(original);
      expect(await head.evaluate(node=>getComputedStyle(node).transform)).toBe('none');
      const tangent=await cursor.locator('.site-cursor-current').evaluate(node=>{
        const point=(node as SVGPathElement).getPointAtLength(1);return {x:point.x-64,y:point.y-64};
      });
      expect(tangent.x*sign).toBeGreaterThan(.8);expect(Math.abs(tangent.y)).toBeLessThan(.15);
    }
    await expect(cursor.locator('.site-cursor-tip')).toHaveCSS('opacity','0');
    await page.waitForTimeout(750);
    await expect(cursor.locator('.site-cursor-tail')).toHaveCSS('opacity','1');
    expect(await cursor.locator('.site-cursor-current').evaluate(node=>(node as SVGPathElement).getTotalLength())).toBeGreaterThan(40);
    await page.screenshot({path:`test-results/cursor-button-${bearing}-rest.png`});
  }
});
