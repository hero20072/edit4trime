// ============================================================
// 01-config.js — config
// 由 test.html 拆分而来（无构建，经典脚本，按 01→11 顺序引入）
// ============================================================

const ColorEngine = {
        toOklab(r, g, b) {
            const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
            const lr = lin(r), lg = lin(g), lb = lin(b);
            const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
            const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
            const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
            const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
            return [
                0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
                1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
                0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
            ];
        },
        fromOklab(L, a, b) {
            const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
            const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
            const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
            const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
            let r  =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
            let g  = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
            let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
            const gamma = c => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
            const clamp = c => Math.round(Math.min(255, Math.max(0, gamma(c) * 255)));
            return [clamp(r), clamp(g), clamp(bl)];
        },
        lerp(c1, c2, t) {
            const [L1, a1, b1] = this.toOklab(c1[0], c1[1], c1[2]);
            const [L2, a2, b2] = this.toOklab(c2[0], c2[1], c2[2]);
            return this.fromOklab(L1 + (L2 - L1) * t, a1 + (a2 - a1) * t, b1 + (b2 - b1) * t);
        }
    }

const CORE_KEYS = new Set([
        'name', 'author', 'dark_scheme',
        'keyboard_back_color', 'key_back_color', 'key_text_color',
        'text_back_color', 'text_color', 'hilited_text_color', 'hilited_back_color', 'hilited_shadow_color',
        'candidate_text_color', 'comment_text_color', 'candidate_separator_color',
        'hilited_candidate_back_color', 'hilited_candidate_text_color', 'hilited_comment_text_color',
        'back_color', 'hilited_key_back_color','key_border_color', 'shadow_color','hilited_key_text_color'
    ])

const SYS_MAPPINGS = Array.from(CORE_KEYS)

const BASE_DARK_COLOR = "rgba(20, 30, 45, 0.45)"

