/* gallery.js
   - arrows + counter for every .gallery on the page
   - keyboard arrows work when a gallery is focused
   - closes the 'jump to project' menu after picking a project
   Save as: assets/js/gallery.js */

document.addEventListener('DOMContentLoaded', function () {

  /* GALLERIES */
  document.querySelectorAll('.gallery').forEach(function (gallery) {
    var track = gallery.querySelector('.gallery-track');
    var slides = track.querySelectorAll('.slide');
    var prev = gallery.querySelector('.gallery-prev');
    var next = gallery.querySelector('.gallery-next');
    var count = gallery.querySelector('.gallery-count');
    var total = slides.length;

    // one photo (or none): no arrows needed
    if (total < 2) {
      gallery.classList.add('is-single');
      return;
    }

    function current() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }

    function update() {
      var i = current();
      count.textContent = (i + 1) + ' / ' + total;
      prev.disabled = i <= 0;
      next.disabled = i >= total - 1;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    }

    prev.addEventListener('click', function () { goTo(current() - 1); });
    next.addEventListener('click', function () { goTo(current() + 1); });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current() - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current() + 1); }
    });

    update();
  });

  /* JUMP TO PROJECT MENU: close after choosing a link */
  document.querySelectorAll('.jump-menu a').forEach(function (link) {
    link.addEventListener('click', function () {
      var menu = link.closest('details');
      if (menu) menu.removeAttribute('open');
    });
  });

});
