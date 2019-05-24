document.addEventListener('DOMContentLoaded', function(){
  let itemsArray = [];
  const sidebar = document.querySelector('.Frame-body');

  const searchWrapper = document.createElement('div');
  const searchField = document.createElement('input');
  const treeItemsWrapper = document.querySelector('.Tree-items');
  const proposals = document.createElement('div');
  const emptyResults = document.createElement('span');

  searchField.setAttribute('placeholder', 'Find component');
  searchWrapper.classList.add('fractal-search');
  proposals.classList.add('fractal-search__proposals', 'empty');
  emptyResults.innerHTML = 'No matches were found';

  searchWrapper.appendChild(searchField);

  sidebar.appendChild(searchWrapper);

  searchWrapper.appendChild(proposals);

  proposals.appendChild(emptyResults);

  getItems();

  searchField.addEventListener('input', (e) => {
    const activeElems = proposals.querySelectorAll('a');
    let isActive = false;

    if(activeElems !== null) {
      activeElems.forEach((item) => {
        item.classList.remove('active');
      });
    }

    if(e.target.value.trim() === '') {
      proposals.classList.add('empty');
      return;
    }

    if(e.target.value !== '') {
      proposals.classList.remove('empty');
      itemsArray.forEach((item) => {
        if(item.innerHTML.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1) {
          isActive = true;
          item.classList.add('active');
        }
      });

      if(!isActive) {
        emptyResults.classList.add('active');
      }
      else {
        emptyResults.classList.remove('active');
      }
      return;
    }
  });

  function getItems() {
    let elements = treeItemsWrapper.querySelectorAll('.Tree-entityLink');

    elements.forEach((item) => {
      let key;
      const elem = document.createElement('a');
      const parent = item.closest('.Tree-collection');
      const link = item.getAttribute('href');
      let parentName;

      let linkArr = link.split('/');
      let name = linkArr[linkArr.length - 1];
      name = name.charAt(0).toUpperCase() + name.substr(1);
      name = name.replace('--default', '').replace('--', ' ').replace(/-/g, ' ');

      elem.setAttribute('href', link);
      elem.innerHTML = name;
      itemsArray.push(elem);
    });

    itemsArray.sort((a, b) => {
      if(a.innerHTML.toLowerCase() > b.innerHTML.toLowerCase()) {
        return 1;
      }
      else if(a.innerHTML.toLowerCase() < b.innerHTML.toLowerCase()) {
        return -1;
      }
      return 0;
    });

    itemsArray.forEach((item) => {
      proposals.appendChild(item);
    });
  }
});