const settingIntros = {
        // --- 核心开关 (General) ---
        'style.auto_caps': " **自动句首大写**：当你在输入英文时，开启此项会在每段话的开头自动切换到大写字母，非常适合习惯写英文长句的用户。",
        'style.proximity_correction': " **边缘容错**：这是 Trime 的黑科技。如果你手指较粗容易点错位置，它会根据你点击的坐标和拼音概率自动纠错。建议开启，能大幅提升盲打准确率！",
        'style.reset_ascii_mode': " **状态重置**：开启后，每次收起键盘再打开，都会强制回到中文输入状态，防止你忘了上次是在写英文。",

        // --- 全局字体 (Fonts) ---
        'style.key_font': " **键盘字体**：主键盘按键上显示的字母/符号字体。建议使用等宽字体以获得整齐的视觉效果。",
        'style.candidate_font': " **候选字体**：候选词区（选词栏）显示的文字字体。建议使用字重稍大的字体，看起来更清晰。",
        'style.comment_font': " **编码提示字体**：在候选词旁边显示的五笔/形码/音形提示的字体，通常设置得比候选字小一些。",
        'style.text_font': " **编码字体**：你正在输入的拼音/编码区的字体。建议使用设计感强的字体，让输入过程赏心悦目。",
        'style.symbol_font': " **符号/角标字体**：按键右上角或左下角那些小符号的字体。",
        'style.popup_font': " **按键提示字体**：手指按下按键时，上方弹出的那个大气泡里的文字字体。",

        // --- 物理参数 (Appearance) ---
        'style.keyboard_height': " **竖屏高度**：这是键盘在手机竖屏时的总高度。太高会遮挡聊天内容，太低按键会显得局促。一般建议在 240-280 之间。",
        'style.keyboard_height_land': " **横屏高度**：横屏玩游戏或打字时，键盘占用的垂直空间。建议设置得比竖屏低很多，否则会占满全屏。",
        'style.vertical_correction': " **竖直方向触摸位置校正**：为了提升打字手感，可将按键的实际触摸位置相对其显示位置上下偏移一点点（默认值-10，上偏为正，下偏为负，为0则不偏移）。",

        
        // --- 编码区 (Preedit) ---
        'preedit.foreground.font_size': " **编码字号**：正在输入的拼音的大小。如果你的视力较好，可以调小一点让布局更紧凑。",
        'preedit.horizontal_padding': " **编码区横向内边距**：拼音文字距离编码栏左边框的距离。调大它可以让拼音看起来不那么拥挤。",
        'preedit.alpha': " **编码区背景透明度**：0 为完全透明，1 为完全不透明。如果你想看到键盘下方的壁纸，可以调低它。",
        'preedit.top_end_radius': " **编码区顶部圆角**：让编码栏的上方两个角变得圆润。如果你的键盘整体是圆润风，建议调大到 14 以上。",

        // --- 悬浮窗口 (Window Mode) ---
        'window.alpha': " **窗口透明度**：控制悬浮候选窗口的透明度，营造毛玻璃或极简视觉感。",
        'window.min_width': " **窗口最小宽度**：防止只有一两个候选词时窗口太窄，设置一个最小值可以让窗口比例更协调。",
        'window.corner_radius': " **窗口圆角**：悬浮窗四个角的弧度。大圆角看起来更现代，小圆角更复古。",
        'window.foreground.text_font_size': " **悬浮候选字号**：在悬浮窗口模式下，候选词显示的大小。建议比内嵌模式稍大一些。",

        // --- 候选栏 (Candidate Bar) ---
        'style.candidate_view_height': " **候选栏高度**：这是内嵌在键盘顶部的选词栏高度。它决定了选词时的触控面积。",
        'style.candidate_text_size': " **候选字号**：选词栏文字的大小。这是输入法最核心的参数之一，建议在 18-24 之间尝试。",
        'style.candidate_spacing': " **候选词间距**：不同候选词之间的水平距离，防止误选相邻的词。",
        'style.candidate_padding': " **候选项内边距**：单个词语四周留出的空白空间。调大它可以增加“留白感”。",
        'style.comment_on_top': " **形码提示位置**：你可以决定将编码提示（如五笔码）放在词语的右边，还是词语的正上方。",

        // --- 按键物理参数 (Keys) ---
        'style.key_height': " **单键高度**：每行按键的高度。调高它可以减少上下行误触，但也增加了键盘总高。",
        'style.vertical_gap': " **行间距**：键盘行与行之间的缝隙。增加间距可以让键盘布局有“悬浮感”。",
        'style.horizontal_gap': " **列间距**：按键与按键左右之间的缝隙。如果你用的是带框的皮肤，这个参数非常重要。",
        'style.round_corner': " **按键圆角**：按键本身的形状。0 是硬朗的方形，18 以上则是圆润的胶囊形。",
        'style.key_text_size': " **按键字号**：按键上字母的大小。太大会显得拥挤，太小则看不清。",
        'style.symbol_text_size': " **符号/角标字号**：按键右上角小符号的大小，通常建议设为按键字号的一半左右。",

        // --- 按键提示 (Popup) ---
        'style.popup_width': " **气泡宽度**：按下按键时弹出的提示框宽度。建议比按键稍宽一些。",
        'style.popup_height': " **气泡高度**：气泡的垂直高度。它需要足够高，才不会被你的手指完全挡住。",
        'style.popup_bottom_margin': " **离键距离**：气泡底部距离按键顶部的距离。调大它会让气泡“飞”得更高，防止手指遮挡。",
        'style.popup_text_size': " **气泡字号**：气泡里文字的大小。通常设得很大，让你余光一扫就知道点对了没。",

        // --- 配色属性 (Colors/Schemes) ---
        'text_back_color': " **编码栏背景**：这就是你正在输入的拼音区域（Preedit）的底色。你可以设为透明或者与键盘底色不同的颜色。",
        'text_color': " **输入符/光标颜色**：在拼音末尾那个指示位置的小三角形或竖线的颜色。",
        'hilited_text_color': " **编码文字颜色**：拼音字母本身的颜色。建议与背景色形成高对比度。",
        'hilited_back_color': " **编码字符高亮**：拼音字母背后的那层“高亮块”背景色，能突出当前正在编辑的内容。",
        'back_color': " **窗口背景**：候选区域的主背景色，是皮肤底色的基调。",
        'keyboard_back_color': " **键盘底色**：按键下方的衬底颜色，决定了键盘整体的视觉深度。",
        'key_back_color': " **按键默认背景**：按键没被按下时的颜色。建议与键盘底色区分开，增强层次感。",
        'key_text_color': " **按键文字颜色**：按键上的字母颜色。",
        'hilited_candidate_back_color': " **选中项背景**：第一个候选词（默认选中项）的背景色。这是皮肤最醒目的“主题色”位置。",
        'candidate_separator_color': " **候选分割线**：不同词语之间若有分割线，这是它的颜色。设为透明可以隐藏分割线。",
        
         // --- 配色方案管理专有项 ---
        'scheme_manager_intro': " **配色方案管理**：Trime 支持在一个皮肤文件里存入多套配色。你可以点击【+ 新增配色】来尝试不同的设计风格。最重要的是，皮肤必须有一个名为 `default` 的方案作为基准。",
        'scheme_type_select': " **用途 (Scheme Type)**：\n- **默认配色 (default)**：输入法启动时首选的配色。\n- **自定义配色**：你可以创建如 `my_red_theme` 这种方案，然后通过按键功能（Color_switch）在多个方案间一键切换。",
        'scheme_id_input': " **英文标识名 (ID)**：这是 YAML 代码中引用该方案的“唯一身份证”。\n- 必须是英文或数字（如 `solarized_dark`）。\n- 修改 ID 会同步更新代码中的引用。注意，`default` 是特殊 ID，通常不建议改名。",
        'scheme_name_input': " **显示名称 (Name)**：这才是你在输入法设置菜单里看到的中文名字，比如“莫兰迪灰”或“赛博朋克”。你可以起任何好听的名字。",
        'scheme_author_input': " **作者 (Author)**：在这里留下你的大名。当你把皮肤分享给朋友时，他们能在设置信息里看到你的署名。",
        'dark_scheme_toggle': " **设为黑暗模式**：这是 Trime 的高级功能！\n- 当你勾选某个方案作为 `default` 的黑暗模式时，输入法会跟随安卓系统的**夜间模式开关**自动切换颜色。\n- 比如：白天用浅色的 `default`，晚上系统变黑时，它会自动跳到你指定的这套方案。",
        'scheme_delete_btn': " **删除方案**：删除不需要的配色。但请注意，至少要保留一个方案，且最好保留 `default`，否则皮肤可能无法在手机上正常编译。"
    }

