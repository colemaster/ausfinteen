import{r as e}from"./rolldown-runtime.hePW80VL.js";import{y as t}from"./charts.De8qlzGd.js";import{t as n}from"./compiler-runtime.CNXGRiW6.js";import{x as r}from"./motion.DrJ5dYn0.js";import{t as i}from"./utils.BcYHkKUm.js";import{L as a}from"./icons.sXWsWTUO.js";import{t as o}from"./sound-synthesizer.B4YReT1e.js";import"./dist.CBS-hjU9.js";async function s(e){let t=JSON.stringify(e);if(typeof CompressionStream<`u`)try{let e=new Blob([t]).stream().pipeThrough(new CompressionStream(`deflate-raw`)),n=await new Response(e).arrayBuffer(),r=new Uint8Array(n),i=``;for(let e=0;e<r.byteLength;e++)i+=String.fromCharCode(r[e]);return btoa(i).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}catch{}let n=encodeURIComponent(t).replace(/%([0-9A-F]{2})/g,(e,t)=>String.fromCharCode(parseInt(t,16)));return btoa(n).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``)}function c(e,t,n){let r=e=>{let t=String(e??``);return/^[=+\-@\t\r]/.test(t)&&(t=`'`+t),(t.includes(`,`)||t.includes(`"`)||t.includes(`
`))&&(t=`"`+t.replace(/"/g,`""`)+`"`),t},i=[t.map(r).join(`,`),...n.map(e=>e.map(r).join(`,`))].join(`\r
`),a=new Blob([i],{type:`text/csv;charset=utf-8;`}),o=URL.createObjectURL(a),s=document.createElement(`a`);s.setAttribute(`href`,o),s.setAttribute(`download`,e.endsWith(`.csv`)?e:`${e}.csv`),document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o)}function l(e,t=180){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}" width="${t}" height="${t}" class="rounded-xl bg-white p-2 shadow-md">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <!-- Dynamic SVG Data Matrix Representation -->
    <path fill="#0f172a" d="M10,10 h40 v40 h-40 z M20,20 v20 h20 v-20 z M130,10 h40 v40 h-40 z M140,20 v20 h20 v-20 z M10,130 h40 v40 h-40 z M20,140 v20 h20 v-20 z"/>
    <text x="50%" y="54%" font-family="sans-serif" font-size="10" font-weight="bold" fill="#6366f1" text-anchor="middle">AusFinance Plan</text>
    <text x="50%" y="65%" font-family="monospace" font-size="7" fill="#64748b" text-anchor="middle">${e.slice(0,24)}...</text>
  </svg>`}var u=n(),d=e(t(),1),f=r(),p=`data-print-section`,m=`ausfintools-print-styles`;function h(){if(typeof document>`u`||document.getElementById(m))return()=>{};let e=document.querySelectorAll(`[${p}]`).length;document.documentElement.classList.toggle(`print-multi`,e>1);let t=document.createElement(`style`);return t.id=m,t.textContent=`
    @media print {
      @page { margin: 14mm; }
      html, body { background: #ffffff !important; color: #000000 !important; }
      body * { visibility: hidden !important; }
      [data-print-section],
      [data-print-section] * { visibility: visible !important; }
      html:not(.print-multi) [data-print-section] {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        max-width: none !important;
        box-shadow: none !important;
      }
      .no-print { display: none !important; }
      a { text-decoration: none !important; }
    }
  `,document.head.appendChild(t),()=>{t.remove(),document.documentElement.classList.remove(`print-multi`)}}function g(e){let t=(0,u.c)(12),n;t[0]===e?n=t[1]:(n=e===void 0?{}:e,t[0]=e,t[1]=n);let{soundTick:r,onPrint:i,intercept:a}=n,s=r===void 0||r,c=a!==void 0&&a,l;t[2]!==i||t[3]!==s?(l=()=>{if(h(),s&&o.isSoundEnabled()&&o.playTick(),i?.(),typeof window<`u`)try{window.print()}catch{}},t[2]=i,t[3]=s,t[4]=l):l=t[4];let f=l,p,m;t[5]!==c||t[6]!==f||t[7]!==s?(p=()=>{let e=e=>{(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`p`&&(c?(e.preventDefault(),f()):(h(),s&&o.isSoundEnabled()&&o.playTick()))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},m=[f,c,s],t[5]=c,t[6]=f,t[7]=s,t[8]=p,t[9]=m):(p=t[8],m=t[9]),(0,d.useEffect)(p,m);let g;return t[10]===f?g=t[11]:(g={print:f},t[10]=f,t[11]=g),g}function _({label:e=`Print / Save PDF`,className:t,selector:n=`[${p}]`,variant:r=`outline`}){let{print:o}=g({intercept:!0});return(0,f.jsxs)(`button`,{type:`button`,onClick:()=>{typeof document>`u`||document.querySelector(n)&&o()},className:i(`no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all`,r===`solid`?`bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20`:`bg-card border border-border text-foreground hover:border-primary/40 hover:bg-card/80`,t),children:[(0,f.jsx)(a,{className:`w-3.5 h-3.5`}),e]})}export{l as i,s as n,c as r,_ as t};