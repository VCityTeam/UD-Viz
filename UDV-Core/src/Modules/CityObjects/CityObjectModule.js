import { CityObjectProvider } from "./ViewModel/CityObjectProvider";
import { CityObjectWindow } from "./View/CityObjectWindow";

import * as THREE from 'three';

export class CityObjectModule {
  constructor(tilesManager) {
    /**
     * 
     */
    this.provider = new CityObjectProvider(tilesManager);

    /**
     * 
     */
    this.view = new CityObjectWindow(this.provider);
  }
}