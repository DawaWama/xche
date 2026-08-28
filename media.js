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

  function getImageUrls(fileNames, folder) {
    return fileNames
      .filter(function (fileName) { return imageExtensions.test(fileName); })
      .map(function (fileName) {
        return { url: new URL(folder.path + fileName, window.location.href), label: folder.label };
      });
  }

  function loadFolder(folder) {
    return fetch(folder.path + 'images.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Folder manifest is not available');
        return response.json();
      })
      .then(function (fileNames) {
        return getImageUrls(fileNames, folder);
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

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'media-image-button';
      button.setAttribute('aria-label', 'Դիտել մեծ չափով');
      button.appendChild(image);

      item.appendChild(button);
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