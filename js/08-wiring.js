// ============================================================
// 08-wiring.js — wiring
// 由 test.html 拆分而来（无构建，经典脚本，按 01→11 顺序引入）
// ============================================================

function extractCustomMappings() {
        const set = new Set();
        Object.values(state.preset_color_schemes).forEach(scheme => {
            Object.keys(scheme).forEach(k => {
                if(!CORE_KEYS.has(k)) set.add(k);
            });
        });
        customMappings = Array.from(set);
    }

function startPressTimer(type, id) {
        isLongPressTriggered = false;
        pressTimer = setTimeout(() => {
            isLongPressTriggered = true; 
            if (type === 'scheme') removeScheme(id);
            if (type === 'layout') removeLayout(id);
        }, 600); 
    }

function cancelPressTimer() {
        if (pressTimer) clearTimeout(pressTimer);
    }

function getCoreMappings() {
        const arr = [];
        (meta.colorMeta || []).forEach(g => g.items.forEach(it => { if (!arr.includes(it.k)) arr.push(it.k); }));
        return arr;
    }

function mappingItemHtml(m) {
        const scheme = state.preset_color_schemes[currentScheme] || {};
        const mappedColorId = scheme[m];
        let previewColor = BASE_DARK_COLOR;

        if (mappedColorId) {
            if (state.colors[mappedColorId]) {
                previewColor = argbToCss(state.colors[mappedColorId]);
            } else if (typeof mappedColorId === 'string' && (mappedColorId.startsWith('0x') || mappedColorId.startsWith('#'))) {
                previewColor = argbToCss(mappedColorId);
            }
        }

        const gradientStyle = `linear-gradient(90deg, ${previewColor} 0%, ${previewColor} 10%, ${BASE_DARK_COLOR} 70%) no-repeat 0 0 / 100% 100%`;
        return `
            <div class="mapping-item group" id="node-mapping-${m}"
                 style="background: ${gradientStyle};"
                 onclick="openMappingPopup('${m}', this, event)">
                <div class="node-port port-in" data-type="mapping" data-id="${m}" onclick="handlePortClick(event, 'mapping', '${m}')"></div>
                <div class="mapping-name">
                    ${escapeHtml(m)}
                </div>
            </div>`;
    }

function renderNodeEditor() {
        const colPalette = document.getElementById('palette-container') || document.getElementById('palette-col');
        const colRight = document.getElementById('mapping-col');
        if (!colPalette || !colRight) return;

        colPalette.innerHTML = ''; 
        colRight.innerHTML = '';

        const scheme = state.preset_color_schemes[currentScheme] || {};

        // ---- 调色板 ----
        Object.entries(state.colors).forEach(([id, val]) => {
            const rgbaColor = argbToCss(val);

            colPalette.innerHTML += `
                <div class="color-card group"
                    style="background: linear-gradient(${rgbaColor}, ${rgbaColor}), ${CHECKER_SVG}; background-size: cover, 16px 16px; background-color: white;"
                    id="node-color-${id}" onclick="triggerPickr('${id}')">
                    
                    <div id="picker-${id}" class="absolute top-1/2 left-0 opacity-0 pointer-events-none w-1 h-1"></div>
                    
                    <span class="color-badge">${id}</span>
                    
                    <div class="node-port port-out color-port" data-type="color" data-id="${id}"
                        onmousedown="event.stopPropagation()" 
                        onmouseup="event.stopPropagation()" 
                        onclick="handlePortClick(event, 'color', '${id}')"></div>
                </div>`;
        });

        // ---- 映射板（核心 19 项 + 自定义 km* 项） ----
        getCoreMappings().forEach(k => {
            colRight.innerHTML += mappingItemHtml(k);
        });
        customMappings.forEach(m => {
            colRight.innerHTML += mappingItemHtml(m);
        });

        requestDrawWires();
    }

let _wireDrawPending = false;
function requestDrawWires() {
        const svg = document.getElementById('wire-canvas');
        if (!svg || _wireDrawPending) return;
        _wireDrawPending = true;
        requestAnimationFrame(() => {
            _wireDrawPending = false;
            drawWires();
        });
    }

