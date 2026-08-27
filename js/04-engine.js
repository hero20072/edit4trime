// ============================================================
// 04-engine.js — engine
// 由 test.html 拆分而来（无构建，经典脚本，按 01→11 顺序引入）
// ============================================================

// 统一设置工具按钮的“激活/未激活”样式与文案（多个 toggle 函数复用）
function setToolBtnState(btn, isActive, onCls, offCls, onText, offText) {
        if (!btn) return;
        btn.classList.remove(...onCls);
        btn.classList.remove(...offCls);
        btn.classList.add(...(isActive ? onCls : offCls));
        btn.innerText = isActive ? onText : offText;
    }

const QQ_GROUP_NUMBER = '47129710';
function copyQQGroup(el) {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(QQ_GROUP_NUMBER).then(() => {
            el.textContent = '已复制';
            setTimeout(() => { el.textContent = '交流Q群'; }, 1500);
        });
    }

// 「渲染选项」下拉菜单：状态同步（开合用 CSS 悬停控制）
function renderRenderDropdown() {
        const items = [
            ['render-dd-popup', isGlobalPopupEnabled],
            ['render-dd-lock', isPopupLocked],
            ['render-dd-win', isWindowMode],
            ['render-dd-keylock', isKeyEditorLocked],
            ['render-dd-spacer', isShowSpacers],
        ];
        items.forEach(([id, active]) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('on', !!active);
        });
    }

function toggleShowSpacers() {
        isShowSpacers = !isShowSpacers;
        renderRenderDropdown();
        renderGlobalKeyboard();
    }

function toggleCapsules() {
        if (currentTab !== 'layout') {
            // 在非「配色|布局」页点击：视为“打开面板”，强制开启并跳到布局页让面板必定显示
            isCapsulesEnabled = true;
            switchTab('layout');
            return; // switchTab 内部已调用 updateCapsuleVisibility
        }
        // 在布局页点击：正常开/关切换
        isCapsulesEnabled = !isCapsulesEnabled;
        updateCapsuleVisibility();
    }

function updateCapsuleVisibility() {
        const btn = document.getElementById('capsule-toggle-btn');
        setToolBtnState(btn, isCapsulesEnabled,
            ['bg-orange-600', 'text-white', 'border-orange-500'],
            ['bg-slate-800', 'text-slate-500', 'border-slate-500/30'],
            '调色映射', '调色映射');
        const container = document.getElementById('right-tools-container');
        
        if (container) {
            if (currentTab === 'layout' && isCapsulesEnabled) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        }
    }

// 共享的键盘行划分 + 行高分配计算（renderGlobalKeyboard 与 updateSizeCalculator 共用）
    function computeKeyboardLayout(layout, s) {
        if (!layout || !layout.keys) return { rows: [], scaledVerticalGap: 0, finalAutoIndex: -1 };

        const rows = [];
        let currentRow = { keys: [], width: 0, rawHeight: 0 };
        const layoutWidth = parseFloat(layout.width !== undefined ? layout.width : 10);
        const fallbackWidth = isFinite(layoutWidth) && layoutWidth > 0 ? layoutWidth : 10;
        layout.keys.forEach(key => {
            const keyWidth = parseFloat(key.width !== undefined ? key.width : fallbackWidth);
            const safeWidth = isFinite(keyWidth) && keyWidth > 0 ? keyWidth : fallbackWidth;
            if (currentRow.width > 0 && currentRow.width + safeWidth > 100.1) {
                rows.push(currentRow);
                currentRow = { keys: [], width: 0, rawHeight: 0 };
            }
            if (currentRow.keys.length === 0) {
                const rawHeight = parseFloat(key.height !== undefined ? key.height : (s.key_height !== undefined ? s.key_height : 44));
                currentRow.rawHeight = isFinite(rawHeight) && rawHeight >= 0 ? rawHeight : 44;
            }
            currentRow.keys.push(key);
            currentRow.width += safeWidth;
        });
        if (currentRow.keys.length > 0) rows.push(currentRow);

        const bottomPadding = s.keyboard_padding_bottom || 0;
        const rawSumHeight = rows.reduce((sum, r) => sum + r.rawHeight, 0);
        const autoHeightIndex = layout.auto_height_index !== undefined ? layout.auto_height_index : -1;

        const availableHeight = s.keyboard_height - bottomPadding;
        const denom = rawSumHeight + s.vertical_gap * (rows.length + 1);
        const scale = denom > 0 ? availableHeight / denom : 0;
        const scaledVerticalGap = Math.ceil((s.vertical_gap || 0) * scale);
        let remainHeight = availableHeight - scaledVerticalGap * (rows.length + 1);
        const heightScale = rawSumHeight > 0 ? remainHeight / rawSumHeight : 0;

        let finalAutoIndex = autoHeightIndex;
        if (finalAutoIndex < 0) {
            finalAutoIndex = rows.length + finalAutoIndex;
            if (finalAutoIndex < 0) finalAutoIndex = 0;
        } else if (finalAutoIndex >= rows.length) {
            finalAutoIndex = rows.length - 1;
        }

        rows.forEach((row, i) => {
            if (i !== finalAutoIndex) {
                const h = Math.floor(row.rawHeight * heightScale);
                row.computedPixelHeight = h;
                remainHeight -= h;
            }
        });
        if (remainHeight < 1 && rows[finalAutoIndex] && rows[finalAutoIndex].rawHeight > 0) remainHeight = 1;
        if (rows[finalAutoIndex]) {
            rows[finalAutoIndex].computedPixelHeight = Math.floor(remainHeight);
        }

        return { rows, scaledVerticalGap, finalAutoIndex };
    }

