// GRID Form Builder – Prototype (Wizard + Tooltips + Step Highlight + Click-to-Highlight Anywhere + Autosave + Live Preview + Inspector + Toasts)

// ------------------ Templates from templates.js ------------------
const TEMPLATES = window.TEMPLATES || [];

// ------------------ State & DOM ------------------
let selectedTemplate = null;
let currentDocId = null;
let step = 1; // 1..4
const signed = { provider:false, client:false };

const elTemplates    = document.getElementById('templates');
const elOrgName      = document.getElementById('orgName');
const elTop          = document.getElementById('brandTop');
const elBot          = document.getElementById('brandBot');
const elLogoUrl      = document.getElementById('logoUrl');
const elInstructions = document.getElementById('instructions');
const elPreview      = document.getElementById('preview');
const elStatusBadge  = document.getElementById('statusBadge');
const elPanelForms   = document.getElementById('panelForms');
const elExport       = document.getElementById('exportActions');
const elAnnounce     = document.getElementById('stepAnnouncer');

const btnPreview   = document.getElementById('btnPreview');
const btnSample    = document.getElementById('btnSample');
const btnSmart     = document.getElementById('btnSmart');
const btnReset     = document.getElementById('btnReset');
const btnDownload  = document.getElementById('btnDownload');
const btnPublish   = document.getElementById('btnPublish');
const btnVerify    = document.getElementById('btnVerify');
const btnNext      = document.getElementById('btnNext');
const btnBack      = document.getElementById('btnBack');
const btnStartOver = document.getElementById('btnStartOver');

// Wizard steps container (for delegation)
const stepsNav = document.querySelector('.wizard-steps');
const w1 = document.getElementById('wStep1');
const w2 = document.getElementById('wStep2');
const w3 = document.getElementById('wStep3');
const w4 = document.getElementById('wStep4');

// ------------------ Utils ------------------
const $  = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));
function uid(n=10){ return Math.random().toString(36).slice(2,2+n); }
function fmtDate(d=new Date()){ const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function setStatus(s){ elStatusBadge.textContent = s; }
function resetSignatures(){ signed.provider=false; signed.client=false; }
const debounce = (fn, delay) => { let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }; };

function escapeHtml(v){
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function notify(type, msg){
  const host = document.getElementById('toastHost');
  if(!host){ alert(msg); return; }
  const el = document.createElement('div');
  el.className = 'toast ' + (type==='ok'?'ok':type==='warn'?'warn':type==='error'?'err':'');
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>{ if(el.parentNode) host.removeChild(el); }, 300); }, 2500);
}

function parseInstructionsText(text){
  const t = text.trim();
  if(!t) return {};
  if(t.startsWith('{') || t.startsWith('[')){
    try { return JSON.parse(t); } catch(e) { /* fallthrough */ }
  }
  const out = {};
  t.split(/\n+/).forEach(line => {
    const m = line.split(':');
    if(m.length>=2){ const key = m.shift().trim(); const val = m.join(':').trim(); if(key) out[key] = val; }
  });
  return out;
}

function renderTemplate(tplHtml, data){
  return tplHtml.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => escapeHtml(data[k] ?? ''));
}

function applyBranding(){
  const top = (elTop && elTop.value) ? elTop.value : '#d8ab76';
  const bot = (elBot && elBot.value) ? elBot.value : '#b87857';
  document.documentElement.style.setProperty('--brandA', top);
  document.documentElement.style.setProperty('--brandB', bot);
  document.querySelectorAll('.doc').forEach(d=>d.style.setProperty('--brandLine', top));
}

