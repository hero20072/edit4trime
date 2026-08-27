




function triggerPickr(colorId) {
        const anchor = document.getElementById(`picker-${colorId}`);
        if (!anchor) {
            console.error(`Picker anchor for ${colorId} not found!`);
            return;
        }
        initPickr(anchor, colorId);
    }

let activePickr = null

let activePickrId = null

function parseColorToHexa(val = '0xFFFFFFFF') {
        const raw = val.replace('0x', '').padStart(8, 'F');
        const alpha = raw.slice(0, 2);
        const rgb = raw.slice(2);
        return `#${rgb}${alpha}`;
    }

function initPickr(element, colorId) {
        if (activePickr) {
            activePickr.hide();
            activePickr.destroyAndRemove();
            activePickr = null;
            activePickrId = null;
        }

        activePickrId = colorId;
        const currentVal = state.colors[colorId] || '0xFFFFFFFF';
        const defaultHexa = parseColorToHexa(currentVal);

        activePickr = Pickr.create({
            el: element,
            theme: 'monolith',
            useAsButton: true,
            default: defaultHexa,
            defaultRepresentation: 'HEXA',
            components: {
                preview: false, opacity: true, hue: true,
                interaction: { hex: true, rgba: true, input: true, save: true, cancel: true }
            },
            i18n: { 'ui:dialog': '取色板', 'btn:save': '确定', 'btn:cancel': '取消' }
        });

        const ensureInfoPanel = (instance) => {
            const app = instance.getRoot().app;
            let infoPanel = app.querySelector('.usage-info-panel');
            if (!infoPanel) {
                infoPanel = document.createElement('div');
                infoPanel.className = 'usage-info-panel custom-scrollbar';
                const interaction = app.querySelector('.pcr-interaction');
                interaction.parentNode.appendChild(infoPanel);
            }
            return infoPanel;
        };

        const ensureDeleteArea = (instance) => {
            const app = instance.getRoot().app;
            let deleteArea = app.querySelector('.pickr-delete-area');
            if (!deleteArea) {
                deleteArea = document.createElement('div');
                deleteArea.className = 'pickr-delete-area';
                deleteArea.innerHTML = '<button type="button" id="real-delete-btn" class="delete-mapping-btn">删除此颜色</button>';
                app.appendChild(deleteArea);
            }
            return deleteArea;
        };

        activePickr.on('init', instance => {
            ensureInfoPanel(instance);
            ensureDeleteArea(instance);
        });

        activePickr.on('show', (color, instance) => {
            const panel = ensureInfoPanel(instance);
            panel.innerHTML = getUsageHTML(colorId); 

            ensureDeleteArea(instance);
            const app = instance.getRoot().app;
            const deleteBtn = app.querySelector('#real-delete-btn');

            if (deleteBtn) {
                deleteBtn.onclick = null; 
                deleteBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    if (typeof deleteColor === 'function') {
                        deleteColor(colorId);
                    }

                    if (activePickr) {
                        activePickr.hide();
                        activePickr.destroyAndRemove();
                        activePickr = null;
                        activePickrId = null;
                    }
                };
            }
        });

        activePickr.on('change', (color) => {
            const rgba = color.toRGBA();
            const hex = '#' + color.toHEXA()[0] + color.toHEXA()[1] + color.toHEXA()[2];
            const alpha = Math.round(rgba[3] * 100);
            handleColorInput(colorId, hex, alpha);
        });

        activePickr.on('save', () => {
            if (typeof updateCssVariablesOnly === 'function') updateCssVariablesOnly();
            if (activePickr) {
                activePickr.hide();
                activePickr.destroyAndRemove();
                activePickr = null;
                activePickrId = null;
            }
        });

        activePickr.on('cancel', () => {
            if (activePickr) {
                activePickr.hide();
                activePickr.destroyAndRemove();
                activePickr = null;
                activePickrId = null;
            }
        });

        activePickr.show();
    }

