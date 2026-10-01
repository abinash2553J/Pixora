// Core DOM Elements per User Specification
const section1 = document.getElementById('section1');
const section2 = document.getElementById('section2');
const section3 = document.getElementById('section3');

const websiteAddressInput = document.getElementById('websiteAdress');
const bgColorInput = document.getElementById('bgColor');
const resultImg = document.getElementById('resultImg');
const downloadBtn = document.getElementById('Download');

// Custom Backdrop & Gradient Controls
const liveBgIndicator = document.getElementById('liveBgIndicator');
const nativeColorPicker = document.getElementById('nativeColorPicker');
const tabBtns = document.querySelectorAll('.tab-btn');
const dotBtns = document.querySelectorAll('.dot-btn');
const gradientCards = document.querySelectorAll('.gradient-card');
const gradColor1 = document.getElementById('gradColor1');
const gradColor2 = document.getElementById('gradColor2');
const gradAngle = document.getElementById('gradAngle');
const chipBtns = document.querySelectorAll('.chip-btn');
const screenshotPreviewFrame = document.getElementById('screenshotPreviewFrame');

// Loader & Status
const targetUrlNotice = document.getElementById('targetUrlNotice');
const progressBar = document.getElementById('progressBar');
const loaderStatusText = document.getElementById('loaderStatusText');

// Result Elements
const mockUrlText = document.getElementById('mockUrlText');
const resultUrlLabel = document.getElementById('resultUrlLabel');
const imgPlaceholder = document.getElementById('imgPlaceholder');
const captureAnotherBtn = document.getElementById('captureAnotherBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

const downloadRawBtn = document.getElementById('downloadRawBtn');

// State
let currentScreenshotUrl = '';
let currentTargetUrl = '';
let toastTimer = null;

// ==========================================
// 1. SECTION SWITCHER & TOAST
// ==========================================

function showSection(targetSection) {
    [section1, section2, section3].forEach(sec => {
        if (sec) sec.classList.remove('active');
    });

    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2800);
}

// ==========================================
// 2. BACKDROP & GRADIENT SYSTEM
// ==========================================

function applyBackdrop(bgValue) {
    if (!bgValue) return;

    // Apply to live indicator and result preview frame
    if (liveBgIndicator) liveBgIndicator.style.background = bgValue;
    if (screenshotPreviewFrame) screenshotPreviewFrame.style.background = bgValue;

    // Synchronize solid swatches if applicable
    dotBtns.forEach(btn => {
        if (btn.dataset.bg && btn.dataset.bg.toLowerCase() === bgValue.trim().toLowerCase()) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Direct input in #bgColor (freeform hex, rgb, or gradient)
bgColorInput.addEventListener('input', (e) => {
    applyBackdrop(e.target.value);
});

bgColorInput.addEventListener('change', (e) => {
    applyBackdrop(e.target.value);
});

// Tab switching (Solid / Gradients / Custom)
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });

        const activePanel = document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        if (activePanel) activePanel.classList.add('active');
    });
});

// Native color picker (Solid tab)
if (nativeColorPicker) {
    nativeColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        bgColorInput.value = color;
        applyBackdrop(color);
    });
}

// Preset solid dots
dotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const c = btn.dataset.bg;
        bgColorInput.value = c;
        if (nativeColorPicker && c.startsWith('#')) {
            nativeColorPicker.value = c;
        }
        applyBackdrop(c);
    });
});

// Gradient cards
gradientCards.forEach(card => {
    card.addEventListener('click', () => {
        const grad = card.dataset.bg;
        bgColorInput.value = grad;
        applyBackdrop(grad);
    });
});

// Dual-Color Custom Gradient Builder
function updateCustomGradient() {
    const c1 = gradColor1?.value || '#1e1b4b';
    const c2 = gradColor2?.value || '#0f766e';
    const angle = gradAngle?.value || '135deg';

    const customGrad = `linear-gradient(${angle}, ${c1} 0%, ${c2} 100%)`;
    bgColorInput.value = customGrad;
    applyBackdrop(customGrad);
}

if (gradColor1) gradColor1.addEventListener('input', updateCustomGradient);
if (gradColor2) gradColor2.addEventListener('input', updateCustomGradient);
if (gradAngle) gradAngle.addEventListener('change', updateCustomGradient);

// Quick suggestions
chipBtns.forEach(chip => {
    chip.addEventListener('click', () => {
        websiteAddressInput.value = chip.dataset.url;
        websiteAddressInput.focus();
    });
});

// ==========================================
// 3. URL NORMALIZATION & VALIDATION
// ==========================================

