module.exports = class AbstractContext {
  constructor(arrayClassScript) {
    // script
    this.classScripts = {};
    if (arrayClassScript) {
      arrayClassScript.forEach((gS) => {
        this.classScripts[gS.name] = gS;
      });
    }
  }

  createInstanceOf(id, object3D, modelVariables) {
    const constructor = this.classScripts[id];
    if (!constructor) {
      console.log('script loaded');
      for (const id in this.classScripts) {
        console.log(this.classScripts[id]);
      }
      throw new Error('no script with id ' + id);
    }
    return new constructor(this, object3D, modelVariables);
  }
};
