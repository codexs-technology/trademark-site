// Auto-generated JS for 12-www (prod)
// Generated on: 09-29-2025 10:29:27

if (typeof jQuery === 'undefined') {
    var jqScript = document.createElement("script");
    jqScript.type = "text/javascript";
    jqScript.src = "https://components.uspto.gov/js/jquery/3.7.0/jquery-3.7.0.min.js";
    document.getElementsByTagName("head")[0].appendChild(jqScript);
}

var dataLayer = window.dataLayer || [];
dataLayer.push({ 'enableRollup': true, 'enableSiteSpecific': true });

var ENV_GTM = 'GTM-5D5BBD';
var enableDAP = true;

var ais_prop_id='UA-21265023-12';

(function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', ENV_GTM);
