# HTML Character Sheets

This is a collection of tabletop character sheets converted to html for ease of use and added features that
would not be present in PDFs.

## Usage

Double clicking on a text field will allow you to edit it, if you don't like this, right click on the text
field to lock it and the only way to edit it would be to right click and click edit.

You can override auto calculated fields by right clicking and clicking override, you can right click and
click reset if you want to go back to it being auto calculated.

Clicking on a skill that you are proficient in will turn the dot red, this indicates expertise.

If you don't like the dynamic font size or want to change the min/max size, you can do so by right clicking
a text field and expanding the font menu.

### Saving Data

There is an auto save feature built in (using localStorage if you know what that means), however this
auto-save feature is not permanent. If you transfer the file to another computer or clear your browser's
data, you will lose all of the character data unless you manually save the character sheet. This is done
using the shortcut ctrl+s and you can simply override the file you are currently working on. You can likely
rely on the autosave to keep track of temporary information like HP and such, but any permanent changes
should be saved with ctrl+s.

Your characters name MUST be saved using ctrl+s, if you do not do so, it will appear that all of your
information was lost, this is not the case, just rename your character to the exact same thing you changed
it to before, reload the page and it should all come back. Just remember to ctrl+s this time.

### Printing

A lot of people prefer pen and paper but like to have permanent information neatly typed out. You can
easily print out the character sheet using ctrl+p, however I would recommend opening the more settings
option in chrome and changing margins to none for the best print quality.


## Building

Make sure to run `npm install` after a pull request to ensure your dependencies are up to date.

To create a single minified HTML file from the source, run the following command:

`node build.js [file1 [file2...]]`

or

`npm run build [file1 [file2...]]`

If no arguments are provided, this will build all of the HTML file in the top level of the src directory.
All resources referenced in the html will be pulled, minified, and injected into the HTML before the HTML
file itself is minified.  The ".html" extension is optional when running this script.

Currently, the following file types are supported in the build process as includes in the HTML:
- CSS
- JS
- SVG

### Running

Opening the HTML file that you are working in a browser on is all you need to do to run the project,
however there is a start.js script provided to allow for ease of use (e.g. run configurations).

`node start.js [file1 [file2...]]`

or

`npm run start [file1 [file2...]]`