// Smart Fill (Mock AI) – same as your current logic
function inferFieldsFromText(txt){
  const t = (txt||'').replace(/\s+/g,' ').trim();
  const out = {};
  out.offerType = /lease|rent|leasing/i.test(t) ? 'Lease' : (/purchase|buy|sale/i.test(t) ? 'Purchase' : '');
  if(/warehouse|industrial/i.test(t)) out.permittedUse = 'Warehouse/Industrial';

  let m = t.match(/(?:nudget|budget|rent|rental|price)[^\d]*(?:of|=|:)?\s*(?:php|₱)?\s*([\d,.]+)\s*(k|m|million)?/i);
  if(m){ let num = parseFloat(m[1].replace(/,/g,''))||0; const suf=(m[2]||'').toLowerCase(); if(suf==='k') num*=1000; else if(suf==='m'||suf==='million') num*=1_000_000; out.monthlyRent = '₱'+Math.round(num).toLocaleString('en-PH'); }
  m = t.match(/(\d+)\s*(?:months?|mos?)\s*(?:deposit|security)/i); if(m) out.securityDeposit = `${m[1]} months`;
  let months=null; m = t.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i); if(m) months=Math.round(parseFloat(m[1])*12);
  if(!months){ m = t.match(/(\d+)\s*(?:months?|mos?)/i); if(m) months=parseInt(m[1]); }
  let start = new Date();
  m = t.match(/(?:start|commence|move\s*in|begin)\s*(?:on|at|from)?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i);
  if(m){ const dt=Date.parse(m[1]); if(!isNaN(dt)) start=new Date(dt); }
  const pad=n=>String(n).padStart(2,'0');
  out.leaseStart = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
  if(months){ const end=new Date(start); end.setMonth(end.getMonth()+months); out.leaseEnd = `${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`; }
  m = t.match(/in\s+([A-Za-z0-9\-\.,\s]+?)(?:\.|,|;|$)/i); if(m) out.propertyAddress = m[1].trim();
  m = t.match(/(\d+)\s*(?:day|d)\s*(?:due\s*diligence|DD)/i); if(m) out.dueDiligenceDays = m[1];
  m = t.match(/earnest\s*(?:money|deposit)[^\d]*(?:php|₱)?\s*([\d,.]+)\s*(k|m|million)?/i); if(m){ let num = parseFloat(m[1].replace(/,/g,''))||0; const suf=(m[2]||'').toLowerCase(); if(suf==='k') num*=1000; else if(suf==='m'||suf==='million') num*=1_000_000; out.earnestMoney='₱'+Math.round(num).toLocaleString('en-PH'); }
  m = t.match(/valid\s*(?:through|until)\s*([A-Za-z]{3,9}\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i); if(m){ const dt=Date.parse(m[1]); if(!isNaN(dt)) { const v=new Date(dt); out.validThrough = `${v.getFullYear()}-${pad(v.getMonth()+1)}-${pad(v.getDate())}`; } }
  return out;
}
const btnRunPipeline   = document.getElementById('btnRunPipeline');
const outBox           = document.getElementById('pipelineOut');
const outPre           = document.getElementById('pipelineJson');
const btnDownloadJSON  = document.getElementById('btnDownloadJSON');

btnRunPipeline?.addEventListener('click', async () => {
  const text = elInstructions.value.trim();
  if (!text) { notify('warn','Type instructions or click “Use Sample Data” first.'); return; }

  btnRunPipeline.disabled = true;
  const old = btnRunPipeline.textContent;
  btnRunPipeline.textContent = 'Running…';

  try {
    const res = await fetch('/api/form-expert', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> '');
      notify('error', `Pipeline error ${res.status}`);
      console.error('Pipeline error', t);
      return;
    }
    const json = await res.json();
    // show it
    outPre.textContent = JSON.stringify(json, null, 2);
    outBox.style.display = 'block';
    // stash for download
    window.__lastExecJSON = json;
    notify('ok','Executive JSON ready');
  } catch (e) {
    console.error(e);
    notify('error','Pipeline failed');
  } finally {
    btnRunPipeline.disabled = false;
    btnRunPipeline.textContent = old;
  }
});

