// ============================================================
// 07-editors.js — editors
// 由 test.html 拆分而来（无构建，经典脚本，按 01→11 顺序引入）
// ============================================================

function toggleKeyEditorLock() {
        isKeyEditorLocked = !isKeyEditorLocked;
        renderRenderDropdown();
    }

function switchTab(t) {
        if (currentTab === t && document.getElementById('chat-viewport').children.length > 0) {
            return; 
        }

        if (t === 'layout') {
            if (currentTab !== 'layout') {
                userPopupLockPreference = isPopupLocked;
            }
            isPopupLocked = false; 
        } else {
            if (currentTab === 'layout') {
                isPopupLocked = userPopupLockPreference;
            }
        }

        currentTab = t;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tab-'+t));
        
        if (!window.isFirstLoad) {
            triggerTutorial(t);
        }
        
        
        if (t === 'layout') {
            renderNodeEditor();
        }
        updateCapsuleVisibility();

        if (t === 'general') renderGeneralEditor();
        else if (t === 'appearance') renderAppearanceEditor();
        else renderLayoutEditor();

        renderGlobalKeyboard();
        updateCssEngine();
    }

function renderGeneralEditor() {
        const v = document.getElementById('editor-viewport'); 
        v.innerHTML = '<div class="p-4 pb-20"></div>'; 
        
        meta.general.forEach(g => {
            v.firstChild.innerHTML += `<div class="group-title ">${g.title}</div>`;
            g.items.forEach(i => {
                const val = getPath(state, i.k) || '';
                let ctrl = '';
                
                if (i.t === 'bool') {
                    ctrl = `<input type="checkbox" ${val ? 'checked' : ''} 
                            onchange="setPath(state,'${i.k}',this.checked); renderGlobalKeyboard()" 
                            class="w-5 h-5 accent-emerald-500 cursor-pointer">`;
                } else if (i.t === 'font') {
                    ctrl = `
                        <div class="flex gap-2 w-full max-w-[200px]">
                            <input type="text" id="input-${i.k}" value="${escapeHtml(val)}" 
                                class="input-dark text-[13px] font-preview-input flex-1" 
                                oninput="setPath(state,'${i.k}',this.value); renderGlobalKeyboard()">
                            <button onclick="triggerFontUpload('${i.k}')" 
                                    class="bg-slate-700 hover:bg-slate-600 px-2 rounded text-[13px] text-white transition shadow-sm">
                                ↑
                            </button>
                        </div>`;
                }

                else if (i.t === 'string') {
                    const valStr = (i.k === 'name' || i.k === 'author') ? (state[i.k] || '') : (getPath(state, i.k) || '');
                    ctrl = `
                        <div class="flex gap-2 w-full max-w-[200px]">
                            <input type="text" value="${escapeHtml(valStr)}" 
                                class="input-dark text-[13px] flex-1" 
                                oninput="if('${i.k}'==='name'||'${i.k}'==='author'){state['${i.k}']=this.value}else{setPath(state,'${i.k}',this.value)}">
                        </div>`;
                }

                else if (i.t === 'info') {
                    ctrl = `
                        <div class="flex flex-col items-end w-full max-w-[200px]">
                            <div class="text-[12px] text-slate-500 italic mb-1 text-right w-full truncate">${i.note}</div>
                            <div class="text-[12px] text-slate-600 bg-slate-900/30 px-2 py-1 rounded border border-slate-800/50 w-full text-right">
                                导出时自动覆盖
                            </div>
                        </div>`;
                }

                v.firstChild.innerHTML += `
                    <div class="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg mb-2 cursor-pointer"
                        onclick="introduceSetting('${i.k}', '${i.l}')">
                        <span class="text-[16px] font-medium text-slate-300">${i.l}</span>
                        ${ctrl}
                    </div>`;
            });
        });
    }

