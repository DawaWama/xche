(function () {
  var lightbox = document.getElementById('media-lightbox');
  var lightboxImage = document.getElementById('media-lightbox-image');
  var closeButton = document.querySelector('.image-lightbox-close');
  if (!lightbox || !lightboxImage || !closeButton) return;

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.classList.remove('lightbox-open');
  }

  document.addEventListener('click', function (event) {
    var imageButton = event.target.closest('.media-image-button');
    if (!imageButton) return;

    var image = imageButton.querySelector('img');
    if (!image) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();