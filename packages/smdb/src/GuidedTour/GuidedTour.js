/**
 * Class: GuidedTour
 * Description :
 * The GuidedTour is an object handling the guidedtour view (should be rename GuidedTourView then)
 *
 *
 * @param { HTMLElement} guidedTourContainer The container of the guided tour
 * @param { import("./GuidedTourController").GuidedTourController } guidedTourController : instance of GuidedTourController
 *
//=============================================================================
 */
export class GuidedTour {
  constructor(guidedTourController) {
    this.domElement = document.createElement('div');

    this.guidedTourWindow = document.createElement('div');
    this.domElement.appendChild(this.guidedTourWindow);

    this.guidedTourTitle = document.createElement('div');
    this.guidedTourWindow.appendChild(this.guidedTourTitle);

    this.guidedTourStepTitle = document.createElement('div');
    this.guidedTourWindow.appendChild(this.guidedTourStepTitle);

    this.guidedTourText1 = document.createElement('div');
    this.guidedTourWindow.appendChild(this.guidedTourText1);

    this.guidedTourDocPreview = document.createElement('div');
    this.guidedTourWindow.appendChild(this.guidedTourDocPreview);

    this.guidedTourDocPreviewImg = document.createElement('img');
    this.guidedTourDocPreview.appendChild(this.guidedTourDocPreviewImg);

    this.tourCpt = document.createElement('div');
    this.guidedTourWindow.appendChild(this.tourCpt);

    const createButton = (label) => {
      const result = document.createElement('button');
      result.setAttribute('type', 'button');
      result.innerText = label;
      return result;
    };

    this.guidedTourNextStepButton = createButton('⇨');
    this.guidedTourWindow.appendChild(this.guidedTourNextStepButton);

    this.guidedTourNextTourButton = createButton('⇨');
    this.guidedTourWindow.appendChild(this.guidedTourNextTourButton);

    this.guidedTourPreviousStepButton = createButton('⇦');
    this.guidedTourWindow.appendChild(this.guidedTourPreviousStepButton);

    this.guidedTourPreviousTourButton = createButton('⇦');
    this.guidedTourWindow.appendChild(this.guidedTourPreviousTourButton);

    this.guidedTourExitButton = createButton('EXIT');
    this.guidedTourWindow.appendChild(this.guidedTourExitButton);

    this.guidedTourStartButton = createButton('START');
    this.guidedTourWindow.appendChild(this.guidedTourStartButton);

    // end DOM element creation

    this.guidedTourController = guidedTourController;

    this.tourIndex = 1; // Current guided tour. Default is 1 (start)

    this.stepIndex = 1; // Current step of the guidedtour. Defautt is 1 (start)

    // boolean to control the state of the guided tour window (open/closed)
    this.guidedTourWindowIsActive = true;

    this.isStart = true;

    this.currentTour = null; // Current guided tour
    this.currentStep = null; // Current step of the current guided tour

    // instance of document browser
    this.documentBrowser = this.guidedTourController.browser;

    this.initializeButtons();
    this.startGuidedTourMode();
  }

  /**
   * Hide or show the guided tour window
   */
  toggleGuidedTourWindow() {
    this.guidedTourWindow.style.display = this.guidedTourWindowIsActive
      ? 'block'
      : 'none';
    this.guidedTourWindowIsActive = !this.guidedTourWindowIsActive;

    if (this.isStart) {
      this.startGuidedTourMode();
      this.isStart = false;
      this.guidedTourController.toggleGuidedTourButtons(true);
    }
  }

  /**
   * Get all available guided tour from the database
   */
  startGuidedTourMode() {
    this.guidedTourController
      .getGuidedTours()
      .then(() => {
        this.previewTour();
      })
      .catch((error) => console.log(error));
  }

