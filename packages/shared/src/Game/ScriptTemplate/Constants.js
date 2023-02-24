/**
 * Constant used in GameScriptTemplate & ExternalScriptTemplate
 */
module.exports = {
  COMMAND: {
    // Native commands
    MOVE_FORWARD: 'move_forward',
    MOVE_BACKWARD: 'move_backward',
    ROTATE_LEFT: 'rotate_left',
    ROTATE_RIGHT: 'rotate_right',
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
};