btnDownloadJSON?.addEventListener('click', () => {
  const data = window.__lastExecJSON || {};
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `executive-json-${(new Date()).toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

// ------------------ NEW: VS helpers ------------------
function getHiddenSchema() {
  try {
    const el = document.getElementById('vs-schema');
    return el ? JSON.parse(el.textContent || '{}') : {};
  } catch (e) {
    console.warn('Schema parse error', e);
    return {};
  }
}

async function runVectorShift(text, templateHint) {
  const endpoint = window.FB_CUSTOM_ENDPOINT || (window.FB_CONFIG?.vs?.endpoint);
  const schema   = getHiddenSchema();
  if (!window.FB_CONFIG?.useBackend || !endpoint) {
    // Fallback: local parse only
    return { template_id: templateHint, fields: parseInstructionsText(text), missing_required: [], confidence: 0 };
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type':'application/json' },
    body: JSON.stringify({
      text,
      template_hint: templateHint || null,
      schema,
      locale: 'en-PH',
      org_id: document.getElementById('orgName')?.value || undefined
    })
  });
  if (!res.ok) {
    const detail = await res.text().catch(()=> '');
    throw new Error(`Proxy/VS error ${res.status}: ${detail}`);
  }
  return await res.json(); // { template_id, fields, missing_required, confidence }
}

// ------------------ UI Builders ------------------
function drawTemplates(){
  elTemplates.innerHTML = '';
  TEMPLATES.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card-template';
    card.dataset.tplId = t.id;
    card.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-weight:800;">${t.name}</div>
        <span class="small">#${t.id}</span>
      </div>
      <div class="small">${t.desc}</div>
    `;
    card.addEventListener('click', () => {
      selectedTemplate = t;
      $$('.card-template').forEach(c=>c.classList.remove('active'));
      card.classList.add('active');
      if(step === 1) enableNext(true);
      btnPreview.click(); // auto preview on selection
    });
    elTemplates.appendChild(card);
  });
}

// ------------------ Field Inspector ------------------
function updateFieldInspector(data){
  const grid = document.getElementById('fieldInspectorGrid'); if(!grid) return;
  grid.innerHTML = '';
  const keys = Object.keys(data||{});
  if(!keys.length){ grid.innerHTML = '<div class="small">No fields parsed.</div>'; return; }
  keys.forEach(k=>{
    const kEl = document.createElement('div'); kEl.className='k'; kEl.textContent=k;
    const vEl = document.createElement('div'); vEl.className='v'; vEl.textContent=String(data[k]);
    grid.appendChild(kEl); grid.appendChild(vEl);
  });
}

// ------------------ Actions ------------------
btnSample?.addEventListener('click', ()=>{
  elInstructions.value = `ownerName: Alice Reyes
brokerName: GRID Realty
propertyAddress: 2211 Ayala Ave, Makati, PH
listingType: Exclusive
listingTerm: 6 months
commissionPercent: 3
coBrokerSplit: 50
listPrice: ₱25,000,000
lessorName: ACME Properties Inc.
lesseeName: Juan Dela Cruz
leaseStart: 2025-12-01
leaseEnd: 2026-11-30
monthlyRent: ₱350,000
securityDeposit: 3 months
permittedUse: Warehouse/Industrial
loiBuyerTenantName: Juan Dela Cruz
sellerLandlordName: ACME Properties Inc.
offerType: Purchase
offerPrice: ₱24,000,000
earnestMoney: ₱500,000
dueDiligenceDays: 30
closingDate: 2026-01-15
validThrough: 2025-12-31
date: ${fmtDate()}`;
  updateFieldInspector(parseInstructionsText(elInstructions.value));
});

btnReset?.addEventListener('click', ()=>{
  elInstructions.value = '';
  elPreview.innerHTML = '<p class="muted">Step 1: pick a form on the left. Step 2: describe it above. Then click <b>Generate Preview</b>.</p>';
  btnDownload.disabled = true; btnPublish.disabled = true; btnVerify && (btnVerify.disabled = true);
  setStatus('Draft'); currentDocId = null; resetSignatures();
});

