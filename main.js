const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let win;
const processes = new Map();

function configPath(){
  return path.join(app.getPath('userData'),'profiles.json');
}

function loadProfiles(){
  try{
    const data=JSON.parse(fs.readFileSync(configPath(),'utf8'));
    return Array.isArray(data) ? data : [];
  }catch{
    return [];
  }
}

function saveProfiles(profiles){
  fs.mkdirSync(path.dirname(configPath()),{recursive:true});
  fs.writeFileSync(configPath(),JSON.stringify(profiles,null,2),'utf8');
}

function profilesRoot(){
  const root=path.join(app.getPath('userData'),'signal-profiles');
  fs.mkdirSync(root,{recursive:true});
  return root;
}

function profileDir(profile){
  const dir=path.join(profilesRoot(),profile.id);
  fs.mkdirSync(dir,{recursive:true});
  return dir;
}

function defaultSignalCandidates(){
  const home=app.getPath('home');
  if(process.platform==='win32'){
    return [
      path.join(process.env.LOCALAPPDATA||'','Programs','signal-desktop','Signal.exe'),
      path.join(process.env.LOCALAPPDATA||'','Programs','signal-desktop-beta','Signal Beta.exe'),
      path.join(process.env.PROGRAMFILES||'','Signal','Signal.exe')
    ];
  }
  if(process.platform==='darwin'){
    return ['/Applications/Signal.app/Contents/MacOS/Signal'];
  }
  return ['/usr/bin/signal-desktop','/opt/Signal/signal-desktop'];
}

function detectSignalExecutable(){
  return defaultSignalCandidates().find(p=>p && fs.existsSync(p)) || '';
}

function enrichedProfiles(){
  return loadProfiles().map(p=>{
    const child=processes.get(p.id);
    return {
      ...p,
      running:Boolean(child && !child.killed),
      pid:child && !child.killed ? child.pid : null,
      profileDirName:path.basename(profileDir(p))
    };
  });
}

function notify(){
  if(win && !win.isDestroyed()) win.webContents.send('profiles:changed');
}

function findProfile(id){
  return loadProfiles().find(p=>p.id===id);
}

async function stopProcess(id){
  const child=processes.get(id);
  if(!child) return true;
  try{
    if(process.platform==='win32'){
      spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true});
    }else{
      child.kill('SIGTERM');
    }
  }catch{}
  processes.delete(id);
  notify();
  return true;
}

app.whenReady().then(()=>{
  win=new BrowserWindow({
    width:1180,
    height:780,
    minWidth:900,
    minHeight:620,
    backgroundColor:'#0b0c0e',
    title:'Signal Multi',
    webPreferences:{
      preload:path.join(__dirname,'preload.js'),
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:true
    }
  });
  win.loadFile('index.html');
});

ipcMain.handle('profiles:list',()=>enrichedProfiles());

ipcMain.handle('profiles:create',(_event,payload)=>{
  const profiles=loadProfiles();
  const id=crypto.randomUUID();
  const profile={
    id,
    name:String(payload?.name||'Signal').trim(),
    exe:String(payload?.exe||'').trim()
  };
  profiles.push(profile);
  saveProfiles(profiles);
  profileDir(profile);
  notify();
  return profile;
});

ipcMain.handle('profiles:delete',async(_event,id)=>{
  await stopProcess(id);
  const profiles=loadProfiles().filter(p=>p.id!==id);
  saveProfiles(profiles);
  notify();
  return true;
});

ipcMain.handle('profiles:start',(_event,id)=>{
  const profile=findProfile(id);
  if(!profile) throw new Error('找不到这个 Signal 实例。');

  const existing=processes.get(id);
  if(existing && !existing.killed) return {pid:existing.pid};

  const exe=profile.exe || detectSignalExecutable();
  if(!exe || !fs.existsSync(exe)){
    throw new Error('没有找到 Signal Desktop。请点击“更换程序”选择 Signal.exe。');
  }

  const dataDir=profileDir(profile);
  const args=[`--user-data-dir=${dataDir}`];

  const child=spawn(exe,args,{
    detached:false,
    stdio:'ignore',
    windowsHide:false,
    env:{...process.env}
  });

  child.on('error',err=>{
    processes.delete(id);
    notify();
    if(win && !win.isDestroyed()){
      dialog.showErrorBox('Signal 启动失败',err.message);
    }
  });

  child.on('exit',()=>{
    processes.delete(id);
    notify();
  });

  processes.set(id,child);
  notify();
  return {pid:child.pid,exe,dataDir};
});

ipcMain.handle('profiles:stop',(_event,id)=>stopProcess(id));

ipcMain.handle('profiles:stopAll',async()=>{
  const ids=[...processes.keys()];
  for(const id of ids) await stopProcess(id);
  return true;
});

ipcMain.handle('profiles:openFolder',(_event,id)=>{
  const profile=findProfile(id);
  if(!profile) return false;
  return shell.openPath(profileDir(profile));
});

ipcMain.handle('profiles:chooseExecutable',async()=>{
  const result=await dialog.showOpenDialog(win,{
    title:'选择 Signal Desktop 可执行文件',
    properties:['openFile'],
    filters:process.platform==='win32'
      ? [{name:'Applications',extensions:['exe']}]
      : []
  });
  return result.canceled ? '' : result.filePaths[0];
});

ipcMain.handle('profiles:setExecutable',(_event,{id,exe})=>{
  const profiles=loadProfiles();
  const p=profiles.find(x=>x.id===id);
  if(!p) return false;
  p.exe=String(exe||'');
  saveProfiles(profiles);
  notify();
  return true;
});

ipcMain.handle('openExternal',(_event,url)=>{
  if(/^https?:\/\//i.test(url)) shell.openExternal(url);
  return true;
});

app.on('before-quit',()=>{
  for(const id of [...processes.keys()]) stopProcess(id);
});

app.on('window-all-closed',()=>{
  if(process.platform!=='darwin') app.quit();
});
