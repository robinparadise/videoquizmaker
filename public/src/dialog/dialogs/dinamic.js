/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at https://raw.github.com/mozilla/butter/master/LICENSE */

define( [ "text!dialog/dialogs/dinamic.html", "dialog/dialog" ],
  function( LAYOUT_SRC, Dialog ) {
    Dialog.register( "dinamic", LAYOUT_SRC, function ( dialog, options ) {
        dialog.assignEscapeKey( "default-close" );
        dialog.assignButton( ".close-button", "close" );
        dialog.enableCloseButton();
console.log("[Click for dinamic dialog]", options);

        // Position of the popup
        if (options && options.position) {
            var height = 300;
            var offsetGlobalY = 62 + 17; // ?? No idea
            var offsetGlobalX = 20; // ??
            console.log("[Dialog popup height]", height, dialog.rootElement)
            $(dialog.rootElement).css({
                "left": options.position.left - offsetGlobalX,
                "top": options.position.top - height - offsetGlobalY
            })
        }
    });
});
