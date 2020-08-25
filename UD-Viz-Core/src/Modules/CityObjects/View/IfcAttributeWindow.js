import { Window } from "../../../Utils/GUI/js/Window";



export class IfcAttributeWindow extends Window {

    constructor(ifcId) {
    super('ifcAttribute', 'ifc Attribute', false);

    this.ifcId = ifcId;

    this.login = "clement.colin69@gmail.com";
    this.psw = "admin";

    this.token = undefined;

    }

    get innerContentHtml() {
        return /*html*/`
        <div class ="box-section"> 
        <input type="checkbox" class="spoiler-check" id="color-layers-spoiler">
        <label for="color-layers-spoiler" class="section-title">Color Layers</Label>
          <div class="spoiler-box">
          </div>
        </div>
        `;
      }

}