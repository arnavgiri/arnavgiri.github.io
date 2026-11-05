"use strict";

/* QR codes are encoded and exported locally. No user content is transmitted. */
const $ = id => document.getElementById(id);
const ui = {
  form: $("qr-form"), content: $("qr-content"), count: $("char-count"),
  foreground: $("foreground"), background: $("background"),
  foregroundCode: $("foreground-code"), backgroundCode: $("background-code"),
  size: $("qr-size"), level: $("error-level"), quiet: $("quiet-zone"),
  preview: $("qr-preview"), status: $("preview-status"), error: $("form-error"),
  feedback: $("feedback"), modules: $("modules-info"), downloadSize: $("download-size"),
  png: $("download-png"), svg: $("download-svg"), copy: $("copy-image"), reset: $("reset-button")
};
let activeQR = null;
let debounceId = null;

function setError(message) {
  ui.error.hidden = !message;
  ui.error.textContent = message;
}

function setFeedback(message) {
  ui.feedback.textContent = message;
}

function getOptions() {
  const foreground = ui.foreground.value;
  const background = ui.background.value;
  if (!/^#[0-9a-f]{6}$/i.test(foreground) || !/^#[0-9a-f]{6}$/i.test(background)) {
    throw new Error("Choose valid colors.");
  }
  if (foreground.toLowerCase() === background.toLowerCase()) {
    throw new Error("Foreground and background need different colors.");
  }
  return {
    text: ui.content.value.trim(),
    foreground, background, correction: ui.level.value,
    size: Number(ui.size.value), margin: ui.quiet.checked ? 4 : 0
  };
}

function makeQR(text, correction) {
  if (typeof qrcode !== "function") throw new Error("QR encoder could not load. Refresh the page.");
  if (!text) throw new Error("Enter a URL or message to generate a code.");
  // The bundled encoder defaults to Latin-1; explicitly encode Unicode as UTF-8.
  qrcode.stringToBytes = value => Array.from(new TextEncoder().encode(value));
  const qr = qrcode(0, correction);
  qr.addData(text, "Byte");
  try {
    qr.make();
  } catch {
    throw new Error("The content is too long for this error correction level. Shorten it or choose a lower level.");
  }
  return qr;
}

function svgMarkup(qr, options) {
  const modules = qr.getModuleCount();
  const dimension = modules + options.margin * 2;
  const paths = [];
  for (let row = 0; row < modules; row++) {
    let col = 0;
    while (col < modules) {
      if (!qr.isDark(row, col)) { col++; continue; }
      const start = col;
      while (col < modules && qr.isDark(row, col)) col++;
      paths.push("M" + (start + options.margin) + " " + (row + options.margin) +
        "h" + (col - start) + "v1H" + (start + options.margin) + "z");
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dimension + ' ' + dimension +
    '" width="' + options.size + '" height="' + options.size + '" role="img" aria-label="QR code">' +
    '<rect width="' + dimension + '" height="' + dimension + '" fill="' + options.background + '"/>' +
    '<path fill="' + options.foreground + '" d="' + paths.join("") + '"/></svg>';
}

function updatePreview() {
  ui.count.textContent = ui.content.value.length + " / 1200";
  ui.foregroundCode.textContent = ui.foreground.value.toUpperCase();
  ui.backgroundCode.textContent = ui.background.value.toUpperCase();
  setFeedback("");
  try {
    const opts = getOptions();
    const qr = makeQR(opts.text, opts.correction);
    activeQR = { qr, opts };
    ui.preview.innerHTML = svgMarkup(qr, opts);
    ui.preview.setAttribute("aria-label", "QR code for " + opts.text.slice(0, 120));
    ui.modules.textContent = qr.getModuleCount() + " × " + qr.getModuleCount() + " modules";
    ui.downloadSize.textContent = opts.size + " × " + opts.size + " PNG";
    ui.status.textContent = "Code is ready";
    setError("");
  } catch (error) {
    activeQR = null;
    ui.preview.replaceChildren();
    ui.modules.textContent = "—";
    ui.status.textContent = "Needs attention";
    setError(error.message || "Unable to generate QR code.");
  }
  ui.png.disabled = !activeQR;
  ui.svg.disabled = !activeQR;
  ui.copy.disabled = !activeQR;
}

function schedulePreview() {
  clearTimeout(debounceId);
  debounceId = setTimeout(updatePreview, 160);
}

function makeCanvas() {
  if (!activeQR) throw new Error("Generate a QR code first.");
  const { qr, opts } = activeQR;
  const count = qr.getModuleCount();
  const dimension = count + opts.margin * 2;
  const canvas = document.createElement("canvas");
  canvas.width = opts.size;
  canvas.height = opts.size;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.fillStyle = opts.background;
  context.fillRect(0, 0, opts.size, opts.size);
  context.fillStyle = opts.foreground;
  for (let y = 0; y < count; y++) {
    for (let x = 0; x < count; x++) {
      if (!qr.isDark(y, x)) continue;
      const left = Math.round((x + opts.margin) * opts.size / dimension);
      const right = Math.round((x + opts.margin + 1) * opts.size / dimension);
      const top = Math.round((y + opts.margin) * opts.size / dimension);
      const bottom = Math.round((y + opts.margin + 1) * opts.size / dimension);
      context.fillRect(left, top, right - left, bottom - top);
    }
  }
  return canvas;
}

function pngBlob() {
  return new Promise((resolve, reject) => {
    makeCanvas().toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG export failed.")), "image/png");
  });
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function handleExport(kind) {
  if (!activeQR) return;
  try {
    if (kind === "svg") {
      const svg = svgMarkup(activeQR.qr, activeQR.opts);
      saveBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "qr-code.svg");
      setFeedback("SVG downloaded.");
    } else if (kind === "png") {
      saveBlob(await pngBlob(), "qr-code.png");
      setFeedback("PNG downloaded.");
    } else {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        throw new Error("Image clipboard is not supported here. Download the PNG instead.");
      }
      const blob = await pngBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setFeedback("QR image copied to clipboard.");
    }
  } catch (error) {
    setFeedback(error.message || "Export failed. Try downloading instead.");
  }
}

ui.form.addEventListener("submit", event => {
  event.preventDefault();
  clearTimeout(debounceId);
  updatePreview();
});
ui.content.addEventListener("input", schedulePreview);
[ui.foreground, ui.background, ui.size, ui.level, ui.quiet].forEach(element => {
  element.addEventListener("input", schedulePreview);
  element.addEventListener("change", schedulePreview);
});
ui.png.addEventListener("click", () => handleExport("png"));
ui.svg.addEventListener("click", () => handleExport("svg"));
ui.copy.addEventListener("click", () => handleExport("copy"));
ui.reset.addEventListener("click", () => {
  ui.content.value = "https://arnavgiri.github.io/";
  ui.foreground.value = "#163e32";
  ui.background.value = "#ffffff";
  ui.level.value = "M";
  ui.size.value = "1024";
  ui.quiet.checked = true;
  clearTimeout(debounceId);
  updatePreview();
});
updatePreview();
