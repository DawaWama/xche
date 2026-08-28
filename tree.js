(function () {
  var peopleMap = {};
  var DEFAULT_IMAGE = 'images/people/default.avif';
  var PEOPLE_FILES = [1, 2, 3, 4, 5, 6].map(function (branchNumber) {
    return 'data/people/branch-' + branchNumber + '.json';
  });

  function getPersonIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var id = parseInt(params.get('id'), 10);
    return isNaN(id) ? 0 : id;
  }

  function getFullName(person) {
    return person.name + ' ' + person.secondName;
  }

  function getDisplayName(person) {
    return person.name + ' ' + person.fathersName;
  }

  function buildPeopleMap(people) {
    people.forEach(function (person) {
      peopleMap[person.id] = person;
    });
  }

  function getAncestors(personId) {
    var chain = [];
    var current = peopleMap[personId];

    while (current && current.fatherId !== null && current.fatherId !== undefined) {
      var father = peopleMap[current.fatherId];
      if (!father) break;
      chain.unshift(father);
      current = father;
    }

    return chain;
  }

  function renderBreadcrumb(person) {
    var nav = document.getElementById('ancestor-breadcrumb');
    if (!nav) return;

    var ancestors = getAncestors(person.id);
    var parts = [];

    ancestors.forEach(function (ancestor) {
      parts.push(
        '<a href="tree.html?id=' + ancestor.id + '">' + escapeHtml(ancestor.name) + '</a>'
      );
    });

    parts.push('<span class="current">' + escapeHtml(person.name) + '</span>');

    nav.innerHTML = parts.join('<span class="sep"> → </span>');
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function parseDate(dateText) {
    if (!dateText || !String(dateText).trim()) return null;

    var parts = String(dateText).split('.');
    if (parts.length !== 3) return null;

    var date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return isNaN(date.getTime()) ? null : date;
  }

  function getAgeAtDeath(birthDate, dieDate) {
    var birth = parseDate(birthDate);
    var death = parseDate(dieDate);
    if (!birth || !death) return null;

    var age = death.getFullYear() - birth.getFullYear();
    var hadBirthday = death.getMonth() > birth.getMonth() ||
      (death.getMonth() === birth.getMonth() && death.getDate() >= birth.getDate());
    if (!hadBirthday) age--;

    return age >= 0 ? age : null;
  }

  function hasValue(value) {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  function getPhoneNumber(phone) {
    var phoneNumber = String(phone).replace(/[^\d+]/g, '').replace(/^00/, '+');
    return /^0\d{8}$/.test(phoneNumber) ? '374' + phoneNumber.slice(1) : phoneNumber.replace('+', '');
  }

  function renderSocialLinks(links) {
    if (!Array.isArray(links) || links.length === 0) return '';

    var validLinks = links.map(function (link) {
      if (typeof link === 'string') {
        var label = 'Սոցիալական կայք';
        if (link.indexOf('facebook.com') !== -1) label = 'Facebook';
        if (link.indexOf('instagram.com') !== -1) label = 'Instagram';
        return { url: link, label: label };
      }
      return link;
    }).filter(function (link) {
      return link && hasValue(link.url) && hasValue(link.label);
    });
    if (validLinks.length === 0) return '';

    return '<div class="person-social"><dt>Սոցիալական կայքեր</dt><dd>' +
      '<span class="social-links">' + validLinks.map(function (link) {
        return '<a href="' + escapeHtml(link.url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(link.label) + '</a>';
      }).join('') + '</span></dd></div>';
  }

  function setupImageLightbox() {
    var detail = document.getElementById('person-detail');
    var lightbox = document.getElementById('image-lightbox');
    var lightboxImage = document.getElementById('image-lightbox-image');
    var closeButton = document.querySelector('.image-lightbox-close');
    if (!detail || !lightbox || !lightboxImage || !closeButton) return;

    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImage.src = '';
      document.body.classList.remove('lightbox-open');
    }

    detail.addEventListener('click', function (event) {
      var imageButton = event.target.closest('.person-photo-button');
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
  }

  function renderPerson(person) {
    var container = document.getElementById('person-detail');
    if (!container) return;

    document.title = getDisplayName(person) + ' — Խաչատրյաններ';
    var ageAtDeath = getAgeAtDeath(person.birthDate, person.dieDate);
    var birthMarkup = hasValue(person.birthDate)
      ? '<div><dt>Ծննդյան ամսաթիվ</dt><dd>' + escapeHtml(person.birthDate) + '</dd></div>'
      : '';
    var deathMarkup = hasValue(person.dieDate)
      ? '<div><dt>Մահվան ամսաթիվ</dt><dd>' + escapeHtml(person.dieDate) + '</dd></div>' +
        (ageAtDeath === null ? '' : '<div><dt>Տարիք</dt><dd>' + ageAtDeath + '</dd></div>')
      : '';
    var phoneMarkup = hasValue(person.phone)
      ? '<div class="person-phone"><dt>Հեռախոս</dt><dd><a href="tel:' + escapeHtml(person.phone) + '">' + escapeHtml(person.phone) + '</a>' +
        '<span class="contact-links">' +
          '<a href="https://wa.me/' + escapeHtml(getPhoneNumber(person.phone)) + '" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><span aria-hidden="true">◉</span> WhatsApp</a>' +
          '<a href="https://t.me/+' + escapeHtml(getPhoneNumber(person.phone)) + '" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><span aria-hidden="true">✈</span> Telegram</a>' +
          '<a href="viber://chat?number=%2B' + escapeHtml(getPhoneNumber(person.phone)) + '" aria-label="Viber"><span aria-hidden="true">◈</span> Viber</a>' +
        '</span></dd></div>'
      : '';
    var socialMarkup = renderSocialLinks(person.socialLinks);
    var descriptionMarkup = hasValue(person.description)
      ? '<p class="person-description">' + escapeHtml(person.description) + '</p>'
      : '';
    var secondaryName = [person.secondName, person.fathersName]
      .filter(hasValue)
      .join(' ');
    var secondaryNameMarkup = secondaryName
      ? '<p class="person-fullname">' + escapeHtml(secondaryName) + '</p>'
      : '';
    var metadata = birthMarkup + deathMarkup + phoneMarkup + socialMarkup;
    var metadataMarkup = metadata
      ? '<dl class="person-meta">' + metadata + '</dl>'
      : '';

    container.innerHTML =
      '<div class="person-card-inner">' +
        '<button type="button" class="person-photo-button" aria-label="Դիտել մեծ չափով">' +
          '<img class="person-photo" src="' + escapeHtml(person.imageAddress) + '" alt="' + escapeHtml(getFullName(person)) + '" onerror="this.src=\'' + DEFAULT_IMAGE + '\'" />' +
        '</button>' +
        '<div class="person-info">' +
          '<h1>' + escapeHtml(person.name) + '</h1>' +
          secondaryNameMarkup +
          metadataMarkup +
          descriptionMarkup +
        '</div>' +
      '</div>';
  }

  function renderSons(person) {
    var section = document.getElementById('sons-section');
    var grid = document.getElementById('sons-grid');
    var title = document.getElementById('sons-title');

    if (!section || !grid) return;

    var sons = (person.sonsIdList || []).map(function (sonId) {
      return peopleMap[sonId];
    }).filter(Boolean);

    sons.sort(function (firstSon, secondSon) {
      var firstBirthDate = parseDate(firstSon.birthDate);
      var secondBirthDate = parseDate(secondSon.birthDate);

      if (!firstBirthDate && !secondBirthDate) return 0;
      if (!firstBirthDate) return 1;
      if (!secondBirthDate) return -1;
      return firstBirthDate.getTime() - secondBirthDate.getTime();
    });

    if (sons.length === 0) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    if (title) {
      title.textContent = 'Որդիներ';
    }

    grid.innerHTML = sons.map(function (son) {
      return (
          '<a class="son-card" href="tree.html?id=' + son.id + '">' +
            '<img src="' + escapeHtml(son.imageAddress) + '" alt="' + escapeHtml(son.name) + '" onerror="this.src=\'' + DEFAULT_IMAGE + '\'" />' +
            '<span>' + escapeHtml(son.name) + '</span>' +
          '</a>'
        );
    }).join('');
  }

  function showError(message) {
    var container = document.getElementById('person-detail');
    if (container) {
      container.innerHTML = '<p class="error">' + escapeHtml(message) + '</p>';
    }
    var section = document.getElementById('sons-section');
    if (section) section.hidden = true;
  }

  function init(people) {
    buildPeopleMap(people);
    setupImageLightbox();
    var personId = getPersonIdFromUrl();
    var person = peopleMap[personId];

    if (!person) {
      showError('Անձը չի գտնվել։');
      return;
    }

    renderBreadcrumb(person);
    renderPerson(person);
    renderSons(person);
  }

  Promise.all(PEOPLE_FILES.map(function (file) {
    return fetch(file).then(function (response) {
      if (!response.ok) throw new Error('Failed to load ' + file);
      return response.json();
    });
  }))
    .then(function (branches) {
      init([].concat.apply([], branches));
    })
    .catch(function () {
      showError('Տվյալները բեռնելիս սխալ է տեղի ունեցել։');
    });
})();
