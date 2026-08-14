/* Renders the "Recent Work" and "Series" strips on index.html. */

(function () {
  const featuredGrid = document.getElementById("featured-grid");
  if (featuredGrid) {
    getFeaturedArtworks(3).forEach(function (artwork) {
      featuredGrid.appendChild(renderArtworkCard(artwork));
    });
  }

  const seriesGrid = document.getElementById("series-grid");
  if (seriesGrid) {
    SERIES.forEach(function (series) {
      seriesGrid.appendChild(renderSeriesCard(series));
    });
  }
})();