function renderAppearanceEditor() {
        const v = document.getElementById('editor-viewport'); 
        v.innerHTML = '<div class="p-4 pb-20"></div>'; 
        const container = v.firstChild;

        meta.appearance.forEach(g => {
            container.innerHTML += `<div class="group-title">${g.title}</div>`;
            
            if (g.title === "3. 候选窗口 (悬浮模式)" && !isWindowMode) {
                container.innerHTML += `
                    <div class="bg-slate-800/20 border border-slate-800/50 rounded-lg p-3 mb-4 flex items-center justify-center">
                        <span class="text-[12px] text-slate-500 italic">打开顶部按钮可设置。</span>
                    </div>`;
                return;
            }

            g.items.forEach(i => {
                let itemHtml = '';
                if(i.t === 'lock') {
                const val = getPath(state, i.k);
                itemHtml = `
                    <div class="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-800/50 rounded-lg mb-2">
                        <span class="text-[16px] font-medium text-slate-300">${i.l}</span>
                        <input type="checkbox" ${val ? 'checked' : ''} 
                            onchange="setPath(state,'${i.k}',this.checked); renderGlobalKeyboard();" 
                            class="w-5 h-5 accent-emerald-500 cursor-pointer">
                    </div>`;
                }
                else if (i.t === 'toggleButton') {
                const val = getPath(state, i.k); 
                itemHtml = `
                    <div class="flex justify-between items-center p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg mb-4">
                        <span class="text-[16px] font-medium text-slate-300">${i.l}</span>
                        <button onclick="setPath(state,'${i.k}', !${val}); renderAppearanceEditor(); renderGlobalKeyboard();"
                                class="px-4 py-1.5 rounded-full text-[14px] font-bold transition-all border 
                                       ${val ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-700 text-slate-400 border-slate-600'}">
                            ${val ? '上方' : '右方'}
                        </button>
                    </div>`;
                }
                else {
                    const val = getPath(state, i.k);
                    itemHtml = `
                        <div class="control-item" onclick="introduceSetting('${i.k}', '${i.l}')">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-[16px] text-slate-300 font-medium">${i.l}</span>
                                <span class="text-[18px] text-emerald-400 font-mono font-bold px-1.5 rounded">${val}</span>
                            </div>
                            <input type="range" min="${i.min}" max="${i.max}" step="${i.step||1}" value="${val}" 
                                onmousedown="event.stopPropagation();" ontouchstart="event.stopPropagation();"
                                oninput="setPath(state,'${i.k}',parseFloat(this.value)); renderGlobalKeyboard(); this.closest('.control-item').querySelector('.font-mono').innerText=this.value;" 
                                class="w-full h-1 my-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500">
                        </div>`;
                }
                container.innerHTML += itemHtml;
            });
        });
    }

function renderColorMapRow(key, label) {
        const scheme = state.preset_color_schemes[currentScheme];
        if (!scheme) return '';
        
        const currentVal = scheme[key] || "";
        const options = `<option value="">(直接输入值)</option>` + 
            Object.keys(state.colors).map(c => 
                `<option value="${c}" ${currentVal === c ? 'selected' : ''}>*${c}</option>`
            ).join('');

        return `
            <div class="flex items-center justify-between p-2 mb-1.5 bg-slate-800/30 border border-slate-700/50 rounded hover:bg-slate-800/50 transition">
                <span class="text-[14px] text-slate-400 flex-1 truncate" title="${label} (${key})">${label}</span>
                <div class="flex gap-1 flex-1">
                    <select onchange="updateSchemeColor('${key}', this.value)" 
                            onclick="event.stopPropagation()"
                            class="bg-slate-900 border border-slate-700 text-[14px] p-1 rounded flex-1 outline-none text-slate-300 focus:border-emerald-500">
                        ${options}
                    </select>
                </div>
            </div>
        `;
    }

function updateSchemeColor(key, val) {
        if (!state.preset_color_schemes[currentScheme]) return;
        state.preset_color_schemes[currentScheme][key] = val;
        updateCssEngine();
    }

