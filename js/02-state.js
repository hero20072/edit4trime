




let state = {
        config_version: "3.0", name: "标准",
        style: {
            auto_caps: false, proximity_correction: true, reset_ascii_mode: true,
            vertical_correction: -10,
            key_font: "MapleMono-NF-CN-Thin.ttf", 
            candidate_font: "MapleMono-NF-CN-Thin.ttf", 
            comment_font: "MapleMono-NF-CN-Thin.ttf",
            text_font: "MapleMono-NF-CN-Thin.ttf", 
            symbol_font: "MapleMono-NF-CN-Thin.ttf", 
            latin_font: "MapleMono-NF-CN-Thin.ttf", 
            popup_font: "MapleMono-NF-CN-Thin.ttf", 
            hanb_font: "MapleMono-NF-CN-Thin.ttf",
            keyboard_height: 236, 
            keyboard_height_land: 100, 
            candidate_padding: 2, 
            candidate_spacing: 2, 
            candidate_text_size: 20, 
            candidate_view_height: 22, 
            comment_height: 20, 
            comment_on_top: false, 
            comment_text_size: 14,
            vertical_gap: 6, 
            horizontal_gap: 6, 
            key_height: 44, 
            round_corner: 8, 
            key_text_size: 24,
            key_border: 0,
            key_long_text_size: 14, 
            symbol_text_size: 10, 
            popup_width: 38, 
            popup_height: 48, 
            popup_bottom_margin: 120, 
            popup_key_height: 40, 
            popup_text_size: 23,
            keyboard_padding_bottom: 24,
            shadow_radius: 0
        },
        preedit: { 
            horizontal_padding: 10, 
            alpha: 1, 
            top_end_radius: 14, 
            foreground: { font_size: 14 } },
        window: { 
            insets: { vertical: 4, horizontal: 4 }, 
            item_padding: { vertical: 2, horizontal: 4 },
            min_width: 0, 
            corner_radius: 8, 
            alpha: 1, 
            foreground: { text_font_size: 20, 
                label_font_size: 16, 
                comment_font_size: 14 } },
                
        colors: { "color1": "0x00000000", "color2": "0xffffffff", "color3": "0xff000000", "color4": "0xffe4e4e4", "color5": "0xff95ec69", "color6": "0xff1E1E1E", "color7": "0x774A4A4A"},
        
        preset_color_schemes: { 
            "default": { 
                name: "标准", 
                key_text_color: "color3", 
                back_color: "color4",               
                text_color: "color5",               
                comment_text_color: "color3",       
                hilited_text_color: "color2",       
                hilited_back_color: "color1",       
                hilited_shadow_color: "color1",     
                candidate_text_color: "color3",     
                hilited_candidate_text_color: "color3", 
                hilited_candidate_back_color: "color5", 
                hilited_comment_text_color: "color3", 
                keyboard_back_color: "color4",      
                key_back_color: "color2",           
                hilited_key_text_color: "color3",
                text_back_color: "color3",
                hilited_key_back_color: "color5",
                key_border_color: "color3",
                shadow_color: "color3",
                candidate_separator_color: "color1", 
                bh1: "color2",                       
                th1: "color3",                       
                bh2: "color2",                      
                th2: "color3",                       
                bh3: "color2",                       
                th3: "color3",                       
                bh4: "color2",                       
                th4: "color3",                       
                bbs: "color2",                       
                tbs: "color3",                       
                bkg: "color2",                       
                tkg: "color5", 
                benter: "color5",                   
                tenter: "color3",                    
                bnk: "color2",
                tnk: "color3"
                },
            
            "Darkmode": { 
                name: "黑暗", 
                key_text_color: "color3", 
                back_color: "color6",               
                text_color: "color5",               
                comment_text_color: "color3",       
                hilited_text_color: "color7",       
                hilited_back_color: "color1",       
                hilited_shadow_color: "color1",     
                candidate_text_color: "color2",     
                hilited_candidate_text_color: "color3", 
                hilited_candidate_back_color: "color5", 
                hilited_comment_text_color: "color3", 
                keyboard_back_color: "color6",      
                key_back_color: "color7",           
                hilited_key_text_color:"color3",
                text_back_color: "color7",
                candidate_separator_color: "color5", 
                bh1: "color7",                       
                th1: "color2",                       
                bh2: "color7",                      
                th2: "color2",                       
                bh3: "color7",                       
                th3: "color2",                       
                bh4: "color7",                       
                th4: "color2",                       
                bbs: "color7",                       
                tbs: "color2",                       
                bkg: "color7",                       
                tkg: "color5", 
                benter: "color5",                   
                tenter: "color3",                    
                bnk: "color7",
                tnk: "color3"
                }     
            }, 
            preset_keyboards: { 
                                "default": { 
                                    name: "26键", 
                                    author: "暖暖", 
                                    width: 10, 
                                    ascii_mode: 0, 
                                    keys: [ 
                                        { click: "q", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "w", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "e", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "r", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "t", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "y", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "u", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "i", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "o", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { click: "p", key_back_color: "bh1", key_text_color: "th1"}, 
                                        { width: 5 },
                                        { click: "a", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "s", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "d", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "f", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "g", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "h", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "j", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "k", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { click: "l", key_back_color: "bh2", key_text_color: "th2"}, 
                                        { width: 5 }, 
                                        { click: "Shift_L", width: 15, label_symbol: " ", long_click: "Shift_L", double_click: "Shift_L3", composing: "delimiter", key_back_color: "bbs", key_text_color: "tbs"}, 
                                        { click: "z", long_click: '`', key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "x", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "c", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "v", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "b", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "n", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "m", key_back_color: "bh3", key_text_color: "th3"}, 
                                        { click: "BackSpace2", width: 15, key_back_color: "bbs", key_text_color: "tbs"}, 
                                        { click: "Keyboard_number", width: 25, key_back_color: "bh4", key_text_color: "th4" }, 
                                        { click: "space", width: 50, key_back_color: "bh4", key_text_color: "th4"}, 
                                        { click: "Return", width: 25, composing: "Return1", key_back_color: "benter", key_text_color: "tenter"} 
                                       
                                    ] 
                                },
        
                            "number": {
                                    name: "数字键盘",
                                    author: "hero20072",
                                    width: 10,
                                    ascii_mode: 1,
                                    keys: [
                                        { click: "'", width: 10 },
                                        { click: "+", width: 10 },
                                        { click: "1", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "2", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "3", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "Keyboard_default", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "_", width: 10 },
                                        { click: "-", width: 10 },
                                        { click: "4", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "5", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "6", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "BackSpace", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "@", width: 10 },
                                        { click: "*", width: 10 },
                                        { click: "7", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "8", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "9", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "space1", width: 20 },
                                        { click: "#", width: 10 },
                                        { click: "%", width: 10 },
                                        { click: ".", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "0", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "=", width: 20, key_back_color: "bnk", key_text_color: "tnk" },
                                        { click: "Return", width: 20 }
                                    ]
                                }
                            },
        _static: { 
            style: { 
                enter_label_mode: 2,
                enter_labels: { go: "前往", done: "完成", next: "下个", pre: "上个", search: "搜索", send: "发送", default: "enter" }
            },
                fallback_colors: { candidate_text_color: "text_color" },
                liquid_keyboard: {
                row: 4, row_land: 6, key_height: 16, key_height_land: 20, single_width: 38, vertical_gap: 6, margin_x: 4,
                fixed_key_bar: { position: "top", keys: ["Return2", "space1", "BackSpace", "liquid_keyboard_exit"] },
                keyboards: ["history", "ascii", "emoji", "math", "symbol", "cn", "list", "unit"],
                history: { name: "常用", type: "HISTORY" },
                emoji: { type: "SINGLE", name: "emoji", keys: "😀😃😄😁😆😅😂🙂🙃🫠😉😊😍🤩🥲😋🤪😝🫢🫣🤫🤔🫡🤐🤨😐😑😶😏🙄🤥😪😴😷🤒🤢🤧🥵🥶🥴😵😎😕🫤😟😲🥺🥹😭😱😖😣😞😩😫🥱😤🤡💔🫴👌🤌🤏✌🫰🤙👆🖕🫵👍👎✊👊👏🫶🤝🙏✍" },
                math: { type: "SINGLE", name: "数学", keys: "≈＝≠≌<>≤≥≡()[]{}-+±×*/÷&∥%‰‱°′″" },
                cn: { type: "SINGLE", name: "中文", keys: ["、", "“", "”", "‘", "···", "……", { click: "-" }, { click: "——", label: "破折" }, { click: "" }, "（", "）", "【", "】", "《", "》", "［", "］", "｛", "｝", "「", "」", "『", "』", "～"] },
                symbol: { name: "特殊", type: "SINGLE", keys: "△▽○◇□☆▲▼●◆■★▷◁▶◀♻♲⌫☑☒✔✘♩♪♫♬♭⇦⇧⇨⇩⇪↖↑↗←↔→↙↓↘⇄⇅⇆⇤↩⇥▸◂▴▾" },
                unit: { name: "单位", type: "SINGLE", keys: "℃¥$€฿￡㎡m³℉￥£￠₠¹²³⁴⁵ⁿ⁶⁷⁸⁹⁰ˣ⁺⁻⁼⁽⁾½⅓¼⅔¾₁₂₃₄₅ₙ₆₇₈₉₀ₓ₊₋₌₍₎℅" },
                list: { name: "列表", type: "SINGLE", keys: "①②③④⑤⑥⑦⑧⑨⑩⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩➊➋➌➍➎➏➐➑➒➓㊀㊁㊂㊃㊄㊅㊆㊇㊈㊉ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ" },
                ascii: { type: "SINGLE", name: "英符", keys: ",.?!:;/\\|*-+=^$`'\"^~@#%&()[]{}_" }
            },
     
                tool_bar: (function() {
            
                    const hide_button = { foreground: { style: "ic@keyboard_close", normal: "candidate_text_color" }, action: "Hide" };
                    const emoji_button = { foreground: { style: "ic@emoticon" }, action: "liquid_keyboard_emoji" };
                    const clipboard_button = { foreground: { style: "ic@clipboard" }, action: "clipboard_window" };
                    const edit_button = { foreground: { style: "ic@cursor_text" }, action: "Keyboard_editor" };
                    const ascii_mode_button = { foreground: { option_styles: ["中", "En"], font_size: 18, padding: 10 }, action: "Mode_switch" };
                    const full_shape_button = { foreground: { option_styles: ["ic@moon_full", "ic@moon_new"] }, action: "Zenkaku_Hankaku" };

                    return {
                        button_spacing: 5,
                        button_font: "iconfont.ttf",
                        primary_button: {
                            background: { type: "circle", corner_radius: 10, normal: 0x00, highlight: "hilited_candidate_button_color", vertical_inset: 4, horizontal_inset: 0 },
                            foreground: { style: "ic@dots_horizontal", normal: "candidate_text_color", padding: 10 },
                            action: "menu_keyboard"
                        },
                    
                        hide_button: hide_button,
                        emoji_button: emoji_button,
                        clipboard_button: clipboard_button,
                        edit_button: edit_button,
                        ascii_mode_button: ascii_mode_button,
                        full_shape_button: full_shape_button,
                        
                        buttons: [ hide_button, emoji_button, clipboard_button, edit_button, ascii_mode_button, full_shape_button ]
                        };
                })(),

                preset_keys: {
                    VOICE_ASSIST: { label: "语音", functional: true, send: "VOICE_ASSIST" },
                    Shift_L: { label: "⇧", preview: "⇪", functional: false, send: "Shift_L" },
                    Shift_L2: { label: "选择", preview: "⇪", functional: false, send: "Shift_L" },
                    Shift_L3: { label: "Shift", preview: "⇪", functional: false, send: "Shift_L", shift_lock: "click" },
                    Return: { label: "enter_labels", preview: "↩", functional: false, send: "Return" },
                    Return1: { label: 'enter', preview: '↩', functional: false, send: "Return" },
                    Return2: { label: 'enter', send: "Return" },
                    Hide: { label: "隐藏", send: "BACK" },
                    BackSpace: { label: "⌫", preview: "⇦", repeatable: true, functional: false, send: "BackSpace" },
                    BackSpace2: { label: "⌫", preview: "⇦", repeatable: true, functional: false, slide_delete: true, send: "BackSpace" },
                    space: { repeatable: false, preview: " ", functional: false, slide_cursor: true, label: "space", send: "space" },
                    space1: { repeatable: false, label: 'space', functional: false, send: 'space' },
                    Clear: { label: "全清", send: "Clear" },
                    Escape: { label: "取消", functional: false, send: "Escape" },
                    Home: { label: "行首", send: "Home", functional: false },
                    Insert: { label: "插入", send: "Insert" },
                    Delete: { label: "删除", send: "Delete", functional: false },
                    End: { label: "行尾", send: "End", functional: false },
                    Page_Up: { label: "上页", send: "Page_Up", functional: false },
                    Page_Down: { label: "下页", send: "Page_Down", functional: false },
                    Left: { label: "←", send: "Left", repeatable: true, functional: false },
                    Down: { label: "↓", send: "Down", functional: false },
                    Up: { label: "↑", send: "Up", functional: false },
                    Right: { label: "→", send: "Right", repeatable: true, functional: false },
                    select_all: { label: "全选", functional: false, send: "Control+a" },
                    cut: { label: "剪切", functional: false, send: "Control+x" },
                    copy: { label: "复制", functional: false, send: "Control+c" },
                    paste: { label: "粘贴", functional: false, send: "Control+v" },
                    paste_clip: { label: "粘贴", send: "function", command: "clipboard" },
                    paste_text: { label: "貼上文本", send: "Control+Shift+Alt+v" },
                    share_text: { label: "分享文本", send: "Control+Alt+s" },
                    redo: { label: "重做", functional: false, send: "Control+Shift+z" },
                    undo: { label: "撤销", functional: false, send: "Control+z" },
                    delimiter: { label: "分词", text: "'" }, 
                    F4: { label: "方案菜单", send: "F4" },
                    BackToPreviousSyllable: { label: "删音节", send: "Control+BackSpace" },
                    CommitRawInput: { label: "编码", send: "Control+Return" },
                    CommitScriptText: { label: "编码", send: "Shift+Return" },
                    CommitComment: { label: "编码", send: "Control+Shift+Return" },
                    DeleteCandidate: { label: "删词", send: "Control+Delete", functional: false },
                    Keyboard_letter: { label: "字母", functional: true, send: "Eisu_toggle", select: "default" },
                    Keyboard_default: { label: "返回", functional: false, send: "Eisu_toggle", select: ".default" },
                    Keyboard_switch: { label: "键盘", functional: true, send: "Eisu_toggle", select: ".next" },
                    Keyboard_number: { label: "123", functional: false, send: "Eisu_toggle", select: "number" },
                    Keyboard_editor: { label: "编辑", functional: false, send: "Eisu_toggle", select: "editor" },
                    Keyboard_symbols: { label: "更多", functional: false, send: "Eisu_toggle", select: "symbols" },
                    Keyboard_move: { label: "❖", functional: true, send: "Eisu_toggle", select: "move" },
                    Keyboard_next: { label: "后退", functional: false, send: "Eisu_toggle", select: ".next" },
                    Keyboard_last: { label: "后退", functional: false, send: "Eisu_toggle", select: ".last" },
                    Keyboard_last_lock: { label: "返回", send: "Eisu_toggle", select: ".last_lock" },
                    liquid_keyboard_exit: { label: "返回", send: "function", command: "liquid_keyboard", option: "-1" },
                    liquid_keyboard_switch: { label: "更多", send: "function", command: "liquid_keyboard", option: "特殊" },
                    liquid_keyboard_tabs: { label: "更多", send: "function", command: "liquid_keyboard", option: "更多" },
                    liquid_keyboard_emoji: { label: "🙂", send: "function", command: "liquid_keyboard", option: "emoji" },
                    liquid_keyboard_ascii: { label: "英符", send: "function", command: "liquid_keyboard", option: "英符" },
                    menu_keyboard: { label: "菜单", send: "function", command: "menu_keyboard" },
                    clipboard_window: { label: "剪贴", send: "function", command: "clipboard_window" },
                    Mode_switch: { toggle: "ascii_mode", functional: false, send: "Mode_switch", states: ["cn", "en"] },
                    Zenkaku_Hankaku: { toggle: "full_shape", send: "Mode_switch", states: ["半角", "全角"] },
                    Henkan: { toggle: "simplification", send: "Mode_switch", states: ["漢字", "汉字"] },
                    Charset_switch: { toggle: "extended_charset", send: "Mode_switch", states: ["常用", "增广"] },
                    Punct_switch: { toggle: "ascii_punct", send: "Mode_switch", states: ["。，", "．，"] },
                    IME_switch: { label: "🌐", send: "LANGUAGE_SWITCH" },
                    Schema_switch: { label: "下一方案", functional: false, send: "Control+Shift+1" },
                    Schema_Eng: { label: "En", functional: true, send: "Control+Shift+0" },
                    Theme_settings: { label: "主题", send: "SETTINGS", option: "theme" },
                    Color_switch: { label: "配色", functional: false, send: "PROG_RED" },
                    Menu: { label: "菜单", functional: false, send: "Menu" },
                    Settings: { label: "设置", functional: false, send: "SETTINGS" },
                    Date: { label: "日期", send: "function", command: "date", option: "yyyy-MM-dd" },
                    Time: { label: "時間", send: "function", command: "date", option: "HH:mm:ss" },
                    Left1: { label: "⇦", send: "Control+Left", repeatable: true, functional: false },
                    Right1: { label: "⇨", send: "Control+Right", repeatable: true, functional: false },
                    
                }
            }
        }

let currentTab = 'layout'

let currentScheme = "default"

let currentLayout = "default"

let selectedKeyIdx = null

let isWindowMode = false

let isPopupLocked = false

let userPopupLockPreference = true

let isGlobalPopupEnabled = true

let forceUnlockId = null

let isSchemeManagerCollapsed = true

let isLayoutManagerCollapsed = true

let colorGroupCollapseState = {
        "键盘与背景": true,
        "编码行 (Preedit)": true,
        "候选词 (未选中)": true,
        "候选词 (选中)": true
    }

let pressTimer = null

let isLongPressTriggered = false

let dragSrcIndex = null

let customMappings = []

let activeWire = null

let isBatchMode = false

let batchMappingName = ''

let batchMappingTarget = ''

let batchSelectedKeys = new Set()

let isKeyEditorLocked = false

let isShowSpacers = true

let isCapsulesEnabled = true

let shownIntros = new Set()

let lastCodeBubble = null

let lastSpokenTab = null

let _saveTimer = null
