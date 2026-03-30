(function() {
  'use strict';

  /* ─── CURSOR ─── */
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-aura');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    gsap.to(dot, { x: mouseX, y: mouseY, duration: 0.08 });
  });
  (function animRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.transform = `translate(${ringX - 22}px, ${ringY - 22}px)`;
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button,.testi-btn,.testi-dot,.proj-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  /* ─── PRELOADER ─── */
  const preEl = document.getElementById('preloader');
  const preNum = document.getElementById('pre-pct');
  let prog = 0;
  const ticker = setInterval(() => {
    prog += Math.random() * 22;
    if (prog >= 100) { prog = 100; clearInterval(ticker); }
    preNum.textContent = Math.floor(prog) + '%';
    if (prog === 100) {
      setTimeout(() => {
        gsap.to(preEl, {
          yPercent: -100, duration: 1.1, ease: 'power4.inOut',
          onComplete: () => { preEl.remove(); startSite(); }
        });
      }, 300);
    }
  }, 70);

  function startSite() {
    initLenis();
    initNavbar();
    initHeroCanvas();
    initHeadCanvas();
    initHeroAnim();
    initScrollAnimations();
    initCounters();
    initSkillBars();
    initTestimonials();
    initBTT();
  }

  /* ─── LENIS ─── */
  function initLenis() {
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, syncTouch: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // Anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) lenis.scrollTo(t, { offset: -80, duration: 1.4 });
      });
    });
  }

  /* ─── NAVBAR ─── */
  function initNavbar() {
    const nav = document.getElementById('nav');
    ScrollTrigger.create({
      start: 'top -60',
      onUpdate: s => nav.classList.toggle('stuck', s.scroll() > 60)
    });
    // Hamburger
    const ham = document.getElementById('hamburger');
    const drawer = document.getElementById('mobile-drawer');
    ham.addEventListener('click', () => {
      drawer.classList.toggle('open');
      const spans = ham.querySelectorAll('span');
      if (drawer.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        spans.forEach(s => { s.style.transform=''; s.style.opacity=''; });
      }
    });
    document.querySelectorAll('.drawer-link').forEach(l => {
      l.addEventListener('click', () => {
        drawer.classList.remove('open');
        const spans = ham.querySelectorAll('span');
        spans.forEach(s => { s.style.transform=''; s.style.opacity=''; });
      });
    });
  }

  /* ─── HERO THREE.JS BACKGROUND ─── */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 200);
    cam.position.z = 28;

    // Particles
    const N = 2800;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 130;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.16, color: 0x00c6ff, transparent: true, opacity: 0.6, sizeAttenuation: true
    }));
    scene.add(particles);

    // Floating shapes
    const shapes = [];
    const shapeData = [
      { g: new THREE.IcosahedronGeometry(1.6,0), p:[15,5,-12], c:0x00c6ff },
      { g: new THREE.TorusGeometry(1.3,.45,8,24), p:[-16,7,-14], c:0x7b2ff7 },
      { g: new THREE.OctahedronGeometry(1.5,0), p:[9,-9,-9], c:0xf72f8a },
      { g: new THREE.TetrahedronGeometry(1.6,0), p:[-10,-6,-7], c:0x00c6ff },
      { g: new THREE.TorusGeometry(.9,.3,6,16), p:[17,-5,-15], c:0x7b2ff7 },
    ];
    shapeData.forEach(d => {
      const m = new THREE.MeshBasicMaterial({ color:d.c, wireframe:true, transparent:true, opacity:.28 });
      const mesh = new THREE.Mesh(d.g, m);
      mesh.position.set(...d.p);
      mesh.userData = { sx: Math.random()*.005+.002, sy: Math.random()*.005+.002 };
      scene.add(mesh); shapes.push(mesh);
    });

    let t = 0, mx = 0, my = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / innerWidth - .5) * 2;
      my = (e.clientY / innerHeight - .5) * 2;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      t += .008;
      particles.rotation.y += .0005;
      cam.position.x += (mx * 2.5 - cam.position.x) * .02;
      cam.position.y += (-my * 1.5 - cam.position.y) * .02;
      shapes.forEach((s,i) => {
        s.rotation.x += s.userData.sx;
        s.rotation.y += s.userData.sy;
        s.position.y += Math.sin(t + i) * .004;
      });
      renderer.render(scene, cam);
    };
    animate();
    addEventListener('resize', () => {
      cam.aspect = innerWidth / innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }

  /* ─── 3D HEAD (HOLOGRAPHIC) ─── */
  function initHeadCanvas() {
    const wrap = document.getElementById('head-canvas-wrap');
    const canvas = document.getElementById('head-canvas');
    if (!wrap || !canvas) return;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    cam.position.z = 10;

    const headGroup = new THREE.Group();

    // Main head sphere
    const headGeo = new THREE.SphereGeometry(2.8, 64, 64);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x05050f, metalness: .9, roughness: .15,
      emissive: 0x001a2e, emissiveIntensity: .6
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.scale.set(1, 1.18, .92);
    headGroup.add(headMesh);

    // Wireframe overlay
    const wGeo = new THREE.SphereGeometry(2.85, 22, 22);
    const wMat = new THREE.MeshBasicMaterial({ color: 0x00c6ff, wireframe: true, transparent: true, opacity: .1 });
    const wMesh = new THREE.Mesh(wGeo, wMat);
    wMesh.scale.copy(headMesh.scale);
    headGroup.add(wMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(.22, 16, 16);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 3 });
    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.85, 0.58, 2.55);
    rEye.position.set(0.85, 0.58, 2.55);
    headGroup.add(lEye, rEye);

    // Eye glow lights
    const lLight = new THREE.PointLight(0x00c6ff, 1.5, 5);
    lLight.position.copy(lEye.position);
    const rLight = new THREE.PointLight(0x00c6ff, 1.5, 5);
    rLight.position.copy(rEye.position);
    headGroup.add(lLight, rLight);

    // Scan line (horizontal ring)
    const scanGeo = new THREE.TorusGeometry(2.9, 0.015, 4, 80);
    const scanMat = new THREE.MeshBasicMaterial({ color: 0x00c6ff, transparent: true, opacity: .7 });
    const scanRing = new THREE.Mesh(scanGeo, scanMat);
    scanRing.rotation.x = Math.PI / 2;
    headGroup.add(scanRing);

    // Orbital ring
    const orbGeo = new THREE.TorusGeometry(4.2, 0.025, 6, 100);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x7b2ff7, transparent: true, opacity: .5 });
    const orbRing = new THREE.Mesh(orbGeo, orbMat);
    orbRing.rotation.x = Math.PI * .28;
    orbRing.rotation.z = Math.PI * .08;
    headGroup.add(orbRing);

    // Second orbital ring
    const orb2Geo = new THREE.TorusGeometry(3.8, 0.018, 6, 100);
    const orb2Mat = new THREE.MeshBasicMaterial({ color: 0xf72f8a, transparent: true, opacity: .3 });
    const orbRing2 = new THREE.Mesh(orb2Geo, orb2Mat);
    orbRing2.rotation.x = Math.PI * .6;
    orbRing2.rotation.y = Math.PI * .2;
    headGroup.add(orbRing2);

    // Head particles
    const hPosArr = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.2 + Math.random() * 0.6;
      hPosArr[i*3] = r * Math.sin(phi) * Math.cos(theta);
      hPosArr[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 1.18;
      hPosArr[i*3+2] = r * Math.cos(phi) * .92;
    }
    const hGeo = new THREE.BufferGeometry();
    hGeo.setAttribute('position', new THREE.BufferAttribute(hPosArr, 3));
    const hParticles = new THREE.Points(hGeo, new THREE.PointsMaterial({
      size: 0.06, color: 0x00c6ff, transparent: true, opacity: .5
    }));
    headGroup.add(hParticles);

    scene.add(headGroup);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, .3));
    const dLight = new THREE.DirectionalLight(0x00c6ff, .8);
    dLight.position.set(5, 10, 8);
    scene.add(dLight);
    const dLight2 = new THREE.DirectionalLight(0x7b2ff7, .6);
    dLight2.position.set(-8, -4, 5);
    scene.add(dLight2);

    // Mouse tracking
    let targetRX = 0, targetRY = 0;
    document.addEventListener('mousemove', e => {
      const nx = (e.clientX / innerWidth - .5) * 2;
      const ny = (e.clientY / innerHeight - .5) * 2;
      targetRX = -ny * .28;
      targetRY = nx * .38;
    });

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += .01;

      // Smooth head follow mouse
      headGroup.rotation.x += (targetRX - headGroup.rotation.x) * .06;
      headGroup.rotation.y += (targetRY - headGroup.rotation.y) * .06;

      // Float animation
      headGroup.position.y = Math.sin(time * .8) * .15;

      // Scan line animation (sweep up and down)
      scanRing.position.y = Math.sin(time * 1.2) * 2.6 * 1.18;
      scanMat.opacity = .4 + Math.sin(time * 1.5) * .3;

      // Orbital rings spin
      orbRing.rotation.z += .004;
      orbRing2.rotation.y += .006;

      // Wireframe pulse
      wMat.opacity = .06 + Math.sin(time * 2) * .04;

      // Eye blink (subtle)
      const blink = Math.abs(Math.sin(time * .3)) > .97 ? .1 : 1;
      lEye.scale.y = blink;
      rEye.scale.y = blink;

      // Eye glow pulse
      const glow = 1.5 + Math.sin(time * 2) * .4;
      lLight.intensity = glow;
      rLight.intensity = glow;

      renderer.render(scene, cam);
    };
    animate();

    // Resize
    const ro = new ResizeObserver(() => {
      const W2 = wrap.clientWidth, H2 = wrap.clientHeight;
      cam.aspect = W2 / H2;
      cam.updateProjectionMatrix();
      renderer.setSize(W2, H2);
    });
    ro.observe(wrap);
  }

  /* ─── HERO ANIMATION ─── */
  function initHeroAnim() {
    const tl = gsap.timeline({ delay: .15 });
    tl.from('.hero-tag', { y: 24, opacity: 0, duration: .7, ease: 'power3.out' })
      .from('.hero-h1 .word span', { y: '105%', duration: 1.1, stagger: .1, ease: 'power4.out' }, '-=.4')
      .from('#hero-sub', { y: 22, opacity: 0, duration: .8, ease: 'power3.out' }, '-=.5')
      .from('#hero-btns > *', { y: 18, opacity: 0, stagger: .1, duration: .6, ease: 'power3.out' }, '-=.4')
      .from('.hero-scroll', { opacity: 0, duration: .7 }, '-=.2')
      .from('#head-canvas-wrap', { opacity: 0, scale: .9, duration: 1.2, ease: 'power3.out' }, '-=1.2');
  }

  /* ─── SCROLL ANIMATIONS ─── */
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal-up').forEach(el => {
      gsap.fromTo(el, { y: 52, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
    gsap.utils.toArray('.reveal-left').forEach(el => {
      gsap.fromTo(el, { x: -36, opacity: 0 }, {
        x: 0, opacity: 1, duration: .8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });
    ScrollTrigger.create({
      trigger: '.services-grid', start: 'top 80%',
      onEnter: () => gsap.fromTo('.srv-item', { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: .09, duration: .7, ease: 'power3.out' })
    });
    ScrollTrigger.create({
      trigger: '.projects-grid', start: 'top 82%',
      onEnter: () => gsap.fromTo('.proj-card', { y: 44, opacity: 0 },
        { y: 0, opacity: 1, stagger: .07, duration: .75, ease: 'power3.out' })
    });
  }

  /* ─── COUNTERS ─── */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 85%', once: true,
        onEnter: () => gsap.fromTo({ v: 0 }, { v: +el.dataset.count, duration: 1.8, ease: 'power3.out',
          onUpdate: function() { el.textContent = Math.floor(this.targets()[0].v) + '+'; }
        })
      });
    });
  }

  /* ─── SKILL BARS ─── */
  function initSkillBars() {
    document.querySelectorAll('.sk-bar').forEach(bar => {
      ScrollTrigger.create({
        trigger: bar, start: 'top 90%', once: true,
        onEnter: () => gsap.to(bar, { width: bar.dataset.w + '%', duration: 1.4, ease: 'power3.out', delay: .15 })
      });
    });
  }

  /* ─── TESTIMONIALS ─── */
  function initTestimonials() {
    const track = document.getElementById('testiTrack');
    const dotsWrap = document.getElementById('testiDots');
    const slides = track.querySelectorAll('.testi-slide');
    let current = 0;
    const total = slides.length;
    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    });
    function goTo(n) {
      current = (n + total) % total;
      gsap.to(track, { x: -current * 100 + '%', duration: .75, ease: 'power3.inOut' });
      dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
    document.getElementById('tPrev').addEventListener('click', () => goTo(current - 1));
    document.getElementById('tNext').addEventListener('click', () => goTo(current + 1));
    setInterval(() => goTo(current + 1), 6200);
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    });
  }

  /* ─── BACK TO TOP ─── */
  function initBTT() {
    const btn = document.getElementById('btt');
    ScrollTrigger.create({
      start: 'top -400',
      onUpdate: s => btn.classList.toggle('show', s.scroll() > 400)
    });
  }

})();

function handleForm(e) {
  e.preventDefault();
  const txt = document.getElementById('submitTxt');
  txt.textContent = 'Sending...';
  setTimeout(() => {
    txt.textContent = '✓ Sent! I\'ll reply soon.';
    e.target.reset();
    setTimeout(() => { txt.textContent = 'Send Message →'; }, 4000);
  }, 1600);
}


