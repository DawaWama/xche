(function () {
  var input = document.getElementById('person-search-input');
  var status = document.getElementById('person-search-status');
  var results = document.getElementById('person-search-results');
  var DEFAULT_IMAGE = 'images/people/default.avif';
  var PEOPLE_FILES = [1, 2, 3, 4, 5, 6].map(function (branchNumber) {
    return 'data/people/branch-' + branchNumber + '.json';
  });

  if (!input || !status || !results) return;

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getSearchText(person) {
    return [person.name, person.secondName, person.fathersName]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();
  }

  function renderResults(people) {
    var query = input.value.trim().toLocaleLowerCase();
    var matches = query
      ? people.filter(function (person) {
          return getSearchText(person).indexOf(query) !== -1;
        })
      : [];

    status.textContent = query && matches.length > 0
      ? matches.length + ' անձ գտնվեց'
      : '';

    if (!query || matches.length === 0) {
      results.innerHTML = query ? '<p>Անձ չի գտնվել։</p>' : '';
      return;
    }

    results.innerHTML = matches.map(function (person) {
      return (
        '<a class="person-search-result" href="tree.html?id=' + person.id + '">' +
          '<img src="' + escapeHtml(person.imageAddress) + '" alt="" onerror="this.src=\'' + DEFAULT_IMAGE + '\'" />' +
          '<span><span class="person-search-result-name">' + escapeHtml(person.name) + '</span>' +
          '<span class="person-search-result-parent">' + escapeHtml(person.secondName) + '</span></span>' +
        '</a>'
      );
    }).join('');
  }

  Promise.all(PEOPLE_FILES.map(function (file) {
    return fetch(file).then(function (response) {
      if (!response.ok) throw new Error('Failed to load ' + file);
      return response.json();
    });
  }))
    .then(function (branches) {
      var people = [].concat.apply([], branches);
      input.addEventListener('input', function () {
        renderResults(people);
      });
    })
    .catch(function () {
      status.textContent = 'Տվյալները բեռնելիս սխալ է տեղի ունեցել։';
    });
})();