function renderGlobalKeyboard() {
        const s = state.style;
        const bottomPadding = s.keyboard_padding_bottom || 0;
        const pre = state.preedit;
        const w = state.window;
        
        const viewport = document.getElementById('global-keyboard-viewport');
        const preeditEl = document.getElementById('preview-preedit');
        const candBar = document.getElementById('preview-candidate-bar');

        let winEl = document.getElementById('preview-window');
        
        if (!state.preset_keyboards[currentLayout] || !viewport) return;
        const layout = state.preset_keyboards[currentLayout];

        viewport.style.boxSizing = 'border-box';
        viewport.style.height = `${s.keyboard_height}px`;
        viewport.style.paddingBottom = `${bottomPadding}px`;
        viewport.style.backgroundColor = `var(--keyboard_back_color)`;


        if (preeditEl) {
            preeditEl.style.height = `${s.comment_height}px`;
            preeditEl.style.fontSize = `${pre.foreground.font_size}px`;
            preeditEl.style.padding = `0 ${pre.horizontal_padding}px`; 
            
            preeditEl.style.borderTopLeftRadius = `${pre.top_end_radius}px`; 
            preeditEl.style.borderTopRightRadius = `${pre.top_end_radius}px`;
            preeditEl.style.opacity = pre.alpha; 

            preeditEl.style.display = 'flex';          
            preeditEl.style.width = 'fit-content';     
            preeditEl.style.minWidth = '20px';         
            
            preeditEl.style.margin = '0';               
            preeditEl.style.marginLeft = `-10px`; 
            preeditEl.style.marginBottom = '0px';      
            
            preeditEl.style.alignItems = 'center';      
            preeditEl.style.boxSizing = 'border-box';   
            preeditEl.style.overflow = 'hidden';     
               

            preeditEl.innerHTML = `
                <span class="preedit-text-item">pinyin</span>
                <span class="preedit-input-char" style="color:var(--text_color); margin-left:2px; font-size:10px;">‸</span>
            `;
        }



        if (candBar) {
            candBar.style.height = `${s.candidate_view_height + s.horizontal_gap}px`;
            candBar.style.gap = `${s.candidate_spacing}px`; 
            candBar.style.padding = `0 ${s.horizontal_gap}px`;

            const renderCandidate = (text, comment, isSelected) => {
                const stateClass = isSelected ? 'candidate-item-highlighted' : 'candidate-item-normal';
                const candStyle = `padding: 0 ${s.candidate_padding}px; font-size:${s.candidate_text_size}px;`;
                const commStyle = `font-size:${s.comment_text_size}px;`;
            
                const content = s.comment_on_top ? `
                    <div class="flex flex-col items-center">
                        <span class="cand-comment" style="${commStyle}">${comment}</span>
                        <div class="flex items-center">
                            <span class="cand-text">${text}</span>
                        </div>
                    </div>
                ` : `
                    <span class="cand-text">${text}</span>
                    <span class="cand-comment" style="${commStyle}">${comment}</span>
                `;

                return `<div class="candidate-item ${stateClass}" style="${candStyle}">${content}</div>`;
            };

            candBar.innerHTML = 
                renderCandidate('预', 'yusr', true) + 
                 `<div class="candidate-separator"></div>` + 
                renderCandidate('效果', 'xg', false);
        }
                
        if (winEl) {
            if (isWindowMode) {
                winEl.style.display = 'block';
                
                preeditEl.style.visibility = 'hidden';
                candBar.style.visibility = 'hidden';

                winEl.style.minWidth = `${w.min_width}px`;
                winEl.style.borderRadius = `${w.corner_radius}px`;
                winEl.style.padding = `${w.insets.vertical}px ${w.insets.horizontal}px`;
                winEl.style.opacity = w.alpha;
                
                winEl.innerHTML = `
                    <div class="text-slate-400 border-b pb-1 mb-1" style="font-size:${w.foreground.comment_font_size}px;">a</div>
                    <div class="text-slate-800 font-bold" style="font-size:${w.foreground.text_font_size}px; padding:${w.item_padding.vertical}px 0;">1. 啊 2. 安装</div>
                `;
            } else {
                winEl.style.display = 'none';
                preeditEl.style.visibility = 'visible';
                candBar.style.visibility = 'visible';
            }
        } else {
            preeditEl.style.visibility = 'visible';
            candBar.style.visibility = 'visible';
        }

        const { rows, scaledVerticalGap } = computeKeyboardLayout(layout, s);

       viewport.innerHTML = '';
        
        viewport.style.padding = `${scaledVerticalGap}px 0 ${bottomPadding}px 0`;
        viewport.style.boxSizing = 'border-box';
        viewport.style.height = `${s.keyboard_height}px`; 


        viewport.style.width = '100%';
        viewport.style.marginLeft = '0';

        viewport.style.display = 'flex';
        viewport.style.flexDirection = 'column';
        viewport.style.flexWrap = 'nowrap';
                
        rows.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.style.display = 'flex';
            rowEl.style.width = '100%';
            rowEl.style.marginBottom = `${scaledVerticalGap}px`;
            rowEl.style.justifyContent = 'flex-start';

            row.keys.forEach(key => {
                const idx = layout.keys.indexOf(key);
                const el = document.createElement('div');
                
                el.className = `key-item ${selectedKeyIdx === idx ? 'selected' : ''}`;
                
                const kw = parseFloat(key.width !== undefined ? key.width : (layout.width !== undefined ? layout.width : 10));
                
                el.style.width = `calc(${kw}% - ${s.horizontal_gap}px)`;
                el.style.height = `${row.computedPixelHeight}px`;
                el.style.margin = `0 ${s.horizontal_gap / 2}px`;
                el.style.padding = `0`; 
                el.style.boxSizing = 'border-box';
                
                const isFiller = (key.click === undefined || key.click === null) && 
                                 !key.label && !key.send && !key.text && !key.toggle;

                if (isFiller) {
                    if (!isShowSpacers) {
                        el.innerHTML = ''; 
                        el.style.pointerEvents = 'none';
                        el.style.visibility = 'hidden'; 
                        rowEl.appendChild(el);
                        return;
                    } else {
                        el.classList.add('spacer-visible');
                    }
                } 

                const preset = state._static.preset_keys[key.click];
                
                let displayText = key.label;
                if (displayText === undefined || displayText === null || displayText === '') {
                    if (preset) {
                        if (preset.label === "enter_labels") {
                            displayText = state._static.style.enter_labels.default || "Enter";
                        } else if (!preset.label && preset.states) {
                            displayText = preset.states[0];
                        } else {
                            displayText = preset.label || key.click;
                        }
                    } else {
                        displayText = (key.click !== undefined && key.click !== null) ? String(key.click) : '';
                    }
                }

                let longClickSymbol = key.label_symbol || "";
                if (!longClickSymbol && key.long_click) {     
                    const lp = state._static.preset_keys[key.long_click];
                    longClickSymbol = (lp ? lp.label : key.long_click) || "";
                    if (longClickSymbol.length > 4) longClickSymbol = longClickSymbol.slice(0, 4); 
                }

                let popupText = key.preview || (preset ? preset.preview : null);
                if (!popupText) popupText = displayText;

                if (key.key_back_color) el.style.setProperty('--k-bg', `var(--${key.key_back_color})`); 
                else el.style.removeProperty('--k-bg');
                
                if (key.key_text_color) el.style.setProperty('--k-text', `var(--${key.key_text_color})`); 
                else el.style.removeProperty('--k-text');
                
                if (key.hilited_key_text_color) el.style.setProperty('--k-hilited-text', `var(--${key.hilited_key_text_color})`);
                else el.style.removeProperty('--k-hilited-text');

                if (key.hilited_key_back_color) el.style.setProperty('--k-hilited-bg', `var(--${key.hilited_key_back_color})`);
                else el.style.removeProperty('--k-hilited-bg');

                if (currentTab === 'layout') {
                    el.style.cursor = 'grab'; el.draggable = true;
                    el.ondragstart = () => { dragSrcIndex = idx; el.classList.add('dragging'); };
                    el.ondragover = e => e.preventDefault();
                    el.ondrop = e => { e.preventDefault(); moveKey(dragSrcIndex, idx); };
                    el.ondragend = () => el.classList.remove('dragging');
                }

                const isLong = (String(displayText).length > 1);
                const fontSize = isLong ? s.key_long_text_size : s.key_text_size;
                const symbolSize = s.symbol_text_size || 10;
                
                const safeDisplayText = (displayText === 0 || displayText === '0') ? '0' : (displayText || '');

                if (isFiller && isShowSpacers) {
                    el.innerHTML = `
                        <div class="key-inner" style="width:100%; height:100%; border-radius:${s.round_corner}px;">
                            <span class="key-label-text"></span>
                        </div>`;
                }else {
                    el.innerHTML = `
                        <div class="key-inner" style="border-radius:${s.round_corner}px; font-size:${fontSize}px; width:100%; height:100%; position:relative; border: ${s.key_border}px solid var(--k-border-color, var(--key_border_color, transparent)); text-shadow: 0px 0px ${s.shadow_radius || 0}px var(--shadow_color);">
                            ${longClickSymbol ? `<span class="key-symbol-top" style="font-size:${symbolSize}px">${longClickSymbol}</span>` : ''}
                            <span class="key-label-text">${String(safeDisplayText)}</span>
                        </div>`;
                }
                el.style.pointerEvents = 'auto';
                
               if (isBatchMode) {
                    el.onclick = () => {
                        if (batchSelectedKeys.has(idx)) batchSelectedKeys.delete(idx);
                        else batchSelectedKeys.add(idx);
                        document.getElementById('batch-count').innerText = batchSelectedKeys.size;
                        renderGlobalKeyboard();
                    };
                    if (batchSelectedKeys.has(idx)) {
                        el.style.outline = "4px solid #10b981"; 
                        el.style.outlineOffset = "2px";
                        el.style.transform = "scale(0.95)";
                        el.style.zIndex = "10";
                        
                        setTimeout(() => {
                            const inner = el.querySelector('.key-inner');
                            if(inner) {
                                inner.style.borderColor = "#10b981";
                            }
                        }, 0);
                    }
                } else {
                    el.onclick = (e) => { 
                        e.stopPropagation(); 
                        
                        updateCodePreview(key); 
                        if (isKeyEditorLocked) return; 
                        
                        selectedKeyIdx = idx; 
                        renderLayoutEditor(); 
                        renderGlobalKeyboard();
                        renderKeyEditorPanel(); 
                    };   
                }
                
                el.onmouseenter = () => { 
                    if (isGlobalPopupEnabled && !isFiller) showPopup(el, popupText); 
                };
                el.onmouseleave = () => { 
                    if (!isGlobalPopupEnabled || !isPopupLocked) hidePopup();
                    else if (isPopupLocked) {
                        const firstKey = viewport.querySelector('.key-item');
                        if (firstKey) showPopup(firstKey, layout.keys[0].label || layout.keys[0].click);
                    } 
                };

                el.addEventListener('mousedown', function(e) {
                    document.querySelectorAll('.key-item').forEach(k => k.classList.remove('key-pressed'));
                    this.classList.add('key-pressed');
                    
                    const onMouseUp = () => {
                        document.querySelectorAll('.key-item').forEach(k => k.classList.remove('key-pressed'));
                        window.removeEventListener('mouseup', onMouseUp);
                    };
                    window.addEventListener('mouseup', onMouseUp);
                });
                el.addEventListener('mouseleave', function() {
                    this.classList.remove('key-pressed');
                });

                rowEl.appendChild(el);
            });
            viewport.appendChild(rowEl);
        });



        if (isPopupLocked && isGlobalPopupEnabled) {
            const firstKey = viewport.querySelector('.key-item');
            if (firstKey) showPopup(firstKey, layout.keys[0].label || layout.keys[0].click);
        } else {
            hidePopup();
        }
    }