function getUsageHTML(cid) {
        try {
            const scheme = state.preset_color_schemes[currentScheme] || {};
            
            const coreKeys = (typeof CORE_KEYS !== 'undefined') ? Array.from(CORE_KEYS) : [];
            const customMaps = (typeof customMappings !== 'undefined') ? customMappings : [];
            const usedByMappings = [...coreKeys, ...customMaps].filter(prop => scheme[prop] === cid);

            const usedByKeys = [];
            const layout = state.preset_keyboards[currentLayout];
            if (layout?.keys) {
                for (const key of layout.keys) {
                    const isUsed = key.key_back_color === cid || 
                                   key.key_text_color === cid || 
                                   key.hilited_key_back_color === cid ||
                                   key.hilited_key_text_color === cid;
                    if (isUsed) {
                        let name = key.label || key.click || '未命名';
                        if (name.length > 8) name = name.substring(0, 6) + '..';
                        usedByKeys.push(name);
                    }
                }
            }

            if (usedByMappings.length === 0 && usedByKeys.length === 0) {
                return '<div class="usage-empty">此颜色暂未被引用</div>';
            }

            let html = '';
            
            if (usedByMappings.length > 0) {
                html += `
                <div class="usage-section">
                    <div class="usage-title">该颜色被应用于...</div>
                    <div class="tags-container">
                        ${usedByMappings.map(m => `
                            <span class="usage-tag">
                                <span class="tag-dot map"></span>${m}
                            </span>
                        `).join('')}
                    </div>
                </div>`;
            }
            
            if (usedByKeys.length > 0) {
                const uniqueKeys = [...new Set(usedByKeys)];
                html += `
                <div class="usage-section">
                    <div class="usage-title">引用按键</div>
                    <div class="tags-container">
                        ${uniqueKeys.map(k => `
                            <span class="usage-tag">
                                <span class="tag-dot key"></span>${k}
                            </span>
                        `).join('')}
                    </div>
                </div>`;
            }
            return html;
        } catch (e) {
            console.error(e);
            return '<div class="usage-empty" style="color:#ef4444">加载信息出错</div>';
        }
    }

function handleColorInput(id, newHex, newAlpha) {
        let currentVal = state.colors[id];
        let currentHex = '#' + currentVal.replace('0x','').slice(-6);
        let currentA = Math.round(parseInt(currentVal.replace('0x','').slice(0,2),16)/2.55);

        if (newHex !== null) currentHex = newHex;
        if (newAlpha !== null) currentA = newAlpha;

        const alphaHex = Math.round(currentA * 2.55).toString(16).padStart(2,'0').toUpperCase();
        const finalArgb = `0x${alphaHex}${currentHex.replace('#','').toUpperCase()}`;
        state.colors[id] = finalArgb;

        const r = parseInt(currentHex.slice(1, 3), 16);
        const g = parseInt(currentHex.slice(3, 5), 16);
        const b = parseInt(currentHex.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        
        const isLightBackground = yiq >= 180; 
        const textColor = isLightBackground ? '#0f172a' : '#ffffff'; 
        const textShadowStyle = isLightBackground ? 'none' : '0 1px 2px rgba(0,0,0,0.6)'; 

        const card = document.getElementById(`node-color-${id}`);
        if (card) {
            const rgbaColor = `rgba(${r},${g},${b},${currentA/100})`;
            
            card.style.backgroundImage = `linear-gradient(${rgbaColor}, ${rgbaColor}), ${CHECKER_SVG}`;
            card.style.backgroundSize = `100% 100%, 16px 16px`;
            card.style.backgroundColor = 'white';
            card.style.boxShadow = `0 6px 15px ${currentHex}50`;

            const nameInput = card.querySelector('input[type="text"]');
            if (nameInput) {
                nameInput.style.color = textColor;
                nameInput.style.textShadow = textShadowStyle;
            }

            const glassBg = isLightBackground ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.15)';
            const glassBorder = isLightBackground ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)';
            const glassCapsule = card.querySelector('.relative.z-20');
            if (glassCapsule) {
                glassCapsule.style.background = glassBg;
                glassCapsule.style.border = `1px solid ${glassBorder}`;
            }
        }
        
        const scheme = state.preset_color_schemes[currentScheme] || {};
        Object.entries(scheme).forEach(([mapId, colorId]) => {
            if (colorId === id) {
                const mapEl = document.getElementById(`node-mapping-${mapId}`);
                if (mapEl) {
                    const rgbaColor = `rgba(${r},${g},${b},${currentA/100})`;
                    mapEl.style.background = `linear-gradient(90deg, ${rgbaColor} 0%, ${rgbaColor} 10%, ${BASE_DARK_COLOR} 70%) no-repeat 0 0 / 100% 100%`;
                }
            }
        });

        updateCssVariablesOnly(); 
    }

