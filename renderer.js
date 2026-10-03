const app = document.querySelector('.app');

const openers = [
  document.getElementById('translatorButton'),
  document.getElementById('translateTop'),
  document.getElementById('openTranslatorInline'),
  document.getElementById('quickTranslate')
].filter(Boolean);

function setTranslator(open){
  app.classList.toggle('translator-open', open);
  if(open){
    const draft = document.getElementById('messageInput')?.value.trim();
    if(draft) document.getElementById('sourceText').value = draft;
  }
}
openers.forEach(btn => btn.addEventListener('click',()=>setTranslator(true)));
document.getElementById('closeTranslator')?.addEventListener('click',()=>setTranslator(false));

const accountNames = {
  'signal-primary': ['Signal · Primary','signal://primary'],
  'signal-business': ['Signal · Business','signal://business'],
  'whatsapp': ['WhatsApp','https://web.whatsapp.com/'],
  'web': ['Web app','https://example.com/']
};

async function activate(target){
  document.querySelectorAll('[data-target]').forEach(el=>{
    el.classList.toggle('active', el.dataset.target === target);
  });

  const meta = accountNames[target] || ['Workspace',''];
  document.getElementById('tabTitle').textContent = meta[0];
  document.getElementById('addressInput').value = meta[1];

  if(!window.workspaceAPI) return;

  if(target === 'whatsapp' || target === 'web'){
    await window.workspaceAPI.openWorkspace(target, meta[1]);
  }else{
    await window.workspaceAPI.hideWorkspace();
  }
}

document.querySelectorAll('[data-target]').forEach(el=>{
  el.addEventListener('click',()=>activate(el.dataset.target));
});

document.getElementById('translateNow')?.addEventListener('click',()=>{
  const text = document.getElementById('sourceText').value.trim();
  const result = document.getElementById('translationResult');
  if(!text){ result.textContent='Enter text to translate.'; return; }

  if(window.workspaceAPI?.translate){
    window.workspaceAPI.translate(text).then(value=>{
      result.textContent = value || 'Translation unavailable.';
    }).catch(()=>{ result.textContent='Translation service unavailable.'; });
  }else{
    result.textContent='Preview mode only. Desktop mode can connect this panel to the translation service you choose.';
  }
});

document.getElementById('copySource')?.addEventListener('click', async ()=>{
  const text=document.getElementById('sourceText').value;
  if(!text) return;
  try{ await navigator.clipboard.writeText(text); }catch{}
});

document.querySelectorAll('.conversation').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.conversation').forEach(x=>x.classList.remove('active'));
    item.classList.add('active');
  });
});

document.getElementById('addWorkspace')?.addEventListener('click',()=>{
  if(window.workspaceAPI){
    alert('Next step: create a new persistent Electron session from this button.');
  }else{
    alert('This is the browser preview. The desktop build creates isolated sessions here.');
  }
});

document.getElementById('addAccount')?.addEventListener('click',()=>{
  if(window.workspaceAPI){
    alert('Next step: add and persist another account workspace.');
  }else{
    alert('Desktop build supports isolated account workspaces.');
  }
});
