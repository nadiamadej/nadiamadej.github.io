// assets/js/hero-graphic.js
//
// Animates the hero graphic above project-1: while the mouse is over it,
// every shape continuously loops in a small circle (orbit) AND additionally
// gets pushed away from the cursor the closer it gets (repel). The two
// motions are added together every frame, so you get orbit+repel combined.
//
// HOW TO USE WITH YOUR OWN EXPORTED SVG:
// 1) export your vector graphic as SVG (see notes from earlier in the chat)
// 2) paste its markup into index.html inside <svg id="hero-graphic-svg">
// 3) add class="shape" to every top-level shape or group you want to move
//    independently (works for <circle>, <path>, <g>, anything with a bounding box)
// 4) that's it -- this script finds them automatically, no per-shape setup needed

function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
  } else {
      document.addEventListener("DOMContentLoaded", fn);
  }
}

docReady(function() {

  var svg = document.getElementById('hero-graphic-svg');
  if (!svg) return; // graphic isn't on this page, nothing to do

  var shapeEls = svg.querySelectorAll('.shape');
  if (!shapeEls.length) return;

  // TUNING -- change these to adjust the feel of the animation.
  var ORBIT_RADIUS_MIN = 5;     // smallest orbit loop, in SVG units
  var ORBIT_RADIUS_MAX = 11;    // largest orbit loop, in SVG units
  var ORBIT_SPEED_MIN = 0.0005; // slowest loop speed (radians per ms)
  var ORBIT_SPEED_MAX = 0.0011; // fastest loop speed
  var REPEL_RADIUS = 65;        // how close the cursor must be to push a shape (SVG units)
  var REPEL_STRENGTH = 26;      // how far a shape gets pushed at maximum

  // each shape gets its own home position (from its natural, un-animated
  // bounding box) plus its own randomised orbit radius/speed/phase, so they
  // don't all move in sync
  var shapes = Array.prototype.map.call(shapeEls, function (el, i) {
    var box = el.getBBox();
    return {
      el: el,
      cx: box.x + box.width / 2,
      cy: box.y + box.height / 2,
      orbitRadius: ORBIT_RADIUS_MIN + Math.random() * (ORBIT_RADIUS_MAX - ORBIT_RADIUS_MIN),
      orbitSpeed: ORBIT_SPEED_MIN + Math.random() * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN),
      phase: i * 1.7 + Math.random() * 2
    };
  });

  var mouse = { x: null, y: null };
  var rafId = null;

  function pointerToSvgCoords(evt) {
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    return pt.matrixTransform(ctm.inverse());
  }

  function tick(time) {
    shapes.forEach(function (s) {
      // orbit component: small circular loop around the shape's home point
      var angle = time * s.orbitSpeed + s.phase;
      var ox = Math.cos(angle) * s.orbitRadius;
      var oy = Math.sin(angle) * s.orbitRadius;

      // repel component: pushes further away from the cursor the closer it gets
      var rx = 0, ry = 0;
      if (mouse.x !== null) {
        var currentX = s.cx + ox;
        var currentY = s.cy + oy;
        var dx = currentX - mouse.x;
        var dy = currentY - mouse.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.001) {
          var push = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          rx = (dx / dist) * push;
          ry = (dy / dist) * push;
        }
      }

      // orbit + repel, added together
      s.el.style.transform = 'translate(' + (ox + rx) + 'px,' + (oy + ry) + 'px)';
    });

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (rafId) return;
    shapes.forEach(function (s) { s.el.style.transition = 'none'; });
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    mouse.x = null;
    mouse.y = null;
    // ease smoothly back to resting position once the mouse leaves
    shapes.forEach(function (s) {
      s.el.style.transition = 'transform 0.5s ease-out';
      s.el.style.transform = 'translate(0px, 0px)';
    });
  }

  svg.addEventListener('mouseenter', start);
  svg.addEventListener('mouseleave', stop);
  svg.addEventListener('mousemove', function (evt) {
    var p = pointerToSvgCoords(evt);
    mouse.x = p.x;
    mouse.y = p.y;
  });

  // respect people who've asked their system for less motion: graphic stays still
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    svg.removeEventListener('mouseenter', start);
    svg.removeEventListener('mouseleave', stop);
  }

});
