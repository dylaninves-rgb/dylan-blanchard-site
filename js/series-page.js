/* Renders series.html from the ?s= query param. */

(function () {
  const params = new URLSearchParams(window.location.search);
  const series = getSeriesBySlug(params.get("s"));
  const header = document.getElementById("series-header");
  const grid = document.getElementById("series-artwork-grid");

  if (!series) {
    header.innerHTML =
      '<p class="series-header__period">Series not found</p>' +
      '<h1 class="series-header__title">This series doesn’t exist</h1>' +
      '<p class="series-header__statement">It may have moved. ' +
      '<a class="text-link" href="work.html?view=series" style="margin-left:0.5em">See all series</a></p>';
    return;
  }

  document.title = series.title + " — Bylan Blanchard";
  document.getElementById("page-title").textContent = document.title;

  header.innerHTML =
    '<p class="series-header__period">' + series.period + '</p>' +
    '<h1 class="series-header__title">' + series.title + '</h1>' +
    '<p class="series-header__statement">' + series.statement + '</p>';

  getArtworksBySeries(series.slug).forEach(function (artwork) {
    grid.appendChild(renderArtworkCard(artwork));
  });
})();
