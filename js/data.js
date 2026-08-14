/*
  Small query helpers over the ARTWORKS / SERIES globals defined in
  data/artworks.js and data/series.js (loaded before this file).
*/

function getSeriesBySlug(slug) {
  return SERIES.find((s) => s.slug === slug) || null;
}

function getArtworkBySlug(slug) {
  return ARTWORKS.find((a) => a.slug === slug) || null;
}

function getArtworksBySeries(seriesSlug) {
  return ARTWORKS.filter((a) => a.series === seriesSlug);
}

function getFeaturedArtworks(limit) {
  const featured = ARTWORKS.filter((a) => a.featured);
  return (limit ? featured.slice(0, limit) : featured);
}

function seriesCoverImage(series) {
  if (series.coverImage) return series.coverImage;
  const first = getArtworksBySeries(series.slug)[0];
  return first ? first.imageThumb : "";
}

/* ---- shared card markup, used by index.html and work.html ---- */

function renderArtworkCard(artwork) {
  const a = document.createElement("a");
  a.className = "artwork-card";
  a.href = "artwork.html?a=" + encodeURIComponent(artwork.slug);

  a.innerHTML =
    '<div class="artwork-card__frame">' +
      '<img src="' + artwork.imageThumb + '" alt="' + artwork.imageAlt + '" ' +
        'width="' + artwork.imageWidth + '" height="' + artwork.imageHeight + '" loading="lazy">' +
    '</div>' +
    '<h3 class="artwork-card__title">' + artwork.title + '</h3>' +
    '<p class="artwork-card__meta">' + artwork.year + '</p>';

  return a;
}

function renderSeriesCard(series) {
  const a = document.createElement("a");
  a.className = "series-card";
  a.href = "series.html?s=" + encodeURIComponent(series.slug);

  const cover = seriesCoverImage(series);

  a.innerHTML =
    '<div class="series-card__frame">' +
      (cover ? '<img src="' + cover + '" alt="" loading="lazy">' : '') +
    '</div>' +
    '<h3 class="series-card__title">' + series.title + '</h3>' +
    (series.period ? '<p class="series-card__period">' + series.period + '</p>' : '');

  return a;
}
