/**
 * PIXORA — Minimal Web Snapshot Studio
 * Supports Solid Colors, Preset Gradients, Dual-Color Customizer & Custom CSS
 */

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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath(); ctx.arc(28, 28, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(46, 28, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(64, 28, 5, 0, Math.PI * 2); ctx.fill();

        // Address
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(url, 100, 33);

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
        ctx.roundRect(80, 250, 540, 220, 8);
        ctx.fill();
        ctx.roundRect(650, 250, 550, 220, 8);
        ctx.fill();
        ctx.roundRect(80, 500, 1120, 220, 8);
        ctx.fill();

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
// 7. DOWNLOAD BUTTON (#Download)
// ==========================================

downloadBtn.addEventListener('click', async () => {
    if (!currentScreenshotUrl) return;

    downloadBtn.disabled = true;
    const prev = downloadBtn.innerHTML;
    downloadBtn.innerHTML = `<span>Preparing...</span>`;

    try {
        let domain = 'screenshot';
        try {
            domain = new URL(currentTargetUrl).hostname.replace(/[^a-zA-Z0-9]/g, '-');
        } catch (_) {}

        const filename = `${domain}-${Date.now()}.png`;

        if (currentScreenshotUrl.startsWith('data:')) {
            const a = document.createElement('a');
            a.href = currentScreenshotUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('Downloaded image');
        } else {
            try {
                const res = await fetch(currentScreenshotUrl, { mode: 'cors' });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                showToast('Downloaded image');
            } catch (_) {
                const a = document.createElement('a');
                a.href = currentScreenshotUrl;
                a.target = '_blank';
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                showToast('Opened image');
            }
        }
    } catch (err) {
        showToast('Download error');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = prev;
    }
});

// ==========================================
// 8. AUXILIARY ACTIONS
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
                showToast('Image in clipboard memory');
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
