import{g as se,E as ue,o as le,s as ce,b as h,d as I,q as x,_ as b,j as s,V as l,u as de,H as pe,f as fe,v as O,i as P,w as X,S as me,x as ve,y as ge,e as he,z as be,X as xe,A as we,B as ye,D as _e,F as d,G as u,J as Ee,K as G,M as q,r as N,N as Te,O as je,P as Ce,Q as Be,U as Fe,W as Se,Y as J,Z as p}from"./vendors.09077050.js";import{c as E,P as Ne,C as ke,a as Ae,b as Oe,d as Pe,t as V,T as De}from"./common.ed25a4e1.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const t of a.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&n(t)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();var He=`
/* H5 端隐藏 TabBar 空图标（只隐藏没有 src 的图标） */
.weui-tabbar__icon:not([src]),
.weui-tabbar__icon[src=''] {
  display: none !important;
}

.weui-tabbar__item:has(.weui-tabbar__icon:not([src])) .weui-tabbar__label,
.weui-tabbar__item:has(.weui-tabbar__icon[src='']) .weui-tabbar__label {
  margin-top: 0 !important;
}

/* Vite 错误覆盖层无法选择文本的问题 */
vite-error-overlay {
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-user-select: text !important;
}

vite-error-overlay::part(window) {
  max-width: 90vw;
  padding: 10px;
}

.taro_page {
  overflow: auto;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* H5 导航栏页面自动添加顶部间距 */
body.h5-navbar-visible .taro_page {
  padding-top: 44px;
}

body.h5-navbar-visible .toaster[data-position^="top"] {
  top: 44px !important;
}

/* Sheet 组件在 H5 导航栏下的位置修正 */
body.h5-navbar-visible .sheet-content:not([data-side="bottom"]) {
    top: 44px !important;
}

/*
 * H5 端 rem 适配：与小程序 rpx 缩放一致
 * 375px 屏幕：1rem = 16px，小程序 32rpx = 16px
 */
html {
    font-size: 4vw !important;
}

/* H5 端组件默认样式修复 */
taro-view-core {
    display: block;
}

taro-text-core {
    display: inline;
}

taro-input-core {
    display: block;
    width: 100%;
}

taro-input-core input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
}

taro-input-core.taro-otp-hidden-input input {
    color: transparent;
    caret-color: transparent;
    -webkit-text-fill-color: transparent;
}

/* 全局按钮样式重置 */
taro-button-core,
button {
    margin: 0 !important;
    padding: 0 !important;
    line-height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
}

taro-button-core::after,
button::after {
    border: none;
}

taro-textarea-core > textarea,
.taro-textarea,
textarea.taro-textarea {
    resize: none !important;
}
`,Re=`
/* PC 宽屏适配 - 基础布局 */
@media (min-width: 769px) {
  html {
    font-size: 15px !important;
  }

  body {
    background-color: #f3f4f6 !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    min-height: 100vh !important;
  }
}
`,Le=`
/* PC 宽屏适配 - 手机框样式（有 TabBar 页面） */
@media (min-width: 769px) {
  .taro-tabbar__container {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    transform: translateX(0) !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
  }

  .taro-tabbar__panel {
    height: 100% !important;
    overflow: auto !important;
  }
}

/* PC 宽屏适配 - Toast 定位到手机框范围内 */
@media (min-width: 769px) {
  body .toaster {
    left: 50% !important;
    right: auto !important;
    width: 375px !important;
    max-width: 375px !important;
    transform: translateX(-50%) !important;
    box-sizing: border-box !important;
  }
}