function drawWires() {
        const svg = document.getElementById('wire-canvas');
        if (!svg) return;
        svg.querySelectorAll('.solid-wire').forEach(el => el.remove());
        const svgRect = svg.getBoundingClientRect();
        const scheme = state.preset_color_schemes[currentScheme] || {};

        const addWire = (selA, selB, key) => {
            const a = document.querySelector(selA);
            const b = document.querySelector(selB);
            if (!a || !b) return;
            const rA = a.getBoundingClientRect();
            const rB = b.getBoundingClientRect();
            const x1 = rA.left + rA.width / 2 - svgRect.left;
            const y1 = rA.top + rA.height / 2 - svgRect.top;
            const x2 = rB.left + rB.width / 2 - svgRect.left;
            const y2 = rB.top + rB.height / 2 - svgRect.top;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'wire-path solid-wire');
            // 曲线方向自适应：左→右用后弯控制点，右→左用前弯控制点
            const dir = x1 <= x2 ? 1 : -1;
            path.setAttribute('d', `M ${x1} ${y1} C ${x1 + 60 * dir} ${y1}, ${x2 - 60 * dir} ${y2}, ${x2} ${y2}`);

            path.onclick = (e) => {
                e.stopPropagation();
                delete state.preset_color_schemes[currentScheme][key];
                updateCssEngine();
            };
            svg.appendChild(path);
        };

        // 链路：调色板 → 映射板（核心项）
        getCoreMappings().forEach(k => {
            const cId = scheme[k];
            if (!cId || !state.colors[cId]) return;
            addWire(`.color-port[data-id="${cId}"]`, `.port-in[data-id="${k}"]`, k);
        });

        // 调色板 → 映射板（自定义项）
        customMappings.forEach(m => {
            const cId = scheme[m];
            if (cId && state.colors[cId]) {
                addWire(`.color-port[data-id="${cId}"]`, `.port-in[data-id="${m}"]`, m);
            }
        });
    }

function handlePortClick(event, type, id) {
        event.stopPropagation(); 

        if (!activeWire) {
            startWiring(event.target, type, id);
        } else {
            completeWire(type, id);
        }
    }

function startWiring(startElement, type, id) {
        activeWire = { startElement, type, id };
        
        document.addEventListener('mousemove', followMouseWithWire);
        window.addEventListener('mousedown', cancelWiring, { capture: true, once: true });
    }

function completeWire(endType, endId) {
        if (activeWire.type !== endType) {
            const startType = activeWire.type;
            const startId = activeWire.id;

            if (startType === 'color' && endType === 'mapping') {
                state.preset_color_schemes[currentScheme][endId] = startId;
            } else if (startType === 'mapping' && endType === 'color') {
                state.preset_color_schemes[currentScheme][startId] = endId;
            }
        }
        scheduleSave();
        stopWiring();
    }

function cancelWiring(event) {
        if (!event.target.classList.contains('node-port')) {
            if (activeWire && activeWire.type === 'mapping') {
                 delete state.preset_color_schemes[currentScheme][activeWire.id];
            }
            scheduleSave();
            stopWiring();
        }
    }

function stopWiring() {
        document.removeEventListener('mousemove', followMouseWithWire);
        document.getElementById('temp-wire').style.display = 'none';
        activeWire = null;
        updateCssEngine();
    }

function followMouseWithWire(e) {
        if (!activeWire) return;

        const svg = document.getElementById('wire-canvas');
        const svgRect = svg.getBoundingClientRect();
        const startRect = activeWire.startElement.getBoundingClientRect();
        
        const x1 = startRect.left + startRect.width / 2 - svgRect.left;
        const y1 = startRect.top + startRect.height / 2 - svgRect.top;
        const x2 = e.clientX - svgRect.left;
        const y2 = e.clientY - svgRect.top;
        
        const path = (activeWire.type === 'color')
            ? `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`
            : `M ${x2} ${y2} C ${x2 + 60} ${y2}, ${x1 - 60} ${y1}, ${x1} ${y1}`;
            
        const temp = document.getElementById('temp-wire');
        temp.setAttribute('d', path);
        temp.style.display = 'block';
    }