function deleteColor(id) {       
        Object.values(state.preset_color_schemes).forEach(scheme => {
            Object.keys(scheme).forEach(key => {
                if (scheme[key] === id) delete scheme[key];
            });
        });

        Object.values(state.preset_keyboards).forEach(kb => {
            if (kb.keys) {
                kb.keys.forEach(k => {
                    if (k.key_back_color === id) delete k.key_back_color;
                    if (k.key_text_color === id) delete k.key_text_color;
                    if (k.hilited_key_back_color === id) delete k.hilited_key_back_color;
                    if (k.hilited_key_text_color === id) delete k.hilited_key_text_color;
                });
            }
        });

        delete state.colors[id];
        updateCssEngine();
        renderLayoutEditor();
        renderGlobalKeyboard();
        scheduleSave();
    }

let generatedColorsCache = []

let gradPickrStart = null

let gradPickrEnd = null

let gradPickrMid = null

let midEnabled = false

let currentGradStart = "0xFFFF69B4"

let currentGradMid = "0xFFFFFFFF"

let currentGradEnd = "0xFF000000"


function positionPopupUnderBtn(btn, popup, width) {
        const rect = btn.getBoundingClientRect();
        let left = rect.left;
        const maxLeft = window.innerWidth - width - 10;
        if (left > maxLeft) left = maxLeft;
        if (left < 10) left = 10;
        popup.style.top = rect.bottom + 'px';
        popup.style.left = left + 'px';
    }

function toggleGradientTool() {
        const popup = document.getElementById('gradient-popup');
        const btn = document.getElementById('grad-tool-btn');
        const isHidden = popup.classList.contains('hidden');

        if (isHidden) {
            positionPopupUnderBtn(btn, popup, 256);
            popup.classList.remove('hidden');
            if (!gradPickrStart) initGradPickers();
            updateGradientPreview();
        } else {
            popup.classList.add('hidden');
        }

        setToolBtnState(btn, isHidden,
            ['bg-pink-600', 'text-white', 'border-pink-500'],
            ['bg-slate-800', 'text-slate-500', 'border-slate-500/30'],
            '渐变生成', '渐变生成');
    }

function toggleSizeCalculator() {
        const btn = document.getElementById('size-calc-btn');
        const panel = document.getElementById('size-calculator-panel');
        if (!btn || !panel) return;

        const isHidden = panel.classList.contains('hidden');
        if (isHidden) {
            positionPopupUnderBtn(btn, panel, 320); 
            panel.classList.remove('hidden');
            updateSizeCalculator();
        } else {
            panel.classList.add('hidden');
        }

        setToolBtnState(btn, isHidden,
            ['bg-indigo-600', 'text-white', 'border-indigo-500'],
            ['bg-slate-800', 'text-slate-500', 'border-slate-500/30'],
            '尺寸计算', '尺寸计算');
    }