function formatUrl(raw) {
    let url = raw.trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
}

function isValidUrl(str) {
    try {
        const parsed = new URL(str);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
    } catch (_) {
        return false;
    }
}

// ==========================================
// 4. CALM PROGRESS LOADER
// ==========================================

async function runCalmLoader() {
    progressBar.style.width = '0%';
    loaderStatusText.textContent = 'Connecting to server...';

    await new Promise(r => setTimeout(r, 450));
    progressBar.style.width = '35%';
    loaderStatusText.textContent = 'Emulating viewport...';

    await new Promise(r => setTimeout(r, 750));
    progressBar.style.width = '75%';
    loaderStatusText.textContent = 'Rendering assets & typography...';

    await new Promise(r => setTimeout(r, 800));
    progressBar.style.width = '100%';
    loaderStatusText.textContent = 'Finalizing snapshot...';

    await new Promise(r => setTimeout(r, 350));
}

// ==========================================
// 5. SCREENSHOT FETCHING & FALLBACK
// ==========================================

function createMinimalFallback(url) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#101113';
        ctx.fillRect(0, 0, 1280, 800);

        // Header
        ctx.fillStyle = '#18191c';
        ctx.fillRect(0, 0, 1280, 56);

        // Window Dots
        ctx.fillStyle = '#ff5f56';
        ctx.beginPath(); ctx.arc(28, 28, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffbd2e';
        ctx.beginPath(); ctx.arc(46, 28, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27c93f';
        ctx.beginPath(); ctx.arc(64, 28, 5, 0, Math.PI * 2); ctx.fill();

        // Address Pill
        ctx.fillStyle = '#101113';
        ctx.roundRect ? ctx.roundRect(100, 14, 400, 28, 6) : ctx.rect(100, 14, 400, 28);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
        ctx.fillText(url, 116, 32);

        // Content
        ctx.fillStyle = '#ededed';
        ctx.font = '500 36px "Space Grotesk", sans-serif';
        const cleanDomain = url.replace(/^https?:\/\//i, '').split('/')[0];
        ctx.fillText(cleanDomain, 80, 170);

        ctx.fillStyle = '#8f949c';
        ctx.font = '16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Live website snapshot', 80, 205);

        // Minimal Content blocks
        ctx.fillStyle = '#18191c';
        if (ctx.roundRect) {
            ctx.roundRect(80, 250, 540, 220, 8);
            ctx.fill();
            ctx.roundRect(650, 250, 550, 220, 8);
            ctx.fill();
            ctx.roundRect(80, 500, 1120, 220, 8);
            ctx.fill();
        } else {
            ctx.fillRect(80, 250, 540, 220);
            ctx.fillRect(650, 250, 550, 220);
            ctx.fillRect(80, 500, 1120, 220);
        }

        resolve(canvas.toDataURL('image/png'));
    });
}

function fetchScreenshot(primary, fallback, raw) {
    return new Promise((resolve) => {
        const img = new Image();
        let done = false;

        const timeout = setTimeout(() => {
            if (!done) {
                done = true;
                if (fallback) {
                    const backup = new Image();
                    backup.onload = () => resolve(fallback);
                    backup.onerror = () => createMinimalFallback(raw).then(resolve);
                    backup.src = fallback;
                } else {
                    createMinimalFallback(raw).then(resolve);
                }
            }
        }, 9000);

        img.onload = () => {
            if (!done) {
                done = true;
                clearTimeout(timeout);
                resolve(primary);
            }
        };

        img.onerror = () => {
            if (!done) {
                done = true;
                clearTimeout(timeout);
                if (fallback) {
                    const backup = new Image();
                    backup.onload = () => resolve(fallback);
                    backup.onerror = () => createMinimalFallback(raw).then(resolve);
                    backup.src = fallback;
                } else {
                    createMinimalFallback(raw).then(resolve);
                }
            }
        };

        img.src = primary;
    });
}

// ==========================================
// 6. PIPELINE (SECTION 1 -> 2 -> 3)
// ==========================================

const screenshotForm = document.getElementById('screenshotForm');

screenshotForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formatted = formatUrl(websiteAddressInput.value);
    if (!isValidUrl(formatted)) {
        showToast('Please enter a valid URL');
        websiteAddressInput.focus();
        return;
    }

    currentTargetUrl = formatted;
    targetUrlNotice.textContent = currentTargetUrl;

    // Show Loader (Section 2)
    showSection(section2);

    const primaryUrl = `https://api.microlink.io?url=${encodeURIComponent(currentTargetUrl)}&screenshot=true&meta=false&embed=screenshot.url`;
    const fallbackUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${encodeURIComponent(currentTargetUrl)}`;

    try {
        const [_, imageUrl] = await Promise.all([
            runCalmLoader(),
            fetchScreenshot(primaryUrl, fallbackUrl, currentTargetUrl)
        ]);

        currentScreenshotUrl = imageUrl;

        // Populate Result (Section 3)
        mockUrlText.textContent = currentTargetUrl;
        try {
            resultUrlLabel.textContent = new URL(currentTargetUrl).hostname;
        } catch (_) {
            resultUrlLabel.textContent = currentTargetUrl;
        }

        imgPlaceholder.style.display = 'flex';
        resultImg.style.display = 'none';

        resultImg.onload = () => {
            imgPlaceholder.style.display = 'none';
            resultImg.style.display = 'block';
        };

        resultImg.onerror = async () => {
            const fallback = await createMinimalFallback(currentTargetUrl);
            currentScreenshotUrl = fallback;
            resultImg.src = fallback;
            imgPlaceholder.style.display = 'none';
            resultImg.style.display = 'block';
        };

        resultImg.src = currentScreenshotUrl;

        // Apply chosen background to preview frame
        applyBackdrop(bgColorInput.value);

        // Show Section 3
        showSection(section3);

    } catch (err) {
        console.error(err);
        const fallback = await createMinimalFallback(currentTargetUrl);
        currentScreenshotUrl = fallback;
        resultImg.src = fallback;
        imgPlaceholder.style.display = 'none';
        resultImg.style.display = 'block';
        applyBackdrop(bgColorInput.value);
        showSection(section3);
    }
});

// ==========================================
// 7. HIGH-RESOLUTION CANVAS PREVIEW EXPORTER
// ==========================================

function drawRoundedRect(ctx, x, y, width, height, radii) {
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, width, height, radii);
    } else {
        const r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}

function parseAngle(angleStr) {
    if (!angleStr) return 135;
    const s = angleStr.trim().toLowerCase();
    if (s.endsWith('deg')) return parseFloat(s);
    if (s === 'to right') return 90;
    if (s === 'to left') return 270;
    if (s === 'to bottom') return 180;
    if (s === 'to top') return 0;
    if (s === 'to bottom right' || s === 'to right bottom') return 135;
    if (s === 'to bottom left' || s === 'to left bottom') return 225;
    if (s === 'to top right' || s === 'to right top') return 45;
    if (s === 'to top left' || s === 'to left top') return 315;
    return 135;
}

function createCssLinearGradient(ctx, width, height, angleDeg, stops) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const length = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
    const halfLen = length / 2;

    const x0 = cx - Math.cos(rad) * halfLen;
    const y0 = cy - Math.sin(rad) * halfLen;
    const x1 = cx + Math.cos(rad) * halfLen;
    const y1 = cy + Math.sin(rad) * halfLen;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(s => {
        try {
            grad.addColorStop(s.offset, s.color);
        } catch (_) {}
    });
    return grad;
}

function parseCssGradient(bgStr, width, height, ctx) {
    const trimmed = bgStr.trim();
    if (trimmed.startsWith('linear-gradient')) {
        const match = trimmed.match(/^linear-gradient\s*\((.*)\)$/i);
        if (!match) return null;

        const inner = match[1];
        const parts = [];
        let current = '';
        let depth = 0;
        for (let i = 0; i < inner.length; i++) {
            const char = inner[i];
            if (char === '(') depth++;
            else if (char === ')') depth--;
            else if (char === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) parts.push(current.trim());
        if (parts.length === 0) return null;

        let angleDeg = 135;
        let stopParts = parts;

        const first = parts[0].toLowerCase();
        if (first.includes('deg') || first.includes('turn') || first.startsWith('to ')) {
            angleDeg = parseAngle(first);
            stopParts = parts.slice(1);
        }

        const stops = [];
        stopParts.forEach((part, index) => {
            const lastSpaceIdx = part.lastIndexOf(' ');
            let color = part;
            let offset = null;
            if (lastSpaceIdx !== -1) {
                const possibleOffset = part.slice(lastSpaceIdx + 1).trim();
                if (possibleOffset.endsWith('%')) {
                    offset = parseFloat(possibleOffset) / 100;
                    color = part.slice(0, lastSpaceIdx).trim();
                } else if (!isNaN(parseFloat(possibleOffset))) {
                    offset = parseFloat(possibleOffset);
                    color = part.slice(0, lastSpaceIdx).trim();
                }
            }

            if (offset === null) {
                offset = stopParts.length === 1 ? 0 : index / (stopParts.length - 1);
            }
            offset = Math.max(0, Math.min(1, offset));
            stops.push({ color, offset });
        });

        stops.sort((a, b) => a.offset - b.offset);
        return createCssLinearGradient(ctx, width, height, angleDeg, stops);

    } else if (trimmed.startsWith('radial-gradient')) {
        const match = trimmed.match(/^radial-gradient\s*\((.*)\)$/i);
        if (!match) return null;
        const inner = match[1];
        const parts = [];
        let current = '';
        let depth = 0;
        for (let i = 0; i < inner.length; i++) {
            const char = inner[i];
            if (char === '(') depth++;
            else if (char === ')') depth--;
            else if (char === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
                continue;
            }
            current += char;
        }
        if (current.trim()) parts.push(current.trim());

        let stopParts = parts;
        if (parts[0].includes('circle') || parts[0].includes('ellipse') || parts[0].includes('at ')) {
            stopParts = parts.slice(1);
        }

        const radius = Math.max(width, height) / 1.4;
        const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, radius);
        stopParts.forEach((part, index) => {
            const lastSpaceIdx = part.lastIndexOf(' ');
            let color = part;
            let offset = index / Math.max(1, stopParts.length - 1);
            if (lastSpaceIdx !== -1) {
                const possibleOffset = part.slice(lastSpaceIdx + 1).trim();
                if (possibleOffset.endsWith('%')) {
                    offset = parseFloat(possibleOffset) / 100;
                    color = part.slice(0, lastSpaceIdx).trim();
                }
            }
            try {
                grad.addColorStop(Math.max(0, Math.min(1, offset)), color);
            } catch (_) {}
        });
        return grad;
    }
    return null;
}

function applyBackgroundToCanvas(ctx, width, height, bgStr) {
    if (!bgStr) {
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, width, height);
        return;
    }

    try {
        const gradient = parseCssGradient(bgStr, width, height, ctx);
        if (gradient) {
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            return;
        }
    } catch (_) {}

    try {
        ctx.fillStyle = bgStr;
        ctx.fillRect(0, 0, width, height);
    } catch (_) {
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, width, height);
    }
}

async function getSafeImageData(src) {
    if (!src || src.startsWith('data:')) return src;
    try {
        const res = await fetch(src, { mode: 'cors' });
        if (!res.ok) throw new Error('CORS fetch failed');
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (_) {
        return src;
    }
}

async function generateFramedPreviewDataUrl(imageSrc, bgValue, urlText) {
    const safeSrc = await getSafeImageData(imageSrc);

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');

                const naturalW = img.naturalWidth || 1280;
                const naturalH = img.naturalHeight || 800;

                // Standard screen width in mockup
                const screenW = 1280;
                const screenH = Math.round(screenW * (naturalH / naturalW));

                const paddingX = 80;
                const paddingY = 80;
                const titleBarH = 50;
                const windowRadius = 14;

                const canvasW = screenW + paddingX * 2;
                const canvasH = screenH + titleBarH + paddingY * 2;

                canvas.width = canvasW;
                canvas.height = canvasH;
                const ctx = canvas.getContext('2d');

                // 1. Draw Background Frame
                applyBackgroundToCanvas(ctx, canvasW, canvasH, bgValue);

                const winX = paddingX;
                const winY = paddingY;
                const winW = screenW;
                const winH = titleBarH + screenH;

                // 2. Drop Shadow for the browser window
                ctx.save();
                ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
                ctx.shadowBlur = 48;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 24;
                ctx.fillStyle = '#161719';
                ctx.beginPath();
                drawRoundedRect(ctx, winX, winY, winW, winH, windowRadius);
                ctx.fill();
                ctx.restore();

                // 3. Titlebar
                ctx.save();
                ctx.beginPath();
                drawRoundedRect(ctx, winX, winY, winW, titleBarH, [windowRadius, windowRadius, 0, 0]);
                ctx.fillStyle = '#161719';
                ctx.fill();

                // Titlebar bottom border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(winX, winY + titleBarH);
                ctx.lineTo(winX + winW, winY + titleBarH);
                ctx.stroke();

                // Window Control Dots (macOS style colors)
                const dotY = winY + titleBarH / 2;
                const dotRadius = 6;
                const dotStartX = winX + 24;
                const dotGap = 18;

                const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
                dotColors.forEach((color, i) => {
                    ctx.beginPath();
                    ctx.arc(dotStartX + i * dotGap, dotY, dotRadius, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                });

                // Address Bar Pill
                const pillW = Math.min(540, winW * 0.55);
                const pillH = 28;
                const pillX = winX + (winW - pillW) / 2;
                const pillY = winY + (titleBarH - pillH) / 2;

                ctx.beginPath();
                drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 6);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Address Bar Text
                ctx.fillStyle = '#8f949c';
                ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let displayUrl = urlText || 'https://...';
                if (displayUrl.length > 55) {
                    displayUrl = displayUrl.substring(0, 52) + '...';
                }
                ctx.fillText(displayUrl, winX + winW / 2, winY + titleBarH / 2);
                ctx.restore();

                // 4. Draw Screenshot Image with bottom-corner clipping
                ctx.save();
                ctx.beginPath();
                drawRoundedRect(ctx, winX, winY + titleBarH, winW, screenH, [0, 0, windowRadius, windowRadius]);
                ctx.clip();
                ctx.drawImage(img, winX, winY + titleBarH, winW, screenH);
                ctx.restore();

                // 5. Outer subtle window border stroke
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                drawRoundedRect(ctx, winX, winY, winW, winH, windowRadius);
                ctx.stroke();
                ctx.restore();

                resolve(canvas.toDataURL('image/png'));
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = () => reject(new Error('Failed to load image for mockup generation'));
        img.src = safeSrc;
    });
}

// ==========================================
// 8. DOWNLOAD HANDLERS
// ==========================================

function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Main Download Button: Downloads full framed preview mockup
downloadBtn.addEventListener('click', async () => {
    if (!currentScreenshotUrl) return;

    downloadBtn.disabled = true;
    const prev = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `<span>Exporting Preview...</span>`;

    try {
        let domain = 'screenshot';
        try {
            domain = new URL(currentTargetUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
        } catch (_) { }

        const filename = `pixora-mockup-${domain}-${Date.now()}.png`;

        // Render high-res framed preview
        const framedDataUrl = await generateFramedPreviewDataUrl(
            currentScreenshotUrl,
            bgColorInput.value,
            currentTargetUrl
        );

        triggerDownload(framedDataUrl, filename);
        showToast('Mockup preview downloaded!');
    } catch (err) {
        console.error('Framed preview export error, falling back to raw screenshot:', err);
        // Fallback to raw screenshot if canvas generation fails
        let domain = 'screenshot';
        try {
            domain = new URL(currentTargetUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
        } catch (_) { }
        const filename = `pixora-screenshot-${domain}-${Date.now()}.png`;
        triggerDownload(currentScreenshotUrl, filename);
        showToast('Downloaded raw screenshot');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = prev;
    }
});

// Raw Screenshot Button: Downloads only the screenshot image
if (downloadRawBtn) {
    downloadRawBtn.addEventListener('click', async () => {
        if (!currentScreenshotUrl) return;

        downloadRawBtn.disabled = true;
        const prev = downloadRawBtn.innerHTML;
        downloadRawBtn.innerHTML = `<span>Preparing...</span>`;

        try {
            let domain = 'screenshot';
            try {
                domain = new URL(currentTargetUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
            } catch (_) { }

            const filename = `pixora-screenshot-${domain}-${Date.now()}.png`;

            if (currentScreenshotUrl.startsWith('data:')) {
                triggerDownload(currentScreenshotUrl, filename);
                showToast('Raw screenshot downloaded');
            } else {
                try {
                    const res = await fetch(currentScreenshotUrl, { mode: 'cors' });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    triggerDownload(url, filename);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                    showToast('Raw screenshot downloaded');
                } catch (_) {
                    triggerDownload(currentScreenshotUrl, filename);
                    showToast('Raw screenshot opened');
                }
            }
        } catch (err) {
            showToast('Download error');
        } finally {
            downloadRawBtn.disabled = false;
            downloadRawBtn.innerHTML = prev;
        }
    });
}

// ==========================================
// 9. AUXILIARY ACTIONS
// ==========================================

if (captureAnotherBtn) {
    captureAnotherBtn.addEventListener('click', () => {
        showSection(section1);
        websiteAddressInput.focus();
        websiteAddressInput.select();
    });
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
        if (!currentScreenshotUrl) return;
        try {
            if (!currentScreenshotUrl.startsWith('data:')) {
                await navigator.clipboard.writeText(currentScreenshotUrl);
                showToast('Link copied');
            } else {
                showToast('Image generated locally');
            }
        } catch (_) {
            showToast('Unable to copy');
        }
    });
}

document.getElementById('brandLogo')?.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(section1);
});

// Initial Setup
applyBackdrop(bgColorInput.value || '#121212');