function addNewMapping() {
        let i = 1;
        
        while (customMappings.includes(`km${i}`) || SYS_MAPPINGS.includes(`km${i}`)) {
            i++;
        }
        
        const newName = `km${i}`;
        
        customMappings.push(newName);
        
        renderNodeEditor(); 
        renderLayoutEditor();
        scheduleSave();
        
        setTimeout(() => {
            const col = document.getElementById('mapping-col');
            if (col) col.scrollTo({ top: col.scrollHeight, behavior: 'smooth' });
        }, 100);
    }

function openMappingPopup(mappingId, element, event) {
        event.stopPropagation();
        const popup = document.getElementById('mapping-popup');
        if (!popup) return;

        const layout = state.preset_keyboards[currentLayout];
        
        const groups = {
            'key_back_color': { label: '背景', color: '#10b981', keys: [] }, 
            'hilited_key_back_color': { label: '按下背景', color: '#f59e0b', keys: [] }, 
            'key_text_color': { label: '文字', color: '#3b82f6', keys: [] }, 
            'hilited_key_text_color': { label: '按下文字', color: '#ec4899', keys: [] } 
        };
        const otherKeys = [];

        if (layout && layout.keys) {
            layout.keys.forEach(k => {
                const keyName = k.label || k.click || '未命名';
                let matched = false;

                for (const [attr, group] of Object.entries(groups)) {
                    if (k[attr] === mappingId) {
                        group.keys.push(keyName);
                        matched = true;
                    }
                }
                
                if (!matched) {
                    const isUsed = Object.values(k).some(val => val === mappingId);
                    if (isUsed) otherKeys.push(keyName);
                }
            });
        }
        document.getElementById('popup-mapping-name').innerText = mappingId;

        let listHtml = '';
        let hasContent = false;

        for (const [attr, group] of Object.entries(groups)) {
            if (group.keys.length > 0) {
                hasContent = true;
                listHtml += `
                    <div class="mb-2 flex items-start text-xs leading-5">
                        <div class="shrink-0 mt-1 mr-2 w-3 h-3 rounded-sm" style="background-color: ${group.color}; box-shadow: 0 0 5px ${group.color}66;"></div>
                        <div>
                            <span class="text-slate-400 font-bold mr-1">${group.label}:</span>
                            <span class="text-slate-300">${group.keys.map(escapeHtml).join('、')}</span>
                        </div>
                    </div>
                `;
            }
        }

        if (otherKeys.length > 0) {
            hasContent = true;
            listHtml += `
                <div class="mb-2 flex items-start text-xs leading-5">
                    <div class="shrink-0 mt-1 mr-2 w-3 h-3 rounded-sm bg-slate-500"></div>
                    <div>
                        <span class="text-slate-400 font-bold mr-1">其他:</span>
                        <span class="text-slate-300">${otherKeys.map(escapeHtml).join('、')}</span>
                    </div>
                </div>
            `;
        }

        if (!hasContent) {
            listHtml = '<div class="text-slate-500 text-xs italic py-2">暂无按键使用此映射</div>';
        }

        document.getElementById('popup-keys-list').innerHTML = listHtml;

        const isSys = (typeof SYS_MAPPINGS !== 'undefined') ? SYS_MAPPINGS.includes(mappingId) : false;
        
        const editArea = document.getElementById('popup-edit-area');
        const deleteArea = document.getElementById('popup-delete-area');
        if (editArea) editArea.style.display = isSys ? 'none' : 'block';
        if (deleteArea) deleteArea.style.display = isSys ? 'none' : 'block';

        // 系统核心映射（现已展示在映射板中）不可被批量设置为按键色，隐藏批量区
        const batchLabel = document.getElementById('popup-batch-label');
        const batchGrid = document.getElementById('popup-batch-grid');
        if (batchLabel) batchLabel.style.display = isSys ? 'none' : 'block';
        if (batchGrid) batchGrid.style.display = isSys ? 'none' : 'block';

        popup.style.display = 'block';
        const rect = element.getBoundingClientRect();
        const popupHeight = popup.offsetHeight;
        const windowHeight = window.innerHeight;

        let top = rect.top;
        if (top + popupHeight > windowHeight) {
            top = windowHeight - popupHeight - 20;
        }
        if (top < 10) top = 10;

        popup.style.top = top + 'px';
        let leftPos = rect.left - 290; 
        if (leftPos < 10) leftPos = 10; 
        popup.style.left = leftPos + 'px';
        popup.setAttribute('data-mapping', mappingId);
    }

