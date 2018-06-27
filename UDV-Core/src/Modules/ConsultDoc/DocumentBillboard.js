/**
 * Class: DocumentBillboard
 * Description :
 * The DocumentBrowser is an object in charge of displaying documents in the form of billboards
 * WORK IN PROGRESS
 */

export function DocumentBillboard(browserContainer)
{

    this.windowIsActive = true;

    this.update = function update()
    {
    }

    this.refresh = function refresh()
    {
        this.activateWindow(this.windowIsActive);
    }


    this.activateWindow = function activateWindow(active)
    {
        if (typeof active != 'undefined')
        {
            this.windowIsActive = active;
        }
    }

}
