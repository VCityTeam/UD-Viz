import udvizBrowserPackage from '@ud-viz/browser/package.json';

import './Reception.css';

// TODO all HARD CODED values should be in a config file

export class ReceptionView {
  constructor() {
    // Build html
    this.rootHtml = document.createElement('section');

    const panel = document.createElement('div');
    panel.setAttribute('id', 'panel');
    this.rootHtml.appendChild(panel);

    const header = document.createElement('div');
    header.setAttribute('id', 'header');
    panel.appendChild(header);

    const h1 = document.createElement('h1');
    header.appendChild(h1);

    const labelH1 = document.createElement('div');
    labelH1.innerHTML = 'ud-viz';
    h1.appendChild(labelH1);

    const versionLink = document.createElement('a');
    versionLink.setAttribute('id', 'version');
    versionLink.setAttribute('target', '_blank');
    versionLink.setAttribute(
      'href',
      'https://github.com/VCityTeam/UD-Viz/releases'
    );
    versionLink.innerHTML = udvizBrowserPackage.version;
    h1.appendChild(versionLink);

    const contentWrapper = document.createElement('div');
    contentWrapper.setAttribute('id', 'contentWrapper');
    panel.appendChild(contentWrapper);

    const content = document.createElement('div');
    content.setAttribute('id', 'content');
    contentWrapper.appendChild(content);

    const addToContent = (title, list) => {
      const contentH2 = document.createElement('h2');
      contentH2.innerHTML = title;
      content.appendChild(contentH2);

      const contentUl = document.createElement('ul');
      content.appendChild(contentUl);

      list.forEach((l) => {
        const href = l.href;
        const label = l.label;
        const li = document.createElement('li');
        contentUl.appendChild(li);

        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.innerHTML = label;
        li.appendChild(link);
      });
    };

    addToContent('Learn', [
      {
        href: 'https://github.com/VCityTeam/UD-Viz/blob/master/Doc/Devel/LocalGameTutorial.md',
        label: 'Game tutorial',
      },
    ]);

    addToContent('Community', [
      { href: 'https://projet.liris.cnrs.fr/vcity/', label: 'Website' },
      { href: '../docs/html/index.html', label: 'Documentation' },
    ]);

    addToContent('Code', [
      { href: 'https://github.com/VCityTeam/UD-Viz', label: 'Github' },
      { href: 'https://www.npmjs.com/package/ud-viz', label: 'Npm package' },
    ]);

    const viewer = document.createElement('div');
    viewer.setAttribute('id', 'viewer');
    this.rootHtml.appendChild(viewer);

    const titleProjectUdviz = document.createElement('h1');
    titleProjectUdviz.classList.add('projects_section_title');
    titleProjectUdviz.innerHTML = '@ud-viz/browser';
    viewer.appendChild(titleProjectUdviz);

    const containerProject = document.createElement('div');
    containerProject.setAttribute('id', 'prj_udviz');
    containerProject.classList.add('projects');
    viewer.appendChild(containerProject);

    const titleProjectUdvizGame = document.createElement('h1');
    titleProjectUdvizGame.classList.add('projects_section_title');
    titleProjectUdvizGame.innerHTML = '@ud-viz/browser Game';
    viewer.appendChild(titleProjectUdvizGame);

    const containerProjectGame = document.createElement('div');
    containerProjectGame.setAttribute('id', 'prj_udgame');
    containerProjectGame.classList.add('projects');
    viewer.appendChild(containerProjectGame);

    const addProjectElement = (name, parentEl, href, title, srcImg) => {
      const newProject = document.createElement('a');
      newProject.href = href;
      newProject.title = title;
      newProject.target = '_blank';
      newProject.rel = 'noopener';
      parentEl.appendChild(newProject);

      const newProjectImg = document.createElement('img');
      newProjectImg.src = srcImg;
      newProjectImg.loading = 'lazy';
      newProject.appendChild(newProjectImg);

      const newProjectNameHoverDiv = document.createElement('div');
      newProjectNameHoverDiv.innerHTML = name;
      newProject.appendChild(newProjectNameHoverDiv);
    };

    addProjectElement(
      'All Widgets',
      containerProject,
      './assets/html/AllWidget.html',
      `This example implements all widgets and extensions currently available. As of today, this includes :
            \n- Temporal            \n- Help & About            \n- Documents            \n- Contribute            \n- Guided tours            \n- Authentication            \n- Documents to validate            \n- Document comments            \n- Geocoding            \n- 3DTiles debug            \n- Camera positioner            \n- Document links`,
      './assets/img/reception/AllWidgets.png'
    );

    addProjectElement(
      'Worldmap',
      containerProject,
      './assets/html/WorldMap/example.html',
      'This example use IGN basemap to be able to navigate all over the world',
      './assets/img/reception/WorldMap.png'
    );

    addProjectElement(
      'Billboard',
      containerProject,
      './assets/html/Billboard.html',
      'This example implements a billboard (ie an embeded html content in a 3D view).',
      './assets/img/reception/billboard.png'
    );

    addProjectElement(
      'Document Widget',
      containerProject,
      'examples/DocumentWidget/example.html',
      'In this example you can consult documents in a document browser and search them using keywords and other fields.',
      './assets/img/reception/DocumentWidget.png'
    );

    addProjectElement(
      'Geocoding Widget',
      containerProject,
      'examples/GeocodingWidget/example.html',
      'Geocoding allows a user to navigate in the city by searching addresses or place names.',
      './assets/img/reception/GeocodingWidget.png'
    );

    addProjectElement(
      'BaseMap Widget',
      containerProject,
      'examples/BaseMapWidget/example.html',
      'BaseMap widget allows a user to select which background to use between those set up in the config file.',
      './assets/img/reception/BaseMapWidget.png'
    );

    addProjectElement(
      'Camera Positioner Widget',
      containerProject,
      'examples/CameraPositionerWidget/example.html',
      'The camera positioner is a tool that show the coordinates and the orientation of the camera.',
      './assets/img/reception/CameraPositionerWidget.png'
    );

    addProjectElement(
      'Slideshow Widget',
      containerProject,
      'examples/SlideShow/slideShow.html',
      'The SlideShow allows to display images and videos on a plane geometry.',
      './assets/img/reception/CameraPositionerWidget.png'
    );

    addProjectElement(
      '3DTilesDebug Widget',
      containerProject,
      'examples/3DTilesDebugWidget/example.html',
      '3DTiles Debug displays a window which shows various information about 3DTiles objects and city objects.',
      './assets/img/reception/3DTilesDebugWidget.png'
    );

    addProjectElement(
      'CityObject Widget',
      containerProject,
      'examples/CityObjectWidget/example.html',
      'This extensions allows the user to explore city objects and color them according to filters.',
      './assets/img/reception/CityObjectWidget.png'
    );

    addProjectElement(
      'LayerChoice Widget',
      containerProject,
      'examples/LayerChoiceWidget/example.html',
      'This extensions interact with layers',
      './assets/img/reception/LayerChoiceWidget.png'
    );

    addProjectElement(
      'Temporal Widget',
      containerProject,
      'examples/TemporalWidget/example.html',
      'This extensions allows the user to explore city objects and color them according to filters.',
      './assets/img/reception/TemporalWidget.png'
    );

    addProjectElement(
      'GeoJSON',
      containerProject,
      './assets/html/GeoJson.html',
      `This example visualizes several GeoJSON datasets (such as bus lines, Velo'v stations, and humidity zones) alongside 3D planar data.`,
      './assets/img/reception/GeoJSON.png'
    );

    addProjectElement(
      'Local Avatar Game',
      containerProjectGame,
      './assets/html/AvatarGame.html',
      'This example implements a local mini game illustrating an avatar walking in the city',
      './assets/img/reception/AvatarGame.png'
    );

    addProjectElement(
      'Local Avatar Game with Shader',
      containerProjectGame,
      './assets/html/LocalAvatar.html',
      'This example implements a local mini game illustrating an avatar walking in the city with collision and shader pass.',
      './assets/img/reception/LocalAvatar.png'
    );

    addProjectElement(
      'Local Zeppelin Game',
      containerProjectGame,
      './assets/html/LocalGame.html',
      'This example implements a local mini game builded with the ud-viz game engine',
      './assets/img/reception/LocalGame.png'
    );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }
}
