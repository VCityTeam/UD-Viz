() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/index") }
     */
    const showRoom = window.showRoom;

    const crs = 'EPSG:3857';

    const instance = new showRoom.ShowRoom(
      new showRoom.itowns.Extent(crs, 0, 1, 0, 1)
    );

    console.log(instance);

    resolve();
  });
};
