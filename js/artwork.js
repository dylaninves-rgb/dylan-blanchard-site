/* Renders artwork.html from the ?a= query param. */

(function () {
  const params = new URLSearchParams(window.location.search);
  const artwork = getArtworkBySlug(params.get("a"));
  const detail = document.getElementById("artwork-detail");

  if (!artwork) {
    detail.innerHTML =
      '<div><p class="series-header__period">Artwork not found</p>' +
      '<h1 class="series-header__title">This piece doesn’t exist</h1>' +
      '<a class="text-link" href="work.html" style="margin-top:1rem">' +
      '<span class="text-link__arrow" aria-hidden="true">&larr;</span> Back to Work</a></div>';
    return;
  }

  document.title = artwork.title + " — Bylan Blanchard";
  document.getElementById("page-title").textContent = document.title;

  const series = getSeriesBySlug(artwork.series);

  const descriptionHtml = artwork.description
    ? '<p class="artwork-detail__description">' + artwork.description + '</p>'
    : "";

  detail.innerHTML =
    '<div class="artwork-detail__image">' +
      '<img src="' + artwork.image + '" alt="' + artwork.imageAlt + '" ' +
        'width="' + artwork.imageWidth + '" height="' + artwork.imageHeight + '">' +
    '</div>' +
    '<div class="artwork-detail__info">' +
      '<h1 class="artwork-detail__title">' + artwork.title + '</h1>' +
      (series
        ? '<a class="artwork-detail__series-link" href="series.html?s=' + series.slug + '">Part of ' + series.title + '</a>'
        : '') +
      '<dl class="meta-list">' +
        '<dt>Year</dt><dd>' + artwork.year + '</dd>' +
        '<dt>Medium</dt><dd>' + artwork.medium + '</dd>' +
        '<dt>Dimensions</dt><dd>' + artwork.dimensions + '</dd>' +
        '<dt>Status</dt><dd><span class="availability" data-status="' + artwork.availability + '">' + artwork.availability + '</span></dd>' +
      '</dl>' +
      descriptionHtml +
    '</div>';

  if (series) {
    const siblings = getArtworksBySeries(series.slug).filter(function (a) {
      return a.slug !== artwork.slug;
    });

    if (siblings.length) {
      const moreSection = document.getElementById("more-from-series");
      const moreGrid = document.getElementById("more-grid");
      siblings.forEach(function (sibling) {
        moreGrid.appendChild(renderArtworkCard(sibling));
      });
      moreSection.hidden = false;
    }
  }
})();