  /**
   * Initialize the preview of the guided tour
   */
  previewTour() {
    this.tourCpt.innerText =
      'Tour: ' +
      this.tourIndex +
      ' out of ' +
      this.guidedTourController.guidedTours.length;
    this.guidedTourPreviousTourButton.style.display = 'block';
    this.guidedTourNextTourButton.style.display = 'block';
    // For the demo, until we have more than one finished guided tour
    // we can prevent user from changing tour by hiding the buttons
    if (this.guidedTourController.preventUserFromChangingTour) {
      this.guidedTourPreviousTourButton.style.display = 'none';
      this.guidedTourNextTourButton.style.display = 'none';
    }

    this.guidedTourPreviousStepButton.style.display = 'none';
    this.guidedTourNextStepButton.style.display = 'none';
    this.guidedTourExitButton.style.display = 'none';
    // this.uidedTourText2.style.display = "none";
    this.guidedTourStartButton.style.display = 'block';

    const currentTour = this.guidedTourController.getCurrentTour();
    this.guidedTourTitle.innerText = currentTour
      ? currentTour.name
      : 'No guided tour';
    this.guidedTourText1.innerText = currentTour
      ? currentTour.description
      : 'Please add guided tours';
    this.guidedTourText1.style.height = '45%';
    this.guidedTourStepTitle.innerText = null;
  }

  /**
   * Update step with current step data
   */
  updateStep() {
    this.currentStep = this.guidedTourController.getCurrentStep();
    this.documentBrowser.currentMetadata =
      this.guidedTourController.getCurrentStep().document;
    this.documentBrowser.currentDoc =
      this.guidedTourController.getCurrentStep().document;
    this.documentBrowser.updateBrowser();
    this.guidedTourText1.innerText = this.currentStep.text1;
    this.guidedTourStepTitle.innerText = this.currentStep.title;
    this.documentBrowser.focusOnDoc();
  }

  /**
   * Start guided tour
   */
  startGuidedTour() {
    const currentTour = this.guidedTourController.getCurrentTour();

    if (currentTour && currentTour.extendedDocs.length > 0) {
      this.tourIndex = 1;
      this.stepIndex = 1;
      this.updateStep();
      // Setup the display (hide & show elements)
      this.guidedTourController.toggleGuidedTourButtons(false);
      this.guidedTourDocPreviewImg.style.display = 'none';
      this.guidedTourText1.style.height = '60%';
      this.tourCpt.style.display = 'none';
    } else {
      alert('This guided tour is empty'); // Should never happen. If a guided tour
      // doesn't have steps, then it is not a guided tour
    }
  }

  /**
   * Quit current guided tour
   */
  exitGuidedTour() {
    this.guidedTourController.reset();
  }

  /**
   * Update guided tour preview by clicking on "guidedTourNextTourButton" button
   */
  nextTour() {
    if (this.tourIndex < this.guidedTourController.guidedTours.length) {
      this.guidedTourController.getNextTour();
      this.tourIndex++;
      this.previewTour();
    }
  }

  /**
   * Update guided tour preview by clicking on "guidedTourPreviousTourButton" button
   */
  previousTour() {
    this.guidedTourController.getPreviousTour();
    if (this.tourIndex > 1) {
      this.tourIndex--;
    }
    this.previewTour();
  }

  /**
   * Update step by clicking on "guidedTourNextStepButton" button
   */
  nextStep() {
    if (
      this.stepIndex <
      this.guidedTourController.getCurrentTour().extendedDocs.length
    ) {
      this.stepIndex++;
      this.guidedTourController.getNextStep();
      this.updateStep();
    }
  }

  /**
   * Update step by clicking on "guidedTourPreviousStepButton" button
   */
  previousStep() {
    if (this.stepIndex > 1) {
      this.guidedTourController.getPreviousStep();
      this.stepIndex--;
      this.updateStep();
    }
  }

  /**
   *  Event listeners (buttons)
   */
  initializeButtons() {
    this.guidedTourNextTourButton.addEventListener(
      'mousedown',
      this.nextTour.bind(this),
      false
    );
    this.guidedTourPreviousTourButton.addEventListener(
      'mousedown',
      this.previousTour.bind(this),
      false
    );
    this.guidedTourStartButton.addEventListener(
      'mousedown',
      this.startGuidedTour.bind(this),
      false
    );
    this.guidedTourNextStepButton.addEventListener(
      'mousedown',
      this.nextStep.bind(this),
      false
    );
    this.guidedTourPreviousStepButton.addEventListener(
      'mousedown',
      this.previousStep.bind(this),
      false
    );
    this.guidedTourExitButton.addEventListener(
      'mousedown',
      this.exitGuidedTour.bind(this),
      false
    );
  }
}
