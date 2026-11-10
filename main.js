(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');

  var heroEl = document.querySelector('.hero');
  function onScroll(){
    if(nav && !nav.classList.contains('always-solid')){
      nav.classList.toggle('solid', window.scrollY > 40);
    }
    if(heroEl){
      document.body.classList.toggle('past-hero', window.scrollY > heroEl.offsetHeight * 0.7);
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  if(toggle){
    toggle.addEventListener('click', function(){
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.nav-links a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
    });
  }

  // scroll reveal, reversible: elements fade out again when they leave the viewport
  var srs = document.querySelectorAll('.sr');
  if('IntersectionObserver' in window && !reduce){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle('in', e.isIntersecting); });
    }, {threshold:0.15, rootMargin:'0px 0px -6% 0px'});
    srs.forEach(function(el){ io.observe(el); });
  } else {
    srs.forEach(function(el){ el.classList.add('in'); });
  }

  // slow parallax on large background images
  var layers = document.querySelectorAll('[data-parallax]');
  if(layers.length && !reduce){
    var ticking = false;
    function para(){
      layers.forEach(function(el){
        var r = el.parentElement.getBoundingClientRect();
        if(r.bottom < 0 || r.top > window.innerHeight) return;
        var speed = parseFloat(el.dataset.parallax) || 0.2;
        // page headers sit at the top of the page, so anchor them to 0 at load
        var offset = el.parentElement.classList.contains('page-head')
          ? -r.top * speed
          : (r.top + r.height/2 - window.innerHeight/2) * -speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(para); ticking = true; } }, {passive:true});
    para();
  }

  // home hero: subtle depth on pointer move
  var heroBg = document.querySelector('.hero-bg');
  if(heroBg && !reduce && window.matchMedia('(pointer:fine)').matches){
    var hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', function(e){
      var x = (e.clientX / window.innerWidth - 0.5) * -18;
      var y = (e.clientY / window.innerHeight - 0.5) * -12;
      heroBg.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    });
    heroBg.style.transition = 'transform 1.4s cubic-bezier(.2,.7,.2,1)';
  }

  // scrollspy: highlight the nav tab for the section in view
  var spyLinks = document.querySelectorAll('.nav-links a[data-spy]');
  if(spyLinks.length && 'IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting) return;
        spyLinks.forEach(function(a){ a.classList.toggle('active', a.dataset.spy === e.target.id); });
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    spyLinks.forEach(function(a){
      var s = document.getElementById(a.dataset.spy);
      if(s) spy.observe(s);
    });
  }

  // gallery: show 12 first, then everything
  var gallery = document.querySelector('.gallery');
  var moreBtn = document.querySelector('.more-btn');
  if(moreBtn){ moreBtn.addEventListener('click', function(){ gallery.classList.remove('collapsed'); }); }
  var revBtn = document.querySelector('.more-reviews');
  if(revBtn){ revBtn.addEventListener('click', function(){ document.querySelector('.reviews').classList.remove('collapsed'); }); }

  // gallery filters + lightbox
  var items = Array.prototype.slice.call(document.querySelectorAll('.g-item'));
  document.querySelectorAll('.filters button').forEach(function(b){
    b.addEventListener('click', function(){
      // picking a category shows every photo in it, not just the first 12
      if(gallery && b.dataset.f !== 'all') gallery.classList.remove('collapsed');
      document.querySelectorAll('.filters button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      var f = b.dataset.f;
      items.forEach(function(it){ it.classList.toggle('hide', f !== 'all' && it.dataset.cat.indexOf(f) === -1); });
    });
  });
  var lb = document.querySelector('.lightbox');
  if(lb && items.length){
    var lbImg = lb.querySelector('img'), idx = 0;
    function visible(){ return items.filter(function(i){ return !i.classList.contains('hide'); }); }
    function show(i){
      var v = visible(); idx = (i + v.length) % v.length;
      var im = v[idx].querySelector('img');
      lbImg.src = im.src; lbImg.alt = im.alt;
    }
    items.forEach(function(it){
      it.addEventListener('click', function(){ show(visible().indexOf(it)); lb.classList.add('open'); });
    });
    lb.querySelector('.lb-close').onclick = function(){ lb.classList.remove('open'); };
    lb.querySelector('.lb-prev').onclick = function(e){ e.stopPropagation(); show(idx-1); };
    lb.querySelector('.lb-next').onclick = function(e){ e.stopPropagation(); show(idx+1); };
    lb.addEventListener('click', function(e){ if(e.target === lb) lb.classList.remove('open'); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key === 'Escape') lb.classList.remove('open');
      if(e.key === 'ArrowLeft') show(idx-1);
      if(e.key === 'ArrowRight') show(idx+1);
    });
  }

  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();
})();