// --------- UPDATED Generate Preview handler (with VS + fallback) ----------
btnPreview?.addEventListener('click', async ()=>{
  if(!selectedTemplate){ notify('error','Pick a form on the left first.'); return; }

  // 1) Ask server/VS for normalized JSON
  btnPreview.disabled = true; const old = btnPreview.textContent; btnPreview.textContent = 'Generating…';
  let parsed;
  try {
    parsed = await runVectorShift(elInstructions.value, selectedTemplate.id);
  } catch (e) {
    console.error(e);
    notify('warn','Could not parse via server; falling back to local parse.');
    parsed = { template_id: selectedTemplate.id, fields: parseInstructionsText(elInstructions.value), missing_required: [], confidence: 0 };
  } finally {
    btnPreview.textContent = old;
    btnPreview.disabled = false;
  }

  // 2) Switch template if VS recommends a different one
  if (parsed?.template_id && parsed.template_id !== selectedTemplate.id) {
    const next = TEMPLATES.find(t => t.id === parsed.template_id);
    if (next) {
      selectedTemplate = next;
      document.querySelectorAll('.card-template').forEach(c=>c.classList.remove('active'));
      document.querySelector(`[data-tpl-id="${next.id}"]`)?.classList.add('active');
    }
  }

  // 3) Rewrite textarea → canonical `key: value` pairs (transparency)
  if (parsed?.fields) {
    elInstructions.value = Object.entries(parsed.fields)
      .filter(([k,v]) => v != null && String(v).trim()!=='')
      .map(([k,v]) => `${k}: ${v}`)
      .join('\n');
  }

  // 3.1 Backward-compat shim for old drafts
  const data = parseInstructionsText(elInstructions.value);
  if (data.terminationDays == null && data.terminationNoticeDays != null) {
    data.terminationDays = data.terminationNoticeDays;
  }

  // 4) Enrich + render placeholders using existing renderer
  data.orgName = elOrgName.value || 'Your Organization';
  data.docCode = (currentDocId || uid(6)).toUpperCase();
  data.date    = data.date || fmtDate();

  const htmlOut = renderTemplate(selectedTemplate.html, data);
  elPreview.innerHTML = `<div class="docWrap">${htmlOut}</div>`;
  applyBranding();

  // click-to-sign (mock)
  document.querySelectorAll('.sign-box').forEach(box => {
    const role = box.getAttribute('data-role');
    box.addEventListener('click', () => {
      let name = 'Signer';
      const parsed = parseInstructionsText(elInstructions.value);
      if(selectedTemplate.id==='lease')   name = role==='provider' ? (parsed.lessorName || 'Lessor') : (parsed.lesseeName || 'Lessee');
      if(selectedTemplate.id==='listing') name = role==='provider' ? (parsed.brokerName || 'Broker') : (parsed.ownerName || 'Owner');
      if(selectedTemplate.id==='loi')     name = role==='provider' ? (parsed.sellerLandlordName || 'Seller/Landlord') : (parsed.loiBuyerTenantName || 'Buyer/Tenant');
      box.innerHTML = `<span class="signature">${escapeHtml(name)}</span>`; box.classList.add('active');
      signed[role]=true; if(signed.provider && signed.client) setStatus('Signed (Mock)'); else setStatus('Partially Signed');
    }, { once:false });
  });

  btnDownload.disabled = false; btnPublish.disabled = false; btnVerify && (btnVerify.disabled = false);
  setStatus('Draft');
  if(step === 2) goTo(3);

  // update inspector + surface missing required fields
  updateFieldInspector(data);
  if (Array.isArray(parsed?.missing_required) && parsed.missing_required.length) {
    notify('warn', `Missing fields: ${parsed.missing_required.join(', ')}`);
  }
});