function showPopup(target, text) {
        const p = document.getElementById('preview-popup');
        const viewport = document.getElementById('global-keyboard-viewport'); 
        const s = state.style;
        
        if (!p || !viewport) return;

        p.innerText = text.toUpperCase();
        p.style.display = 'flex';
        p.style.width = `${s.popup_width}px`;
        p.style.height = `${s.popup_height}px`;
        p.style.fontSize = `${s.popup_text_size}px`;
        p.style.borderRadius = `${s.round_corner / 2}px`;

        const visibleKeyTop = target.offsetTop + viewport.offsetTop + (s.vertical_gap / 2);
        
        const centerX = target.offsetLeft + viewport.offsetLeft + target.offsetWidth / 2;

        p.style.left = `${centerX}px`;
        
        p.style.top = `${visibleKeyTop - s.popup_bottom_margin}px`;
    }

function hidePopup() { document.getElementById('preview-popup').style.display = 'none'; }

function toggleGlobalPopup() {
        isGlobalPopupEnabled = !isGlobalPopupEnabled;
        renderRenderDropdown();
        if (!isGlobalPopupEnabled) hidePopup();
        renderGlobalKeyboard();
    }

function togglePopupLock() {
        isPopupLocked = !isPopupLocked;
        renderRenderDropdown();
        if (typeof renderGlobalKeyboard === "function") {
            renderGlobalKeyboard();
        }
    }

