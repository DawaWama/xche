(function () {
  var grid = document.getElementById('people-grid');
  var status = document.getElementById('people-status');
  var DEFAULT_IMAGE = 'images/people/default.avif';
  var PEOPLE_FILES = [1, 2, 3, 4, 5, 6].map(function (branchNumber) {
    return 'data/people/branch-' + branchNumber + '.json';
  });

  if (!grid || !status) return;

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value === null || value === undefined ? '' : value;
    return div.innerHTML;
  }

  function getPeople() {
    return Promise.all(PEOPLE_FILES.map(function (file) {
      return fetch(file).then(function (response) {
        if (!response.ok) throw new Error('Failed to load ' + file);
        return response.json();
      });
    })).then(function (branches) {
      var peopleById = new Map();
      [].concat.apply([], branches).forEach(function (person) {
        if (!peopleById.has(person.id)) peopleById.set(person.id, person);
      });
      return Array.from(peopleById.values());
    });
  }

  function renderPeople(people) {
    people.sort(function (firstPerson, secondPerson) {
      return String(firstPerson.name || '').localeCompare(
        String(secondPerson.name || ''),
        'hy'
      );
    });

    grid.innerHTML = people.map(function (person) {
      var details = [person.secondName, person.fathersName]
        .filter(function (value) { return value !== null && value !== undefined && String(value).trim(); })
        .join(' ');

      return (
        '<a class="person-directory-card" href="tree.html?id=' + encodeURIComponent(person.id) + '">' +
          '<img src="' + escapeHtml(person.imageAddress) + '" alt="" onerror="this.src=\'' + DEFAULT_IMAGE + '\'" />' +
          '<span>' +
            '<span class="person-directory-name">' + escapeHtml(person.name) + '</span>' +
            '<span class="person-directory-detail">' + escapeHtml(details) + '</span>' +
          '</span>' +
        '</a>'
      );
    }).join('');
    status.textContent = people.length + ' հոգի';
  }

  getPeople()
    .then(renderPeople)
    .catch(function () {
      status.textContent = 'Տվյալները բեռնելիս սխալ է տեղի ունեցել։';
    });
})();