/* Renders work.html: series grid (default) or a flat all-artwork grid,
   toggled without a page reload. The current view is reflected in the URL
   (?view=all) so it can be linked to directly. */

(function () {
  const seriesGrid = document.getElementById("series-grid");
  const allGrid = document.getElementById("all-grid");
  const seriesView = document.getElementById("series-view");
  const allView = document.getElementById("all-view");
  const seriesBtn = document.getElementById("view-series-btn");
  const allBtn = document.getElementById("view-all-btn");

  SERIES.forEach(function (series) {
    seriesGrid.appendChild(renderSeriesCard(series));
  });

  ARTWORKS.forEach(function (artwork) {
    allGrid.appendChild(renderArtworkCard(artwork));
  });

  function showView(view) {
    const isAll = view === "all";
    seriesView.hidden = isAll;
    allView.hidden = !isAll;
    seriesBtn.setAttribute("aria-pressed", String(!isAll));
    allBtn.setAttribute("aria-pressed", String(isAll));
  }

  seriesBtn.addEventListener("click", function () {
    showView("series");
    history.replaceState(null, "", "work.html");
  });

  allBtn.addEventListener("click", function () {
    showView("all");
    history.replaceState(null, "", "work.html?view=all");
  });

  const params = new URLSearchParams(window.location.search);
  showView(params.get("view") === "all" ? "all" : "series");
})();
