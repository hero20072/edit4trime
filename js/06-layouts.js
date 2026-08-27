




function duplicateLayout(originalId) {
        cancelPressTimer();
        let x = 1;
        while (state.preset_keyboards[`custom${x}`]) x++;
        const newId = `custom${x}`;
        state.preset_keyboards[newId] = JSON.parse(JSON.stringify(state.preset_keyboards[originalId]));
        state.preset_keyboards[newId].name = (state.preset_keyboards[originalId].name || originalId) + " 副本";
        
        currentLayout = newId;
        selectedKeyIdx = null;
        renderLayoutEditor();
        renderGlobalKeyboard();
        scheduleSave();
    }

function handleLayoutTypeChange(oldId, selectedValue) {
        if (selectedValue === 'custom') {
            forceUnlockId = oldId;
            renderLayoutEditor(); 
            setTimeout(() => {
                const input = document.getElementById(`id_input_${oldId}`);
                if (input) { input.focus(); input.select(); }
            }, 50);
            return;
        }
        
        forceUnlockId = null;
        if (oldId !== selectedValue) {
            changeLayoutId(oldId, selectedValue);
        }
    }

function createNewLayout() {
        let x = 1;
        while (state.preset_keyboards[`custom${x}`]) x++;
        const newId = `custom${x}`;

        state.preset_keyboards[newId] = {
            name: "新方案",
            author: state.author || "User",
            width: 10,
            ascii_mode: 0,
            keys: JSON.parse(JSON.stringify(state.preset_keyboards.default.keys))
        };

        renderLayoutEditor(); 
        renderGlobalKeyboard();
        scheduleSave();
    }

function changeLayoutId(oldId, newId) {
        if (!newId || oldId === newId){
            forceUnlockId = null; 
            renderAppearanceEditor();
            return;
        }
        
        if (state.preset_keyboards[newId]) {
            alert(`方案标识 '${newId}' 已存在，请先删除或重命名该方案。`);
            renderAppearanceEditor();
            return;
        }

        const newKbs = {};
        for (const id in state.preset_keyboards) {
            if (id === oldId) newKbs[newId] = state.preset_keyboards[oldId];
            else newKbs[id] = state.preset_keyboards[id];
        }
        state.preset_keyboards = newKbs;
        if (currentLayout === oldId) currentLayout = newId;

        forceUnlockId = null;
        renderLayoutEditor(); 
        renderGlobalKeyboard();
        scheduleSave();
    }

function removeLayout(id) {
        if (Object.keys(state.preset_keyboards).length <= 1) {
            alert("必须保留至少一个布局方案！");
            return;
        }
        if (confirm(`确定要永久删除布局方案 "${id}" 吗？`)) {
            delete state.preset_keyboards[id];
            if (currentLayout === id) {
                currentLayout = Object.keys(state.preset_keyboards)[0];
            }
            renderLayoutEditor();
            renderGlobalKeyboard();
            scheduleSave();
        }
    }
