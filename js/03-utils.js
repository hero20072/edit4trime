




function getPath(o, p) { return (p || '').split('.').reduce((a, b) => (a && a[b] !== undefined) ? a[b] : undefined, o); }

function setPath(o, p, v) { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, b) => a[b], o); t[last] = v; }

const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase()

function argbToCss(v) { 
        if(!v) return 'transparent'; 
        if(state && state.colors && state.colors[v]) return `var(--${v})`;
        
        let str;
        if (typeof v === 'number') {
            str = v.toString(16).padStart(8, '0');
        } else {
            str = String(v).replace('0x', '').replace('#', '');
        }

        if (str.length === 3) str = str.split('').map(c => c + c).join('');
        if (str.length === 6) str = 'FF' + str;
        
        const a = parseInt(str.slice(0, 2), 16) / 255;
        const r = parseInt(str.slice(2, 4), 16);
        const g = parseInt(str.slice(4, 6), 16);
        const b = parseInt(str.slice(6, 8), 16);
        
        return `rgba(${r},${g},${b},${a.toFixed(2)})`;
    }

function escapeHtml(str) {
        return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
