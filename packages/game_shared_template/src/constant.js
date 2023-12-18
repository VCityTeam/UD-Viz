/**
 * Constant used in @ud-viz/game_shared_template & @ud-viz/game_browser_template
 */
module.exports = {
  COMMAND: {
    // Native commands
    MOVE_FORWARD: 'move_forward',
    MOVE_BACKWARD: 'move_backward',
    ROTATE_LEFT: 'rotate_left',
    ROTATE_RIGHT: 'rotate_right',
    MOVE_UP: 'move_up',
    MOVE_DOWN: 'move_down',
    UPDATE_TRANSFORM: 'update_transform',
    UPDATE_EXTERNALSCRIPT_VARIABLES: 'update_externalscript_variables',
    REMOVE_OBJECT3D: 'remove_object3D',
    MOVE_FORWARD_START: 'move_forward_start',
    MOVE_FORWARD_END: 'move_forward_end',
    MOVE_BACKWARD_START: 'move_backward_start',
    MOVE_BACKWARD_END: 'move_backward_end',
    MOVE_LEFT_START: 'move_left_start',
    MOVE_LEFT_END: 'move_left_end',
    MOVE_RIGHT_START: 'move_right_start',
    MOVE_RIGHT_END: 'move_right_end',
    ROTATE: 'rotate',
    ADD_OBJECT3D: 'add_object3D',
    // Not native for now
    ADD_AVATAR: 'add_avatar',
    REMOVE_AVATAR: 'remove_avatar',
    ADD_NOTE: 'add_note',
  },
  NAME: {
    AVATAR: 'avatar',
  },
  /**
   * These id ar declared here in ud-viz/shared script template constant because these ids have to known by browser and node
   */
  ID_SCRIPT: {
    CAMERA_MANAGER: 'camera_manager_id',
    CONTROLLER_NATIVE_COMMAND_MANAGER: 'controller_native_command_manager_id',
    NOTE_ELEMENT: 'note_element_id',
    NOTE_SOCKET_SERVICE: 'note_socket_service_id',
    NOTE_UI: 'note_ui_id',
    DOM_ELEMENT_3D_CUBE_ID: 'dom_element_3D_id',
  },
};