function updateSizeCalculator() {
        const displayDiv = document.getElementById('size-display');
        if (!displayDiv) return;

        const s = state.style;
        const layout = state.preset_keyboards[currentLayout];
        
        const phone = document.querySelector('.phone-mockup');
        const phoneWidth = phone ? phone.clientWidth : 370; 
        
        const { rows, scaledVerticalGap, finalAutoIndex } = computeKeyboardLayout(layout, s);

        const statsMap = new Map();
        rows.forEach(row => {
            row.keys.forEach(k => {
                const wPercent = parseFloat(k.width !== undefined ? k.width : (layout.width !== undefined ? layout.width : 10));
                const wPx = Math.floor(phoneWidth * (wPercent / 100)) - s.horizontal_gap;
                
                const mapKey = `${wPercent}-${row.computedPixelHeight}`;

                if (!statsMap.has(mapKey)) {
                    let label = k.label || k.click || 'Key';
                    if (label.length > 8) label = label.substring(0, 6) + '..';

                    statsMap.set(mapKey, {
                        wPercent: wPercent,
                        wPx: Math.max(0, wPx),
                        hPx: row.computedPixelHeight, 
                        count: 1,
                        example: label
                    });
                } else {
                    const info = statsMap.get(mapKey);
                    info.count++;
                    if ((info.example === 'Key' || info.example === 'new') && k.click) {
                        info.example = k.label || k.click;
                    }
                }
            });
        });

        const sortedStats = Array.from(statsMap.values()).sort((a, b) => b.wPercent - a.wPercent);

        let htmlContent = ``;

        htmlContent += `
            <div class="mb-3 border-b border-slate-700 pb-2">
                <div class="text-[10px] text-pink-400 font-bold mb-1 uppercase tracking-wider">容器尺寸 (Containers)</div>
                <div class="grid grid-cols-2 gap-y-1 gap-x-2 text-xs">
                    <div class="text-slate-400">键盘总区域</div>
                    <div class="font-mono text-white text-right font-bold">${Math.round(phoneWidth)} x ${s.keyboard_height} px</div>
                    
                    <div class="text-slate-400">候选栏区域</div>
                    <div class="font-mono text-white text-right font-bold">${Math.round(phoneWidth)} x ${s.candidate_view_height} px</div>
                </div>
            </div>
        `;

        htmlContent += `
            <div class="mb-3 border-b border-slate-700 pb-2">
                <div class="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider">垂直布局详情 (Vertical)</div>
                <div class="grid grid-cols-2 gap-y-1 gap-x-2 text-xs">
                    <div class="text-slate-400">当前行数</div><div class="text-white font-mono text-right">${rows.length} 行</div>
                    <div class="text-slate-400">间距计算高度</div><div class="text-white font-mono text-right">${scaledVerticalGap} px</div>
                    <div class="text-slate-400">吸收余数行</div><div class="text-white font-mono text-right">第 ${finalAutoIndex + 1} 行</div>
                </div>
            </div>
        `;

        htmlContent += `<div class="text-[10px] text-indigo-400 font-bold mb-1 uppercase tracking-wider">按键真实像素统计 (Keys)</div>`;
        htmlContent += `<div class="grid grid-cols-1 gap-1 text-xs">`;

        if (sortedStats.length === 0) {
            htmlContent += `<div class="text-slate-500 italic">无按键数据</div>`;
        } else {
            sortedStats.forEach(info => {
                const isWide = info.wPercent > 15;
                const bgClass = isWide ? 'bg-indigo-900/30' : 'bg-transparent';
                const borderClass = isWide ? 'border-indigo-500/30' : 'border-transparent';

                htmlContent += `
                    <div class="flex justify-between items-center p-1.5 rounded border ${borderClass} ${bgClass}">
                        <div class="flex flex-col">
                            <span class="text-slate-200 font-bold">
                                ${info.wPercent}% <span class="text-[10px] text-slate-500 font-normal">(${info.count}个)</span>
                            </span>
                            <span class="text-[10px] text-slate-500">如: ${info.example}</span>
                        </div>
                        <div class="font-mono text-emerald-300 font-bold text-right">
                            ${info.wPx} x ${info.hPx} px
                        </div>
                    </div>
                `;
            });
        }
        htmlContent += `</div>`;
        
        displayDiv.innerHTML = htmlContent;
    }

