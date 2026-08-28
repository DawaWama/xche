(function () {
  var gallery = document.getElementById('event-gallery');
  var status = document.getElementById('event-gallery-status');
  var folder = 'images/havaq2026/';
  var imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

  if (!gallery || !status) return;

  function showStatus(message) {
    status.textContent = message;
  }

  function getImageUrls(fileNames) {
    return fileNames
      .filter(function (fileName) { return imageExtensions.test(fileName); })
      .map(function (fileName) { return new URL(folder + fileName, window.location.href); })
      .sort(function (first, second) {
        return first.pathname.localeCompare(second.pathname, undefined, { numeric: true });
      });
  }

  function renderGallery(urls) {
    gallery.innerHTML = '';
    urls.forEach(function (url) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'media-image-button';
      button.setAttribute('aria-label', 'Դիտել մեծ չափով');

      var image = document.createElement('img');
      image.src = url.href;
      image.alt = 'Խաչատրյանների հավաքը 2026';
      button.appendChild(image);
      gallery.appendChild(button);
    });
    showStatus(urls.length ? '' : 'Այս թղթապանակում լուսանկարներ չկան։');
  }

  fetch(folder + 'images.json')
    .then(function (response) {
      if (!response.ok) throw new Error('Gallery manifest is not available');
      return response.json();
    })
    .then(function (fileNames) {
      renderGallery(getImageUrls(fileNames));
    })
    .catch(function () {
      showStatus('Լուսանկարները բեռնելիս սխալ է տեղի ունեցել։');
    });
})();