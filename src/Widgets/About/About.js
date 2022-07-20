/** @format */

// Components
import { ModuleView } from '../Components/ModuleView/ModuleView';

import './About.css';

/**
 * Adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export class AboutWindow extends ModuleView {
  constructor() {
    super();
    // Create DOM element
    const aboutDiv = document.createElement('div');
    aboutDiv.id = 'aboutWindow';
    document.getElementById('contentSection').append(aboutDiv);

    // Create HMTL
    document.getElementById('aboutWindow').innerHTML =
      `<h1> About </h1>
      <div id="text">
             <br>
             <p>This UD-Viz-Core demo is part of the 
             <a target="_blank"
                href="https://github.com/VCityTeam/UD-Viz">Urban Data Viewer</a>
             (UD-Viz) project of the
             <a target="_blank"
                href="https://projet.liris.cnrs.fr/vcity/">VCity project</a>
             from
             <a target="_blank"
                href="https://liris.cnrs.fr/en">LIRIS lab</a>
             (with additional support from 
             <a target="_blank"
                href="http://imu.universite-lyon.fr/"">LabEx IMU</a>).</p>
             <p>UD-Viz-Core demo is powered with
                <ul>
                <li><a href="http://www.itowns-project.org/">iTowns</a></li>
                <li><a target="_blank"
                       href="https://data.grandlyon.com">Lyon Métropole Open Data</a></li>
                </ul>
             </p>
             <p> <b>Legal and operational disclaimer:</b> This demonstration
                and its underlying software are provided “as is”. The authors 
                and contributors disclaim all warranties with regard to the 
                software including all implied warranties of merchantability 
                and fitness for a particular purpose (refer to the spirit of 
                any <a
                 href="https://en.wikipedia.org/wiki/BSD_licenses#2-clause_license_(%22Simplified_BSD_License%22_or_%22FreeBSD_License%22)">BSD
                 license</a> dislaimer).
             </p>
             <p>
                Nevertheless, if you notice any issue, help us by <a
                href="https://github.com/MEPP-team/UD-Viz/issues">openning an 
                issue on github</a>
             </p>
             <p>
                Concerning user contributed data:
                <ul>
                    <li>
                        the free usage with no warranty spirit also applies
                        to any user contributed data : in particular there are
                        no backups of any user contributed/uploaded data.
                    </li>
                    <li>
                        if you are a copyright owner and believe that content 
                        available in this demo infringes one or more of your 
                        copyrights, please <a
                        href="https://github.com/VCityTeam/UD-Viz/issues">open an 
                        issue on github</a> so that we can (best effort)
                         remove it from this site
                    </li>
                </ul>
             </p>
             <p style="display: inline-block; color: white; margin: 0;">
             Icons made by <a href="https://www.freepik.com/"
             title="Freepik">Freepik</a> from
             <a href="https://www.flaticon.com/"
             title="Flaticon">www.flaticon.com</a><br> is licensed by
             <a href="http://creativecommons.org/licenses/by/3.0/"
             title="Creative Commons BY 3.0" target="_blank">
             CC 3.0 BY</a>
         </p>
        </div>
        `;
  }

  // ///// MODULE VIEW MANAGEMENT
  enableView() {
    document
      .getElementById('aboutWindow')
      .style.setProperty('display', 'block');
  }

  disableView() {
    document.getElementById('aboutWindow').style.setProperty('display', 'none');
  }
}
