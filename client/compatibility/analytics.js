//analytics
(function(window, document, script, variableName, scriptElement, firstScript) {
  window['GoogleAnalyticsObject'] = variableName;
  window[variableName] || (window[variableName] = function() {
    (window[variableName].q = window[variableName].q || []).push(arguments)
  });
  window[variableName].l = +new Date;
  scriptElement = document.createElement(script);
  firstScript = document.getElementsByTagName(script)[0];
  scriptElement.src = '//www.google-analytics.com/analytics.js';
  firstScript.parentNode.insertBefore(scriptElement, firstScript)
}(window, document, 'script', 'ga'));

ga('create', 'UA-44816550-3', 'cityio.nl');
ga('send', 'pageview');