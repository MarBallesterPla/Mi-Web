/* ═══════════════════════════════════════════════════════════════
   Mar Ballester Pla · JavaScript pur, sense dependències
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. Any i hora local ─────────────────────────────────── */
  const any = $('#any');
  if (any) any.textContent = new Date().getFullYear();

  const hora = $('#hora');
  if (hora) {
    const f = new Intl.DateTimeFormat('ca-ES', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Madrid'
    });
    const tic = () => { hora.textContent = f.format(new Date()); };
    tic(); setInterval(tic, 1000);
  }

  /* ── 2. Barra de progrés + estat de la capçalera ─────────── */
  const barra = $('#barra'), cap = $('.cap');
  let toc = false;
  const pintar = () => {
    const d = document.documentElement;
    const total = d.scrollHeight - d.clientHeight;
    if (barra) barra.style.width = (total > 0 ? (d.scrollTop / total) * 100 : 0) + '%';
    if (cap) cap.classList.toggle('es-llarga', d.scrollTop > 24);
    toc = false;
  };
  addEventListener('scroll', () => { if (!toc) { toc = true; requestAnimationFrame(pintar); } }, { passive: true });
  pintar();

  /* ── 3. Menú mòbil ───────────────────────────────────────── */
  const botoMenu = $('#menú'), nav = $('#nav');
  if (botoMenu && nav) {
    botoMenu.addEventListener('click', () => {
      const obert = nav.classList.toggle('es-oberta');
      botoMenu.setAttribute('aria-expanded', obert);
    });
    $$('a', nav).forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('es-oberta'); botoMenu.setAttribute('aria-expanded', 'false');
    }));
  }

  /* ── 4. Revelar en entrar en pantalla (amb retard) ───────── */
  const revelables = $$('[data-reveal], .nom, .linia li, .barras');
  if ('IntersectionObserver' in window && !REDUIT) {
    const io = new IntersectionObserver((entrades, obs) => {
      entrades.forEach(e => {
        if (!e.isIntersecting) return;
        const germans = $$('[data-reveal]', e.target.parentElement || document);
        const i = Math.max(0, germans.indexOf(e.target));
        e.target.style.setProperty('--d', Math.min(i * 85, 380) + 'ms');
        e.target.classList.add('es-veu');
        obs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 });
    revelables.forEach(el => io.observe(el));
  } else {
    revelables.forEach(el => el.classList.add('es-veu'));
  }

  /* Entrada del nom */
  const nom = $('.nom');
  if (nom) {
    $$('.lin i', nom).forEach((i, n) => i.style.setProperty('--d', (n * 110 + 120) + 'ms'));
    requestAnimationFrame(() => nom.classList.add('es-veu'));
  }

  /* ── 5. Cronologia: línia que es va omplint ──────────────── */
  const linia = $('[data-linia]');
  if (linia) {
    const omplir = () => {
      const r = linia.getBoundingClientRect();
      const mig = innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, (mig - r.top) / r.height));
      linia.style.setProperty('--prog', (p * 100).toFixed(1) + '%');
    };
    addEventListener('scroll', omplir, { passive: true });
    addEventListener('resize', omplir);
    omplir();
  }

  /* ── 6. Títols descodificats ─────────────────────────────── */
  const GLIFS = '▓▒░#@$%&/\\<>*+=—·01';
  const titols = $$('[data-descodifica]');
  titols.forEach(t => { t.dataset.pla = t.textContent.trim(); });
  const descodificar = (el) => {
    const original = el.dataset.pla;
    let n = 0;
    const pas = () => {
      let sortida = '';
      for (let i = 0; i < original.length; i++) {
        const c = original[i];
        if (c === ' ') { sortida += ' '; continue; }
        sortida += (i < n / 1.7) ? c : GLIFS[(Math.random() * GLIFS.length) | 0];
      }
      el.textContent = sortida;
      n++;
      if (n / 1.7 <= original.length) requestAnimationFrame(pas);
      else el.textContent = original;
    };
    pas();
  };
  if (!REDUIT && 'IntersectionObserver' in window) {
    const io2 = new IntersectionObserver((ent, obs) => {
      ent.forEach(e => { if (e.isIntersecting) { descodificar(e.target); obs.unobserve(e.target); } });
    }, { threshold: .6 });
    titols.forEach(t => io2.observe(t));
  }

  /* ── 7. Consola: canviam els paràmetres ──────────────────── */
  const codiEl = $('[data-tecleja]'), ixida = $('[data-ixida]');
  const CODI_1 = [
    "// Mar Ballester Pla · 1r DAM",
    "const experiment = {",
    "  persona:      \"Mar\",",
    "  centre:       \"IES Simarro\",",
    "  intent:       1,        // ET Gestió: no va funcionar",
    "  oportunitat:  1,",
    "  paràmetres:   \"per canviar\",",
    "  estat:        \"aprenent\",",
    "};"
  ].join('\n');
  const CODI_2 = [
    "// Mar Ballester Pla · 1r DAM",
    "const experiment = {",
    "  persona:      \"Mar\",",
    "  centre:       \"IES Simarro\",",
    "  intent:       2,        // ET no va anar: canviem rumb",
    "  oportunitat:  2,",
    "  paràmetres:   \"canviats\",",
    "  estat:        \"mosset a mosset\",",
    "};"
  ].join('\n');

  const acolorir = (t) => t
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(\/\/[^\n]*)/g, '<span class="c-com">$1</span>')
    .replace(/("[^"]*")/g, '<span class="c-str">$1</span>')
    .replace(/\b(\d+)\b(?![^<]*<\/span>)/g, '<span class="c-num">$1</span>')
    .replace(/\b(const|let|var|new|return|function|if|for)\b(?![^<]*<\/span>)/g, '<span class="c-clau">$1</span>');

  if (codiEl) {
    if (REDUIT) {
      codiEl.innerHTML = acolorir(CODI_2);
      if (ixida) ixida.hidden = false;
    } else {
      let i = 0;
      const teclar = () => {
        i += Math.random() < .2 ? 2 : 1;
        codiEl.innerHTML = acolorir(CODI_1.slice(0, i));
        if (i < CODI_1.length) {
          const c = CODI_1[i];
          setTimeout(teclar, c === '\n' ? 95 : c === ' ' ? 16 : 24 + Math.random() * 32);
        } else {
          // Canvi de paràmetre: intent 1 → 2
          setTimeout(() => {
            codiEl.innerHTML = acolorir(CODI_2);
            $$('.c-num', codiEl).forEach(n => { if (n.textContent === '2') n.classList.add('es-canvi'); });
            if (ixida) setTimeout(() => { ixida.hidden = false; }, 500);
          }, 1200);
        }
      };
      setTimeout(teclar, 700);
    }
  }

  /* ── 8. Marquesina: dupliquem la pista ───────────────────── */
  const pista = $('[data-marquesina]');
  if (pista && !REDUIT) {
    const contenidor = document.createElement('div');
    contenidor.className = 'cinta__pista';
    contenidor.appendChild(pista.cloneNode(true));
    contenidor.appendChild(pista.cloneNode(true));
    pista.replaceWith(contenidor);
  }

  /* ── 9. Comptadors ───────────────────────────────────────── */
  const comptadors = $$('[data-compta]');
  const llancar = (el) => {
    const fi = parseInt(el.dataset.compta, 10);
    const suf = el.dataset.suf || '';
    if (REDUIT) { el.textContent = fi + suf; return; }
    const dur = 1200, t0 = performance.now();
    const pas = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(fi * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  };
  if ('IntersectionObserver' in window) {
    const io3 = new IntersectionObserver((ent, obs) => {
      ent.forEach(e => { if (e.isIntersecting) { llancar(e.target); obs.unobserve(e.target); } });
    }, { threshold: .5 });
    comptadors.forEach(c => io3.observe(c));
  } else comptadors.forEach(llancar);

  /* ── 10. Filtres ─────────────────────────────────────────── */
  const xips = $$('.xip'), targetes = $$('#targetes > li'), buit = $('#buit');
  xips.forEach(x => x.addEventListener('click', () => {
    xips.forEach(o => { o.classList.toggle('is-actiu', o === x); o.setAttribute('aria-pressed', o === x); });
    const f = x.dataset.filtra;
    let visibles = 0;
    targetes.forEach(li => {
      const ok = f === '*' || (li.dataset.cat || '').split(' ').includes(f);
      li.style.display = ok ? '' : 'none';
      if (ok) visibles++;
    });
    if (buit) buit.hidden = visibles !== 0;
  }));

  /* ── 11. Copiar correu ───────────────────────────────────── */
  const botoCopiar = $('#copiar'), avis = $('#avis');
  const mostrar = (t) => {
    if (!avis) return;
    avis.textContent = t; avis.hidden = false;
    requestAnimationFrame(() => avis.classList.add('es-visible'));
    clearTimeout(mostrar._t);
    mostrar._t = setTimeout(() => {
      avis.classList.remove('es-visible');
      setTimeout(() => (avis.hidden = true), 320);
    }, 2600);
  };
  if (botoCopiar) botoCopiar.addEventListener('click', async () => {
    const correu = botoCopiar.dataset.correu;
    try { await navigator.clipboard.writeText(correu); mostrar('✓ Correu copiat: ' + correu); }
    catch (e) { window.location.href = 'mailto:' + correu; }
    botoCopiar.textContent = 'Copiat!';
    setTimeout(() => (botoCopiar.textContent = 'Copiar el correu'), 2000);
  });

  /* ── 12. Enllaç actiu ────────────────────────────────────── */
  const enllacos = $$('.nav a[href^="#"]');
  const seccions = enllacos.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && seccions.length) {
    const io4 = new IntersectionObserver((ent) => {
      ent.forEach(e => {
        if (!e.isIntersecting) return;
        enllacos.forEach(a => a.classList.toggle('actiu', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    seccions.forEach(s => io4.observe(s));
  }

  /* ── 13. Llum del cursor + botons magnètics ──────────────── */
  if (!REDUIT && matchMedia('(pointer:fine)').matches) {
    const llum = $('.llum');
    let x = innerWidth / 2, y = innerHeight / 2, sx = x, sy = y;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (llum) llum.style.opacity = 1;
    }, { passive: true });
    addEventListener('pointerleave', () => llum && (llum.style.opacity = 0));
    (function seguir() {
      sx += (x - sx) * .12; sy += (y - sy) * .12;
      if (llum) llum.style.transform = `translate3d(${sx}px,${sy}px,0)`;
      requestAnimationFrame(seguir);
    })();

    $$('.btn--gran, .btn--plena').forEach(b => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .1}px,${(e.clientY - r.top - r.height / 2) * .2 - 2}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ── 14. Dia / nit amb memòria ───────────────────────────── */
  const tema = $('#tema');
  const posar = (t) => {
    document.documentElement.dataset.theme = t;
    if (tema) tema.setAttribute('aria-pressed', t === 'nit');
    try { localStorage.setItem('tema', t); } catch (e) {}
  };
  let desat = null;
  try { desat = localStorage.getItem('tema'); } catch (e) {}
  if (desat) posar(desat);
  if (tema) tema.addEventListener('click', () =>
    posar(document.documentElement.dataset.theme === 'nit' ? 'dia' : 'nit'));

})();