/* PC 宽屏适配 - 手机框样式（无 TabBar 页面，通过 JS 添加 no-tabbar 类） */
@media (min-width: 769px) {
  body.no-tabbar #app {
    width: 375px !important;
    max-width: 375px !important;
    height: calc(100vh - 40px) !important;
    max-height: 900px !important;
    background-color: #fff !important;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px !important;
    overflow: hidden !important;
    position: relative !important;
    transform: translateX(0) !important;
  }

  body.no-tabbar #app .taro_router {
    height: 100% !important;
    overflow: auto !important;
  }
}
`;function ze(){var i=document.createElement("style");i.innerHTML=He+Re+Le,document.head.appendChild(i)}function Ie(){var i=function(){var n=!!document.querySelector(".taro-tabbar__container");document.body.classList.toggle("no-tabbar",!n)};i();var e=new MutationObserver(i);e.observe(document.body,{childList:!0,subtree:!0})}function Ve(){ze(),Ie()}function Me(){var i=se();if(i===ue.WEAPP)try{var e=le(),r=e.miniProgram.envVersion;console.log("[Debug] envVersion:",r),r!=="release"&&ce({enableDebug:!0})}catch(n){console.error("[Debug] 开启调试模式失败:",n)}}var Ue={visible:!1,title:"",bgColor:"#ffffff",textStyle:"black",navStyle:"default",transparent:"none",leftIcon:"none"},We=function(){var e,r=O();return(r==null||(e=r.config)===null||e===void 0?void 0:e.window)||{}},$e=function(){var e,r,n=(e=O())===null||e===void 0||(e=e.config)===null||e===void 0?void 0:e.tabBar;return new Set((n==null||(r=n.list)===null||r===void 0?void 0:r.map(function(o){return o.pagePath}))||[])},M=function(){var e,r=O();return(r==null||(e=r.config)===null||e===void 0||(e=e.pages)===null||e===void 0?void 0:e[0])||"pages/index/index"},C=function(e){return e.replace(/^\//,"")},Ye=function(e,r,n,o){if(!e)return"none";var a=C(e),t=C(o),m=a===t,c=r.has(a)||r.has("/".concat(a)),v=n>1;return c||m?"none":v?"back":"home"},Xe=function(){var e=h.useState(Ue),r=I(e,2),n=r[0],o=r[1],a=h.useState(0),t=I(a,2),m=t[0],c=t[1],v=h.useCallback(function(){var f=x.getCurrentPages();if(f.length===0){o(function(oe){return b(b({},oe),{},{visible:!1})});return}var g=f[f.length-1],R=(g==null?void 0:g.route)||"";if(R){var w=(g==null?void 0:g.config)||{},y=We(),T=$e(),te=M(),j=C(R),L=C(te),ae=j===L,ie=T.has(j)||T.has("/".concat(j)),z=T.size<=1&&f.length<=1&&(ae||ie);o({visible:!z,title:document.title||w.navigationBarTitleText||y.navigationBarTitleText||"",bgColor:w.navigationBarBackgroundColor||y.navigationBarBackgroundColor||"#ffffff",textStyle:w.navigationBarTextStyle||y.navigationBarTextStyle||"black",navStyle:w.navigationStyle||y.navigationStyle||"default",transparent:w.transparentTitle||y.transparentTitle||"none",leftIcon:z?"none":Ye(j,T,f.length,L)})}},[]);x.useDidShow(function(){v()}),x.usePageScroll(function(f){var g=f.scrollTop;n.transparent==="auto"&&c(Math.min(g/100,1))}),h.useEffect(function(){var f=null,g=new MutationObserver(function(){f&&clearTimeout(f),f=setTimeout(function(){v()},50)});return g.observe(document.head,{subtree:!0,childList:!0,characterData:!0}),v(),function(){g.disconnect(),f&&clearTimeout(f)}},[v]);var S=n.visible&&n.navStyle!=="custom";if(h.useEffect(function(){S?document.body.classList.add("h5-navbar-visible"):document.body.classList.remove("h5-navbar-visible")},[S]),!S)return s.jsx(s.Fragment,{});var H=n.textStyle==="white"?"#fff":"#333",Z=n.textStyle==="white"?"text-white":"text-gray-800",ee=function(){return n.transparent==="always"?{backgroundColor:"transparent"}:n.transparent==="auto"?{backgroundColor:n.bgColor,opacity:m}:{backgroundColor:n.bgColor}},re=function(){return x.navigateBack()},ne=function(){var g=M();x.reLaunch({url:"/".concat(g)})};return s.jsxs(s.Fragment,{children:[s.jsxs(l,{className:"fixed top-0 left-0 right-0 h-11 flex items-center justify-center z-1000",style:ee(),children:[n.leftIcon==="back"&&s.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:re,children:s.jsx(de,{size:24,color:H})}),n.leftIcon==="home"&&s.jsx(l,{className:"absolute left-2 top-1/2 -translate-y-1/2 p-1 flex items-center justify-center",onClick:ne,children:s.jsx(pe,{size:22,color:H})}),s.jsx(fe,{className:"text-base font-medium max-w-3/5 truncate ".concat(Z),children:n.title})]}),s.jsx(l,{className:"h-11 shrink-0"})]})},Ge=function(e){var r=e.children;return s.jsxs(s.Fragment,{children:[s.jsx(Xe,{}),r]})},qe=["className","variant"],Je=X("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground hover:bg-primary hover:bg-opacity-80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary hover:bg-opacity-80",destructive:"border-transparent bg-destructive text-destructive-foreground hover:bg-destructive hover:bg-opacity-80",outline:"text-foreground"}},defaultVariants:{variant:"default"}});function k(i){var e=i.className,r=i.variant,n=P(i,qe);return s.jsx(l,b({className:E(Je({variant:r}),e)},n))}var Ke=["className","variant","size","asChild","disabled"],Qe=X("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",{variants:{variant:{default:"bg-primary text-primary-foreground hover:bg-primary hover:bg-opacity-90",destructive:"bg-destructive text-destructive-foreground hover:bg-destructive hover:bg-opacity-90",outline:"border border-input bg-background hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground hover:bg-secondary hover:bg-opacity-80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-10 px-4 py-2",sm:"h-9 rounded-md px-3",lg:"h-11 rounded-md px-8",icon:"h-10 w-10"}},defaultVariants:{variant:"default",size:"default"}}),_=h.forwardRef(function(i,e){var r,n=i.className,o=i.variant,a=i.size;i.asChild;var t=i.disabled,m=P(i,Ke),c=(r=m.tabIndex)!==null&&r!==void 0?r:t?-1:0;return s.jsx(l,b(b({className:E(Qe({variant:o,size:a,className:n}),t&&"opacity-50 pointer-events-none"),ref:e},{tabIndex:c}),{},{hoverClass:t?void 0:"border-ring ring-2 ring-ring ring-offset-2 ring-offset-background"},m))});_.displayName="Button";var Ze=["className","children","orientation"],K=h.forwardRef(function(i,e){var r=i.className,n=i.children,o=i.orientation,a=o===void 0?"vertical":o,t=P(i,Ze),m=a==="horizontal"||a==="both",c=a==="vertical"||a==="both";return s.jsx(me,b(b({ref:e,className:E("relative",r),scrollY:c,scrollX:m,style:{overflowX:m?"auto":"hidden",overflowY:c?"auto":"hidden"}},t),{},{children:n}))});K.displayName="ScrollArea";var er={error:null,report:"",source:"",visible:!1,open:!1,timestamp:""},U="hsl(360, 100%, 45%)",W=!1,B=er,A=new Set,rr=function(){A.forEach(function(e){return e()})},nr=function(e){return A.add(e),function(){return A.delete(e)}},$=function(){return B},Q=function(e){B=e,rr()},tr=function(){var i=d(u().m(function e(r){var n,o,a,t,m;return u().w(function(c){for(;;)switch(c.p=c.n){case 0:if(typeof window!="undefined"){c.n=1;break}return c.a(2,!1);case 1:if(c.p=1,!((n=navigator.clipboard)!==null&&n!==void 0&&n.writeText)){c.n=3;break}return c.n=2,navigator.clipboard.writeText(r);case 2:return c.a(2,!0);case 3:c.n=5;break;case 4:c.p=4,t=c.v,console.warn("[H5ErrorBoundary] Clipboard API copy failed:",t);case 5:return c.p=5,o=document.createElement("textarea"),o.value=r,o.setAttribute("readonly","true"),o.style.position="fixed",o.style.opacity="0",document.body.appendChild(o),o.select(),a=document.execCommand("copy"),document.body.removeChild(o),c.a(2,a);case 6:return c.p=6,m=c.v,console.warn("[H5ErrorBoundary] Fallback copy failed:",m),c.a(2,!1)}},e,null,[[5,6],[1,4]])}));return function(r){return i.apply(this,arguments)}}(),ar=function(e){if(e instanceof Error)return e;if(typeof e=="string")return new Error(e);try{return new Error(JSON.stringify(e))}catch(r){return new Error(String(e))}},ir=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=["[H5 Runtime Error]","Time: ".concat(new Date().toISOString()),r.source?"Source: ".concat(r.source):"","Name: ".concat(e.name),"Message: ".concat(e.message),e.stack?`Stack:
`.concat(e.stack):"",r.componentStack?`Component Stack:
`.concat(r.componentStack):"",typeof navigator!="undefined"?"User Agent: ".concat(navigator.userAgent):""].filter(Boolean);return n.join(`

