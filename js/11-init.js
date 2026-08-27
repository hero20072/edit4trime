




document.addEventListener("DOMContentLoaded", () => {
        const colorUpload = document.getElementById('image-upload');
            if (colorUpload) {
                colorUpload.addEventListener('change', handleImageUpload);
        }
        const authorAvatar = document.getElementById('author-avatar');
        if (authorAvatar && AVATAR_BASE64) authorAvatar.src = AVATAR_BASE64;
        
        if (AVATAR_BASE64) document.documentElement.style.setProperty('--author-avatar-bg', `url("${AVATAR_BASE64}")`);

        initPanelDrag();
    })




const PANEL_POS_KEY = 'trime-panel-positions-v3';


const PANEL_DEFAULT_POS = {
        'palette': { left: 0, top: 0 },
        'mapping': { left: 368, top: 0 }
    };

function loadPanelPositions() {
        try { return JSON.parse(localStorage.getItem(PANEL_POS_KEY) || '{}'); }
        catch (e) { return {}; }
    }

function savePanelPosition(name, left, top) {
        const saved = loadPanelPositions();
        saved[name] = { left, top };
        try { localStorage.setItem(PANEL_POS_KEY, JSON.stringify(saved)); } catch (e) {}
    }

function initPanelDrag() {
        const container = document.getElementById('right-tools-container');
        if (!container) return;

        const saved = loadPanelPositions();
        const panels = container.querySelectorAll('.glass-capsule[data-panel]');

        panels.forEach(panel => {
            const name = panel.getAttribute('data-panel');
            const pos = (saved[name] && typeof saved[name].left === 'number') ? saved[name] : PANEL_DEFAULT_POS[name];
            if (pos) {
                panel.style.left = pos.left + 'px';
                panel.style.top = pos.top + 'px';
            }
            const header = panel.querySelector('.capsule-header');
            if (header) header.addEventListener('mousedown', startPanelDrag);
        });

        
        ['palette-container', 'mapping-col'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('scroll', requestDrawWires);
        });
    }

