// ============================================================
// 05-schemes.js — schemes
// 由 test.html 拆分而来（无构建，经典脚本，按 01→11 顺序引入）
// ============================================================

function duplicateScheme(originalId) {
        cancelPressTimer();
        let x = 1;
        while (state.preset_color_schemes[`scheme${x}`]) x++;
        const newId = `scheme${x}`;
        state.preset_color_schemes[newId] = JSON.parse(JSON.stringify(state.preset_color_schemes[originalId]));
        state.preset_color_schemes[newId].name = (state.preset_color_schemes[originalId].name || originalId) + " 副本";
        
        currentScheme = newId;
        renderLayoutEditor();
        updateCssEngine();
        scheduleSave();
    }

function createNewScheme() {
        let x = 1;
        while (state.preset_color_schemes[`scheme${x}`]) x++;
        const newId = `scheme${x}`;
        state.preset_color_schemes[newId] = {
            name: "新配色",
            author: state.author || "User",
            keyboard_back_color: "color4",
            key_back_color: "color2",
            key_text_color: "color3"
        };
        currentScheme = newId;
        renderLayoutEditor();
        updateCssEngine();
        scheduleSave();
    }

function handleSchemeTypeChange(oldId, val) {
        if (val === 'default') changeSchemeId(oldId, 'default');
        else {
            let newId = oldId;
            if (oldId === 'default') {
                let x = 1;
                while (state.preset_color_schemes[`custom_scheme${x}`]) x++;
                newId = `custom_scheme${x}`;
            }
            changeSchemeId(oldId, newId);
        }
    }

function changeSchemeId(oldId, newId) {
        if (!newId) {
            alert("方案 ID 不能为空。");
            renderLayoutEditor();
            return;
        }
        if (oldId === newId) {
            renderLayoutEditor();
            return;
        }
        if (state.preset_color_schemes[newId]) {
            alert(`已存在名为 "${newId}" 的方案，请更换其他名称。`);
            renderLayoutEditor();
            return;
        }
        const newSchemes = {};
        for (const id in state.preset_color_schemes) {
            if (id === oldId) newSchemes[newId] = state.preset_color_schemes[oldId];
            else newSchemes[id] = state.preset_color_schemes[id];
        }
        state.preset_color_schemes = newSchemes;
        if (currentScheme === oldId) currentScheme = newId;
        if (state.preset_color_schemes.default?.dark_scheme === oldId) state.preset_color_schemes.default.dark_scheme = newId;
        renderLayoutEditor();
        updateCssEngine();
        scheduleSave();
    }

function removeScheme(id) {
        if (Object.keys(state.preset_color_schemes).length <= 1) {
            alert("至少需要保留一个配色方案，无法删除。");
            return;
        }
        if (confirm(`确定删除配色方案 "${id}" 吗？`)) {
            if (state.preset_color_schemes.default?.dark_scheme === id) delete state.preset_color_schemes.default.dark_scheme;
            delete state.preset_color_schemes[id];
            if (currentScheme === id) currentScheme = Object.keys(state.preset_color_schemes)[0];
            renderLayoutEditor();
            updateCssEngine();
            scheduleSave();
        }
    }

function toggleDarkScheme(id, isChecked) {
        if (!state.preset_color_schemes.default) {
            alert("未发现 'default' 方案，无法设置黑暗模式。");
            renderLayoutEditor();
            return;
        }
        if (isChecked) state.preset_color_schemes.default.dark_scheme = id;
        else if (state.preset_color_schemes.default.dark_scheme === id) delete state.preset_color_schemes.default.dark_scheme;
        scheduleSave();
        renderLayoutEditor();
    }
