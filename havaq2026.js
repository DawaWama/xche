(function () {
  var gallery = document.getElementById('event-gallery');
  var status = document.getElementById('event-gallery-status');
  var folder = 'images/havaq2026/';
  var imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

  if (!gallery || !status) return;

  function showStatus(message) {
    status.textContent = message;
  }

  function getImageUrls(directoryHtml) {
    var documentFragment = new DOMParser().parseFromString(directoryHtml, 'text/html');
    return Array.from(documentFragment.querySelectorAll('a[href]'))
      .map(function (link) {
        return new URL(link.getAttribute('href'), window.location.href);
      })
      .filter(function (url) {
        return url.pathname.indexOf('/images/havaq2026/') !== -1 &&
          url.pathname.split('/').pop().match(imageExtensions);
      })
      .sort(function (first, second) {
        return first.pathname.localeCompare(second.pathname, undefined, { numeric: true });
      });
  }

  function renderGallery(urls) {
    gallery.innerHTML = '';
    urls.forEach(function (url) {
      var image = document.createElement('img');
      image.src = url.href;
      image.alt = 'Խաչատրյանների հավաքը 2026';
      gallery.appendChild(image);
    });
    showStatus(urls.length ? '' : 'Այս թղթապանակում լուսանկարներ չկան։');
  }

  fetch(folder)
    .then(function (response) {
      if (!response.ok) throw new Error('Gallery folder is not available');
      return response.text();
    })
    .then(function (directoryHtml) {
      renderGallery(getImageUrls(directoryHtml));
    })
    .catch(function () {
      showStatus('Լուսանկարները ցուցադրելու համար սերվերը պետք է թույլ տա թղթապանակի ցուցակի դիտումը։');
    });
})();