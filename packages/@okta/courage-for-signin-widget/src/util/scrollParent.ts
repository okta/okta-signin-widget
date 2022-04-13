import $ from '@okta/courage/src/util/jquery-wrapper';

/*!
 * jQuery UI Scroll Parent @VERSION
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Modifications Copyright 2021 Okta, Inc.
 */

// This is required because SIW doesn't want to include jqueryui even though it's an external dependency of courage
$.fn.scrollParent = function( includeHidden? ) {
    const position = this.css( "position" ),
        excludeStaticParent = position === "absolute",
        overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
        scrollParent = this.parents().filter( function() {
            const parent = $( this );
            if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
                return false;
            }
            return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) +
                parent.css( "overflow-x" ) );
        } ).eq( 0 );

    return position === "fixed" || !scrollParent.length ?
        $( this[ 0 ].ownerDocument || document ) :
        scrollParent;
};
