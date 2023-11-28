/**
 * /!\ showdown needs to be imported
 *
 * @param {Array<string>} paths - markdown paths
 */
// eslint-disable-next-line no-unused-vars
const addMarkdown = (paths) => {
  const loadMarkdown = () => {
    const mdContainer = document.createElement('div');
    mdContainer.classList.add('md_container');
    mdContainer.hidden = true;
    document.body.appendChild(mdContainer);

    paths.forEach((path) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      xhr.onload = () => {
        if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300) {
          const mdHtml = document.createElement('div');
          mdHtml.innerHTML = new showdown.Converter()
            .makeHtml(xhr.responseText)
            .replace(/..\/img\//g, './assets/img/');

          mdContainer.appendChild(mdHtml);
        }
      };
      xhr.send();
    });

    const showMdContainerButton = document.createElement('button');
    showMdContainerButton.innerText = '?';
    showMdContainerButton.classList.add('show_md_container_button');
    document.body.appendChild(showMdContainerButton);

    showMdContainerButton.onclick = () => {
      mdContainer.hidden = !mdContainer.hidden;
      if (mdContainer.hidden) {
        showMdContainerButton.innerText = '?';
      } else {
        showMdContainerButton.innerText = 'X';
      }
    };
  };

  if (!window.showdown) {
    const scriptTagShowdown = document.createElement('script');
    scriptTagShowdown.src = './assets/js/libs/showdown.min.js';
    document.body.appendChild(scriptTagShowdown);
    scriptTagShowdown.onload = loadMarkdown;
  } else {
    loadMarkdown;
  }
};
