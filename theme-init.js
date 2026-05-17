(function () {
  var key = "poketier-theme";
  var stored = localStorage.getItem(key);
  document.documentElement.setAttribute("data-theme", stored === "dark" ? "dark" : "light");
})();
