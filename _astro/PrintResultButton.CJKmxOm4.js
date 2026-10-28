import{r as e}from"./rolldown-runtime.XKyaHtl9.js";import{t}from"./react.B54jxNxs.js";import{n,t as r}from"./jsx-runtime.Isw2e4yz.js";import{t as i}from"./createLucideIcon.BiXpiBvU.js";import{o as a}from"./share-state.CRNd3Xyx.js";import{t as o}from"./utils.De4in0In.js";import{t as s}from"./sound-synthesizer.2UdGVL0F.js";var c={name:`download`,size:24,node:[[`path`,{d:`M12 15V3`,key:`m9g1x1`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`path`,{d:`m7 10 5 5 5-5`,key:`brsn70`}]]};c.node;var l=i(c),u=n(),d=e(t(),1),f=r(),p=`data-print-section`;`${p}`;var m=`ausfintools-print-styles`;function h(){if(typeof document>`u`||document.getElementById(m))return()=>{};let e=document.querySelectorAll(`[${p}]`).length;document.documentElement.classList.toggle(`print-multi`,e>1);let t=document.createElement(`style`);return t.id=m,t.textContent=`
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
  `,document.head.appendChild(t),()=>{t.remove(),document.documentElement.classList.remove(`print-multi`)}}function g(e){let t=(0,u.c)(12),n;t[0]===e?n=t[1]:(n=e===void 0?{}:e,t[0]=e,t[1]=n);let{soundTick:r,onPrint:i,intercept:a}=n,o=r===void 0||r,c=a!==void 0&&a,l;t[2]!==i||t[3]!==o?(l=()=>{if(h(),o&&s.isSoundEnabled()&&s.playTick(),i?.(),typeof window<`u`)try{window.print()}catch{}},t[2]=i,t[3]=o,t[4]=l):l=t[4];let f=l,p,m;t[5]!==c||t[6]!==f||t[7]!==o?(p=()=>{let e=e=>{(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()===`p`&&(c?(e.preventDefault(),f()):(h(),o&&s.isSoundEnabled()&&s.playTick()))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},m=[f,c,o],t[5]=c,t[6]=f,t[7]=o,t[8]=p,t[9]=m):(p=t[8],m=t[9]),(0,d.useEffect)(p,m);let g;return t[10]===f?g=t[11]:(g={print:f},t[10]=f,t[11]=g),g}function _(e){let t=(0,u.c)(12),{label:n,className:r,selector:i,variant:s}=e,c=n===void 0?`Print / Save PDF`:n,l=s===void 0?`outline`:s,d=i??`[data-print-section]`,p;t[0]===Symbol.for(`react.memo_cache_sentinel`)?(p={intercept:!0},t[0]=p):p=t[0];let{print:m}=g(p),h;t[1]!==d||t[2]!==m?(h=()=>{typeof document<`u`&&document.querySelector(d)&&m()},t[1]=d,t[2]=m,t[3]=h):h=t[3];let _=h,v=l===`solid`?`bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20`:`bg-card border border-border text-foreground hover:border-primary/40 hover:bg-card/80`,y;t[4]!==r||t[5]!==v?(y=o(`no-print inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all`,v,r),t[4]=r,t[5]=v,t[6]=y):y=t[6];let b;t[7]===Symbol.for(`react.memo_cache_sentinel`)?(b=(0,f.jsx)(a,{className:`w-3.5 h-3.5`}),t[7]=b):b=t[7];let x;return t[8]!==_||t[9]!==c||t[10]!==y?(x=(0,f.jsxs)(`button`,{type:`button`,onClick:_,className:y,children:[b,c]}),t[8]=_,t[9]=c,t[10]=y,t[11]=x):x=t[11],x}export{l as n,_ as t};