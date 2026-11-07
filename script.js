/* Studio Valenti — portfolio concept (English, light version) */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js');

/* ---------- non-breaking spaces: short words and the last two words never sit alone ---------- */
const NB = ' ';
const SHORT = /(^|[^A-Za-z0-9])(a|an|the|to|of|in|on|at|by|or|and|for|is|it|as|we|you|us|no|if|so|be|do|our|your|my|i)\s+(?=[A-Za-z0-9€«“"(])/gi;
const nb = s => {
  let r = String(s);
  for (let i = 0; i < 3; i++) r = r.replace(SHORT, '$1$2' + NB);
  r = r.replace(/(\d) (?=[A-Za-z%])/g, '$1' + NB);
  const m = r.match(/^([\s\S]*?)(\S+) (\S+)(\s*)$/);
  if (m && (r.match(/\s/g) || []).length >= 2 && (m[2] + m[3]).length <= 22) r = m[1] + m[2] + NB + m[3] + m[4];
  return r;
};
const nbDom = root => {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while ((n = w.nextNode())) { if (!n.parentElement.closest('script,style,svg,textarea,input')) nodes.push(n); }
  nodes.forEach(t => { if (t.textContent.trim().length > 2) t.textContent = nb(t.textContent); });
};
nbDom(document.body);

/* ---------- header, menu, mobile bar ---------- */
const topBar = $('#top'), burger = $('#burger'), menu = $('#menu'), barM = $('#barM'), hero = $('#hero');
const onScroll = () => {
  topBar.classList.toggle('stuck', scrollY > 24);
  if (barM) barM.classList.toggle('on', hero.getBoundingClientRect().bottom < innerHeight * .4);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
burger.addEventListener('click', () => { const o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

/* ---------- reveal on scroll ---------- */
(() => {
  const els = $$('.rv');
  if (reduced || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  els.forEach(e => io.observe(e));
})();

/* ---------- counters ---------- */
(() => {
  const els = $$('[data-to]');
  const run = el => {
    const to = +el.dataset.to, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduced) { el.textContent = pre + to + suf; return; }
    const t0 = performance.now();
    (function s(t) { const p = Math.min(1, (t - t0) / 1400); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf; if (p < 1) requestAnimationFrame(s); })(t0);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
  els.forEach(e => io.observe(e));
})();

/* ---------- "Sound familiar?": chaos / order switch ---------- */
(() => {
  const btn = $('#swBtn'), notes = $('#notes'), a = $('#swA'), b = $('#swB');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); notes.classList.toggle('order', on);
    a.classList.toggle('on', !on); b.classList.toggle('on', on);
  });
})();

/* ---------- calm index ---------- */
(() => {
  const body = $('#cBody'); if (!body) return;
  const stepEl = $('#cStep'), bar = $('#cBar'), back = $('#cBack');
  const Q = [
    { q: 'How often do you see your real profit?', t: 'Seeing your real profit every month', o: [['Every month', 2], ['A few times a year', 1], ['Once a year, or never', 0]] },
    { q: 'Where are your invoices and receipts?', t: 'Keeping all documents in one agreed place', o: [['One shared place everyone uses', 2], ['Mostly organised, some scattered', 1], ['Chats, email and drawers', 0]] },
    { q: 'When did you last miss a tax or payment date?', t: 'A deadline calendar with reminders', o: [['Never', 2], ['Once or twice', 1], ['It happens regularly', 0]] },
    { q: 'How do you feel when a letter from the tax office arrives?', t: 'A clear routine for tax-office letters', o: [['Calm, we know what to do', 2], ['A little uneasy', 1], ['Close to panic', 0]] },
    { q: 'Does your accountant explain the numbers in plain language?', t: 'Reports you can read without a translator', o: [['Always', 2], ['Sometimes', 1], ['Rarely', 0]] }
  ];
  let step = 0, ans = [];
  const render = () => {
    stepEl.textContent = `Question ${step + 1} of ${Q.length}`;
    bar.style.width = (step / Q.length * 100) + '%';
    back.hidden = step === 0;
    body.innerHTML = `<h3 class="calm__q">${nb(Q[step].q)}</h3><div class="opts">${Q[step].o.map((o, i) => `<button type="button" data-i="${i}" class="${ans[step] === i ? 'sel' : ''}">${nb(o[0])}</button>`).join('')}</div>`;
  };
  const result = () => {
    stepEl.textContent = 'Your result'; bar.style.width = '100%'; back.hidden = false;
    const sum = ans.reduce((s, a, i) => s + Q[i].o[a][1], 0), idx = Math.round(sum / (Q.length * 2) * 100);
    const lows = Q.map((q, i) => ({ t: q.t, s: q.o[ans[i]][1] })).sort((a, b) => a.s - b.s);
    const band = idx < 40 ? ['Stormy', 'Your business runs on memory and good luck. The good news: the first improvements are quick.']
      : idx < 70 ? ['Mostly steady', 'The basics work, but a few gaps still cost you time and attention.']
        : ['Calm', 'You are in good shape. A short review can still find easy wins.'];
    const first = lows[0].s < 2 ? `<p class="first">Start with: ${nb(lows[0].t)}.</p>` : '';
    body.innerHTML = `<div class="res"><b class="score">${idx}<small>/100</small></b><div class="gauge" aria-hidden="true"><i></i></div><h3>${band[0]}</h3><p>${nb(band[1])}</p>${first}<div class="res__act"><a class="btn btn--lg" href="#contact" id="calmCta">Talk it through</a><button class="btn btn--dark btn--lg" type="button" id="calmAgain">Take it again</button></div></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => { const g = $('.gauge i', body); if (g) g.style.left = `calc(${idx}% - 2px)`; }));
    $('#calmAgain').addEventListener('click', () => { step = 0; ans = []; render(); });
    $('#calmCta').addEventListener('click', () => { const t = $('#ctaForm textarea'); if (t) t.value = `My calm index is ${idx}/100. First thing to fix: ${lows[0].t}.`; });
  };
  body.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]'); if (!b) return;
    ans[step] = +b.dataset.i; $$('button', body).forEach(x => x.classList.toggle('sel', x === b)); b.blur();
    setTimeout(() => { step++; step < Q.length ? render() : result(); }, 260);
  });
  back.addEventListener('click', () => { step = step >= Q.length ? Q.length - 1 : Math.max(0, step - 1); render(); });
  render();
})();

/* ---------- build your package ---------- */
(() => {
  const box = $('#checks'); if (!box) return;
  const DATA = {
    free: { label: 'Freelancer', items: [
      ['Business set-up', 'Opening your Partita IVA and choosing the right tax regime for your activity.'],
      ['Monthly bookkeeping', 'Income and expenses recorded and documents filed, nothing left for the last minute.'],
      ['Electronic invoicing', 'Invoices issued and checked through the SDI so they are accepted first time.'],
      ['VAT and F24 payments', 'Calculations, filing and a reminder before every payment date.'],
      ['Annual tax return', 'Your income tax return prepared, explained and filed on time.'],
      ['Pension and social contributions', 'Contributions calculated and scheduled, so there are no surprises.'],
      ['Help with tax-office letters', 'We read the letter, explain it and prepare the reply.']
    ] },
    co: { label: 'Company', items: [
      ['Bookkeeping and annual accounts', 'Day-to-day books and year-end financial statements.'],
      ['VAT, e-invoicing and cross-border sales', 'Domestic and EU invoicing, VAT returns and export paperwork.'],
      ['Payroll and HR paperwork', 'Pay slips, contracts and contributions for your team.'],
      ['Management reporting', 'Profit and loss, cash flow and balance sheet in plain language.'],
      ['Import and export accounting', 'Customs documents, VAT and foreign-currency payments.'],
      ['Support during tax audits and bank requests', 'We prepare documents and explanations, and stay beside you.'],
      ['Business process review', 'We map how documents move and remove the manual work.']
    ] }
  };
  const sel = { free: new Set(), co: new Set() };
  let tab = 'free';
  const list = $('#reqList'), title = $('#reqTitle'), seg = $$('.seg button'), form = $('#reqForm'), err = $('#reqErr'), ok = $('#reqOk');
  const paint = () => {
    const d = DATA[tab], s = sel[tab];
    title.textContent = `${d.label} · selected: ${s.size}`;
    list.innerHTML = s.size ? [...s].sort((a, b) => a - b).map(i => `<li>${nb(d.items[i][0])}</li>`).join('') : '<li class="empty">Tick the services on the left ←</li>';
  };
  const render = () => {
    box.innerHTML = DATA[tab].items.map((it, i) => `<label class="check"><input type="checkbox" data-i="${i}" ${sel[tab].has(i) ? 'checked' : ''}><span class="box"></span><span><b>${nb(it[0])}</b><span>${nb(it[1])}</span></span></label>`).join('');
    paint();
  };
  box.addEventListener('change', e => { const c = e.target.closest('input'); if (!c) return; const i = +c.dataset.i; c.checked ? sel[tab].add(i) : sel[tab].delete(i); paint(); ok.hidden = true; form.querySelector('.btn').hidden = false; });
  seg.forEach(b => b.addEventListener('click', () => { tab = b.dataset.t; seg.forEach(x => x.setAttribute('aria-selected', x === b)); render(); }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), mail = form.elements.email.value.trim();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(mail)) { err.hidden = false; return; }
    err.hidden = true; form.querySelector('.btn').hidden = true; ok.hidden = false;   // demo: nothing is sent
  });
  render();
})();

/* ---------- team cards ---------- */
$$('.person button').forEach(b => b.addEventListener('click', () => {
  const p = b.closest('.person'), o = p.classList.toggle('open'); b.setAttribute('aria-expanded', o);
}));

/* ---------- FAQ ---------- */
(() => {
  const list = $('#faqList'); if (!list) return;
  list.addEventListener('click', e => {
    const b = e.target.closest('.qa > button'); if (!b) return;
    const qa = b.parentElement, open = !qa.classList.contains('open');
    $$('.qa', list).forEach(x => { x.classList.remove('open'); x.querySelector('button').setAttribute('aria-expanded', false); });
    if (open) { qa.classList.add('open'); b.setAttribute('aria-expanded', true); }
  });
})();

/* ---------- contact form (demo) ---------- */
(() => {
  const f = $('#ctaForm'); if (!f) return;
  const err = $('#ctaErr'), ok = $('#ctaOk');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const name = f.elements.name.value.trim(), mail = f.elements.email.value.trim();
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(mail)) { err.hidden = false; return; }
    err.hidden = true; f.querySelector('.btn').hidden = true; ok.hidden = false;   // demo: nothing is sent
  });
})();
