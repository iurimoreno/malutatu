(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  // ---------------------------------------------------------------
  // Configuração fixa da campanha
  // ---------------------------------------------------------------
  var SITE_URL = 'https://malutatu.com.br';
  var META_GOIANIA = 100000;
  var META_BRASIL = 500000;
  var PIX = {
    chave: '99630141191',          // CPF, só números
    nome: 'IURI MORENO CHAVES',    // máx. 25 caracteres (padrão BR Code)
    cidade: 'GOIANIA'              // máx. 15 caracteres, sem acento
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var brlCents = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  function formatShort(v) {
    if (v >= 1000) {
      var mil = v / 1000;
      return 'R$ ' + mil.toLocaleString('pt-BR', { maximumFractionDigits: mil < 10 ? 1 : 0 }) + ' mil';
    }
    return brl.format(v);
  }

  // ---------------------------------------------------------------
  // Toast + copiar para a área de transferência
  // ---------------------------------------------------------------
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return legacyCopy(text);
  }
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error('copy failed'));
    });
  }

  // ---------------------------------------------------------------
  // Pix Copia e Cola (BR Code estático, padrão EMV do Banco Central)
  // ---------------------------------------------------------------
  function emv(id, value) {
    var len = String(value.length).padStart(2, '0');
    return id + len + value;
  }
  function crc16(str) {
    var bytes = new TextEncoder().encode(str);
    var crc = 0xFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc ^= bytes[i] << 8;
      for (var j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  function brCode(valor) {
    var payload =
      emv('00', '01') +
      emv('26', emv('00', 'br.gov.bcb.pix') + emv('01', PIX.chave)) +
      emv('52', '0000') +
      emv('53', '986') +
      (valor > 0 ? emv('54', valor.toFixed(2)) : '') +
      emv('58', 'BR') +
      emv('59', PIX.nome) +
      emv('60', PIX.cidade) +
      emv('62', emv('05', '***')) +
      '6304';
    return payload + crc16(payload);
  }

  // ---------------------------------------------------------------
  // Seleção de valor
  // ---------------------------------------------------------------
  var amountButtons = $$('.amount');
  var otherBox = $('[data-other]');
  var otherInput = $('[data-other-input]');
  var copyBrBtn = $('[data-copy-brcode]');
  var copyBrLabel = $('[data-copy-brcode-label]');
  var selected = 50;

  function parseMoney(str) {
    var clean = String(str).replace(/[^\d,\.]/g, '');
    if (clean.indexOf(',') > -1) clean = clean.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(clean);
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  }
  function updateCopyLabel() {
    if (selected === 'outro') {
      var v = parseMoney(otherInput.value);
      copyBrLabel.textContent = v ? 'Copiar Pix de ' + brlCents.format(v).replace(',00', '') : 'Copiar código Pix';
    } else {
      copyBrLabel.textContent = 'Copiar Pix de R$ ' + selected;
    }
  }
  amountButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      amountButtons.forEach(function (b) { b.setAttribute('aria-checked', 'false'); });
      btn.setAttribute('aria-checked', 'true');
      var a = btn.getAttribute('data-amount');
      selected = a === 'outro' ? 'outro' : Number(a);
      otherBox.hidden = selected !== 'outro';
      if (selected === 'outro') otherInput.focus();
      updateCopyLabel();
    });
  });
  otherInput.addEventListener('input', updateCopyLabel);

  copyBrBtn.addEventListener('click', function () {
    var valor = selected === 'outro' ? parseMoney(otherInput.value) : selected;
    var code = brCode(valor);
    copyText(code).then(function () {
      toast('Código Pix copiado! Agora cole no app do seu banco 💛');
    }, function () {
      window.prompt('Copie o código Pix abaixo:', code);
    });
  });

  $('[data-copy-key]').addEventListener('click', function () {
    copyText(PIX.chave).then(function () {
      toast('Chave Pix (CPF) copiada!');
    }, function () {
      window.prompt('Copie a chave Pix:', PIX.chave);
    });
  });

  // QR Code: aberto no computador, recolhido no celular
  var qr = $('[data-qr]');
  if (window.matchMedia('(min-width: 900px)').matches) qr.open = true;

  // ---------------------------------------------------------------
  // Mensagem para compartilhar
  // ---------------------------------------------------------------
  var SHARE_MESSAGE = [
    '🎬🐾 *Vamos levar a Malu Tatu para o cinema?*',
    '',
    'Malu Tatu é uma animação brasileira, feita aqui em Goiás, sobre uma tatuzinha engenheira que enfrenta a seca e um caçador de animais para salvar a sua toca no Cerrado. Tem a voz da Tainá Müller e roteiro premiado no FRAPA.',
    '',
    'O filme levou anos para ficar pronto. Agora falta o último passo: *chegar às telonas*, primeiro em Goiânia e depois no Brasil todo. Imagina levar as crianças para ver no cinema uma história nossa, com os bichos do nosso Cerrado? 💛',
    '',
    '✨ Qualquer valor ajuda, e *quem contribuir ganha o nome nos créditos finais do filme!*',
    '',
    '*Pix (CPF):* 99630141191',
    '*Favorecido:* Iuri Moreno Chaves Pereira',
    '',
    'Veja o teaser e acompanhe a campanha:',
    '👉 ' + SITE_URL,
    '',
    'Não pode contribuir agora? Compartilhar já ajuda muito! 🫶'
  ].join('\n');

  var bubble = $('[data-share-message]');
  bubble.innerHTML = SHARE_MESSAGE
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');

  $('[data-copy-message]').addEventListener('click', function () {
    copyText(SHARE_MESSAGE).then(function () {
      toast('Mensagem copiada! É só colar no WhatsApp 📲');
    }, function () {
      window.prompt('Copie a mensagem:', SHARE_MESSAGE);
    });
  });
  $('[data-wa-link]').href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_MESSAGE);

  var nativeBtn = $('[data-native-share]');
  if (navigator.share) {
    nativeBtn.hidden = false;
    nativeBtn.addEventListener('click', function () {
      navigator.share({ title: 'Leve Malu Tatu aos cinemas', text: SHARE_MESSAGE }).catch(function () {});
    });
  }

  // ---------------------------------------------------------------
  // Barra de arrecadação (túnel)
  // Metade esquerda: 0 → R$ 100 mil (Goiânia). Metade direita: → R$ 500 mil (Brasil).
  // ---------------------------------------------------------------
  function positionFor(v) {
    if (v <= META_GOIANIA) return (v / META_GOIANIA) * 50;
    return Math.min(100, 50 + ((v - META_GOIANIA) / (META_BRASIL - META_GOIANIA)) * 50);
  }

  var tunnel = $('[data-tunnel]');
  var fillEarth = $('[data-fill-earth]');
  var fillWater = $('[data-fill-water]');
  var malu = $('[data-tunnel-malu]');
  var tunnelData = null;
  var tunnelShown = false;

  function animateNumber(el, to) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || to === 0) { el.textContent = brl.format(to); return; }
    var start = performance.now();
    var dur = 1800;
    (function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = brl.format(Math.round(to * eased));
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  function renderTunnel() {
    if (!tunnelData || !tunnelShown) return;
    var v = tunnelData.arrecadado;
    var pos = positionFor(v);
    fillEarth.style.width = Math.min(pos, 50) + '%';
    fillWater.style.width = Math.max(0, pos - 50) + '%';
    malu.style.left = 'clamp(33px, ' + pos + '%, calc(100% - 33px))';
    tunnel.classList.toggle('is-goiania', v >= META_GOIANIA);
    animateNumber($('[data-raised]'), v);
  }

  function setupTunnel(data) {
    var v = Math.max(0, Number(data.arrecadado) || 0);
    tunnelData = { arrecadado: v };

    tunnel.setAttribute('aria-valuenow', String(v));
    tunnel.setAttribute('aria-valuetext', brl.format(v) + ' arrecadados');

    var remaining = $('[data-remaining]');
    if (v < META_GOIANIA) {
      remaining.textContent = 'Faltam ' + formatShort(META_GOIANIA - v) + ' para chegar em Goiânia';
    } else if (v < META_BRASIL) {
      remaining.textContent = '🎉 Goiânia garantida! Faltam ' + formatShort(META_BRASIL - v) + ' para o Brasil';
    } else {
      remaining.textContent = '🎉 Chegamos ao Brasil todo! Obrigado!';
    }

    var n = Number(data.apoiadores) || 0;
    if (n > 0) {
      var sup = $('[data-supporters]');
      sup.textContent = n.toLocaleString('pt-BR') + (n === 1 ? ' pessoa já está cavando junto' : ' pessoas já estão cavando junto');
      sup.hidden = false;
    }

    if (data.atualizado_em) {
      var parts = String(data.atualizado_em).split('-');
      if (parts.length === 3) $('[data-updated]').textContent = 'Atualizado em ' + parts[2] + '/' + parts[1] + '/' + parts[0];
    }

    var chip = $('[data-hero-chip]');
    if (v > 0) {
      $('[data-hero-chip-text]').textContent = brl.format(v) + ' arrecadados de R$ 100 mil';
      chip.hidden = false;
    }

    // Prazo e formulário dos créditos
    if (data.prazo_creditos) {
      var p = String(data.prazo_creditos).split('-');
      var dl = $('[data-deadline]');
      dl.textContent = '⏰ Para entrar nos créditos, apoie até ' + p[2] + '/' + p[1];
      dl.hidden = false;
    }
    if (data.formulario_creditos) {
      var link = $('[data-credits-link]');
      link.href = data.formulario_creditos;
      link.hidden = false;
      $('[data-credits-text]').textContent = 'Depois do Pix, conte pra gente como o seu nome (ou o da sua família) deve aparecer nos créditos.';
    }

    renderTunnel();
  }

  // ?demo=150000 permite testar a barra sem alterar o campanha.json
  var demo = new URLSearchParams(location.search).get('demo');

  fetch('campanha.json', { cache: 'no-store' })
    .then(function (r) { return r.json(); })
    .catch(function () { return { arrecadado: 0 }; })
    .then(function (data) {
      if (demo !== null) data.arrecadado = Number(demo) || 0;
      setupTunnel(data);
    });

  // ---------------------------------------------------------------
  // Teaser: carrega o player do Vimeo só quando a pessoa clica
  // ---------------------------------------------------------------
  var facade = $('.video__facade');
  facade.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.src = facade.getAttribute('data-video');
    iframe.title = 'Teaser de Malu Tatu';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    facade.replaceWith(iframe);
  });

  // ---------------------------------------------------------------
  // Topbar sólida, CTA fixo e animações ao rolar
  // ---------------------------------------------------------------
  var topbar = $('.topbar');
  var sticky = $('[data-sticky-cta]');
  var donate = $('#apoiar');
  var heroEl = $('.hero');
  var donateVisible = false;

  function onScroll() {
    var y = window.scrollY;
    topbar.classList.toggle('is-solid', y > 40);
    var pastHero = y > heroEl.offsetHeight * 0.7;
    var show = pastHero && !donateVisible;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    sticky.tabIndex = show ? 0 : -1;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { revealObs.observe(el); });

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !tunnelShown) { tunnelShown = true; renderTunnel(); }
    }, { threshold: 0.35 }).observe(tunnel);

    new IntersectionObserver(function (entries) {
      donateVisible = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.1 }).observe(donate);
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
    tunnelShown = true;
  }
})();
