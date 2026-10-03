const grid = document.getElementById('profileGrid');
const dialog = document.getElementById('profileDialog');
const form = document.getElementById('profileForm');
const addBtn = document.getElementById('addProfile');
const runningCount = document.getElementById('runningCount');
const translatorCard = document.getElementById('translatorCard');

const api = window.signalMulti;

function escapeHtml(v=''){
  return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function loadProfiles(){
  if(!api){
    grid.innerHTML='<div class="empty">这是网页预览版。真正多开 Signal 需要运行 Electron 桌面版。</div>';
    runningCount.textContent='0';
    return;
  }
  const profiles = await api.listProfiles();
  runningCount.textContent = profiles.filter(p=>p.running).length;
  if(!profiles.length){
    grid.innerHTML='<div class="empty">还没有 Signal 实例。点击右上角“添加 Signal”。</div>';
    return;
  }
  grid.innerHTML = profiles.map(p=>`
    <article class="profile">
      <div class="profile-top">
        <div class="profile-icon">S</div>
        <div class="profile-copy">
          <strong>${escapeHtml(p.name)}</strong>
          <small>${escapeHtml(p.exe || '自动检测 Signal Desktop')}</small>
        </div>
        <span class="status ${p.running?'running':''}">
          <i></i>${p.running?'运行中':'已停止'}
        </span>
      </div>

      <div class="profile-meta">
        <div class="meta-box">
          <span>PROFILE</span>
          <strong>${escapeHtml(p.profileDirName)}</strong>
        </div>
        <div class="meta-box">
          <span>PID</span>
          <strong>${p.pid || '—'}</strong>
        </div>
      </div>

      <div class="profile-actions">
        ${p.running
          ? `<button class="stop" data-action="stop" data-id="${p.id}">停止</button>`
          : `<button class="start" data-action="start" data-id="${p.id}">启动</button>`
        }
        <button class="sub" data-action="folder" data-id="${p.id}">数据目录</button>
        <button class="sub" data-action="exe" data-id="${p.id}">更换程序</button>
        <button class="delete" data-action="delete" data-id="${p.id}">删除</button>
      </div>
    </article>
  `).join('');
}

grid.addEventListener('click', async e=>{
  const btn=e.target.closest('button[data-action]');
  if(!btn || !api) return;
  const id=btn.dataset.id;
  const action=btn.dataset.action;

  try{
    if(action==='start') await api.startProfile(id);
    if(action==='stop') await api.stopProfile(id);
    if(action==='folder') await api.openProfileFolder(id);
    if(action==='exe'){
      const exe=await api.chooseExecutable();
      if(exe) await api.setProfileExecutable(id,exe);
    }
    if(action==='delete'){
      if(confirm('删除这个实例配置？\n不会自动删除 Signal 数据目录。')) await api.deleteProfile(id);
    }
  }catch(err){
    alert(err?.message || String(err));
  }
  await loadProfiles();
});

addBtn.addEventListener('click',()=>{
  document.getElementById('profileName').value='';
  document.getElementById('profileExe').value='';
  dialog.showModal();
});

document.getElementById('chooseExe').addEventListener('click', async ()=>{
  if(!api) return;
  const exe=await api.chooseExecutable();
  if(exe) document.getElementById('profileExe').value=exe;
});

form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!api){
    alert('请运行 Electron 桌面版。GitHub Pages 只能预览界面。');
    return;
  }
  const name=document.getElementById('profileName').value.trim();
  const exe=document.getElementById('profileExe').value.trim();
  if(!name) return;
  await api.createProfile({name,exe});
  dialog.close();
  await loadProfiles();
});

document.getElementById('refreshProfiles').addEventListener('click',loadProfiles);
document.getElementById('stopAll').addEventListener('click',async()=>{
  if(!api) return;
  await api.stopAll();
  await loadProfiles();
});

document.getElementById('openGlobalTranslate').addEventListener('click',()=>translatorCard.classList.add('open'));
document.getElementById('closeTranslate').addEventListener('click',()=>translatorCard.classList.remove('open'));
document.getElementById('translateExternal').addEventListener('click',()=>{
  const text=document.getElementById('translateInput').value.trim();
  if(!text) return;
  const tl=document.getElementById('translateTarget').value;
  const url='https://translate.google.com/?sl=auto&tl='+encodeURIComponent(tl)+'&text='+encodeURIComponent(text)+'&op=translate';
  if(api) api.openExternal(url); else window.open(url,'_blank','noopener');
});

if(api?.onProfileStateChanged) api.onProfileStateChanged(loadProfiles);
loadProfiles();