function initGradPickers() {
        const config = {
            theme: 'monolith',
            useAsButton: true,
            defaultRepresentation: 'HEXA',
            components: { 
                preview: true, opacity: true, hue: true, 
                interaction: { hex: true, rgba: true, input: true, save: true } 
            },
            i18n: { 'btn:save': '确定' }
        };

        gradPickrStart = Pickr.create({ ...config, el: '#grad-start-picker', default: argbToCss(currentGradStart) });
        gradPickrMid = Pickr.create({ ...config, el: '#grad-mid-picker', default: argbToCss(currentGradMid) });
        gradPickrEnd = Pickr.create({ ...config, el: '#grad-end-picker', default: argbToCss(currentGradEnd) });

        const onGradientChange = (setTarget) => (color, source, instance) => {
            midEnabled = true;
            const rgba = color.toRGBA();
            const r = Math.round(rgba[0]);
            const g = Math.round(rgba[1]);
            const b = Math.round(rgba[2]);
            const a = Math.round(rgba[3] * 255);
            setTarget('0x' + toHex(a) + toHex(r) + toHex(g) + toHex(b));
            instance.getRoot().button.style.background = color.toRGBA().toString();
            updateGradientPreview();
        };

        gradPickrStart.on('init', instance => {
            instance.getRoot().button.style.background = argbToCss(currentGradStart);
        });
        gradPickrStart.on('change', onGradientChange(v => { currentGradStart = v; }));
        gradPickrStart.on('save', (color, instance) => { instance.hide(); });

        gradPickrMid.on('init', instance => {
            instance.getRoot().button.style.background = argbToCss(currentGradMid);
        });
        gradPickrMid.on('change', onGradientChange(v => { currentGradMid = v; }));
        gradPickrMid.on('save', (color, instance) => { instance.hide(); });

        gradPickrEnd.on('init', instance => {
            instance.getRoot().button.style.background = argbToCss(currentGradEnd);
        });
        gradPickrEnd.on('change', onGradientChange(v => { currentGradEnd = v; }));
        gradPickrEnd.on('save', (color, instance) => { instance.hide(); });
    }

function updateGradientPreview() {
        const steps = parseInt(document.getElementById('grad-steps').value);
        const previewBox = document.getElementById('grad-preview');
        if (!previewBox) return;
    
        previewBox.innerHTML = '';
        generatedColorsCache = [];

        const parse = (argb) => {
            const full = argb.replace('0x', '').padStart(8, 'F');
            return {
                a: parseInt(full.slice(0, 2), 16),
                r: parseInt(full.slice(2, 4), 16),
                g: parseInt(full.slice(4, 6), 16),
                b: parseInt(full.slice(6, 8), 16)
            };
        };

        const cStart = parse(currentGradStart);
        const cEnd = parse(currentGradEnd);

        for (let i = 0; i < steps; i++) {
            const t = steps > 1 ? i / (steps - 1) : 0; 
            let r, g, b, a;

            const interpolateOKLab = (c1, c2, factor) => {
                const rgb = ColorEngine.lerp([c1.r, c1.g, c1.b], [c2.r, c2.g, c2.b], factor);
                const a = Math.round(c1.a + factor * (c2.a - c1.a));
                return { r: rgb[0], g: rgb[1], b: rgb[2], a: a };
            };

            if (midEnabled) {
                const cMid = parse(currentGradMid);
                if (t <= 0.5) {
                    const res = interpolateOKLab(cStart, cMid, t * 2);
                    r = res.r; g = res.g; b = res.b; a = res.a;
                } else {
                    const res = interpolateOKLab(cMid, cEnd, (t - 0.5) * 2);
                    r = res.r; g = res.g; b = res.b; a = res.a;
                }
            } else {
                const res = interpolateOKLab(cStart, cEnd, t);
                r = res.r; g = res.g; b = res.b; a = res.a;
            }
            
            const argbStr = `0x${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`;
            generatedColorsCache.push(argbStr);

            const strip = document.createElement('div');
            strip.style.flex = "1";
            strip.style.height = "100%";
            strip.style.backgroundColor = `rgba(${r},${g},${b},${a/255})`;
            previewBox.appendChild(strip);
        }
    }

