




function introduceSetting(key, label) {
        if (shownIntros.has(key) || !settingIntros[key]) return;

        addChatMessage('right', `这个“${label}”是干什么用的？`);
        
        setTimeout(() => {
            addChatMessage('left', `**${label} 简介**：${settingIntros[key]}`);
        }, 800);

        shownIntros.add(key);
    }

function addChatMessage(side, text, isCode = false, allowHtml = false) {
        const viewport = document.getElementById('chat-viewport');
        if (!viewport) return;

        const row = document.createElement('div');
        row.className = `msg-row ${side === 'right' ? 'right' : ''}`;
        
        const avatar = `<div class="avatar ${side === 'right' ? 'avatar-user' : 'avatar-author'}"></div>`;
        const bubbleClass = isCode ? 'bubble-code' : (side === 'right' ? 'bubble-right' : 'bubble-left');
        
        const bubbleId = isCode ? `code-bubble-${Date.now()}` : '';

        
        const safeText = allowHtml ? String(text) : escapeHtml(text);
        const content = isCode ? `<pre style="white-space: pre-wrap;">${safeText}</pre>` : safeText;

        row.innerHTML = `
            ${avatar}
            <div class="bubble ${bubbleClass}" ${isCode ? `id="${bubbleId}"` : ''}>${content}</div>
        `;
        
        viewport.appendChild(row);
        requestAnimationFrame(() => {
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: 'smooth'
            });
        });

        if (isCode) {
            lastCodeBubble = document.getElementById(bubbleId);
        }
    }

function triggerTutorial(tab) {
        const viewport = document.getElementById('chat-viewport');
        if (!viewport) return;

        if (lastSpokenTab === tab) return;
        lastSpokenTab = tab;
        
        const tabNames = { general: '通用设置', appearance: '键盘尺寸', layout: '配色 | 布局' };
        const timeDivider = document.createElement('div');
        timeDivider.className = "chat-time";
        timeDivider.innerHTML = `进入了 [${tabNames[tab]}] 页面`;
        viewport.appendChild(timeDivider);
        
        const scripts = {
            general: { u: "这些开关和字体怎么用？", a: "这里是【通用设置】。你可以开启按键容错，或者上传自己的字体。上传后，输入框会实时预览效果！" },
            appearance: { u: "我想调整键盘的高度和间距。", a: "没问题！在【键盘尺寸】页拉动滑块，预览键盘会实时拉伸。你还可以锁定气泡来精调位置。" },
            layout: { u: "怎么修改按键的功能和颜色？", a: "点击预览键盘上的按键，我就会在这里实时展示它的 YAML 代码供你参考。" }
        };

        setTimeout(() => addChatMessage('right', scripts[tab].u), 400);
        setTimeout(() => addChatMessage('left', scripts[tab].a), 1200);
    }

function togglePartialExportPopup() {
        document.getElementById('partial-export-popup').classList.toggle('hidden');
    }

function getFormattedTime() {
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    }

