(function () {
  var gallery = document.getElementById('media-gallery');
  var status = document.getElementById('media-status');
  var folders = [
    { path: 'images/logos/', label: 'Logos' },
    { path: 'images/people/', label: 'People' },
    { path: 'images/havaq2026/', label: 'Havaq 2026' }
  ];
  var imageExtensions = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i;

  if (!gallery || !status) return;

  function getImageUrls(directoryHtml, folder) {
    var directoryDocument = new DOMParser().parseFromString(directoryHtml, 'text/html');
    return Array.from(directoryDocument.querySelectorAll('a[href]'))
      .map(function (link) {
        return new URL(link.getAttribute('href'), window.location.href);
      })
      .filter(function (url) {
        return url.pathname.indexOf('/' + folder.path) !== -1 &&
          url.pathname.split('/').pop().match(imageExtensions);
      })
      .map(function (url) {
        return { url: url, label: folder.label };
      });
  }

  function loadFolder(folder) {
    return fetch(folder.path)
      .then(function (response) {
        if (!response.ok) throw new Error('Folder is not available');
        return response.text();
      })
      .then(function (directoryHtml) {
        return getImageUrls(directoryHtml, folder);
      })
      .catch(function () {
        return [];
      });
  }

  function renderGallery(images) {
    gallery.innerHTML = '';
    images.sort(function (first, second) {
      return first.url.pathname.localeCompare(second.url.pathname, undefined, { numeric: true });
    });

    images.forEach(function (imageData) {
      var item = document.createElement('figure');
      item.className = 'media-item';

      var image = document.createElement('img');
      image.src = imageData.url.href;
      image.alt = imageData.label;

      var caption = document.createElement('figcaption');
      caption.textContent = imageData.label + ' / ' + imageData.url.pathname.split('/').pop();

      item.appendChild(image);
      item.appendChild(caption);
      gallery.appendChild(item);
    });

    status.textContent = images.length
      ? images.length + ' լուսանկար'
      : 'Լուսանկարներ չեն գտնվել։';
  }

  Promise.all(folders.map(loadFolder))
    .then(function (folderImages) {
      renderGallery([].concat.apply([], folderImages));
    });
})();