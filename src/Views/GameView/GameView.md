# GameView

This document explains how works the refresh pass of the GameView class.

Below this is what happen when you start a GameView:

```mermaid
stateDiagram
    state GameView{
        interpolator
        note left of interpolator : an interpolator of WorldState local or distant (see WorldStateInterpolator class)
    }
    GameView --> start
    note left of start : start method take a WorldState as argument
    start --> Compute_itowns_Extent: if WorldState has an origin
    start --> init_THREE.JS : if WorldState has not an origin
    Compute_itowns_Extent --> View3D.initItownsView
    View3D.initItownsView --> Disable_itowns_rendering
    state View_initialized{
        THREE.Scene_initialized
        THREE.Camera_initialized
        THREE.Renderer_initialized
        itowns.Extent_initialized
    }
    state View_initialized <<join>>
    Disable_itowns_rendering --> View_initialized
    note left of Disable_itowns_rendering : by default itownsRendering = false
    init_THREE.JS --> View_initialized
    View_initialized --> inputManager_start_listening
    inputManager_start_listening --> initScene
    note left of initScene : georeference object3D + read config game + add lights
    state tick{
        tickRequesters --> updateGameObject
        note left of updateGameObject : done by pulling last states of the interpolator
        updateGameObject --> computeNearFarCamera : if GameView isRendering = true and itownsRendering = false

            computeNearFarCamera --> GameView.render


    }
    initScene --> requestAnimationFrame
    requestAnimationFrame --> tick
    tick --> requestAnimationFrame

```

Note you can switch from GameView rendering to the itowns rendering pass using ```GameView.setItownsRendering``` method.

```mermaid
stateDiagram
setItownsRendering --> True
setItownsRendering --> False
True --> add_PlanarControl
add_PlanarControl --> add_computeNearFar_Requester
add_computeNearFar_Requester --> enable_itowns_rendering
False --> dispose_PlanarControl
dispose_PlanarControl --> remove_computeNearFar_Requester
remove_computeNearFar_Requester --> disable_itowns_rendering

```