const meta = {
        general: [
            { title: "核心开关", items: [ 
                {k:'style.auto_caps', l:'自动句首大写', t:'bool'}, 
                {k:'style.proximity_correction', l:'按键边缘容错', t:'bool'},

                {k:'style.reset_ascii_mode', l:'重置中文', t:'bool'} 
            ]},
            { title: "全局字体", items: [ 
                { k: 'style.key_font', l: '按键字体', t: 'font' }, 
                { k: 'style.candidate_font', l: '候选字体', t: 'font' }, 
                { k: 'style.comment_font', l: '候选注释字体', t: 'font' }, 
                { k: 'style.text_font', l: '编码字体', t: 'font' }, 
                { k: 'style.symbol_font', l: '符号字体', t: 'font' },
                { k: 'style.popup_font', l: '按键气泡字体', t: 'font' },
                { k: 'style.latin_font', l: '候选及候选注释拉丁字体', t: 'info', note: '默认同步候选字体'},
                { k: 'style.hanb_font', l: '后备字体。用于补充候选字体', t: 'info', note: '默认同步候选字体'}
            ]
        }
            
        ],
        appearance: [        
            { 
                title: "1. 键盘整体", 
                items: [ 
                    {k:'style.keyboard_height', l:'竖屏总高度', t:'range', min:150, max:400}, 
                    {k:'style.keyboard_padding_bottom', l:'抬高键盘', t:'range', min:1, max:100},
                    {k:'style.vertical_correction', l:' 触摸校正', t:'range', min:-20, max:20},
                    {k:'style.keyboard_height_land', l:'横屏总高度', t:'range', min:50, max:200} 
                ]
            },
            { 
                title: "2. 拼音编码区 (Preedit)", 
                items: [ 
                    {k:'preedit.foreground.font_size', l:'字号', t:'range', min:10, max:30}, 
                    {k:'style.comment_height', l:'高度', t:'range', min:0, max:60}, 
                    {k:'preedit.horizontal_padding', l:'横向内边距', t:'range', min:0, max:50}, 
                    {k:'preedit.alpha', l:'背景透明', t:'range', min:0, max:1, step:0.1}, 
                    {k:'preedit.top_end_radius', l:'右上圆角', t:'range', min:0, max:30} 
                ]
            },
            { 
                title: "3. 候选窗口 (悬浮模式)", 
                items: [ 
                    {k:'window.alpha', l:'透明度', t:'range', min:0, max:1, step:0.1},
                    {k:'window.corner_radius', l:'窗口圆角', t:'range', min:0, max:30},  
                    {k:'window.min_width', l:'最小宽度', t:'range', min:0, max:300}, 
                    {k:'window.insets.vertical', l:'纵向边距', t:'range', min:0, max:30}, 
                    {k:'window.insets.horizontal', l:'横向边距', t:'range', min:0, max:30},
                    {k:'window.item_padding.vertical', l:'候选项纵距', t:'range', min:0, max:20},
                    {k:'window.foreground.text_font_size', l:'候选字号', t:'range', min:12, max:40},
                    {k:'window.foreground.label_font_size', l:'序号字号', t:'range', min:10, max:30},
                    {k:'window.foreground.comment_font_size', l:'注释字号', t:'range', min:10, max:30}
                ]
            },
            { 
                title: "4. 候选栏 (内嵌模式)", 
                items: [ 
                    {k:'style.candidate_view_height', l:'高度', t:'range', min:0, max:80}, 
                    {k:'style.candidate_text_size', l:'字号', t:'range', min:1, max:40}, 
                    {k:'style.candidate_spacing', l:'词间距', t:'range', min:0, max:50}, 
                    {k:'style.candidate_padding', l:'词内边距', t:'range', min:0, max:30},
                    
                    {k:'style.comment_text_size', l:'提示码字号', t:'range', min:0, max:20},
                    {k:'style.comment_on_top', l:'形码提示在：', t:'toggleButton'} 
                ]
            },
            { 
                title: "5. 主键盘 (Keypad)", 
                items: [ 
                    {k:'style.key_height', l:'单键高度', t:'range', min:5, max:80}, 
                    {k:'style.vertical_gap', l:'行间距', t:'range', min:0, max:30}, 
                    {k:'style.horizontal_gap', l:'列间距', t:'range', min:0, max:30}, 
                    {k:'style.key_border', l:'按键边框宽度', t:'range', min:0, max:10},
                    {k:'style.round_corner', l:'按键圆角', t:'range', min:0, max:40}, 
                    {k:'style.key_text_size', l:'按键字号', t:'range', min:0, max:60},
                     {k:'style.shadow_radius', l:'按键字体阴影半径', t:'range', min:0, max:20, step:1},
                    {k:'style.key_long_text_size', l:'功能键字号', t:'range', min:0, max:30},
                    {k:'style.symbol_text_size', l:'符号字号', t:'range', min:0, max:20}
                ]
            },
            { 
                title: "6. 按键提示 (Popup)", 
                items: [ 
                    {k:'style.popup_width', l:'气泡宽度', t:'range', min:20, max:100}, 
                    {k:'style.popup_height', l:'气泡高度', t:'range', min:30, max:120}, 
                    {k:'style.popup_bottom_margin', l:'离键距离', t:'range', min:0, max:120}, 
                    {k:'style.popup_key_height', l:'内键高度', t:'range', min:20, max:100}, 
                    {k:'style.popup_text_size', l:'气泡字号', t:'range', min:12, max:50} 
                ]
            }
        ],

        colorMeta: [
        { 
            group: "键盘与背景", color: '#10b981',
            items: [
                { k: 'back_color', l: '候选栏背景' }, 
                { k: 'keyboard_back_color', l: '键盘背景' },
                { k: 'key_back_color', l: '按键常态背景' }, 
                { k: 'hilited_key_back_color', l: '按键按下背景' },
                { k: 'key_border_color', l: '按键边框' },
                { k: 'shadow_color', l: '按键文字阴影' },
                { k: 'key_text_color', l: '按键默认文字' },
                { k: 'hilited_key_text_color', l:'按键文字按下'}
            ]
        },
        { 
            group: "编码行 (Preedit)", color: '#f59e0b',
            items: [
                { k: 'text_back_color', l: '背景' }, 
                { k: 'hilited_text_color', l: '字体' },  
                { k: 'hilited_back_color', l: '字体背景' },
                { k: 'hilited_shadow_color', l: '字体阴影' },
                { k: 'text_color', l: '输入符' }
            ]
        },

        { 
            group: "候选词 (选中)", color: '#3b82f6',
            items: [
                { k: 'hilited_candidate_text_color', l: '字体' }, 
                { k: 'hilited_candidate_back_color', l: '选中背景' }, 
                { k: 'hilited_comment_text_color', l: '提示码' },
                { k: 'candidate_separator_color', l: '分割线' } 
            ]
        },
        { 
            group: "候选词 (未选中)", color: '#ec4899',
            items: [
                { k: 'candidate_text_color', l: '字体' }, 
                { k: 'comment_text_color', l: '提示码' }
            ]
        }
    ],
    }

const CHECKER_SVG = "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill-opacity=%27.15%27%3E%3Crect width=%278%27 height=%278%27/%3E%3Crect x=%278%27 y=%278%27 width=%278%27 height=%278%27/%3E%3C/svg%3E')"

const fontVarMap = {
        'style.key_font': '--font-key',
        'style.popup_font': '--font-popup',
        'style.text_font': '--font-text',       // 对应编码区
        'style.candidate_font': '--font-candidate',
        'style.comment_font': '--font-comment',
        'style.symbol_font': '--font-symbol',
        'style.latin_font': '--font-key',       // 暂时兜底
        'style.hanb_font': '--font-candidate'   // 暂时兜底
    }

const STORAGE_KEY = 'trime-skin-editor-draft'

const AVATAR_BASE64 = "data:image/png;base64,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"