function toggleWindowMode() {
        isWindowMode = !isWindowMode;
        renderRenderDropdown();
        renderGlobalKeyboard(); 
        if (currentTab === 'appearance') {
            renderAppearanceEditor();
        }
    }

function updateCssVariablesOnly() {
        const scheme = state.preset_color_schemes[currentScheme];
        if (!scheme) return;

        const keysToMap = [
        // 候选区核心
        'candidate_text_color',
        'comment_text_color',
        'candidate_separator_color', 
        // 候选区高亮
        'hilited_candidate_back_color',

        'hilited_candidate_text_color',
        'hilited_comment_text_color',
        // 编码区核心
        'text_back_color',
        'text_color',
        'hilited_text_color',
        'hilited_back_color',
        // 键盘核心
        'keyboard_back_color',
        'key_back_color',
        'key_text_color',
        'hilited_key_back_color', 
        'hilited_key_text_color',
        'key_border_color',
        'shadow_color',
        'back_color'
    ];

        let css = `:root {\n`;

        Object.entries(state.colors).forEach(([id, val]) => {
            css += `  --${id}: ${argbToCss(val)};\n`;
        });

        const mappedKeys = [...keysToMap, ...customMappings.filter(k => !keysToMap.includes(k))];
        mappedKeys.forEach(k => {
            const v = scheme[k];
            if (!v) return;
            if (v.startsWith('0x')) css += `  --${k}: ${argbToCss(v)};\n`;
            else css += `  --${k}: var(--${v});\n`;
        });

        // 补充：为 scheme 中其余颜色键生成 CSS 变量（alphabet_back / enter_back / 数字色板键等）
        Object.keys(scheme).forEach(k => {
            if (keysToMap.includes(k) || customMappings.includes(k)) return;
            const v = scheme[k];
            if (v === undefined || v === null || v === '') return;
            if (typeof v === 'number') {
                css += `  --${k}: ${argbToCss(v)};\n`;
            } else if (typeof v === 'string') {
                if (v.startsWith('0x') || v.startsWith('#')) {
                    css += `  --${k}: ${argbToCss(v)};\n`;
                } else if (state.colors[v]) {
                    css += `  --${k}: var(--${v});\n`;
                }
            }
        });

        css += `}`;
        document.getElementById('dynamic-theme').textContent = css;
    }

function updateCssEngine() {
        updateCssVariablesOnly(); 
        renderNodeEditor(); 
    }