// Export actions
btnDownload?.addEventListener('click', ()=>{
  const node = document.querySelector('.doc'); if(!node){ notify('error','Nothing to export. Generate preview first.'); return; }
  const name = (selectedTemplate?.name || 'Document').replace(/\s+/g,'_');
  const opt = { margin: 10, filename: `${name}_${fmtDate()}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
  html2pdf().set(opt).from(node).save();
});
btnPublish?.addEventListener('click', ()=>{
  const node = document.querySelector('.doc'); if(!node){ notify('error','Generate preview first.'); return; }
  const id = currentDocId || uid(8).toUpperCase(); currentDocId = id;
  const raw = node.outerHTML; const checksum = btoa(unescape(encodeURIComponent(raw))).slice(0,24);
  const record = { id, tplId:selectedTemplate.id, name:selectedTemplate.name, orgName: elOrgName.value||'Your Organization', brandTop: elTop?.value||'#d8ab76', brandBot: elBot?.value||'#b87857', html: raw, signed:{...signed}, createdAt: Date.now(), checksum };
  localStorage.setItem(`doc_${id}`, JSON.stringify(record));
  const idx = JSON.parse(localStorage.getItem('doc_index')||'[]'); if(!idx.includes(id)){ idx.push(id); localStorage.setItem('doc_index', JSON.stringify(idx)); }
  setStatus(signed.provider && signed.client ? 'Signed (Mock)' : 'Sent (Mock)');
  location.hash = `#/view/${id}`;
});

// Wizard controls (unchanged core)
btnNext?.addEventListener('click', ()=>{
  if(step === 1 && !selectedTemplate){ notify('error','Pick a form on the left to continue.'); return; }
  if(step === 2){ btnPreview.click(); return; }
  if(step === 3){ goTo(4); return; }
  if(step === 4){ return; }
  goTo(step + 1);
});
btnBack?.addEventListener('click', ()=>{ if(step>1) goTo(step-1); });
btnStartOver?.addEventListener('click', ()=>{ goTo(1); });

// Click-to-highlight (any section)
function jumpTo(target){ goTo(target); }
if (stepsNav) {
  stepsNav.addEventListener('click', (e)=>{
    const li = e.target.closest('li');
    if(!li) return;
    const target = parseInt(li.id.replace('wStep',''),10);
    if(!isNaN(target)) jumpTo(target);
  });
}
elPanelForms?.addEventListener('click', ()=> jumpTo(1));
elInstructions?.addEventListener('focusin', ()=> jumpTo(2));
elInstructions?.addEventListener('click',   ()=> jumpTo(2));
elPreview?.addEventListener('click',        ()=> jumpTo(3));
elExport?.addEventListener('click',         ()=> jumpTo(4));

// Router (unchanged – keep this one)
function route(){
  const hash = location.hash || '#/'
  if(hash.startsWith('#/view/')){
    const id = hash.split('/').pop(); const raw = localStorage.getItem(`doc_${id}`); document.title = 'Published Document';
    if(!raw){ document.body.innerHTML = '<div style="padding:30px; font-family:Inter, sans-serif; color:#e9eef4;">Document not found. <a href="#/" style="color:#6dc8ff;">Back</a></div>'; return; }
    const doc = JSON.parse(raw);
    document.body.innerHTML = `
      <header class="site-header"><div class="wrap"><div class="brand"><div class="logo"></div> Published View</div><div class="status"><span class="badge">Read-only</span><span class="badge">Code: ${doc.id}</span></div></div></header>
      <main class="layout" style="grid-template-columns:280px 1fr;">
        <aside class="left card">
          <h2>Verify</h2>
          <div id="qrcode" style="background:#0b0f13; border:1px dashed #2a3951; border-radius:12px; padding:12px; display:flex; align-items:center; justify-content:center; height:160px;"></div>
          <p class="small">Scan to open this page. Or visit <span class="muted">#/verify/${doc.id}</span></p>
          <hr style="border:none; border-top:1px solid var(--line);" />
          <p class="small"><b>Organization:</b> ${doc.orgName}</p>
          <p class="small"><b>Status:</b> ${doc.signed.provider && doc.signed.client ? 'Signed (Mock)' : 'In Progress'}</p>
          <p class="small"><b>Created:</b> ${new Date(doc.createdAt).toLocaleString()}</p>
          <p class="small"><b>Checksum:</b> ${doc.checksum}</p>
          <div class="actions"><button id="goVerify" class="ghost">Open Verify</button><button id="goBack" class="ghost">Back</button></div>
        </aside>
        <section class="right card">
          <div class="preview" id="pubPreview">${doc.html}</div>
          <div class="actions tail"><button class="accent" id="pubDownload">Download PDF</button><button id="copyLink" class="ghost">Copy Share Link</button></div>
        </section>
      </main>
      <footer class="site-footer">Share this URL. Code <b>${doc.id}</b></footer>
    `;
    document.documentElement.style.setProperty('--brandA', doc.brandTop); document.documentElement.style.setProperty('--brandB', doc.brandBot); document.querySelectorAll('.doc').forEach(d=>d.style.setProperty('--brandLine', doc.brandTop));
    new QRCode('qrcode', { text: location.href, width: 140, height: 140 });
    document.getElementById('goBack').addEventListener('click', ()=>{ location.hash = '#/'; location.reload(); });
    document.getElementById('goVerify').addEventListener('click', ()=>{ location.hash = `#/verify/${doc.id}`; location.reload(); });
    document.getElementById('pubDownload').addEventListener('click', ()=>{ const node=document.querySelector('#pubPreview .doc'); const name=(doc.name||'Document').replace(/\s+/g,'_'); const opt={ margin:10, filename:`${name}_${fmtDate()}.pdf`, image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}}; html2pdf().set(opt).from(node).save(); });
    document.getElementById('copyLink').addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(location.href); notify('ok','Link copied!'); }catch{ notify('error','Copy failed'); } });
    return;
  }
  if(hash.startsWith('#/verify/')){
    const id = hash.split('/').pop(); document.title='Verify Document'; const raw = localStorage.getItem(`doc_${id}`); const ok = !!raw; const doc = ok ? JSON.parse(raw) : null;
    document.body.innerHTML = `
      <header class="site-header"><div class="wrap"><div class="brand"><div class="logo"></div> Verify Document</div><div class="status"><span class="badge">${ok?'Found':'Not Found'}</span></div></div></header>
      <main class="layout"><section class="right card">${ ok ? `
        <p class="small">Document Code: <b>${doc.id}</b></p>
        <p class="small">Organization: ${doc.orgName}</p>
        <p class="small">Status: ${doc.signed.provider && doc.signed.client ? 'Signed (Mock)' : 'In Progress'}</p>
        <p class="small">Created: ${new Date(doc.createdAt).toLocaleString()}</p>
        <p class="small">Checksum: ${doc.checksum}</p>
        <div class="actions"><button id="openDoc" class="ghost">Open Document</button><button id="goHome" class="ghost">Back</button></div>
      ` : `
        <p class="small">No record for code <b>${id}</b> in this browser.</p>
        <div class="actions"><button id="goHome" class="ghost">Back</button></div>
      `}</section></main>`;
    if(ok){ document.documentElement.style.setProperty('--brandA', doc.brandTop); document.documentElement.style.setProperty('--brandB', doc.brandBot); document.getElementById('openDoc').addEventListener('click', ()=>{ location.hash = `#/view/${doc.id}`; location.reload(); }); }
    document.getElementById('goHome').addEventListener('click', ()=>{ location.hash = '#/'; location.reload(); });
    return;
  }
}

