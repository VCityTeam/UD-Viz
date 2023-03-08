// Code from https://www.w3schools.com/howto/howto_js_draggable.asp
// Make the DIV element draggable:
/**
 *
 * @param {HTMLElement} elmnt The draggable window
 * @param {HTMLElement} dragelmnt The element used to drag the window
 */
export function dragElement(elmnt, dragelmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  dragelmnt.onmousedown = dragMouseDown;

  /**
   *
   * @param {event} e Mouse down event
   */
  function dragMouseDown(e) {
    e = e || window.event;
    // Get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  /**
   *
   * @param {event} e Mouse move event
   */
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // Calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position:
    let newTop = elmnt.offsetTop - pos2;
    if (newTop < 0) {
      newTop = 0;
    }
    let newLeft = elmnt.offsetLeft - pos1;
    if (newLeft < 0) {
      newLeft = 0;
    }
    elmnt.style.top = newTop + 'px';
    elmnt.style.left = newLeft + 'px';
  }

  /**
   *
   */
  function closeDragElement() {
    // Stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
