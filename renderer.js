const app = document.querySelector('.app');
const translatorPanel = document.getElementById('translatorPanel');
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
  'web': ['Web app','https://']
};

function activate(target){
  document.querySelectorAll('[data-target]').forEach(el=>{
    el.classList.toggle('active', el.dataset.target === target);
  });
  const meta = accountNames[target] || ['Workspace',''];
  document.getElementById('tabTitle').textContent = meta[0];
  document.getElementById('addressInput').value = meta[1];
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
    result.textContent='Desktop mode can connect this panel to your preferred translation service. Preview mode keeps the UI local.';
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
  alert('Desktop build will create an isolated session/profile here.');
});
document.getElementById('addAccount')?.addEventListener('click',()=>{
  alert('Desktop build will add another isolated account workspace here.');
});