// Step highlight helpers (existing)
function clearHighlights(){ [elPanelForms, elInstructions, elPreview, elExport].forEach(el=>{ if(el) el.classList.remove('focus-outline'); }); }
function applyStepHighlight(){ clearHighlights(); if(step===1){(elPanelForms||elTemplates)?.classList.add('focus-outline');} if(step===2){elInstructions?.classList.add('focus-outline');} if(step===3){elPreview?.classList.add('focus-outline');} if(step===4){elExport?.classList.add('focus-outline');} }
function announceStep(){ if(!elAnnounce) return; elAnnounce.textContent = {1:'Step 1 of 4: Pick a form',2:'Step 2 of 4: Describe your form',3:'Step 3 of 4: Preview and sign',4:'Step 4 of 4: Export or publish'}[step]; }

// Wizard helpers
function enableNext(v){ if(btnNext){ btnNext.disabled=!v; btnNext.setAttribute('aria-disabled', String(!v)); } }
function updateWizardUI(){
  [w1,w2,w3,w4].forEach(w => { w?.classList.remove('current','complete','upcoming'); });
  const list = [w1,w2,w3,w4];
  list.forEach((el, i) => { if(!el) return; if(i+1 < step) el.classList.add('complete'); else if(i+1 === step) el.classList.add('current'); else el.classList.add('upcoming'); });
  if(btnBack) btnBack.disabled = (step === 1);
  enableNext(true);
  const exportEnabled = (step >= 3);
  if(btnDownload) btnDownload.disabled = !exportEnabled;
  if(btnPublish)  btnPublish.disabled  = !exportEnabled;
  if(btnVerify)   btnVerify.disabled   = !exportEnabled;
  applyStepHighlight(); announceStep();
}
function goTo(n){
  step = Math.max(1, Math.min(4, n));
  updateWizardUI();
  if(step === 1){ elPanelForms?.scrollIntoView({behavior:'smooth', block:'nearest'}); }
  if(step === 2){ elInstructions?.focus(); }
  if(step === 3){ elPreview?.scrollIntoView({behavior:'smooth', block:'nearest'}); }
  if(step === 4){ elExport?.scrollIntoView({behavior:'smooth', block:'nearest'}); }
}

