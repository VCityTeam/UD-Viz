import { createLabelInput } from '../../../../../HTMLUtil';
import { DocumentProvider } from '../../Core/ViewModel/DocumentProvider';
import { ContributeService } from '../Service/ContributeService';

/**
 * This window is used to update a document. It contains a form that allows to
 * manipulate
 */
export class DocumentUpdateWindow {
  /**
   * Creates a new document update window.
   *
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   * @param {object} provider - document provider
   */
  constructor(contributeService, provider) {
    // create dom ui
    this.domElement = document.createElement('div');

    this.docTitle = document.createElement('h3');
    this.domElement.appendChild(this.docTitle);

    const container = document.createElement('div');

    this.docImage = document.createElement('img');
    this.docImage.setAttribute('alt', 'Document image');
    container.appendChild(this.docImage);

    this.form = document.createElement('form');
    container.appendChild(this.form);

    this.docDescription = createLabelInput('Description', 'text');
    this.docDescription.input.setAttribute('name', 'description');
    this.form.appendChild(this.docDescription.parent);

    this.docPubDate = createLabelInput('PubDate', 'date');
    this.docPubDate.input.setAttribute('name', 'publicationDate');
    this.form.appendChild(this.docPubDate.parent);

    this.docRefDate = createLabelInput('RefDate', 'date');
    this.docRefDate.input.setAttribute('name', 'refDate');
    this.form.appendChild(this.docRefDate.parent);

    this.docSource = createLabelInput('Source', 'text');
    this.docSource.input.setAttribute('name', 'source');
    this.form.appendChild(this.docSource.parent);

    this.docRightsHolder = createLabelInput('RightsHolder', 'text');
    this.docRightsHolder.input.setAttribute('name', 'rightsHolder');
    this.form.appendChild(this.docRightsHolder.parent);

    this.inputUpdate = document.createElement('input');
    this.inputUpdate.setAttribute('type', 'submit');
    this.inputUpdate.value = 'Update';
    this.form.appendChild(this.inputUpdate);

    this.buttonCancel = document.createElement('button');
    this.buttonCancel.innerText = 'Cancel';
    this.buttonCancel.setAttribute('type', 'button');
    this.form.appendChild(this.buttonCancel);

    // end dom ui

    /**
     * The contribute service to perform requests.
     *
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    this.form.onsubmit = () => {
      this._submitUpdate();
      return false;
    };

    this.buttonCancel.onclick = () => {
      this.domElement.remove();
    };

    this.provider = provider;
    this.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.domElement.remove()
    );
  }

  // /////////////////////
  // /// WINDOW APPEARANCE

  /**
   * This function is called when the user clicks on the 'Update' button in a
   * document. It requests the document view to display this window, and
   * change its position to match the document browser. It also updates the
   * field values.
   *
   * @private
   */
  async updateFromDisplayedDocument() {
    // Sets doc attributes in HTML
    const doc = this.provider.getDisplayedDocument();

    if (!doc) {
      this.domElement.remove();
      return;
    }

    this.docTitle.innerText = doc.title;
    this.docImage.src = await this.provider.getDisplayedDocumentImage();
    this.docSource.input.value = doc.source;
    this.docRightsHolder.input.value = doc.rightsHolder;
    this.docDescription.input.value = doc.description;
    this.docPubDate.input.value = new Date(doc.publicationDate)
      .toISOString()
      .substring(0, 10);
    this.docRefDate.input.value = new Date(doc.refDate)
      .toISOString()
      .substring(0, 10);
  }

  // ///////////////
  // /// FORM SUBMIT

  /**
   * Called when the user submits the update form. Updates the document.
   *
   * @private
   */
  async _submitUpdate() {
    const data = new FormData(this.form);
    try {
      await this.contributeService.updateDocument(data);
    } catch (e) {
      alert(e);
    }
  }
}