function exportYAML(isFull = true) {
        let selectedKeys = [];
        if (!isFull) {
            const checkboxes = document.querySelectorAll('#partial-export-popup input[type="checkbox"]:checked');
            selectedKeys = Array.from(checkboxes).map(cb => cb.value);
            if (selectedKeys.length === 0) {
                alert("请至少勾选一个要导出的结构！");
                return;
            }
            document.getElementById('partial-export-popup').classList.add('hidden');
        }

        const out = {
            config_version: state.config_version,
            name: state.name,
            style: JSON.parse(JSON.stringify(state.style)),
            preedit: state.preedit,
            window: state.window,
            colors: state.colors, 
            preset_color_schemes: JSON.parse(JSON.stringify(state.preset_color_schemes)),
            fallback_colors: state._static.fallback_colors,
            liquid_keyboard: state._static.liquid_keyboard,
            tool_bar: state._static.tool_bar,
            preset_keys: state._static.preset_keys,
            preset_keyboards: state.preset_keyboards
        };

        if (state._static && state._static.style) Object.assign(out.style, state._static.style);

        const escapeStr = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

        const toTrimeFlow = (obj) => {
            const parts = Object.entries(obj).map(([k, v]) => {
                if (typeof v === 'string' && state.colors[v]) return `${k}: *${v}`;
                
                if (Array.isArray(v)) {
                const arrStr = v.map(item => typeof item === 'string' ? `"${escapeStr(item)}"` : item).join(', ');
                return `${k}: [ ${arrStr} ]`;
            }

            if (v !== null && typeof v === 'object') {
                return `${k}: ${toTrimeFlow(v)}`;
            }

            if (k === 'label' || typeof v === 'string') {
                let s = String(v); 
                if (s === '') return `${k}: ""`;
                if (s === "'") return `${k}: "'"`;
                return `${k}: "${escapeStr(s)}"`;
            }
                
                if (k === 'width' || k === 'height') {
                    return `${k}: ${parseFloat(v)}`;
                }
                
                return `${k}: ${v}`;
            });
            return `{ ${parts.join(', ')} }`;
        };

        let res = [];

        if (isFull) {
            res.push(`config_version: "${out.config_version}"`);
            res.push(`name: ${JSON.stringify(String(out.name ?? ''))}`);
        }

        const simpleBlocks = { style: out.style, preedit: out.preedit, window: out.window };
        let filteredSimpleBlocks = {};
        ['style', 'preedit', 'window'].forEach(k => {
            if (isFull || selectedKeys.includes(k)) {
                filteredSimpleBlocks[k] = simpleBlocks[k];
            }
        });
        
        if (Object.keys(filteredSimpleBlocks).length > 0) {
            res.push(jsyaml.dump(filteredSimpleBlocks, { indent: 2, lineWidth: -1 }));
        }

        if (isFull || selectedKeys.includes('colors')) {
            res.push("colors:");
            Object.entries(out.colors).forEach(([id, val]) => {
                res.push(`  ${id}: &${id} ${val}`);
            });
        }

        if (isFull || selectedKeys.includes('preset_color_schemes')) {
            res.push("\npreset_color_schemes:");
            Object.entries(out.preset_color_schemes).forEach(([id, scheme]) => {
                res.push(`  ${id}:`);
                Object.entries(scheme).forEach(([k, v]) => {
                    if (typeof v === 'string' && out.colors[v]) {
                        res.push(`    ${k}: *${v}`);
                    } else {
                        if (typeof v === 'string') {
                            res.push(`    ${k}: "${v.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
                        } else {
                            res.push(`    ${k}: ${v}`);
                        }
                    }
                });
            });
        }

        if (isFull || selectedKeys.includes('preset_keys')) {
            res.push("preset_keys:");
            Object.entries(out.preset_keys).forEach(([id, cfg]) => {
                res.push(`  ${id}: ${toTrimeFlow(cfg)}`);
            });
        }

        if (isFull || selectedKeys.includes('preset_keyboards')) {
            res.push("preset_keyboards:");
            Object.keys(out.preset_keyboards).forEach(kbId => {
                const kb = out.preset_keyboards[kbId];
                res.push(`  ${kbId}:`);
                res.push(`    name: "${escapeStr(kb.name || '')}"`);
                res.push(`    author: "${escapeStr(kb.author || '')}"`);
                res.push(`    width: ${kb.width || 10}`);
                res.push(`    ascii_mode: ${kb.ascii_mode !== undefined ? kb.ascii_mode : 0}`);
                if (kb.auto_height_index !== undefined) res.push(`    auto_height_index: ${kb.auto_height_index}`);
                res.push(`    keys:`);
                kb.keys.forEach(key => {
                    res.push(`      - ${toTrimeFlow(key)}`);
                });
            });
        }

        if (out.fallback_colors && (isFull || selectedKeys.includes('fallback_colors'))) {
            res.push(`\nfallback_colors:`);
            Object.entries(out.fallback_colors).forEach(([k, v]) => res.push(`  ${k}: ${v}`));
        }
        
        if (out.liquid_keyboard && (isFull || selectedKeys.includes('liquid_keyboard'))) {
            const liquidBlock = jsyaml.dump({ liquid_keyboard: out.liquid_keyboard }, { 
                indent: 2, 
                lineWidth: -1 
            });
            res.push("" + liquidBlock); 
        }

        if (out.tool_bar && (isFull || selectedKeys.includes('tool_bar'))) {
            res.push("tool_bar:");
            res.push(`  button_spacing: ${out.tool_bar.button_spacing}`);
            res.push(`  button_font: ${out.tool_bar.button_font}`);
            res.push(`  primary_button: ${toTrimeFlow(out.tool_bar.primary_button)}`);
            
            const buttonKeys = [
                'hide_button', 'emoji_button', 'clipboard_button', 
                'edit_button', 'ascii_mode_button', 'full_shape_button'
            ];
            
            buttonKeys.forEach(k => {
                if (out.tool_bar[k]) {
                    res.push(`  ${k}: &${k} ${toTrimeFlow(out.tool_bar[k])}`);
                }
            });

            res.push(`  buttons:`);
            buttonKeys.forEach(k => {
                if (out.tool_bar[k]) {
                    res.push(`    - *${k}`);
                }
            });
        }

        const finalYaml = res.join('\n').replace(/\n{3,}/g, '\n\n');
        const blob = new Blob([finalYaml], { type: 'text/yaml;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        
        const timeStr = getFormattedTime();
        a.download = isFull ? `${timeStr}.trime.yaml` : `部分_${timeStr}.trime.yaml`;
        
        a.click();
    }

function openImageViewer(highResUrl) {
        const overlay = document.getElementById('image-viewer-overlay');
        const img = document.getElementById('image-viewer-img');
        img.src = highResUrl;
        overlay.classList.remove('hidden');
    }

function saveDraft() {
        try {
            const toSave = { _v: 1, state, currentScheme, currentLayout, customMappings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) { console.warn('[Draft] 保存失败:', e); }
    }

function loadDraft() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const draft = JSON.parse(raw);
            if (draft._v !== 1) return null;
            return draft;
        } catch { return null; }
    }

function scheduleSave() {
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(saveDraft, 800);
    }