function renameMappingFromPopup() {
        const oldName = document.getElementById('mapping-popup').getAttribute('data-mapping');
        const newName = document.getElementById('popup-rename-input').value.trim();
        
        if (!newName) return alert("名字不能为空");
        if (newName === oldName) return; 
        if (SYS_MAPPINGS.includes(newName)) return alert("不能使用系统保留名称！");
        if (customMappings.includes(newName)) return alert("名称已存在！");

        const idx = customMappings.indexOf(oldName);
        if (idx !== -1) customMappings[idx] = newName;
        else customMappings.push(newName); 

        Object.values(state.preset_color_schemes).forEach(scheme => {
            if (scheme[oldName] !== undefined) {
                scheme[newName] = scheme[oldName];
                delete scheme[oldName];
            }
        });

        Object.values(state.preset_keyboards).forEach(kb => {
            kb.keys.forEach(k => {
                if (k.key_back_color === oldName) k.key_back_color = newName;
                if (k.key_text_color === oldName) k.key_text_color = newName;
                if (k.hilited_key_back_color === oldName) k.hilited_key_back_color = newName;
                if (k.hilited_key_text_color === oldName) k.hilited_key_text_color = newName;
            });
        });

        document.getElementById('mapping-popup').style.display = 'none';
        updateCssEngine();
        renderLayoutEditor(); 
        renderGlobalKeyboard();
        scheduleSave();
    }

function deleteMappingFromPopup() {
        const name = document.getElementById('mapping-popup').getAttribute('data-mapping');
        
        if (SYS_MAPPINGS.includes(name)) {
            alert("系统核心映射无法删除！");
            return;
        }
        
        if(!confirm(`确定要删除映射 [${name}] 吗？\n该操作无法撤销。`)) return;
        
        customMappings = customMappings.filter(m => m !== name);
        
        Object.values(state.preset_color_schemes).forEach(scheme => {
            delete scheme[name];
        });

        Object.values(state.preset_keyboards).forEach(kb => {
            kb.keys.forEach(k => {
                if (k.key_back_color === name) delete k.key_back_color;
                if (k.key_text_color === name) delete k.key_text_color;
                if (k.hilited_key_back_color === name) delete k.hilited_key_back_color;
                if (k.hilited_key_text_color === name) delete k.hilited_key_text_color;
            });
        });

        document.getElementById('mapping-popup').style.display = 'none';
        updateCssEngine();
        renderLayoutEditor();
        renderGlobalKeyboard();
        scheduleSave();
    }

function triggerBatchMode(targetField) {
        document.getElementById('mapping-popup').style.display = 'none';
        isBatchMode = true; 
        batchMappingName = document.getElementById('mapping-popup').getAttribute('data-mapping'); 
        batchMappingTarget = targetField;
        batchSelectedKeys.clear(); selectedKeyIdx = null; 
        document.getElementById('batch-mode-bar').classList.remove('hidden');
        document.getElementById('batch-mode-text').innerText = `正在将 [${batchMappingName}] 设为 ${targetField === 'key_back_color' ? '背景色' : '文字色'}`;
        document.getElementById('batch-count').innerText = '0';
        renderGlobalKeyboard();
    }

function cancelBatchMode() {
        isBatchMode = false; batchSelectedKeys.clear();
        document.getElementById('batch-mode-bar').classList.add('hidden');
        renderGlobalKeyboard();
    }

function applyBatchMode() {
        const layout = state.preset_keyboards[currentLayout];
        batchSelectedKeys.forEach(idx => { layout.keys[idx][batchMappingTarget] = batchMappingName; });
        cancelBatchMode(); updateCssEngine(); scheduleSave();
    }