function addAllGradientColors() {
    
        let x = 1;
        while (state.colors[`color${x}`]) x++;
        generatedColorsCache.forEach(argb => {
            state.colors[`color${x}`] = argb;
            x++;
        });
        updateCssEngine();
        renderLayoutEditor();
        scheduleSave();
    }

function clearGradientTool() {
        midEnabled = false;
        currentGradStart = "0xFFFF69B4";
        currentGradMid = "0xFFffffff"; 
        currentGradEnd = "0xFF000000";
        if (gradPickrStart) {
            gradPickrStart.setColor(argbToCss(currentGradStart));
            gradPickrMid.setColor(argbToCss(currentGradMid));
            gradPickrEnd.setColor(argbToCss(currentGradEnd));
            gradPickrStart.getRoot().el.style.background = argbToCss(currentGradStart);
            gradPickrMid.getRoot().el.style.background = argbToCss(currentGradMid);
            gradPickrEnd.getRoot().el.style.background = argbToCss(currentGradEnd);
        }
        document.getElementById('grad-steps').value = 10;
        document.getElementById('grad-num').innerText = '10 阶过渡';
        updateGradientPreview();
    }

function clearMidColor() {
        midEnabled = false;
        updateGradientPreview();
    }

setTimeout(updateGradientPreview, 500)

function addNewColor() {
        let x = 1;
        while (state.colors[`color${x}`]) {
            x++;
        }
        const newId = `color${x}`;
        
        state.colors[newId] = '0xFFFFFFFF'; 
        
        updateCssEngine();
        renderLayoutEditor();
        scheduleSave();
        setTimeout(() => {
            const container = document.getElementById('palette-container');
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 100);
    }

let pickedColors = []

let currentImageCanvas = null

let currentImageCtx = null

let magnifierCanvas = null

let magnifierCtx = null

let magnifierBound = false

const MAGNIFIER_SIZE = 120

const ZOOM_FACTOR = 4

function toggleColorPicker() {
        const btn = document.getElementById('color-picker-btn');
        const panel = document.getElementById('color-picker-panel');
        if (!btn || !panel) return;

        const isHidden = panel.classList.contains('hidden');
        if (isHidden) {
            positionPopupUnderBtn(btn, panel, 320); 
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }

        setToolBtnState(btn, isHidden,
            ['bg-yellow-600', 'text-white', 'border-yellow-500'],
            ['bg-slate-800', 'text-slate-500', 'border-slate-500/30'],
            '上传取色', '上传取色');
    }


    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('color-canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, img.width, img.height);
                canvas.style.display = 'block';
                currentImageCanvas = canvas;
                currentImageCtx = ctx;

                pickedColors = [];
                renderColorSwatches();
                canvas.onclick = (e) => {
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;

                    const x = (e.clientX - rect.left) * scaleX;
                    const y = (e.clientY - rect.top) * scaleY;

                    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

                    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
                    const r = pixel[0], g = pixel[1], b = pixel[2];
                    const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
                    pickedColors.push(hex);
                    renderColorSwatches();
                };
                bindMagnifierOnce();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }


    function bindMagnifierOnce() {
        if (magnifierBound) return;
        magnifierBound = true;
        const canvas = document.getElementById('color-canvas');
        magnifierCanvas = document.getElementById('magnifier-canvas');
        if (!canvas || !magnifierCanvas) return;
        magnifierCtx = magnifierCanvas.getContext('2d');
        canvas.addEventListener('mouseenter', () => {
            magnifierCanvas.style.display = 'block';
        });
        canvas.addEventListener('mousemove', (e) => updateMagnifier(e, currentImageCanvas, currentImageCtx));
        canvas.addEventListener('mouseleave', () => {
            magnifierCanvas.style.display = 'none';
        });
    }

function renderColorSwatches() {
        const container = document.getElementById('color-swatches');
        if (!container) return;
        container.innerHTML = '';
        pickedColors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'flex items-center gap-1 p-1 bg-slate-800 rounded border border-slate-600 cursor-pointer hover:border-yellow-500';
            swatch.setAttribute('data-color', color);   
            swatch.innerHTML = `
                <div class="w-5 h-5 rounded" style="background-color: ${color};"></div>
                <span class="text-xs font-mono text-slate-300">${color}</span>
            `;
            swatch.onclick = (e) => {
                e.stopPropagation();
                copyColorCode(color);
            };
            container.appendChild(swatch);
        });
    }