function startPanelDrag(e) {
        if (e.button !== 0) return;
        if (e.target.closest('button')) return; 
        e.preventDefault();

        const panel = e.currentTarget.closest('.glass-capsule');
        const container = panel.closest('#right-tools-container');
        if (!panel || !container) return;

        const cRect = container.getBoundingClientRect();
        const pRect = panel.getBoundingClientRect();
        const offsetX = e.clientX - pRect.left;
        const offsetY = e.clientY - pRect.top;

        panel.classList.add('dragging');

        const onMove = (ev) => {
            const maxLeft = container.clientWidth - panel.offsetWidth;
            const maxTop = container.clientHeight - panel.offsetHeight;
            let left = ev.clientX - cRect.left - offsetX;
            let top = ev.clientY - cRect.top - offsetY;
            left = Math.max(0, Math.min(left, maxLeft));
            top = Math.max(0, Math.min(top, maxTop));
            panel.style.left = left + 'px';
            panel.style.top = top + 'px';
            requestDrawWires();
        };

        const onUp = () => {
            panel.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            savePanelPosition(panel.getAttribute('data-panel'), parseInt(panel.style.left) || 0, parseInt(panel.style.top) || 0);
            requestDrawWires();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

window.isFirstLoad = true

window.onload = () => { 
        const draft = loadDraft();
        if (draft) {
            state = draft.state;
            currentScheme = draft.currentScheme || 'default';
            currentLayout = draft.currentLayout || 'default';
        }
        extractCustomMappings();
        
        if (draft && Array.isArray(draft.customMappings)) {
            draft.customMappings.forEach(m => { if (!customMappings.includes(m)) customMappings.push(m); });
        }
        
        
        const asideEl = document.querySelector('aside');
        if (asideEl) {
            document.documentElement.style.setProperty('--right-tools-left', (asideEl.offsetWidth + 20) + 'px');
        }
        switchTab('layout'); 
        window.isFirstLoad = false; 
        updateCssEngine();

        const origSetPath = setPath;
        setPath = function(o, p, v) { origSetPath(o, p, v); scheduleSave(); };

        const origUpdateSchemeColor = updateSchemeColor;
        updateSchemeColor = function(key, val) { origUpdateSchemeColor(key, val); scheduleSave(); };

        const origHandleColorInput = handleColorInput;
        handleColorInput = function(id, hex, alpha) { origHandleColorInput(id, hex, alpha); scheduleSave(); };

        window.addEventListener('beforeunload', saveDraft);

        
        renderRenderDropdown();

        const importInput = document.getElementById('importFile');
        if (importInput) {
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    
                    
                    try {
                        let textToParse = event.target.result;

                        
                        textToParse = textToParse.replace(/([*&][a-zA-Z0-9_]+)@([a-zA-Z0-9_]+)/g, '$1_AT_$2');

                        
                        let dummyCounter = 1;
                        textToParse = textToParse.replace(/^(\s*)([^\x00-\xffa-zA-Z0-9_]{1,2})(\s*:)/gm, (match, p1, p2, p3) => {
                            return `${p1}${p2}_auto_${dummyCounter++}${p3}`;
                        });

                        let imported;
                        let retries = 100; 
                        let dupCounter = 0; 
                        let showDuplicateWarning = false; 

                        
                        while (retries > 0) {
                            try {
                                imported = jsyaml.load(textToParse);
                                break; 
                            } catch (err) {
                                if (err.name === 'YAMLException') {
                                    
                                    if (err.message.includes('unidentified alias')) {
                                        const match = err.message.match(/unidentified alias "([^"]+)"/);
                                        if (match && match[1]) {
                                            const aliasName = match[1];
                                            const regex = new RegExp(`\\*${aliasName}\\b`, 'g');
                                            textToParse = textToParse.replace(regex, `"_REF_${aliasName}_"`);
                                            retries--;
                                            continue;
                                        }
                                    }
                                    
                                    // 拦截 2：重复的键 (duplicated mapping key) - 自动绕过
                                    if (err.message.includes('duplicated mapping key')) {
                                        showDuplicateWarning = true;
                                        // js-yaml 的错误对象通常包含 mark 信息 (line, column)
                                        if (err.mark && err.mark.line !== undefined && err.mark.column !== undefined) {
                                            const lineIdx = err.mark.line;
                                            const colIdx = err.mark.column;
                                            let lines = textToParse.split('\n');
                                            
                                            // 核心魔法：在重复的键前面悄悄加上唯一前缀
                                            if (lines[lineIdx]) {
                                                dupCounter++;
                                                // 在报错的列位置插入 __DUP_x_ 前缀
                                                lines[lineIdx] = lines[lineIdx].substring(0, colIdx) + `__DUP_${dupCounter}_` + lines[lineIdx].substring(colIdx);
                                                textToParse = lines.join('\n');
                                                retries--;
                                                continue; // 重试解析
                                            }
                                        }
                                    }
                                }
                                throw err; // 无法自愈的错误，抛出到外层 catch
                            }
                        }

                        if (!imported || !imported.preset_keyboards) {
                            throw new Error("无效的配置文件：未找到 preset_keyboards 数据。");
                        }

                        // --- 数据处理与赋值 ---
                        if (imported.colors) {
                            Object.keys(imported.colors).forEach(id => {
                                let val = imported.colors[id];
                                if (typeof val === 'number') {
                                    imported.colors[id] = '0x' + val.toString(16).toUpperCase().padStart(8, '0');
                                }
                            });
                            state.colors = imported.colors;
                        }

                        state.config_version = imported.config_version || "3.0";
                        state.name = imported.name || "未命名导入";
                        
                        if (imported.style) state.style = Object.assign({}, state.style, imported.style);
                        if (imported.preedit) state.preedit = Object.assign({}, state.preedit, imported.preedit);
                        if (imported.window) state.window = Object.assign({}, state.window, imported.window);
                        
                        if (imported.liquid_keyboard) state._static.liquid_keyboard = imported.liquid_keyboard;
                        if (imported.preset_keys) state._static.preset_keys = imported.preset_keys;
                        if (imported.fallback_colors) state._static.fallback_colors = imported.fallback_colors;
                        if (imported.preset_color_schemes) state.preset_color_schemes = imported.preset_color_schemes;
                        if (imported.preset_keyboards) state.preset_keyboards = imported.preset_keyboards;

                        // 兼容处理：js-yaml 会把裸 0x 颜色解析为数字，统一转为 0x 字符串
                        Object.values(state.preset_color_schemes).forEach(scheme => {
                            Object.keys(scheme).forEach(key => {
                                if (typeof scheme[key] === 'number') {
                                    scheme[key] = '0x' + scheme[key].toString(16).toUpperCase().padStart(8, '0');
                                }
                            });
                        });

                        // 修复颜色引用
                        Object.values(state.preset_color_schemes).forEach(scheme => {
                            Object.keys(scheme).forEach(key => {
                                let val = scheme[key];
                                let hexStr = (typeof val === 'number') ? 
                                    '0x' + val.toString(16).toUpperCase().padStart(8, '0') : String(val);
                                
                                const match = Object.entries(state.colors).find(([cid, cval]) => 
                                    cval.toLowerCase() === hexStr.toLowerCase()
                                );
                                if (match) scheme[key] = match[0]; 
                            });
                        });

                        extractCustomMappings();
                        currentScheme = Object.keys(state.preset_color_schemes)[0] || "default";
                        currentLayout = Object.keys(state.preset_keyboards)[0] || "default";
                        selectedKeyIdx = null;

                        updateCssEngine();
                        if (currentTab === 'general') renderGeneralEditor();
                        else if (currentTab === 'appearance') renderAppearanceEditor();
                        else renderLayoutEditor();
                        renderGlobalKeyboard();

                        // 成功提示
                        addChatMessage('left', `导入成功！已识别方案：${Object.keys(state.preset_color_schemes).length}个，键盘：${Object.keys(state.preset_keyboards).length}个。`);
                        
                        // 【新增】如果触发了重复键修复，显示温馨提示
                        if (showDuplicateWarning) {
                            const warningMsg = `
                                <div style="color: #475569; margin-top: 5px; font-size: 12px; line-height: 1.5; background: #fffbeb; padding: 10px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                                    <b>格式兼容提示：已自动绕过重复属性</b><br><br>
                                    您的文件中包含重复的键（Duplicated Keys）。同文输入法(Trime)通常会忽略重复项，但标准YAML语法不允许。<br><br>
                                    <b>工坊已自动为您忽略这些重复项并完成读取。</b><br>
                                    如果遇到极个别文件依然无法上传，建议使用文本编辑器检查是否有完全重复的配置行，或使用语法检查工具：<br>
                                    <a href="https:
                                </div>
                            `;
                            setTimeout(() => addChatMessage('left', warningMsg, false, true), 300);
                        }

                        importInput.value = '';

                    } catch (err) {
                        console.error(err);
                        
                        // 错误弹窗逻辑
                        const errorPopup = document.getElementById('import-error-popup');
                        const pTags = errorPopup.querySelectorAll('p');
                        
                        pTags[0].innerHTML = "导入失败";
                        // 错误信息可能来自外部文件，使用 textContent 防止 HTML 注入
                        pTags[1].textContent = err.message; 
                        pTags[1].className = "text-slate-300 text-sm text-left leading-relaxed break-all"; // 允许换行
                        
                        if (pTags[2]) {
                            pTags[2].innerHTML = `<a href="https://www.yamlvalidator.org/zh" target="_blank" class="text-blue-400 underline">点击检查YAML语法</a>`;
                            pTags[2].style.display = 'block';
                        }

                        errorPopup.classList.remove('hidden');
                        importInput.value = '';
                    }
                };
                reader.readAsText(file);
            };
        }
        setTimeout(() => {
            addChatMessage('left', '欢迎体验键帽工坊！（更多功能请使用桌面版）。');
            
        }, 400);


    }

document.addEventListener('click', function(e) {
        const panel = document.getElementById('key-editor-panel');
            if (panel && panel.style.display !== 'none') {
                if (panel.contains(e.target)) {
                    return;
                }
                panel.style.display = 'none';
                selectedKeyIdx = null;
                renderGlobalKeyboard();
            }
        const popup = document.getElementById('mapping-popup');
            if (popup && popup.style.display !== 'none' && !popup.contains(e.target)) {
                popup.style.display = 'none';
            }
        
        
            const partialPopup = document.getElementById('partial-export-popup');
        const partialBtn = document.querySelector('button[onclick="togglePartialExportPopup()"]');
        if (partialPopup && !partialPopup.classList.contains('hidden')) {
            if (!partialPopup.contains(e.target) && e.target !== partialBtn) {
                partialPopup.classList.add('hidden');
            }
        }
    })