function renderLayoutEditor() {
        const v = document.getElementById('editor-viewport');
        if (!v) return;
        v.innerHTML = ''; 

        
        let schemeManagerHtml = `
            <div class="m-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner" onclick="introduceSetting('scheme_manager_intro', '配色方案管理')">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-emerald-400">配色方案管理</h3>
                        <button onclick="event.stopPropagation(); isSchemeManagerCollapsed = !isSchemeManagerCollapsed; renderLayoutEditor();"
                                class="px-3 py-0.5 rounded text-[14px] font-bold transition-all border ${isSchemeManagerCollapsed ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-slate-200'}">
                            ${isSchemeManagerCollapsed ? '已收起' : '收起'}
                        </button>
                    </div>
                    <button onclick="event.stopPropagation(); createNewScheme()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-[14px] font-bold transition-all shadow-lg">+</button>
                </div>
                <div class="space-y-3">
        `;

        if (isSchemeManagerCollapsed) {
            schemeManagerHtml += `<div class="flex flex-wrap gap-2 pt-1">`;
            Object.keys(state.preset_color_schemes).forEach(id => {
                const scheme = state.preset_color_schemes[id];
                const isActive = (currentScheme === id);
                schemeManagerHtml += `
                    <button 
                            onmousedown="startPressTimer('scheme', '${id}')" 
                            onmouseup="cancelPressTimer()" 
                            onmouseleave="cancelPressTimer()"
                            ontouchstart="startPressTimer('scheme', '${id}')" 
                            ontouchend="cancelPressTimer()" 
                            ontouchcancel="cancelPressTimer()"
                            ondblclick="duplicateScheme('${id}')"
                            onclick="event.stopPropagation(); if(!isLongPressTriggered){ currentScheme='${id}'; renderLayoutEditor(); updateCssEngine(); }"
                            oncontextmenu="return false;"
                            class="select-none px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${isActive ? 'bg-emerald-600 text-white border-emerald-500 shadow-md transform scale-105' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'}">
                        ${escapeHtml(scheme.name || id)}
                    </button>`;
            });
            schemeManagerHtml += `</div>`;
        } else {
            Object.keys(state.preset_color_schemes).forEach(id => {
                const scheme = state.preset_color_schemes[id];
                const isDefault = (id === 'default');
                const isDarkSelected = state.preset_color_schemes.default?.dark_scheme === id;

                schemeManagerHtml += `
                    <div class="p-3 ${currentScheme === id ? 'bg-slate-700/60 ring-1 ring-emerald-500/50' : 'bg-slate-900/60'} rounded-lg border border-slate-700/50 group cursor-pointer" 
                        onclick="if(event.target.tagName !== 'SELECT' && event.target.tagName !== 'INPUT') { currentScheme='${id}'; renderLayoutEditor(); updateCssEngine(); }">
                        <div class="grid grid-cols-2 gap-x-3 gap-y-2">
                            <div class="space-y-1" onclick="introduceSetting('scheme_type_select', '用途')">
                                <label class="text-[12px] text-slate-500 uppercase">用途</label>
                                <select onclick="event.stopPropagation()" onchange="event.stopPropagation(); handleSchemeTypeChange('${id}', this.value)"
                                        class="input-dark text-sm h-7 border-emerald-900/30 focus:border-emerald-500">
                                    <option value="default" ${isDefault ? 'selected' : ''}>默认配色 (default)</option>
                                    <option value="custom" ${!isDefault ? 'selected' : ''}>自定义英文名称</option>
                                </select>
                            </div>
                            <div class="space-y-1  ${isDefault ? 'opacity-30 pointer-events-none' : ''}" onclick="introduceSetting('scheme_id_input', '英文标识名')">
                                <label class="text-[12px] text-slate-500 uppercase">英文标识名</label>
                                <input type="text" value="${id}" onclick="event.stopPropagation()" onchange="event.stopPropagation(); changeSchemeId('${id}', this.value)"
                                    class="input-dark text-sm h-7" ${isDefault ? 'disabled' : ''}>
                            </div>
                            <div class="space-y-1" onclick="introduceSetting('scheme_name_input', '方案名称')">
                                <label class="text-[12px] text-slate-500 uppercase">方案名称</label>
                                <input type="text" value="${escapeHtml(scheme.name || '')}" oninput="state.preset_color_schemes['${id}'].name=this.value; scheduleSave()"
                                    onclick="event.stopPropagation()" class="input-dark text-sm h-7" >
                            </div>
                            <div class="space-y-1" onclick="introduceSetting('scheme_author_input', '作者')">
                                <label class="text-[12px] text-slate-500 uppercase">作者</label>
                                <input type="text" value="${escapeHtml(scheme.author || '')}" oninput="state.preset_color_schemes['${id}'].author=this.value; scheduleSave()"
                                    onclick="event.stopPropagation()" class="input-dark text-sm h-7">
                            </div>

                            <div class="col-span-1 flex items-center gap-2 pt-2" onclick="introduceSetting('dark_scheme_toggle', '黑暗模式切换')">
                                <input type="checkbox" id="dark_check_${id}" ${isDarkSelected ? 'checked' : ''} ${isDefault ? 'disabled' : ''}
                                    onchange="event.stopPropagation(); toggleDarkScheme('${id}', this.checked)"
                                    class="w-4 h-4 accent-emerald-500 ${isDefault ? 'opacity-20' : ''}">
                                <label for="dark_check_${id}" class="text-[16px] ${isDefault ? 'text-slate-600' : 'text-slate-400'}">设为黑暗模式</label>
                            </div>
                            <div class="col-span-1 flex justify-end pt-2" onclick="introduceSetting('scheme_delete_btn', '删除按钮')">
                                <button onclick="event.stopPropagation(); removeScheme('${id}')" 
                                        class="text-[14px] text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">删除</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        schemeManagerHtml += `</div></div>`;
        v.innerHTML = schemeManagerHtml;

        if (meta.colorMeta) {
            let colorMapHtml = `<div class="mx-4 mb-6 border-t border-slate-800 pt-4">`;
            meta.colorMeta.forEach(group => {
                const isCollapsed = colorGroupCollapseState[group.group];

        colorMapHtml += `
                    <div class="mb-4 rounded-lg border ${isCollapsed ? 'border-slate-700/50' : 'border-slate-700'} bg-slate-800/30 overflow-hidden">
                        <div class="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/50 transition"
                            onclick="toggleColorGroup('${group.group}')">
                            <div class="flex items-center gap-2">
                                <h4 class="text-sm font-bold text-slate-300">${group.group}</h4>
                            </div>
                            <button class="px-3 py-1 rounded text-[14px] font-bold transition-all border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700">
                                ${isCollapsed ? '已收起' : '收起'}
                            </button>
                        </div>
                        <div class="${isCollapsed ? 'hidden' : 'block'} px-3 pb-3 space-y-1">
                `;
                if (!isCollapsed) {
                    group.items.forEach(item => {
                        colorMapHtml += renderColorMapRow(item.k, item.l);
                    });
                }
                colorMapHtml += `</div></div>`;
            });
            colorMapHtml += `</div>`;
            v.innerHTML += colorMapHtml;
        }

        v.innerHTML += `
        <div class="relative my-10">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-700/50"></div>
            </div>
            <div class="relative flex justify-center">
                <span class="bg-slate-900 px-4 text-slate-500 font-mono uppercase tracking-wider">分隔线</span>
            </div>
        </div>
        `;

        let layoutManagerHtml = `
                <div class="m-4 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-inner">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                            <h3 class="text-sm font-bold text-emerald-400">布局方案管理</h3>
                            <button onclick="isLayoutManagerCollapsed = !isLayoutManagerCollapsed; renderLayoutEditor();"
                                    class="px-3 py-0.5 rounded text-[14px] font-bold transition-all border 
                                        ${isLayoutManagerCollapsed ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-700 text-slate-400 border-slate-600 hover:text-slate-200'}">
                                ${isLayoutManagerCollapsed ? '已收起' : '收起'}
                            </button>
                        </div>
                        <button onclick="createNewLayout()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-[14px] font-bold transition-all shadow-lg">+</button>
                    </div>
                    <div class="space-y-3">
            `;

            if (isLayoutManagerCollapsed) {
                layoutManagerHtml += `<div class="flex flex-wrap gap-2 pt-1">`;
                Object.keys(state.preset_keyboards).forEach(id => {
                    const kb = state.preset_keyboards[id];
                    const isActive = (currentLayout === id);
                    layoutManagerHtml += `
                        <button 
                                onmousedown="startPressTimer('layout', '${id}')" 
                                onmouseup="cancelPressTimer()" 
                                onmouseleave="cancelPressTimer()"
                                ontouchstart="startPressTimer('layout', '${id}')" 
                                ontouchend="cancelPressTimer()" 
                                ontouchcancel="cancelPressTimer()"
                                ondblclick="duplicateLayout('${id}')"
                                onclick="if(!isLongPressTriggered){ currentLayout='${id}'; selectedKeyIdx=null; cancelBatchMode(); renderLayoutEditor(); renderGlobalKeyboard(); }"
                                oncontextmenu="return false;"
                                class="select-none px-4 py-1.5 rounded-full text-xs font-medium border transition-all 
                                    ${isActive ? 'bg-emerald-600 text-white border-emerald-500 shadow-md transform scale-105' : 'bg-slate-900 text-slate-500 border-slate-700 hover:border-slate-500'}">
                            ${kb.name || id}
                        </button>`;
                });
                layoutManagerHtml += `</div>`;
            } else {
                Object.keys(state.preset_keyboards).forEach(id => {
                    const kb = state.preset_keyboards[id];
                    const isStandard = (id === 'default' || id === 'number');
                    const isDisabled = isStandard && (forceUnlockId !== id);

                    layoutManagerHtml += `
                        <div class="p-3 ${currentLayout === id ? 'bg-slate-700/60 ring-1 ring-emerald-500/50' : 'bg-slate-900/60'} rounded-lg border border-slate-700/50 group cursor-pointer" 
                            onclick="if(event.target.tagName !== 'SELECT' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'BUTTON') { currentLayout='${id}'; selectedKeyIdx=null; renderLayoutEditor(); renderGlobalKeyboard(); }">
                            <div class="grid grid-cols-2 gap-x-3 gap-y-2">
                                <div class="space-y-1">
                                    <label class="text-[12px] text-slate-500 uppercase">用途</label>
                                    <select onclick="event.stopPropagation()" onchange="event.stopPropagation(); handleLayoutTypeChange('${id}', this.value)" class="input-dark text-sm h-7">
                                        <option value="default" ${id === 'default' ? 'selected' : ''}>默认键盘 (default)</option>
                                        <option value="number" ${id === 'number' ? 'selected' : ''}>数字键盘 (number)</option>
                                        <option value="custom" ${(!isStandard || forceUnlockId === id) ? 'selected' : ''}>自定义</option>
                                    </select>
                                </div>
                                <div class="space-y-1 ${isDisabled ? 'opacity-30 pointer-events-none' : ''}">
                                    <label class="text-[12px] text-slate-500 uppercase">英文标识名</label>
                                    <input type="text" id="id_input_${id}" value="${id}" onclick="event.stopPropagation()" onchange="event.stopPropagation(); changeLayoutId('${id}', this.value)" class="input-dark text-sm h-7" ${isDisabled ? 'disabled' : ''}>
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[12px] text-slate-500 uppercase">名称</label>
                                    <input type="text" value="${kb.name || ''}" oninput="state.preset_keyboards['${id}'].name=this.value; scheduleSave()" onclick="event.stopPropagation()" class="input-dark text-sm h-7">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[12px] text-slate-500 uppercase">作者</label>
                                    <input type="text" value="${kb.author || ''}" oninput="state.preset_keyboards['${id}'].author=this.value; scheduleSave()" onclick="event.stopPropagation()" class="input-dark text-sm h-7">
                                </div>
                                <div class="space-y-1">
                                    <label class="text-[12px] text-slate-500 uppercase">初始模式 (ascii_mode)</label>
                                    <select onclick="event.stopPropagation()" 
                                            onchange="state.preset_keyboards['${id}'].ascii_mode = parseInt(this.value); scheduleSave()" 
                                            class="input-dark text-sm h-7">
                                        <option value="0" ${kb.ascii_mode == 0 ? 'selected' : ''}>中文 (0)</option>
                                        <option value="1" ${kb.ascii_mode == 1 ? 'selected' : ''}>英文 (1)</option>
                                    </select>
                                </div>
                                
                                <div class="col-span-2 flex justify-end">
                                    <button onclick="event.stopPropagation(); removeLayout('${id}')" class="text-[14px] text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all font-bold">删除方案</button>
                                </div>
                            </div>
                        </div>`;
                });
            }

            layoutManagerHtml += `</div></div>`;
            v.innerHTML += layoutManagerHtml;

        const layout = state.preset_keyboards[currentLayout];
        if (!layout) return;

        v.innerHTML += `
            <div class="p-4 border-b border-slate-800 bg-slate-900/50 mx-4 rounded-xl border border-slate-700">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-sm font-bold text-slate-300">当前布局: <span class="text-emerald-400">${currentLayout}</span></h3>
                    <button onclick="addNewKey()" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold transition-all shadow-md">+ 按键</button>
                </div>

                <div class="grid grid-cols-1 gap-3">
                    <div class="space-y-1">
                        <label class="text-[14px] text-slate-400">布局名称 (name)</label>
                        <input type="text" value="${layout.name||''}" oninput="state.preset_keyboards['${currentLayout}'].name=this.value; scheduleSave()" class="input-dark">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[14px] text-slate-400">默认键宽 (width%)</label>
                        <input type="number" value="${layout.width||10}" oninput="state.preset_keyboards['${currentLayout}'].width=parseFloat(this.value); renderGlobalKeyboard(); scheduleSave()" class="input-dark">
                    </div>
                    <div class="space-y-1" title="由于像素不可分割，余数高度默认由倒数第一行(-1)吸收">
                        <label class="text-[14px] text-slate-400">吸收余数行</label>
                        <input type="number" placeholder="-1" value="${layout.auto_height_index!==undefined ? layout.auto_height_index : ''}" oninput="state.preset_keyboards['${currentLayout}'].auto_height_index=this.value ? parseInt(this.value) : undefined; renderGlobalKeyboard(); scheduleSave()" class="input-dark">
                    </div>
                </div>

            </div>`;
    }

function renderKeyEditorPanel() {
        const panel = document.getElementById('key-editor-panel');
        const layout = state.preset_keyboards[currentLayout];
        
        if (selectedKeyIdx === null || !layout || !layout.keys[selectedKeyIdx]) {
            panel.style.display = 'none';
            return;
        }

        const key = layout.keys[selectedKeyIdx];
        panel.style.display = 'block';

        const generateFunctionalInput = (icon, label, field, currentValue) => {
            const keyCnMap = {
                    "VOICE_ASSIST": "语音助手｜VOICE_ASSIST",
                    "Shift_L": "上档键｜Shift_L",
                    "Shift_L2": "选择键｜Shift_L2",
                    "Shift_L3": "锁定大写｜Shift_L3",
                    "Return": "回车键｜Return",
                    "Return1": "回车键｜Return1",
                    "Return2": "回车键｜Return2",
                    "Hide": "隐藏键盘｜Hide",
                    "BackSpace": "点击删除｜BackSpace",
                    "BackSpace2": "滑动删除｜BackSpace2",
                    "space": "空格键｜space",
                    "space1": "空格键｜space1",
                    "Clear": "清空输入框｜Clear",
                    "Escape": "取消/退出｜Escape",
                    "Home": "跳转行首｜Home",
                    "Insert": "插入模式｜Insert",
                    "Delete": "向后删除｜Delete",
                    "End": "跳转行尾｜End",
                    "Page_Up": "向上翻页｜Page_Up",
                    "Page_Down": "向下翻页｜Page_Down",
                    "Left": "光标左移｜Left",
                    "Down": "光标下移｜Down",
                    "Up": "光标上移｜Up",
                    "Right": "光标右移｜Right",
                    "Left1": "光标左跳｜Left1",
                    "Right1": "光标右跳｜Right1",
                    "BackToPreviousSyllable": "删除音节词｜BackToPreviousSyllable",
                    "CommitRawInput": "提交原始编码｜CommitRawInput",
                    "CommitScriptText": "提交文本编码｜CommitScriptText",
                    "CommitComment": "提交注释编码｜CommitComment",
                    "DeleteCandidate": "删除候选词词｜DeleteCandidate",
                    "delimiter": "分词符｜delimiter",
                    "select_all": "全选｜select_all",
                    "cut": "剪切｜cut",
                    "copy": "复制｜copy",
                    "paste": "粘贴｜paste",
                    "paste_clip": "剪贴板粘贴｜paste_clip",
                    "paste_text": "粘贴文本｜paste_text",
                    "share_text": "分享文本｜share_text",
                    "redo": "重做｜redo",
                    "undo": "撤销｜undo",
                    "Mode_switch": "中英切换｜Mode_switch",
                    "Zenkaku_Hankaku": "全半角切换｜Zenkaku_Hankaku",
                    "Henkan": "简繁转换｜Henkan",
                    "Charset_switch": "字符集切换｜Charset_switch",
                    "Punct_switch": "标点符号切换｜Punct_switch",
                    "IME_switch": "切换输入法｜IME_switch",
                    "Schema_switch": "下一方案｜Schema_switch",
                    "Schema_Eng": "英文方案｜Schema_Eng",
                    "F4": "方案菜单｜F4",
                    "Keyboard_letter": "字母键盘｜Keyboard_letter",
                    "Keyboard_default": "返回默认键盘｜Keyboard_default",
                    "Keyboard_switch": "切换键盘布局｜Keyboard_switch",
                    "Keyboard_number": "数字键盘｜Keyboard_number",
                    "Keyboard_editor": "编辑键盘｜Keyboard_editor",
                    "Keyboard_symbols": "符号键盘｜Keyboard_symbols",
                    "Keyboard_move": "移动模式｜Keyboard_move",
                    "Keyboard_next": "下一键盘｜Keyboard_next",
                    "Keyboard_last": "上一键盘｜Keyboard_last",
                    "Keyboard_last_lock": "返回并锁定｜Keyboard_last_lock",
                    "Menu": "菜单｜Menu",
                    "Settings": "设置｜Settings",
                    "Theme_settings": "主题设置｜Theme_settings",
                    "Color_switch": "配色切换｜Color_switch",
                    "Date": "当前日期｜Date",
                    "Time": "当前时间｜Time",
                    "liquid_keyboard_exit": "返回(液态)｜liquid_keyboard_exit",
                    "liquid_keyboard_switch": "更多(液态)｜liquid_keyboard_switch",
                    "liquid_keyboard_tabs": "分页(液态)｜liquid_keyboard_tabs",
                    "liquid_keyboard_emoji": "表情符号｜liquid_keyboard_emoji",
                    "liquid_keyboard_ascii": "英文字符｜liquid_keyboard_ascii",
                    "menu_keyboard": "键盘菜单｜menu_keyboard",
                    "clipboard_window": "剪贴板窗口｜clipboard_window"
                };

            const presetNames = Object.keys(state._static.preset_keys || {}).sort();
            const presetOptions = `<option value="">选择预设</option>` + 
                presetNames.map(name => {
                    const displayName = keyCnMap[name] || name;
                    return `<option value="${name}" ${currentValue === name ? 'selected' : ''}>${displayName}</option>`;
                }).join('');
            
            return `
                <div class="function-item">
                    <div class="func-label">${icon ? icon + ' ' : ''}${label}</div>
                    <div class="func-inputs">
                        <input type="text" id="input_${field}" value="${currentValue || ''}" 
                            oninput="updateKeyData('${field}', this.value)" 
                            class="input-dark flex-1 font-mono text-emerald-400" placeholder="未设置">
                        <select onchange="const val=this.value; if(val){ document.getElementById('input_${field}').value=val; updateKeyData('${field}', val); }" 
                                class="outline-none" style="width:120px">
                            ${presetOptions}
                        </select>
                    </div>
                </div>`;
        };

        const sysOptions = ['key_back_color', 'key_text_color', 'hilited_key_back_color', 'hilited_key_text_color', 'hilited_candidate_back_color'];
        const allMappingsForDropdown = [...sysOptions, ...customMappings];
        const colorOptions = `<option value="">(默认透明)</option>` + 
            allMappingsForDropdown.map(k => `<option value="${k}" ${key.key_back_color === k ? 'selected' : ''}>${k}</option>`).join('');
        const hilitedColorOptions = `<option value="">(默认透明)</option>` + 
            allMappingsForDropdown.map(k => `<option value="${k}" ${key.hilited_key_back_color === k ? 'selected' : ''}>${k}</option>`).join('');
        const textOptions = `<option value="">(默认继承)</option>` + 
            allMappingsForDropdown.map(k => `<option value="${k}" ${key.key_text_color === k ? 'selected' : ''}>${k}</option>`).join('');
        const hilitedTextOptions = `<option value="">(默认继承)</option>` + 
            allMappingsForDropdown.map(k => `<option value="${k}" ${key.hilited_key_text_color === k ? 'selected' : ''}>${k}</option>`).join('');

        panel.innerHTML = `
            <div class="panel-header">
                <div class="header-left">
                    <span class="key-id-badge">ID: ${selectedKeyIdx}</span>
                    <span class="header-title">编辑按键</span>
                </div>
                <div class="header-actions">
                    <button onclick="deleteKey(); document.getElementById('key-editor-panel').style.display='none';" 
                            class="panel-btn delete" title="删除">删除</button>
                    <button onclick="document.getElementById('key-editor-panel').style.display='none'; selectedKeyIdx=null; renderGlobalKeyboard();" 
                            class="panel-btn" title="关闭">✕</button>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="settings-card">
                    <div class="grid-2">
                        <div class="input-group">
                            <label>标签 (label)</label>
                            <input type="text" value="${key.label||''}" oninput="updateKeyData('label', this.value)" class="input-dark" placeholder="可选">
                        </div>
                        <div class="input-group">
                            <label>上标 (label_symbol)</label>
                            <input type="text" value="${key.label_symbol||''}" oninput="updateKeyData('label_symbol', this.value)" class="input-dark" placeholder="可选">
                        </div>
                        <div class="input-group">
                            <label>宽度 (%)</label>
                            <input type="number" placeholder="${layout.width||10}" value="${key.width||''}" oninput="updateKeyData('width', this.value ? parseFloat(this.value) : undefined)" class="input-dark">
                        </div>
                        <div class="input-group">
                            <label>高度 (px)</label>
                            <input type="number" value="${key.height||''}" oninput="updateKeyData('height', this.value ? parseInt(this.value) : undefined)" class="input-dark" placeholder="自动">
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="grid-2">
                        <div class="input-group">
                            <label>背景色</label>
                            <select onchange="updateKeyData('key_back_color', this.value)">${colorOptions}</select>
                        </div>
                        <div class="input-group">
                            <label>文字色</label>
                            <select onchange="updateKeyData('key_text_color', this.value)">${textOptions}</select>
                        </div>
                        <div class="input-group">
                            <label>按下背景色</label>
                            <select onchange="updateKeyData('hilited_key_back_color', this.value)">${hilitedColorOptions}</select>
                        </div>
                        <div class="input-group">
                            <label>按下文字色</label>
                            <select onchange="updateKeyData('hilited_key_text_color', this.value)">${hilitedTextOptions}</select>
                        </div>
                    </div>
                </div>

                <div class="settings-card">
                    <div class="flex flex-col">
                        ${generateFunctionalInput('', '点击 (click)', 'click', key.click)}
                        ${generateFunctionalInput('', '长按 (long_click)', 'long_click', key.long_click)}
                        ${generateFunctionalInput('', '上滑 (swipe_up)', 'swipe_up', key.swipe_up)}
                        ${generateFunctionalInput('', '下滑 (swipe_down)', 'swipe_down', key.swipe_down)}
                        ${generateFunctionalInput('', '左滑 (swipe_left)', 'swipe_left', key.swipe_left)}
                        ${generateFunctionalInput('', '右滑 (swipe_right)', 'swipe_right', key.swipe_right)}
                    </div>
                </div>
            </div>
        `;
    }

function toggleColorGroup(groupName) {
        colorGroupCollapseState[groupName] = !colorGroupCollapseState[groupName];
        renderLayoutEditor(); 
    }

function updateKeyData(field, val) {
        if (selectedKeyIdx === null) return;
        const layout = state.preset_keyboards[currentLayout];
        const key = layout.keys[selectedKeyIdx];
        
        if (val === undefined || val === '') {
            delete key[field];
        } else {
            key[field] = val;
        }

        renderGlobalKeyboard(); 
        refreshLiveCode(key); 
    }

function addNewKey() {
        const layout = state.preset_keyboards[currentLayout];
        const insertPos = (selectedKeyIdx === null) ? layout.keys.length : selectedKeyIdx + 1;
        layout.keys.splice(insertPos, 0, { click: "new" });
        
        selectedKeyIdx = insertPos;

        renderLayoutEditor();
        renderGlobalKeyboard();
        updateCodePreview(layout.keys[selectedKeyIdx]);
        scheduleSave();
    }

function deleteKey() {
        if (selectedKeyIdx === null) return;
        if (confirm(`确定要删除索引为 ${selectedKeyIdx} 的按键吗？`)) {
            state.preset_keyboards[currentLayout].keys.splice(selectedKeyIdx, 1);
            selectedKeyIdx = null; 
            renderLayoutEditor();
            renderGlobalKeyboard();
            scheduleSave();

        }
    }

function updateCodePreview(k) {
        addChatMessage('right', `我想看看按键 "${k.label || k.click}" 的配置代码。`);
        
        const yaml = jsyaml.dump([k], { 
            flowLevel: 1, 
            lineWidth: -1 
        });
        
        setTimeout(() => {
            addChatMessage('left', yaml, true);
        }, 500);
    }

function refreshLiveCode(k) {
        if (lastCodeBubble) {
            const yaml = jsyaml.dump([k], { 
                flowLevel: 1, 
                lineWidth: -1 
            });
            lastCodeBubble.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHtml(yaml)}</pre>`;
            
            const viewport = document.getElementById('chat-viewport');
            viewport.scrollTop = viewport.scrollHeight;
        }
    }

function moveKey(f, t) { const ks = state.preset_keyboards[currentLayout].keys; const item = ks.splice(f, 1)[0]; ks.splice(t, 0, item); selectedKeyIdx = t; renderGlobalKeyboard(); scheduleSave(); }

async function triggerFontUpload(key) {
            const f = document.createElement('input'); f.type='file'; f.accept='.ttf,.otf';
            f.onchange = async () => {
                const file = f.files[0]; if(!file) return;
                
                setPath(state, key, file.name);
                
                const fontName = "Font_" + key.replace('.','_') + "_" + Date.now();
                const font = new FontFace(fontName, await file.arrayBuffer());
                await font.load(); 
                document.fonts.add(font);
                
                const cssVar = fontVarMap[key];
                if (cssVar) {
                    document.documentElement.style.setProperty(cssVar, fontName);
                }
                
                const inputEl = document.getElementById('input-'+key);
                if(inputEl) {
                    inputEl.value = file.name;
                    inputEl.style.fontFamily = fontName;
                }
                
                renderGlobalKeyboard();
            }; 
            f.click();
        }