`)},Y=function(e){B.visible&&Q(b(b({},B),{},{open:e}))},D=function(e){var r=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};if(typeof window!="undefined"){var n=ar(e),o=ir(n,r),a=new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"});Q({error:n,report:o,source:r.source||"runtime",timestamp:a,visible:!0,open:!1}),console.error("[H5ErrorOverlay] Showing error overlay:",n,r)}},or=function(e){var r=e.error||new Error(e.message||"Unknown H5 runtime error");D(r,{source:"window.error"})},sr=function(e){D(e.reason,{source:"window.unhandledrejection"})},ur=function(){typeof window=="undefined"||W||(W=!0,window.addEventListener("error",or),window.addEventListener("unhandledrejection",sr))},lr=function(){var e,r,n=h.useSyncExternalStore(nr,$,$);if(!n.visible)return null;var o=((e=n.error)===null||e===void 0?void 0:e.name)||"Error";return s.jsx(Ne,{children:s.jsxs(l,{className:"pointer-events-none fixed inset-0 z-[2147483646]",children:[s.jsx(l,{className:"pointer-events-auto fixed bottom-5 left-5",children:s.jsx(_,{variant:"outline",size:"icon",className:E("h-11 w-11 rounded-full shadow-md transition-transform"),style:{backgroundColor:"hsl(359, 100%, 97%)",borderColor:"hsl(359, 100%, 94%)",color:U},onClick:function(){return Y(!n.open)},children:s.jsx(he,{size:22,color:U})})}),n.open&&s.jsx(l,{className:"pointer-events-none fixed inset-0 bg-white bg-opacity-15 supports-[backdrop-filter]:backdrop-blur-md",children:s.jsx(l,{className:"absolute inset-0 flex items-center justify-center px-4 py-4",children:s.jsx(l,{className:"w-full max-w-md",style:{width:"min(calc(100vw - 32px), var(--h5-phone-width, 390px))",height:"min(calc(100vh - 32px), 900px)"},children:s.jsx(ke,{className:E("pointer-events-auto h-full rounded-2xl border border-border bg-background text-foreground shadow-2xl"),children:s.jsxs(l,{className:"relative flex h-full flex-col",children:[s.jsxs(Ae,{className:"gap-2 p-4 pb-2",children:[s.jsxs(l,{className:"flex items-start justify-between gap-3",children:[s.jsxs(l,{className:"flex flex-wrap items-center gap-2",children:[s.jsx(k,{variant:"destructive",className:"border-none bg-red-500 px-3 py-1 text-xs font-medium text-white",children:"Runtime Error"}),s.jsx(k,{variant:"outline",className:"px-3 py-1 text-xs",children:n.source})]}),s.jsxs(l,{className:"flex shrink-0 items-center gap-1",children:[s.jsx(_,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return window.location.reload()},children:s.jsx(be,{size:15,color:"inherit"})}),s.jsx(_,{variant:"ghost",size:"icon",className:"h-8 w-8 rounded-full",onClick:function(){return Y(!1)},children:s.jsx(xe,{size:17,color:"inherit"})})]})]}),s.jsxs(l,{className:"flex items-center justify-between gap-3",children:[s.jsx(Oe,{className:"text-left text-lg",children:o}),s.jsxs(_,{variant:"outline",size:"sm",className:"shrink-0 rounded-lg",onClick:function(){var a=d(u().m(function m(){var c;return u().w(function(v){for(;;)switch(v.n){case 0:return v.n=1,tr(n.report);case 1:if(c=v.v,!c){v.n=2;break}return V.success("已复制错误信息",{description:"可发送给 Agent 进行自动修复",position:"top-center"}),v.a(2);case 2:V.warning("复制失败",{description:"请直接选中文本后手动复制。",position:"top-center"});case 3:return v.a(2)}},m)}));function t(){return a.apply(this,arguments)}return t}(),children:[s.jsx(we,{size:15,color:"inherit"}),s.jsx(l,{children:"复制错误"})]})]})]}),s.jsx(Pe,{className:"min-h-0 flex-1 overflow-hidden px-4 pb-4 pt-2",children:s.jsxs(l,{className:"flex h-full min-h-0 flex-col gap-2",children:[s.jsxs(l,{className:"flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border px-3 py-2 text-sm",children:[s.jsxs(l,{className:"flex items-center gap-2",children:[s.jsx(l,{className:"text-muted-foreground",children:"Error"}),s.jsx(l,{className:"font-medium text-foreground",children:((r=n.error)===null||r===void 0?void 0:r.name)||"Error"})]}),s.jsx(l,{className:"h-4 w-px bg-border"}),s.jsxs(l,{className:"flex items-center gap-2",children:[s.jsx(l,{className:"text-muted-foreground",children:"Source"}),s.jsx(l,{className:"font-medium text-foreground",children:n.source})]})]}),s.jsxs(l,{className:"min-h-0 flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-black text-white",children:[s.jsxs(l,{className:"flex items-center justify-between border-b border-white border-opacity-10 px-3 py-3",children:[s.jsx(l,{className:"text-xs font-medium uppercase tracking-wide text-zinc-400",children:"Full Report"}),s.jsx(k,{variant:"outline",className:"border-zinc-700 bg-transparent px-2 py-1 text-xs text-zinc-400",children:n.timestamp})]}),s.jsx(K,{className:"min-h-0 flex-1 w-full",orientation:"both",children:s.jsx(l,{className:"inline-block min-w-full whitespace-pre px-3 py-3 pb-8 font-mono text-xs leading-6 text-zinc-200",children:n.report})})]})]})})]})})})})})]})})},cr=function(i){function e(){var r;ye(this,e);for(var n=arguments.length,o=new Array(n),a=0;a<n;a++)o[a]=arguments[a];return r=_e(this,e,[].concat(o)),r.state={error:null},r}return ve(e,i),ge(e,[{key:"componentDidUpdate",value:function(n){this.state.error&&n.children!==this.props.children&&this.setState({error:null})}},{key:"componentDidCatch",value:function(n,o){D(n,{source:"React Error Boundary",componentStack:o.componentStack||""})}},{key:"render",value:function(){return s.jsxs(s.Fragment,{children:[s.jsx(lr,{}),this.state.error?null:this.props.children]})}}],[{key:"getDerivedStateFromError",value:function(n){return{error:n}}}])}(h.Component),dr=function(e){var r=e.children;return s.jsx(cr,{children:r})},pr=function(e){var r=e.children;return ur(),x.useLaunch(function(){Me(),Ve()}),s.jsx(dr,{children:s.jsx(Ge,{children:r})})},fr=function(e){var r=e.children;return s.jsxs(Ee,{defaultColor:"#000",defaultSize:24,children:[s.jsx(pr,{children:r}),s.jsx(De,{})]})},F=G.__taroAppConfig={router:{mode:"hash"},pages:["pages/index/index","pages/bead-designer/index","pages/material/index","pages/color/index","pages/accessory/index","pages/preview/index","pages/checkout/index","pages/color-theme/index","pages/favorites/index","pages/payment/index","pages/result/index","pages/signin/index","pages/wish/index","pages/couple/index","pages/wrist-size/index","pages/bead-shop/index","pages/rope-charm/index","pages/quiz/index"],window:{backgroundTextStyle:"light",navigationBarBackgroundColor:"#ffffff",navigationBarTitleText:"灵珠手作",navigationBarTextStyle:"black"}};F.routes=[Object.assign({path:"pages/index/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.274d6133.js"),["./index.274d6133.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"灵珠手作"}),Object.assign({path:"pages/bead-designer/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.cbae56a7.js"),["./index.cbae56a7.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"编手串"}),Object.assign({path:"pages/material/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.96b063b0.js"),["./index.96b063b0.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选择材质"}),Object.assign({path:"pages/color/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.55731e96.js"),["./index.55731e96.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选择颜色"}),Object.assign({path:"pages/accessory/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.09d09b34.js"),["./index.09d09b34.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选择配珠"}),Object.assign({path:"pages/preview/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.241b8ab3.js"),["./index.241b8ab3.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"确认订单"}),Object.assign({path:"pages/checkout/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.ed817616.js"),["./index.ed817616.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"结算"}),Object.assign({path:"pages/color-theme/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.0a540fa7.js"),["./index.0a540fa7.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"色系编"}),Object.assign({path:"pages/favorites/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.1ec42c3b.js"),["./index.1ec42c3b.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"我的收藏"}),Object.assign({path:"pages/payment/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.60d2ddf8.js"),["./index.60d2ddf8.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"支付"}),Object.assign({path:"pages/result/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.74f6b392.js"),["./index.74f6b392.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"运势结果"}),Object.assign({path:"pages/signin/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.18cb76c1.js"),["./index.18cb76c1.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"每日签到"}),Object.assign({path:"pages/wish/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.8c08d737.js"),["./index.8c08d737.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"心选编"}),Object.assign({path:"pages/couple/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.06148ace.js"),["./index.06148ace.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"缘分编"}),Object.assign({path:"pages/wrist-size/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.b90d2efe.js"),["./index.b90d2efe.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选手腕"}),Object.assign({path:"pages/bead-shop/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.f91788ee.js"),["./index.f91788ee.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选珠子"}),Object.assign({path:"pages/rope-charm/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.450b086e.js"),["./index.450b086e.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"选择绳子"}),Object.assign({path:"pages/quiz/index",load:function(){var i=d(u().m(function r(n,o){var a;return u().w(function(t){for(;;)switch(t.n){case 0:return t.n=1,p(()=>import("./index.2fc1bd63.js"),["./index.2fc1bd63.js","./vendors.09077050.js","../css/vendors.8886af03.css","./common.ed25a4e1.js"],import.meta.url);case 1:return a=t.v,t.a(2,[a,n,o])}},r)}));function e(r,n){return i.apply(this,arguments)}return e}()},{navigationBarTitleText:"心理测试"})];Object.assign(q,{findDOMNode:N.findDOMNode,render:N.render,unstable_batchedUpdates:N.unstable_batchedUpdates});Te();var mr=je(fr,J,q,F),vr=Ce({window:G});Be(F);Fe(vr,mr,F,J);Se({designWidth:750,deviceRatio:{375:2,640:1.17,750:1,828:.905},baseFontSize:20,unitPrecision:void 0,targetUnit:void 0});
