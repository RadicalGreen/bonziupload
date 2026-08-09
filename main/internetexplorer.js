function isIE() {
  return /MSIE|Trident/.test(window.navigator.userAgent);
}

if (isIE()) {
  document.getElementById("contentie").hidden = false;
}