// Autosave + live preview + zoom
const STORAGE_KEYS = { draft:'fb_draft', brand:'fb_brand', tpl:'fb_tpl' };
function loadDraft(){
  try{
    const d = JSON.parse(localStorage.getItem(STORAGE_KEYS.draft)||'{}');
    if(d.instructions) elInstructions.value = d.instructions;
    const b = JSON.parse(localStorage.getItem(STORAGE_KEYS.brand)||'{}');
    if(b.orgName) elOrgName.value = b.orgName;
    if(b.top) elTop.value = b.top;
    if(b.bot) elBot.value = b.bot;
    if(b.logo) elLogoUrl.value = b.logo;
    const tpl = localStorage.getItem(STORAGE_KEYS.tpl);
    if(tpl){
      // select template visually
      setTimeout(()=>{
        const card = document.querySelector(`.card-template[data-tpl-id="${tpl}"]`);
        if(card) card.click();
      }, 0);
    }
  }catch(e){}
}
const saveDraftDebounced = debounce(()=>{
  try{
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify({ instructions: elInstructions.value }));
    localStorage.setItem(STORAGE_KEYS.brand, JSON.stringify({ orgName: elOrgName.value, top: elTop.value, bot: elBot.value, logo: elLogoUrl.value }));
    if(selectedTemplate) localStorage.setItem(STORAGE_KEYS.tpl, selectedTemplate.id);
  }catch(e){}
}, 400);
const autoPreviewDebounced = debounce(()=>{ if(selectedTemplate) btnPreview.click(); }, 500);
elInstructions?.addEventListener('input', ()=>{ saveDraftDebounced(); autoPreviewDebounced(); updateFieldInspector(parseInstructionsText(elInstructions.value)); });
[elOrgName, elTop, elBot, elLogoUrl].forEach(el=> el?.addEventListener('input', saveDraftDebounced));

// Zoom
let zoom = 1;
function applyZoom(){ const wrap = elPreview?.querySelector('.docWrap'); if(wrap) wrap.style.transform = `scale(${zoom})`; }
document.getElementById('zoomOut')?.addEventListener('click', ()=>{ zoom=Math.max(0.6, +(zoom-0.1).toFixed(2)); applyZoom(); });
document.getElementById('zoomIn') ?.addEventListener('click', ()=>{ zoom=Math.min(1.6, +(zoom+0.1).toFixed(2)); applyZoom(); });
document.getElementById('zoomReset')?.addEventListener('click', ()=>{ zoom=1; applyZoom(); });

// Router
window.addEventListener('hashchange', route);

// Init
drawTemplates(); applyBranding(); updateWizardUI(); loadDraft(); updateFieldInspector(parseInstructionsText(elInstructions.value)); route();