function copyColorCode(color) {
        navigator.clipboard.writeText(color).then(() => {

        });
    }

function clearPickedColors() {
        pickedColors = [];
        renderColorSwatches();
    }

function addAllPickedColors() {
        if (!pickedColors || pickedColors.length === 0) {
            alert("没有色块可导入，请先点击图片取色。");
            return;
        }

        let x = 1;
        while (state.colors[`color${x}`]) {
            x++;
        }

        let count = 0;

        pickedColors.forEach(hex => {
            if (!hex || !hex.startsWith('#')) return;

            const rawHex = hex.replace('#', '').toUpperCase();
            const argb = '0xFF' + rawHex;

            state.colors[`color${x}`] = argb;
            
            x++; 
            count++;
        });

        updateCssEngine();   
        renderLayoutEditor(); 
        scheduleSave();
        setTimeout(() => {
            const container = document.getElementById('palette-container');
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }, 100);

        clearPickedColors();
    }

function updateMagnifier(event, sourceCanvas, sourceCtx) {
        if (!magnifierCanvas || !sourceCanvas) return;

        
        if (magnifierCanvas.width !== MAGNIFIER_SIZE) {
            magnifierCanvas.width = MAGNIFIER_SIZE;
            magnifierCanvas.height = MAGNIFIER_SIZE;
        }

        const rect = sourceCanvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        
        const scaleX = sourceCanvas.width / rect.width;
        const scaleY = sourceCanvas.height / rect.height;
        const pixelX = mouseX * scaleX;
        const pixelY = mouseY * scaleY;

        
        magnifierCtx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);
        magnifierCtx.fillStyle = '#020617';
        magnifierCtx.fillRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);

        
        magnifierCtx.imageSmoothingEnabled = false;

        magnifierCtx.save();
        
        magnifierCtx.translate(MAGNIFIER_SIZE / 2, MAGNIFIER_SIZE / 2); 
        
        magnifierCtx.scale(ZOOM_FACTOR, ZOOM_FACTOR); 
        
        magnifierCtx.translate(-pixelX, -pixelY); 
        
        magnifierCtx.drawImage(sourceCanvas, 0, 0);
        magnifierCtx.restore();

        
        const center = MAGNIFIER_SIZE / 2;
        
        
        magnifierCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        magnifierCtx.lineWidth = 1;
        magnifierCtx.beginPath();
        magnifierCtx.moveTo(center - 4, center);
        magnifierCtx.lineTo(center - 5, center);
        magnifierCtx.moveTo(center + 5, center);
        magnifierCtx.lineTo(center + 4, center);
        magnifierCtx.moveTo(center, center - 4);
        magnifierCtx.lineTo(center, center - 5);
        magnifierCtx.moveTo(center, center + 5);
        magnifierCtx.lineTo(center, center + 4);
        magnifierCtx.stroke();

        
        magnifierCtx.beginPath();
        magnifierCtx.arc(center, center, 2.5, 0, 2 * Math.PI);
        magnifierCtx.fillStyle = '#ef4444'; 
        magnifierCtx.fill();
        magnifierCtx.lineWidth = 1.5;
        magnifierCtx.strokeStyle = '#ffffff'; 
        magnifierCtx.stroke();

        
        const magnifierLeft = mouseX - MAGNIFIER_SIZE / 2;
        const magnifierTop = mouseY - MAGNIFIER_SIZE - 15; 

        magnifierCanvas.style.left = magnifierLeft + 'px';
        magnifierCanvas.style.top = magnifierTop + 'px';
    }
