/* Renders dump.html: a plain vertical stack of every image in DUMP_IMAGES. */

(function () {
  const count = document.getElementById("dump-count");
  const list = document.getElementById("dump-list");

  count.textContent = DUMP_IMAGES.length
    ? DUMP_IMAGES.length + (DUMP_IMAGES.length === 1 ? " image" : " images")
    : "No images yet";

  DUMP_IMAGES.forEach(function (src) {
    const item = document.createElement("div");
    item.className = "dump-item";
    item.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
    list.appendChild(item);
  });
})();
