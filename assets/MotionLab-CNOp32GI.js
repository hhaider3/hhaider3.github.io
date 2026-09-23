import{a as e,i as t,n}from"./index-DsOBEMMZ.js";import{i as r,r as i,t as a}from"./radio-tower-BG-MVvNC.js";import{C as o,S as s,a as c,c as l,d as u,f as d,g as f,i as p,l as m,m as h,n as g,r as _,s as ee,t as v,u as te}from"./TelemetryTile-Dgp9wyVe.js";import{n as y,r as b,t as ne}from"./x-CESzQ5NI.js";import{$ as re,A as ie,B as x,C as S,D as C,E as w,F as ae,G as oe,H as T,I as se,J as E,K as ce,L as D,M as le,N as ue,O,P as k,R as A,S as de,T as fe,U as pe,V as me,W as he,X as ge,Y as _e,Z as ve,_ as ye,_t as j,a as be,b as xe,c as Se,ct as Ce,d as we,dt as Te,et as Ee,f as De,ft as Oe,g as ke,gt as Ae,h as je,ht as Me,i as Ne,it as Pe,j as Fe,k as Ie,l as Le,lt as Re,m as M,mt as N,n as ze,nt as P,o as Be,p as Ve,pt as F,q as He,r as Ue,rt as We,s as Ge,t as Ke,tt as qe,ut as Je,v as Ye,w as Xe,x as Ze,y as Qe,z as $e}from"./three.module-uLymheyg.js";var et=r(`link`,[[`path`,{d:`M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71`,key:`1cjeqo`}],[`path`,{d:`M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71`,key:`19qd67`}]]),tt=r(`refresh-cw`,[[`path`,{d:`M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8`,key:`v9h5vc`}],[`path`,{d:`M21 3v5h-5`,key:`1q7to0`}],[`path`,{d:`M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16`,key:`3uifl3`}],[`path`,{d:`M8 16H3v5`,key:`1cv678`}]]),nt=r(`wifi`,[[`path`,{d:`M12 20h.01`,key:`zekei9`}],[`path`,{d:`M2 8.82a15 15 0 0 1 20 0`,key:`dnpr2z`}],[`path`,{d:`M5 12.859a10 10 0 0 1 14 0`,key:`1x1e6c`}],[`path`,{d:`M8.5 16.429a5 5 0 0 1 7 0`,key:`1bycff`}]]),I=e(t(),1),rt=function(e,t){let n=e,r=it[t],i=null,a=0,o=null,s=[],c={},l=function(e,t){a=n*4+17,i=function(e){let t=Array(e);for(let n=0;n<e;n+=1){t[n]=Array(e);for(let r=0;r<e;r+=1)t[n][r]=null}return t}(a),u(0,0),u(a-7,0),u(0,a-7),p(),f(),h(e,t),n>=7&&m(e),o??=ee(n,r,s),g(o,t)},u=function(e,t){for(let n=-1;n<=7;n+=1)if(!(e+n<=-1||a<=e+n))for(let r=-1;r<=7;r+=1)t+r<=-1||a<=t+r||(0<=n&&n<=6&&(r==0||r==6)||0<=r&&r<=6&&(n==0||n==6)||2<=n&&n<=4&&2<=r&&r<=4?i[e+n][t+r]=!0:i[e+n][t+r]=!1)},d=function(){let e=0,t=0;for(let n=0;n<8;n+=1){l(!0,n);let r=R.getLostPoint(c);(n==0||e>r)&&(e=r,t=n)}return t},f=function(){for(let e=8;e<a-8;e+=1)i[e][6]??(i[e][6]=e%2==0);for(let e=8;e<a-8;e+=1)i[6][e]??(i[6][e]=e%2==0)},p=function(){let e=R.getPatternPosition(n);for(let t=0;t<e.length;t+=1)for(let n=0;n<e.length;n+=1){let r=e[t],a=e[n];if(i[r][a]==null)for(let e=-2;e<=2;e+=1)for(let t=-2;t<=2;t+=1)e==-2||e==2||t==-2||t==2||e==0&&t==0?i[r+e][a+t]=!0:i[r+e][a+t]=!1}},m=function(e){let t=R.getBCHTypeNumber(n);for(let n=0;n<18;n+=1){let r=!e&&(t>>n&1)==1;i[Math.floor(n/3)][n%3+a-8-3]=r}for(let n=0;n<18;n+=1){let r=!e&&(t>>n&1)==1;i[n%3+a-8-3][Math.floor(n/3)]=r}},h=function(e,t){let n=r<<3|t,o=R.getBCHTypeInfo(n);for(let t=0;t<15;t+=1){let n=!e&&(o>>t&1)==1;t<6?i[t][8]=n:t<8?i[t+1][8]=n:i[a-15+t][8]=n}for(let t=0;t<15;t+=1){let n=!e&&(o>>t&1)==1;t<8?i[8][a-t-1]=n:t<9?i[8][15-t-1+1]=n:i[8][15-t-1]=n}i[a-8][8]=!e},g=function(e,t){let n=-1,r=a-1,o=7,s=0,c=R.getMaskFunction(t);for(let t=a-1;t>0;t-=2)for(t==6&&--t;;){for(let n=0;n<2;n+=1)if(i[r][t-n]==null){let a=!1;s<e.length&&(a=(e[s]>>>o&1)==1),c(r,t-n)&&(a=!a),i[r][t-n]=a,--o,o==-1&&(s+=1,o=7)}if(r+=n,r<0||a<=r){r-=n,n=-n;break}}},_=function(e,t){let n=0,r=0,i=0,a=Array(t.length),o=Array(t.length);for(let s=0;s<t.length;s+=1){let c=t[s].dataCount,l=t[s].totalCount-c;r=Math.max(r,c),i=Math.max(i,l),a[s]=Array(c);for(let t=0;t<a[s].length;t+=1)a[s][t]=255&e.getBuffer()[t+n];n+=c;let u=R.getErrorCorrectPolynomial(l),d=ot(a[s],u.getLength()-1).mod(u);o[s]=Array(u.getLength()-1);for(let e=0;e<o[s].length;e+=1){let t=e+d.getLength()-o[s].length;o[s][e]=t>=0?d.getAt(t):0}}let s=0;for(let e=0;e<t.length;e+=1)s+=t[e].totalCount;let c=Array(s),l=0;for(let e=0;e<r;e+=1)for(let n=0;n<t.length;n+=1)e<a[n].length&&(c[l]=a[n][e],l+=1);for(let e=0;e<i;e+=1)for(let n=0;n<t.length;n+=1)e<o[n].length&&(c[l]=o[n][e],l+=1);return c},ee=function(e,t,n){let r=st.getRSBlocks(e,t),i=ct();for(let t=0;t<n.length;t+=1){let r=n[t];i.put(r.getMode(),4),i.put(r.getLength(),R.getLengthInBits(r.getMode(),e)),r.write(i)}let a=0;for(let e=0;e<r.length;e+=1)a+=r[e].dataCount;if(i.getLengthInBits()>a*8)throw`code length overflow. (`+i.getLengthInBits()+`>`+a*8+`)`;for(i.getLengthInBits()+4<=a*8&&i.put(0,4);i.getLengthInBits()%8!=0;)i.putBit(!1);for(;!(i.getLengthInBits()>=a*8||(i.put(236,8),i.getLengthInBits()>=a*8));)i.put(17,8);return _(i,r)};c.addData=function(e,t){t||=`Byte`;let n=null;switch(t){case`Numeric`:n=lt(e);break;case`Alphanumeric`:n=ut(e);break;case`Byte`:n=dt(e);break;case`Kanji`:n=ft(e);break;default:throw`mode:`+t}s.push(n),o=null},c.isDark=function(e,t){if(e<0||a<=e||t<0||a<=t)throw e+`,`+t;return i[e][t]},c.getModuleCount=function(){return a},c.make=function(){if(n<1){let e=1;for(;e<40;e++){let t=st.getRSBlocks(e,r),n=ct();for(let t=0;t<s.length;t++){let r=s[t];n.put(r.getMode(),4),n.put(r.getLength(),R.getLengthInBits(r.getMode(),e)),r.write(n)}let i=0;for(let e=0;e<t.length;e++)i+=t[e].dataCount;if(n.getLengthInBits()<=i*8)break}n=e}l(!1,d())},c.createTableTag=function(e,t){e||=2,t=t===void 0?e*4:t;let n=``;n+=`<table style="`,n+=` border-width: 0px; border-style: none;`,n+=` border-collapse: collapse;`,n+=` padding: 0px; margin: `+t+`px;`,n+=`">`,n+=`<tbody>`;for(let t=0;t<c.getModuleCount();t+=1){n+=`<tr>`;for(let r=0;r<c.getModuleCount();r+=1)n+=`<td style="`,n+=` border-width: 0px; border-style: none;`,n+=` border-collapse: collapse;`,n+=` padding: 0px; margin: 0px;`,n+=` width: `+e+`px;`,n+=` height: `+e+`px;`,n+=` background-color: `,n+=c.isDark(t,r)?`#000000`:`#ffffff`,n+=`;`,n+=`"/>`;n+=`</tr>`}return n+=`</tbody>`,n+=`</table>`,n},c.createSvgTag=function(e,t,n,r){let i={};typeof arguments[0]==`object`&&(i=arguments[0],e=i.cellSize,t=i.margin,n=i.alt,r=i.title),e||=2,t=t===void 0?e*4:t,n=typeof n==`string`?{text:n}:n||{},n.text=n.text||null,n.id=n.text?n.id||`qrcode-description`:null,r=typeof r==`string`?{text:r}:r||{},r.text=r.text||null,r.id=r.text?r.id||`qrcode-title`:null;let a=c.getModuleCount()*e+t*2,o,s,l,u,d=``,f;for(f=`l`+e+`,0 0,`+e+` -`+e+`,0 0,-`+e+`z `,d+=`<svg version="1.1" xmlns="http://www.w3.org/2000/svg"`,d+=i.scalable?``:` width="`+a+`px" height="`+a+`px"`,d+=` viewBox="0 0 `+a+` `+a+`" `,d+=` preserveAspectRatio="xMinYMin meet"`,d+=r.text||n.text?` role="img" aria-labelledby="`+v([r.id,n.id].join(` `).trim())+`"`:``,d+=`>`,d+=r.text?`<title id="`+v(r.id)+`">`+v(r.text)+`</title>`:``,d+=n.text?`<description id="`+v(n.id)+`">`+v(n.text)+`</description>`:``,d+=`<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>`,d+=`<path d="`,l=0;l<c.getModuleCount();l+=1)for(u=l*e+t,o=0;o<c.getModuleCount();o+=1)c.isDark(l,o)&&(s=o*e+t,d+=`M`+s+`,`+u+f);return d+=`" stroke="transparent" fill="black"/>`,d+=`</svg>`,d},c.createDataURL=function(e,t){e||=2,t=t===void 0?e*4:t;let n=c.getModuleCount()*e+t*2,r=t,i=n-t;return _t(n,n,function(t,n){if(r<=t&&t<i&&r<=n&&n<i){let i=Math.floor((t-r)/e),a=Math.floor((n-r)/e);return+!c.isDark(a,i)}else return 1})},c.createImgTag=function(e,t,n){e||=2,t=t===void 0?e*4:t;let r=c.getModuleCount()*e+t*2,i=``;return i+=`<img`,i+=` src="`,i+=c.createDataURL(e,t),i+=`"`,i+=` width="`,i+=r,i+=`"`,i+=` height="`,i+=r,i+=`"`,n&&(i+=` alt="`,i+=v(n),i+=`"`),i+=`/>`,i};let v=function(e){let t=``;for(let n=0;n<e.length;n+=1){let r=e.charAt(n);switch(r){case`<`:t+=`&lt;`;break;case`>`:t+=`&gt;`;break;case`&`:t+=`&amp;`;break;case`"`:t+=`&quot;`;break;default:t+=r;break}}return t},te=function(e){e=e===void 0?2:e;let t=c.getModuleCount()*1+e*2,n=e,r=t-e,i,a,o,s,l,u={"██":`█`,"█ ":`▀`," █":`▄`,"  ":` `},d={"██":`▀`,"█ ":`▀`," █":` `,"  ":` `},f=``;for(i=0;i<t;i+=2){for(o=Math.floor((i-n)/1),s=Math.floor((i+1-n)/1),a=0;a<t;a+=1)l=`█`,n<=a&&a<r&&n<=i&&i<r&&c.isDark(o,Math.floor((a-n)/1))&&(l=` `),n<=a&&a<r&&n<=i+1&&i+1<r&&c.isDark(s,Math.floor((a-n)/1))?l+=` `:l+=`█`,f+=e<1&&i+1>=r?d[l]:u[l];f+=`
`}return t%2&&e>0?f.substring(0,f.length-t-1)+Array(t+1).join(`▀`):f.substring(0,f.length-1)};return c.createASCII=function(e,t){if(e||=1,e<2)return te(t);--e,t=t===void 0?e*2:t;let n=c.getModuleCount()*e+t*2,r=t,i=n-t,a,o,s,l,u=Array(e+1).join(`██`),d=Array(e+1).join(`  `),f=``,p=``;for(a=0;a<n;a+=1){for(s=Math.floor((a-r)/e),p=``,o=0;o<n;o+=1)l=1,r<=o&&o<i&&r<=a&&a<i&&c.isDark(s,Math.floor((o-r)/e))&&(l=0),p+=l?u:d;for(s=0;s<e;s+=1)f+=p+`
`}return f.substring(0,f.length-1)},c.renderTo2dContext=function(e,t){t||=2;let n=c.getModuleCount();for(let r=0;r<n;r++)for(let i=0;i<n;i++)e.fillStyle=c.isDark(r,i)?`black`:`white`,e.fillRect(i*t,r*t,t,t)},c};rt.stringToBytes=function(e){let t=[];for(let n=0;n<e.length;n+=1){let r=e.charCodeAt(n);t.push(r&255)}return t},rt.createStringToBytes=function(e,t){let n=function(){let n=ht(e),r=function(){let e=n.read();if(e==-1)throw`eof`;return e},i=0,a={};for(;;){let e=n.read();if(e==-1)break;let t=r(),o=r(),s=r(),c=String.fromCharCode(e<<8|t);a[c]=o<<8|s,i+=1}if(i!=t)throw i+` != `+t;return a}();return function(e){let t=[];for(let r=0;r<e.length;r+=1){let i=e.charCodeAt(r);if(i<128)t.push(i);else{let i=n[e.charAt(r)];typeof i==`number`?(i&255)==i?t.push(i):(t.push(i>>>8),t.push(i&255)):t.push(63)}}return t}};var L={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},it={L:1,M:0,Q:3,H:2},at={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},R=function(){let e=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],t=1335,n=7973,r={},i=function(e){let t=0;for(;e!=0;)t+=1,e>>>=1;return t};return r.getBCHTypeInfo=function(e){let n=e<<10;for(;i(n)-i(t)>=0;)n^=t<<i(n)-i(t);return(e<<10|n)^21522},r.getBCHTypeNumber=function(e){let t=e<<12;for(;i(t)-i(n)>=0;)t^=n<<i(t)-i(n);return e<<12|t},r.getPatternPosition=function(t){return e[t-1]},r.getMaskFunction=function(e){switch(e){case at.PATTERN000:return function(e,t){return(e+t)%2==0};case at.PATTERN001:return function(e,t){return e%2==0};case at.PATTERN010:return function(e,t){return t%3==0};case at.PATTERN011:return function(e,t){return(e+t)%3==0};case at.PATTERN100:return function(e,t){return(Math.floor(e/2)+Math.floor(t/3))%2==0};case at.PATTERN101:return function(e,t){return e*t%2+e*t%3==0};case at.PATTERN110:return function(e,t){return(e*t%2+e*t%3)%2==0};case at.PATTERN111:return function(e,t){return(e*t%3+(e+t)%2)%2==0};default:throw`bad maskPattern:`+e}},r.getErrorCorrectPolynomial=function(e){let t=ot([1],0);for(let n=0;n<e;n+=1)t=t.multiply(ot([1,z.gexp(n)],0));return t},r.getLengthInBits=function(e,t){if(1<=t&&t<10)switch(e){case L.MODE_NUMBER:return 10;case L.MODE_ALPHA_NUM:return 9;case L.MODE_8BIT_BYTE:return 8;case L.MODE_KANJI:return 8;default:throw`mode:`+e}else if(t<27)switch(e){case L.MODE_NUMBER:return 12;case L.MODE_ALPHA_NUM:return 11;case L.MODE_8BIT_BYTE:return 16;case L.MODE_KANJI:return 10;default:throw`mode:`+e}else if(t<41)switch(e){case L.MODE_NUMBER:return 14;case L.MODE_ALPHA_NUM:return 13;case L.MODE_8BIT_BYTE:return 16;case L.MODE_KANJI:return 12;default:throw`mode:`+e}else throw`type:`+t},r.getLostPoint=function(e){let t=e.getModuleCount(),n=0;for(let r=0;r<t;r+=1)for(let i=0;i<t;i+=1){let a=0,o=e.isDark(r,i);for(let n=-1;n<=1;n+=1)if(!(r+n<0||t<=r+n))for(let s=-1;s<=1;s+=1)i+s<0||t<=i+s||n==0&&s==0||o==e.isDark(r+n,i+s)&&(a+=1);a>5&&(n+=3+a-5)}for(let r=0;r<t-1;r+=1)for(let i=0;i<t-1;i+=1){let t=0;e.isDark(r,i)&&(t+=1),e.isDark(r+1,i)&&(t+=1),e.isDark(r,i+1)&&(t+=1),e.isDark(r+1,i+1)&&(t+=1),(t==0||t==4)&&(n+=3)}for(let r=0;r<t;r+=1)for(let i=0;i<t-6;i+=1)e.isDark(r,i)&&!e.isDark(r,i+1)&&e.isDark(r,i+2)&&e.isDark(r,i+3)&&e.isDark(r,i+4)&&!e.isDark(r,i+5)&&e.isDark(r,i+6)&&(n+=40);for(let r=0;r<t;r+=1)for(let i=0;i<t-6;i+=1)e.isDark(i,r)&&!e.isDark(i+1,r)&&e.isDark(i+2,r)&&e.isDark(i+3,r)&&e.isDark(i+4,r)&&!e.isDark(i+5,r)&&e.isDark(i+6,r)&&(n+=40);let r=0;for(let n=0;n<t;n+=1)for(let i=0;i<t;i+=1)e.isDark(i,n)&&(r+=1);let i=Math.abs(100*r/t/t-50)/5;return n+=i*10,n},r}(),z=function(){let e=Array(256),t=Array(256);for(let t=0;t<8;t+=1)e[t]=1<<t;for(let t=8;t<256;t+=1)e[t]=e[t-4]^e[t-5]^e[t-6]^e[t-8];for(let n=0;n<255;n+=1)t[e[n]]=n;let n={};return n.glog=function(e){if(e<1)throw`glog(`+e+`)`;return t[e]},n.gexp=function(t){for(;t<0;)t+=255;for(;t>=256;)t-=255;return e[t]},n}(),ot=function(e,t){if(e.length===void 0)throw e.length+`/`+t;let n=function(){let n=0;for(;n<e.length&&e[n]==0;)n+=1;let r=Array(e.length-n+t);for(let t=0;t<e.length-n;t+=1)r[t]=e[t+n];return r}(),r={};return r.getAt=function(e){return n[e]},r.getLength=function(){return n.length},r.multiply=function(e){let t=Array(r.getLength()+e.getLength()-1);for(let n=0;n<r.getLength();n+=1)for(let i=0;i<e.getLength();i+=1)t[n+i]^=z.gexp(z.glog(r.getAt(n))+z.glog(e.getAt(i)));return ot(t,0)},r.mod=function(e){if(r.getLength()-e.getLength()<0)return r;let t=z.glog(r.getAt(0))-z.glog(e.getAt(0)),n=Array(r.getLength());for(let e=0;e<r.getLength();e+=1)n[e]=r.getAt(e);for(let r=0;r<e.getLength();r+=1)n[r]^=z.gexp(z.glog(e.getAt(r))+t);return ot(n,0).mod(e)},r},st=function(){let e=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],t=function(e,t){let n={};return n.totalCount=e,n.dataCount=t,n},n={},r=function(t,n){switch(n){case it.L:return e[(t-1)*4+0];case it.M:return e[(t-1)*4+1];case it.Q:return e[(t-1)*4+2];case it.H:return e[(t-1)*4+3];default:return}};return n.getRSBlocks=function(e,n){let i=r(e,n);if(i===void 0)throw`bad rs block @ typeNumber:`+e+`/errorCorrectionLevel:`+n;let a=i.length/3,o=[];for(let e=0;e<a;e+=1){let n=i[e*3+0],r=i[e*3+1],a=i[e*3+2];for(let e=0;e<n;e+=1)o.push(t(r,a))}return o},n}(),ct=function(){let e=[],t=0,n={};return n.getBuffer=function(){return e},n.getAt=function(t){return(e[Math.floor(t/8)]>>>7-t%8&1)==1},n.put=function(e,t){for(let r=0;r<t;r+=1)n.putBit((e>>>t-r-1&1)==1)},n.getLengthInBits=function(){return t},n.putBit=function(n){let r=Math.floor(t/8);e.length<=r&&e.push(0),n&&(e[r]|=128>>>t%8),t+=1},n},lt=function(e){let t=L.MODE_NUMBER,n=e,r={};r.getMode=function(){return t},r.getLength=function(e){return n.length},r.write=function(e){let t=n,r=0;for(;r+2<t.length;)e.put(i(t.substring(r,r+3)),10),r+=3;r<t.length&&(t.length-r==1?e.put(i(t.substring(r,r+1)),4):t.length-r==2&&e.put(i(t.substring(r,r+2)),7))};let i=function(e){let t=0;for(let n=0;n<e.length;n+=1)t=t*10+a(e.charAt(n));return t},a=function(e){if(`0`<=e&&e<=`9`)return e.charCodeAt(0)-48;throw`illegal char :`+e};return r},ut=function(e){let t=L.MODE_ALPHA_NUM,n=e,r={};r.getMode=function(){return t},r.getLength=function(e){return n.length},r.write=function(e){let t=n,r=0;for(;r+1<t.length;)e.put(i(t.charAt(r))*45+i(t.charAt(r+1)),11),r+=2;r<t.length&&e.put(i(t.charAt(r)),6)};let i=function(e){if(`0`<=e&&e<=`9`)return e.charCodeAt(0)-48;if(`A`<=e&&e<=`Z`)return e.charCodeAt(0)-65+10;switch(e){case` `:return 36;case`$`:return 37;case`%`:return 38;case`*`:return 39;case`+`:return 40;case`-`:return 41;case`.`:return 42;case`/`:return 43;case`:`:return 44;default:throw`illegal char :`+e}};return r},dt=function(e){let t=L.MODE_8BIT_BYTE,n=rt.stringToBytes(e),r={};return r.getMode=function(){return t},r.getLength=function(e){return n.length},r.write=function(e){for(let t=0;t<n.length;t+=1)e.put(n[t],8)},r},ft=function(e){let t=L.MODE_KANJI,n=rt.stringToBytes;(function(e,t){let r=n(e);if(r.length!=2||(r[0]<<8|r[1])!=t)throw`sjis not supported.`})(`友`,38726);let r=n(e),i={};return i.getMode=function(){return t},i.getLength=function(e){return~~(r.length/2)},i.write=function(e){let t=r,n=0;for(;n+1<t.length;){let r=(255&t[n])<<8|255&t[n+1];if(33088<=r&&r<=40956)r-=33088;else if(57408<=r&&r<=60351)r-=49472;else throw`illegal char at `+(n+1)+`/`+r;r=(r>>>8&255)*192+(r&255),e.put(r,13),n+=2}if(n<t.length)throw`illegal char at `+(n+1)},i},pt=function(){let e=[],t={};return t.writeByte=function(t){e.push(t&255)},t.writeShort=function(e){t.writeByte(e),t.writeByte(e>>>8)},t.writeBytes=function(e,n,r){n||=0,r||=e.length;for(let i=0;i<r;i+=1)t.writeByte(e[i+n])},t.writeString=function(e){for(let n=0;n<e.length;n+=1)t.writeByte(e.charCodeAt(n))},t.toByteArray=function(){return e},t.toString=function(){let t=``;t+=`[`;for(let n=0;n<e.length;n+=1)n>0&&(t+=`,`),t+=e[n];return t+=`]`,t},t},mt=function(){let e=0,t=0,n=0,r=``,i={},a=function(e){r+=String.fromCharCode(o(e&63))},o=function(e){if(e<0)throw`n:`+e;if(e<26)return 65+e;if(e<52)return 97+(e-26);if(e<62)return 48+(e-52);if(e==62)return 43;if(e==63)return 47;throw`n:`+e};return i.writeByte=function(r){for(e=e<<8|r&255,t+=8,n+=1;t>=6;)a(e>>>t-6),t-=6},i.flush=function(){if(t>0&&(a(e<<6-t),e=0,t=0),n%3!=0){let e=3-n%3;for(let t=0;t<e;t+=1)r+=`=`}},i.toString=function(){return r},i},ht=function(e){let t=e,n=0,r=0,i=0,a={};a.read=function(){for(;i<8;){if(n>=t.length){if(i==0)return-1;throw`unexpected end of file./`+i}let e=t.charAt(n);if(n+=1,e==`=`)return i=0,-1;e.match(/^\s$/)||(r=r<<6|o(e.charCodeAt(0)),i+=6)}let e=r>>>i-8&255;return i-=8,e};let o=function(e){if(65<=e&&e<=90)return e-65;if(97<=e&&e<=122)return e-97+26;if(48<=e&&e<=57)return e-48+52;if(e==43)return 62;if(e==47)return 63;throw`c:`+e};return a},gt=function(e,t){let n=e,r=t,i=Array(e*t),a={};a.setPixel=function(e,t,r){i[t*n+e]=r},a.write=function(e){e.writeString(`GIF87a`),e.writeShort(n),e.writeShort(r),e.writeByte(128),e.writeByte(0),e.writeByte(0),e.writeByte(0),e.writeByte(0),e.writeByte(0),e.writeByte(255),e.writeByte(255),e.writeByte(255),e.writeString(`,`),e.writeShort(0),e.writeShort(0),e.writeShort(n),e.writeShort(r),e.writeByte(0);let t=s(2);e.writeByte(2);let i=0;for(;t.length-i>255;)e.writeByte(255),e.writeBytes(t,i,255),i+=255;e.writeByte(t.length-i),e.writeBytes(t,i,t.length-i),e.writeByte(0),e.writeString(`;`)};let o=function(e){let t=e,n=0,r=0,i={};return i.write=function(e,i){if(e>>>i)throw`length over`;for(;n+i>=8;)t.writeByte(255&(e<<n|r)),i-=8-n,e>>>=8-n,r=0,n=0;r=e<<n|r,n+=i},i.flush=function(){n>0&&t.writeByte(r)},i},s=function(e){let t=1<<e,n=(1<<e)+1,r=e+1,a=c();for(let e=0;e<t;e+=1)a.add(String.fromCharCode(e));a.add(String.fromCharCode(t)),a.add(String.fromCharCode(n));let s=pt(),l=o(s);l.write(t,r);let u=0,d=String.fromCharCode(i[u]);for(u+=1;u<i.length;){let e=String.fromCharCode(i[u]);u+=1,a.contains(d+e)?d+=e:(l.write(a.indexOf(d),r),a.size()<4095&&(a.size()==1<<r&&(r+=1),a.add(d+e)),d=e)}return l.write(a.indexOf(d),r),l.write(n,r),l.flush(),s.toByteArray()},c=function(){let e={},t=0,n={};return n.add=function(r){if(n.contains(r))throw`dup key:`+r;e[r]=t,t+=1},n.size=function(){return t},n.indexOf=function(t){return e[t]},n.contains=function(t){return e[t]!==void 0},n};return a},_t=function(e,t,n){let r=gt(e,t);for(let i=0;i<t;i+=1)for(let t=0;t<e;t+=1)r.setPixel(t,i,n(t,i));let i=pt();r.write(i);let a=mt(),o=i.toByteArray();for(let e=0;e<o.length;e+=1)a.writeByte(o[e]);return a.flush(),`data:image/gif;base64,`+a};rt.stringToBytes;var vt=(e,t=4)=>{let n=rt(0,`M`);n.addData(e),n.make();let r=n.getModuleCount(),i=Array.from({length:r},(e,t)=>Array.from({length:r},(e,r)=>n.isDark(t,r))),a=r+t*2,o=[];return i.forEach((e,n)=>{e.forEach((e,r)=>{e&&o.push(`M${r+t} ${n+t}h1v1h-1z`)})}),{path:o.join(``),size:a,modules:i}},yt=class extends qe{constructor(){super(),this.name=`RoomEnvironment`,this.position.y=-3.5;let e=new Ge;e.deleteAttribute(`uv`);let t=new me({side:1}),n=new me,r=new E(16777215,900,28,2);r.position.set(.418,16.199,.3),this.add(r);let i=new D(e,t);i.position.set(-.757,13.219,.717),i.scale.set(31.713,28.305,28.591),this.add(i);let a=new C(e,n,6),o=new T;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let s=new D(e,B(50));s.position.set(-16.116,14.37,8.208),s.scale.set(.1,2.428,2.739),this.add(s);let c=new D(e,B(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let l=new D(e,B(17));l.position.set(14.904,12.198,-1.832),l.scale.set(.15,4.265,6.331),this.add(l);let u=new D(e,B(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new D(e,B(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new D(e,B(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function B(e){return new $e({color:0,emissive:16777215,emissiveIntensity:e})}var bt=new N;function V(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;bt.copy(t),bt[r]=0,bt.normalize();let l=.5*o/(o+s),u=1-bt.angleTo(e)/c;return Math.sign(bt[n])===1?u*l:s/(o+s)+l+l*(1-u)}var xt=class e extends Ge{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new N,c=new N,l=new N(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new N,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=V(m,c,`z`,`y`,i,n),f[a+1]=1-V(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-V(m,c,`z`,`y`,i,n),f[a+1]=1-V(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-V(m,c,`x`,`z`,i,e),f[a+1]=V(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-V(m,c,`x`,`z`,i,e),f[a+1]=1-V(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-V(m,c,`x`,`y`,i,e),f[a+1]=1-V(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=V(m,c,`x`,`y`,i,e),f[a+1]=1-V(m,c,`y`,`x`,i,t);break}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};Ue.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new F(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}},ze.line={uniforms:Oe.merge([Ue.common,Ue.fog,Ue.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var St=class extends P{constructor(e){super({type:`LineMaterial`,uniforms:Oe.clone(ze.line.uniforms),vertexShader:ze.line.vertexShader,fragmentShader:ze.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return`WORLD_UNITS`in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS=``:delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return`USE_DASH`in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH=``:delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return`USE_ALPHA_TO_COVERAGE`in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE=``:delete this.defines.USE_ALPHA_TO_COVERAGE)}},Ct=new Be,wt=new N,Tt=class extends fe{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type=`LineSegmentsGeometry`,this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute(`position`,new Ze([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute(`uv`,new Ze([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceStart`,new O(n,3,0)),this.setAttribute(`instanceEnd`,new O(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new w(t,6,1);return this.setAttribute(`instanceColorStart`,new O(n,3,0)),this.setAttribute(`instanceColorEnd`,new O(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new j(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Be);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Ct.setFromBufferAttribute(t),this.boundingBox.union(Ct))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new We),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)wt.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(wt)),wt.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(wt));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error(`THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.`,this)}}toJSON(){}},Et=new Me,Dt=new N,Ot=new N,H=new Me,U=new Me,W=new Me,G=new N,K=new se,q=new ie,kt=new N,J=new Be,At=new We,Y=new Me,X,Z;function jt(e,t,n){return Y.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),Y.multiplyScalar(1/Y.w),Y.x=Z/n.width,Y.y=Z/n.height,Y.applyMatrix4(e.projectionMatrixInverse),Y.multiplyScalar(1/Y.w),Math.abs(Math.max(Y.x,Y.y))}function Mt(e,t){let n=e.matrixWorld,r=e.geometry,i=r.attributes.instanceStart,a=r.attributes.instanceEnd,o=Math.min(r.instanceCount,i.count);for(let r=0,s=o;r<s;r++){q.start.fromBufferAttribute(i,r),q.end.fromBufferAttribute(a,r),q.applyMatrix4(n);let o=new N,s=new N;X.distanceSqToSegment(q.start,q.end,s,o),s.distanceTo(o)<Z*.5&&t.push({point:s,pointOnLine:o,distance:X.origin.distanceTo(s),object:e,face:null,faceIndex:r,uv:null,uv1:null})}}function Nt(e,t,n){let r=t.projectionMatrix,i=e.material.resolution,a=e.matrixWorld,o=e.geometry,s=o.attributes.instanceStart,c=o.attributes.instanceEnd,l=Math.min(o.instanceCount,s.count),u=-t.near;X.at(1,W),W.w=1,W.applyMatrix4(t.matrixWorldInverse),W.applyMatrix4(r),W.multiplyScalar(1/W.w),W.x*=i.x/2,W.y*=i.y/2,W.z=0,G.copy(W),K.multiplyMatrices(t.matrixWorldInverse,a);for(let t=0,o=l;t<o;t++){if(H.fromBufferAttribute(s,t),U.fromBufferAttribute(c,t),H.w=1,U.w=1,H.applyMatrix4(K),U.applyMatrix4(K),H.z>u&&U.z>u)continue;if(H.z>u){let e=H.z-U.z,t=(H.z-u)/e;H.lerp(U,t)}else if(U.z>u){let e=U.z-H.z,t=(U.z-u)/e;U.lerp(H,t)}H.applyMatrix4(r),U.applyMatrix4(r),H.multiplyScalar(1/H.w),U.multiplyScalar(1/U.w),H.x*=i.x/2,H.y*=i.y/2,U.x*=i.x/2,U.y*=i.y/2,q.start.copy(H),q.start.z=0,q.end.copy(U),q.end.z=0;let o=q.closestPointToPointParameter(G,!0);q.at(o,kt);let l=k.lerp(H.z,U.z,o),d=l>=-1&&l<=1,f=G.distanceTo(kt)<Z*.5;if(d&&f){q.start.fromBufferAttribute(s,t),q.end.fromBufferAttribute(c,t),q.start.applyMatrix4(a),q.end.applyMatrix4(a);let r=new N,i=new N;X.distanceSqToSegment(q.start,q.end,i,r),n.push({point:i,pointOnLine:r,distance:X.origin.distanceTo(i),object:e,face:null,faceIndex:t,uv:null,uv1:null})}}}var Pt=class extends D{constructor(e=new Tt,t=new St({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type=`LineSegments2`}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)Dt.fromBufferAttribute(t,e),Ot.fromBufferAttribute(n,e),r[i]=i===0?0:r[i-1],r[i+1]=r[i]+Dt.distanceTo(Ot);let i=new w(r,2,1);return e.setAttribute(`instanceDistanceStart`,new O(i,1,0)),e.setAttribute(`instanceDistanceEnd`,new O(i,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;r===null&&!n&&console.error(`LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.`);let i=e.params.Line2===void 0?0:e.params.Line2.threshold||0;X=e.ray;let a=this.matrixWorld,o=this.geometry,s=this.material;Z=s.linewidth+i,o.boundingSphere===null&&o.computeBoundingSphere(),At.copy(o.boundingSphere).applyMatrix4(a);let c;if(c=n?Z*.5:jt(r,Math.max(r.near,At.distanceToPoint(X.origin)),s.resolution),At.radius+=c,X.intersectsSphere(At)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),J.copy(o.boundingBox).applyMatrix4(a);let l;l=n?Z*.5:jt(r,Math.max(r.near,J.distanceToPoint(X.origin)),s.resolution),J.expandByScalar(l),X.intersectsBox(J)!==!1&&(n?Mt(this,t):Nt(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Et),this.material.uniforms.resolution.value.set(Et.z,Et.w))}},Ft={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},It=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Lt=new he(-1,1,1,-1,0,1),Rt=new class extends Le{constructor(){super(),this.setAttribute(`position`,new Ze([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new Ze([0,2,0,0,2,0],2))}},zt=class{constructor(e){this._mesh=new D(Rt,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Lt)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Bt=class extends It{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof P?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Oe.clone(e.uniforms),this.material=new P({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new zt(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Vt=class extends It{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Ht=class extends It{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},Ut=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new F);this._width=n.width,this._height=n.height,t=new Ae(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Xe}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Bt(Ft),this.copyPass.material.blending=0,this.timer=new Ce}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Vt!==void 0&&(r instanceof Vt?n=!0:r instanceof Ht&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new F);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},Wt=class extends It{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new M}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},Gt={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new M(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},Kt=class e extends It{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new F(256,256):new F(e.x,e.y),this.clearColor=new M(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ae(i,a,{type:Xe}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Ae(i,a,{type:Xe});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Ae(i,a,{type:Xe});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=Gt;this.highPassUniforms=Oe.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new P({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new F(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1),new N(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Oe.clone(Ft.uniforms),this.blendMaterial=new P({uniforms:this.copyUniforms,vertexShader:Ft.vertexShader,fragmentShader:Ft.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new M,this._oldClearAlpha=1,this._basic=new A,this._fsQuad=new zt(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new F(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);return new P({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new F(.5,.5)},direction:{value:new F(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new P({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Kt.BlurDirectionX=new F(1,0),Kt.BlurDirectionY=new F(0,1);var Q=n(),qt=1800,Jt=18,Yt=220,Xt=k.degToRad(.75),Zt=k.degToRad(.12),Qt=9,$t=30,en=.18,tn=7,nn=18,rn=(e,t)=>1-Math.exp(-e*t),an=(e,t)=>{if(!Number.isFinite(e))return 0;let n=Math.abs(e);return n<=t?0:Math.sign(e)*(n-t)},on=new N(0,-.92,0),sn=3.2,cn=900,ln=1450,un=680,dn=9e4,fn=1700,pn=2,mn=7,hn=4.2,gn=.14,_n=2.85,vn=.47,yn=.62,bn=-1.36,xn=2.05,Sn=[{id:`right`,color:16723285,hit:new N(1.92,-.38,.12)},{id:`top-right`,color:3113215,hit:new N(1.26,.82,.12)},{id:`top`,color:11032055,hit:new N(0,1.52,.12)},{id:`top-left`,color:14239471,hit:new N(-1.26,.82,.12)},{id:`left`,color:1635839,hit:new N(-1.92,-.38,.12)}].map(e=>({...e,start:new N(e.hit.x*1.24,e.hit.y,-6.4)})),Cn=Math.abs(Sn[0].hit.z-Sn[0].start.z)/sn,wn=2.06,Tn=[1635839,11032055,16732120],En=(()=>{let e=new xe,t=new ve,n=new N(0,0,1),r=new ve(-Math.sqrt(.5),0,0,Math.sqrt(.5));return(i,a)=>{let o=u(a);if(!f(a))return!1;let s=k.degToRad(o.alpha),c=k.degToRad(o.beta),l=k.degToRad(o.gamma),d=k.degToRad(a?.screen?.angle||0);return e.set(c,s,-l,`YXZ`),i.setFromEuler(e),i.multiply(r),i.multiply(t.setFromAxisAngle(n,-d)),!0}})(),Dn=({baseZ:e,tipZ:t,baseWidth:n,tipWidth:r,baseThickness:i,tipThickness:a})=>{let o=t-.32,s=[[-n,0,e],[0,i,e],[n,0,e],[0,-i,e],[-r,0,o],[0,a,o],[r,0,o],[0,-a,o],[0,0,t]],c=[],l=(e,t,n,r)=>{c.push(e,t,r,t,n,r)};for(let e=0;e<4;e+=1){let t=(e+1)%4;l(e,t,t+4,e+4),c.push(e+4,t+4,8)}c.push(0,1,2,0,2,3);let u=new Le;u.setAttribute(`position`,new Ze(s.flat(),3)),u.setIndex(c);let d=u.toNonIndexed();return u.dispose(),d.computeVertexNormals(),d},On=({startZ:e,endZ:t,centerY:n,startRadius:r,endRadius:i,turns:a=4.25})=>{let o=[];for(let s=0;s<=96;s+=1){let c=s/96,l=c*Math.PI*2*a,u=k.lerp(r,i,c);o.push(new N(Math.cos(l)*u,n+Math.sin(l)*u,k.lerp(e,t,c)))}return new Te(new De(o),96,.008,5,!1)},$=1e-5,kn=(e,t,n,r)=>{e.push(t.x,t.y,t.z,n.x,n.y,n.z,r.x,r.y,r.z)},An=(e,t,n)=>{let r=[];for(let i=0;i<e.length;i+=1){let a=e[i],o=e[(i+e.length-1)%e.length],s=t.distanceToPoint(a),c=t.distanceToPoint(o),l=n?s>=-1e-5:s<=$;if(l!==(n?c>=-1e-5:c<=$)){let e=c/(c-s);r.push(o.clone().lerp(a,e))}l&&r.push(a.clone())}let i=r.filter((e,t)=>t===0||e.distanceToSquared(r[t-1])>$**2);return i.length>2&&i[0].distanceToSquared(i[i.length-1])<=$**2&&i.pop(),i},jn=(e,t)=>{let n=e.reduce((e,t)=>e.add(t),new N).divideScalar(e.length),r=Math.abs(t.x)<.8?new N(1,0,0):new N(0,1,0),i=new N().crossVectors(r,t).normalize(),a=new N().crossVectors(t,i).normalize();return[...e].sort((e,t)=>{let r=e.clone().sub(n),o=t.clone().sub(n);return Math.atan2(r.dot(a),r.dot(i))-Math.atan2(o.dot(a),o.dot(i))})},Mn=(e,t)=>{let n=e/2,r=[new N(-n,-n,-n),new N(-n,-n,n),new N(-n,n,-n),new N(-n,n,n),new N(n,-n,-n),new N(n,-n,n),new N(n,n,-n),new N(n,n,n)],i=[[r[4],r[6],r[7],r[5]],[r[1],r[3],r[2],r[0]],[r[2],r[3],r[7],r[6]],[r[1],r[0],r[4],r[5]],[r[1],r[5],r[7],r[3]],[r[4],r[0],r[2],r[6]]],a=[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]],o=[],s=e=>{o.some(t=>t.distanceToSquared(e)<=$**2)||o.push(e.clone())};a.forEach(([e,n])=>{let i=r[e],a=r[n],o=t.distanceToPoint(i),c=t.distanceToPoint(a);Math.abs(o)<=$&&s(i),Math.abs(c)<=$&&s(a),o*c<-($**2)&&s(i.clone().lerp(a,o/(o-c)))});let c=e=>{let n=[];i.forEach(r=>{let i=An(r,t,e);for(let e=1;e<i.length-1;e+=1)kn(n,i[0],i[e],i[e+1])});let r=[];if(o.length>=3){let n=jn(o,t.normal.clone().multiplyScalar(e?-1:1));for(let e=1;e<n.length-1;e+=1)kn(r,n[0],n[e],n[e+1])}let a=n.length/3,s=r.length/3,c=new Float32Array(n.length+r.length);c.set(n),c.set(r,n.length);let l=new Le;return l.setAttribute(`position`,new Se(c,3)),l.addGroup(0,a,0),s>0&&l.addGroup(a,s,1),l.computeVertexNormals(),l.computeBoundingBox(),l.computeBoundingSphere(),l};return{front:c(!0),back:c(!1),cutOutline:o.length>=3?jn(o,t.normal):[]}},Nn=e=>{let t=e.getAttribute(`position`),n=new N,r=new N,i=new N,a=new N,o=new N,s=new N,c=0;for(let e=0;e<t.count;e+=3){r.fromBufferAttribute(t,e),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2);let l=r.dot(o.crossVectors(i,a))/6;s.copy(r).add(i).add(a),n.addScaledVector(s,l),c+=l}return Math.abs(c)>$?n.multiplyScalar(1/(4*c)):(e.computeBoundingBox(),e.boundingBox.getCenter(n))},Pn=(e,t)=>{e.translate(-t.x,-t.y,-t.z),e.computeBoundingBox(),e.computeBoundingSphere()},Fn=(0,I.memo)(({packetRef:e,calibrateKey:t,onBlockScored:n})=>{let r=(0,I.useRef)(null),i=(0,I.useRef)(n),a=(0,I.useRef)(0);return(0,I.useEffect)(()=>{i.current=n},[n]),(0,I.useEffect)(()=>{a.current+=1},[t]),(0,I.useEffect)(()=>{let t=r.current;if(!t)return;let n=new qe;n.fog=new de(330002,5,14);let o=new oe(42,1,.1,50);o.position.set(0,1.05,5.4),o.lookAt(0,0,0);let s=o.position.clone(),c=new N(0,0,0),l=new Ne({antialias:!0,alpha:!0}),u=Math.min(window.devicePixelRatio||1,2);l.setPixelRatio(u),l.outputColorSpace=Ee,l.toneMapping=4,l.toneMappingExposure=.92,l.setClearColor(330002,1),t.appendChild(l.domElement);let f=new Ke(l),p=f.fromScene(new yt,.04).texture;f.dispose(),n.environment=p,n.environmentIntensity=.72;let m=new Ut(l),h=new Wt(n,o),g=new Kt(new F(1,1),.48,.36,.9);m.addPass(h),m.addPass(g);let _=new be(14281983,1.18),ee=new E(1628159,48,10);ee.position.set(2.3,2.7,2.8);let v=new E(16735912,22,8);v.position.set(-2.7,-.8,2.2);let y=new E(10181887,34,9);y.position.set(-2.1,2.4,-1.7);let b=new E(1635839,26,11);b.position.set(0,-.7,-2.1),n.add(_,ee,v,y,b);let ne=[],ie=[],C=e=>(ne.push(e),e),w=e=>(ie.push(e),e),T=new S,O=new S;O.quaternion.setFromUnitVectors(new N(0,0,1),new N(0,1,0));let fe=.5,he=3.08,j=-.08,xe=w(new x({color:6007228,metalness:.36,roughness:.34,emissive:888229,emissiveIntensity:.46,clearcoat:.28,clearcoatRoughness:.38,envMapIntensity:.5,flatShading:!0})),Ce=w(new x({color:594464,metalness:.72,roughness:.28,emissive:469575,emissiveIntensity:.28,clearcoat:.58,clearcoatRoughness:.24})),Te=w(new x({color:16765286,metalness:.72,roughness:.24,emissive:3876096,emissiveIntensity:.16,clearcoat:.64,clearcoatRoughness:.2})),De=w(new A({color:1685759,transparent:!0,opacity:.82,blending:2,depthWrite:!1})),Oe=w(new me({color:1477811,metalness:.68,roughness:.3,emissive:692679,emissiveIntensity:.56})),Ae=w(new x({color:463133,metalness:.46,roughness:.34,emissive:891863,emissiveIntensity:.12,clearcoat:.72,clearcoatRoughness:.2})),Me=w(new x({color:133393,metalness:.08,roughness:.16,emissive:1298431,emissiveIntensity:.94,clearcoat:1,clearcoatRoughness:.08})),ze=w(new Fe({color:8186111,transparent:!0,opacity:.82})),P=C(Dn({baseZ:fe,tipZ:he,baseWidth:.17,tipWidth:.055,baseThickness:.045,tipThickness:.018})),Be=new D(P,xe),Ue=new ue(C(new Qe(P)),ze),We=new D(C(new ke(.065,.075,.84,18)),Ce);We.rotation.x=Math.PI/2,We.position.set(0,.04,j);let Xe=new D(C(On({startZ:-.46,endZ:.3,centerY:.04,startRadius:.078,endRadius:.068})),Oe),$e=C(new Re(.079,.012,8,32)),et=[-.49,.34].map(e=>{let t=new D($e,Te);return t.position.set(0,.04,e),t}),tt=new D(C(new xt(.3,.05,.86,4,.025)),Ae);tt.position.set(0,-.105,j);let nt=new D(C(new xt(.25,.012,.66,4,.018)),Me);nt.position.set(0,-.136,j-.015);let I=new D(C(new ke(.018,.018,.009,16)),De);I.position.set(-.085,-.146,.20999999999999996);let rt=fe-.08,L=new D(C(new xt(.3,.12,.18,4,.028)),Te);L.position.z=rt;let it=C(new we(.055,.28,5,12)),at=[-1,1].map(e=>{let t=new D(it,Te),n=new N(e,0,-.28).normalize();return t.quaternion.setFromUnitVectors(new N(0,1,0),n),t.position.set(e*.3,0,rt-.045),t}),R=new D(C(new ye(.115,0)),Te);R.position.z=-.62;let z=new D(C(new Pe(.035,18,10)),De);z.position.z=j;let ot=C(new pe(.065,1));[-1,1].forEach(e=>{let t=new D(ot,De);t.position.set(e*.49,0,rt-.1),O.add(t)}),O.add(Be,Ue,L,...at,We,Xe,...et,tt,nt,I,R,z),T.add(O),n.add(T);let st=new S,ct=new D(C(new He(4.8,8.2)),w(new A({color:465460,transparent:!0,opacity:.58,depthWrite:!1,side:2})));ct.rotation.x=-Math.PI/2,ct.position.set(0,bn-.018,-1.58);let lt=new D(C(new He(.16,8.2)),w(new A({color:2947327,transparent:!0,opacity:.26,blending:2,depthWrite:!1,side:2})));lt.rotation.x=-Math.PI/2,lt.position.set(0,bn-.006,-1.58);let ut=[];[-2.25,-1.12,0,1.12,2.25].forEach(e=>{ut.push(e,-1.354,-5.68,e,-1.354,2.52)});let dt=[];[-3.64,-1.58,.48,2.52].forEach(e=>{dt.push(-2.4,-1.354,e,2.4,-1.354,e)});let ft=e=>{let t=C(new Le().setAttribute(`position`,new Ze(e,3)));return{lines:new ue(t,w(new Fe({color:2160127,transparent:!0,opacity:.82,blending:2,depthWrite:!1,fog:!0}))),glow:new ue(t,w(new Fe({color:11032055,transparent:!0,opacity:.42,blending:2,depthWrite:!1,fog:!0})))}},pt=ft(ut),mt=ft(dt);mt.lines.material.blending=1,mt.lines.material.opacity=.48,mt.glow.visible=!1;let ht=new S;ht.add(mt.lines);let gt=w(new A({color:9133302,transparent:!0,opacity:.075,blending:2,depthWrite:!1,side:2})),_t=new D(C(new Ve(.82,48)),gt);_t.rotation.x=-Math.PI/2;let vt=w(new A({color:1635839,transparent:!0,opacity:.1,blending:2,depthWrite:!1,side:2})),B=new D(C(new Ve(.48,48)),vt);B.rotation.x=-Math.PI/2;let bt=new D(C(new Ve(.18,32)),w(new A({color:1635839,transparent:!0,opacity:.26,blending:2,depthWrite:!1,side:2})));bt.rotation.x=-Math.PI/2;let V=new D(C(new Ve(.13,32)),w(new A({color:16773544,transparent:!0,opacity:.38,blending:2,depthWrite:!1,side:2})));V.rotation.x=-Math.PI/2;let Ct=new S;st.add(ct,lt,pt.glow,pt.lines,ht,_t,B,bt,V,Ct),n.add(st);let wt=C(new Ge(yn,yn,yn)),Et=C(new Qe(wt)),Dt=C(new Tt().fromEdgesGeometry(Et)),Ot=new S,H=new S,U=new S,W=new S,G=[],K=[],q=[],kt=[],J=[],At=new Map,Y=new M(16777215),X=new N,Z=new N,jt=new N,Mt=new N,Nt=new N,Ft=new N,It=new N,Lt=new N,Rt=new N,zt=new N,Bt=new Je,Vt=new Je,Ht=new ce,Gt=new N,Q=new N,$=new N,kn=new N,An=new N,jn=new N,Fn=!1,In=0,Ln=1,Rn=0,zn=0,Bn=null,Vn=performance.now(),Hn=Vn+cn;n.add(Ot,H,U,W);let Un=e=>(e.userData.baseOpacity=e.opacity,e),Wn=(e,t)=>{e.materials.forEach(e=>{Number.isFinite(e.userData.baseOpacity)&&(e.opacity=e.userData.baseOpacity*t)})},Gn=e=>{Ot.remove(e.group),H.remove(e.approachTrail),e.materials.forEach(e=>e.dispose()),e.approachTrailGeometry.dispose(),e.cutRimGeometry?.dispose(),e.slicedGeometries&&e.slicedGeometries.forEach(e=>e.dispose()),e.group.clear()},Kn=(e,t)=>{i.current?.(e,t)},qn=window.AudioContext||window.webkitAudioContext,Jn=()=>qn?(Bn||=new qn,Bn.state===`suspended`&&Bn.resume().catch(()=>{}),Bn):null,Yn=e=>{let t=Jn();if(!t)return;let n=()=>{if(t.state!==`running`)return;let n=t.currentTime,r=t.createGain(),i=t.createOscillator(),a=t.createOscillator();r.gain.setValueAtTime(1e-4,n),r.gain.exponentialRampToValueAtTime(.075+e*.055,n+.008),r.gain.exponentialRampToValueAtTime(1e-4,n+.17),i.type=`triangle`,i.frequency.setValueAtTime(260+e*130,n),i.frequency.exponentialRampToValueAtTime(82,n+.17),a.type=`sine`,a.frequency.setValueAtTime(720+e*420,n),a.frequency.exponentialRampToValueAtTime(360,n+.09),i.connect(r),a.connect(r),r.connect(t.destination),i.start(n),a.start(n),i.stop(n+.18),a.stop(n+.1)};t.state===`running`?n():t.resume().then(n).catch(()=>{})};window.addEventListener(`pointerdown`,Jn,{passive:!0}),window.addEventListener(`keydown`,Jn);let Xn=e=>{In=Math.max(In,.032+e*.016),Ln=0,Rn=.14+e*.06,zn=.014+e*.018},Zn=(e,t)=>{if(o.position.copy(s),Ln<Rn){Ln+=t;let n=k.clamp(1-Ln/Rn,0,1),r=zn*n*n;o.position.x+=Math.sin(e*.19)*r,o.position.y+=Math.cos(e*.23)*r*.72,o.position.z+=Math.sin(e*.16+.8)*r*.35}o.lookAt(c)},Qn=e=>{W.remove(e.points),e.geometry.dispose(),e.material.dispose()},$n=(e,t,n,r)=>{let i=16+Math.round(n*10),a=new Float32Array(i*3),o=new Float32Array(i*3);for(let t=0;t<i;t+=1){let i=t*3,s=Math.random()>.5?1:-1,c=.72+Math.random()*(1.1+n*.75);a[i]=e.x,a[i+1]=e.y,a[i+2]=e.z,o[i]=r.x*s*c+(Math.random()-.5)*.9,o[i+1]=r.y*s*c+(Math.random()-.2)*.9,o[i+2]=r.z*s*c+(Math.random()-.5)*.85}let s=new Le,c=new Se(a,3);c.setUsage(Ye),s.setAttribute(`position`,c);let l=new ge({color:t.clone().lerp(Y,.42),size:.035+n*.025,transparent:!0,opacity:.95,blending:2,depthWrite:!1,fog:!0,sizeAttenuation:!0}),u=new _e(s,l);W.add(u),kt.push({points:u,geometry:s,material:l,velocities:o,age:0,life:.28+n*.16})},er=e=>{for(let t=kt.length-1;t>=0;--t){let n=kt[t],r=n.geometry.getAttribute(`position`);n.age+=e;for(let t=0;t<r.count;t+=1){let i=t*3;n.velocities[i+1]-=1.65*e,r.setXYZ(t,r.getX(t)+n.velocities[i]*e,r.getY(t)+n.velocities[i+1]*e,r.getZ(t)+n.velocities[i+2]*e),n.velocities[i]*=.985,n.velocities[i+1]*=.985,n.velocities[i+2]*=.985}r.needsUpdate=!0;let i=k.clamp(1-n.age/n.life,0,1);n.material.opacity=.95*i*i,n.material.size=(.035+.025*i)*i,i<=0&&(Qn(n),kt.splice(t,1))}},tr=e=>{U.remove(e.mesh),e.geometry.dispose(),e.material.dispose()},nr=e=>{tr(K[e]),K.splice(e,1)},rr=(e,t,n,r)=>{Ft.copy(n).sub(t);let i=Ft.lengthSq();if(i<=1e-4)return r.copy(t),e.distanceTo(t);let a=k.clamp(It.copy(e).sub(t).dot(Ft)/i,0,1);return r.copy(t).addScaledVector(Ft,a),r.distanceTo(e)},ir=e=>{let t=1/0,n=(e,n)=>{e<t&&(t=e,Lt.copy(n))};return n(rr(e,X,Z,Rt),Rt),n(rr(e,jt,Mt,Rt),Rt),Bt.set(jt,Mt,Z),Bt.closestPointToPoint(e,zt),n(e.distanceTo(zt),zt),Vt.set(jt,Z,X),Vt.closestPointToPoint(e,zt),n(e.distanceTo(zt),zt),t},ar=e=>{Ct.remove(e.ring,e.flash),e.ring.geometry.dispose(),e.ring.material.dispose(),e.flash.geometry.dispose(),e.flash.material.dispose()},or=(e,t,n)=>{let r=new D(new re(.13,.17,40),new A({color:t.clone().lerp(Y,.32),transparent:!0,opacity:.72,blending:2,depthWrite:!1,fog:!0,side:2})),i=new D(new Ve(.16,40),new A({color:t.clone().lerp(new M(1635839),.35),transparent:!0,opacity:.18+n*.14,blending:2,depthWrite:!1,fog:!0,side:2}));[r,i].forEach(t=>{t.rotation.x=-Math.PI/2,t.position.set(e.x,-1.334,e.z)}),Ct.add(r,i),q.push({ring:r,flash:i,age:0,life:.46+n*.14,ringOpacity:r.material.opacity,flashOpacity:i.material.opacity}),q.length>14&&ar(q.shift())},sr=e=>{let t=new M(e.color),n=new S,r=Un(new x({color:t.clone().multiplyScalar(.62),metalness:.08,roughness:.48,emissive:t,emissiveIntensity:.2,transparent:!0,opacity:.96,clearcoat:.18,clearcoatRoughness:.46,envMapIntensity:.38,fog:!0})),i=Un(new St({color:t.clone().lerp(Y,.48),linewidth:2.35,transparent:!0,opacity:.96,depthWrite:!1,fog:!0,alphaToCoverage:!0})),a=new D(wt,r),o=new Pt(Dt,i);a.rotation.set(Math.random()*.55,Math.random()*.35,Math.random()*Math.PI),o.rotation.copy(a.rotation),n.add(a,o),n.position.copy(e.start),n.scale.setScalar(.18),Ot.add(n);let s=sn+Math.random()*.35,c=e.hit.clone().sub(e.start).divideScalar(s),l=c.clone().normalize(),u=new je(.07,1,12,1,!0),d=Un(new A({color:t.clone().lerp(Y,.22),transparent:!0,opacity:.22,blending:2,depthWrite:!1,fog:!0,side:2})),f=new D(u,d);f.quaternion.setFromUnitVectors(new N(0,1,0),l),H.add(f),G.push({state:`active`,lane:e,group:n,body:a,edges:o,materials:[r,i,d],approachDirection:l,approachTrail:f,approachTrailGeometry:u,approachTrailMaterial:d,progress:0,travelDuration:s,forwardVelocity:c,cutVelocity:new N,missVelocity:new N,fallVelocity:0,wobble:Math.random()*Math.PI*2,spin:new N(.35+Math.random()*.45,.22+Math.random()*.38,.36+Math.random()*.52),cutAge:0,cutLife:0,missAge:0,missLife:0,missSpin:0,splitSpeed:0,cutSpin:0,pieces:[]})},cr=(e,t,n,r)=>{e.state=`cut`,Kn(`hit`,{intensity:n,color:e.lane.color}),e.cutAge=0,e.cutLife=1.18+n*.34,e.splitSpeed=.28+n*.28,e.cutSpin=(Math.random()>.5?1:-1)*(.4+n*.85),e.cutVelocity.copy(e.forwardVelocity).multiplyScalar(1.08+n*.32),e.cutVelocity.y=0,e.fallVelocity=-.36-n*.3,e.body.visible=!1,e.edges.visible=!1,e.approachTrail.visible=!1,or(r,new M(e.lane.color),n),An.setFromMatrixColumn(o.matrixWorld,0).normalize(),jn.setFromMatrixColumn(o.matrixWorld,1).normalize(),$.copy(An).multiplyScalar(t.dot(An)).addScaledVector(jn,t.dot(jn)),$.z=0,$.lengthSq()>1e-4?$.normalize():t.lengthSq()>1e-4?$.copy(t).setZ(0).normalize():$.set(1,0,0),kn.set(-$.y,$.x,0),kn.lengthSq()<=1e-4&&kn.set(1,0,0),kn.normalize();let i=new M(e.lane.color);Xn(n),$n(r,i,n,kn),Yn(n);let a=new se().copy(e.body.matrixWorld).invert();Q.copy(r).applyMatrix4(a),Gt.copy(kn);let s=new ae().getNormalMatrix(a);Gt.applyMatrix3(s).normalize();let c=yn*.5*(Math.abs(Gt.x)+Math.abs(Gt.y)+Math.abs(Gt.z)),l=k.clamp(-Q.dot(Gt),-c*.72,c*.72);Ht.set(Gt,l);let u=Mn(yn,Ht),d=new Le().setFromPoints(u.cutOutline),f=Un(new Fe({color:i.clone().lerp(Y,.72),transparent:!0,opacity:.96,blending:2,depthWrite:!1,fog:!1})),p=new le(d,f);p.rotation.copy(e.body.rotation),p.renderOrder=3,e.group.add(p),e.cutRim=p,e.cutRimGeometry=d;let m=Nn(u.front),h=Nn(u.back);Pn(u.front,m),Pn(u.back,h);let g=new M(e.lane.color),_=Un(new x({color:g.clone().multiplyScalar(.68),metalness:.16,roughness:.42,emissive:g.clone(),emissiveIntensity:.32,transparent:!0,opacity:.94,clearcoat:.2,clearcoatRoughness:.44,envMapIntensity:.36,fog:!1,side:2})),ee=_.clone();Un(ee);let v=Un(new x({color:new M(132106).lerp(g,.035),metalness:.02,roughness:.94,emissive:g.clone().multiplyScalar(.015),emissiveIntensity:.08,transparent:!0,opacity:.98,fog:!0,side:2})),te=v.clone();Un(te);let y=new D(u.front,[_,v]),b=new D(u.back,[ee,te]),ne=m.clone().applyQuaternion(e.body.quaternion),re=h.clone().applyQuaternion(e.body.quaternion);y.position.copy(ne),b.position.copy(re),y.rotation.copy(e.body.rotation),b.rotation.copy(e.body.rotation),e.group.add(y,b),e.pieces=[y,b],e.pieceCenters=[ne,re],e.splitNormalLocal=Gt.clone().applyQuaternion(e.body.quaternion).normalize(),e.materials.push(_,ee,v,te,f),e.slicedGeometries=[u.front,u.back]},lr=e=>{e.state=`missed`,Kn(`miss`),e.missAge=0,e.missLife=.92,e.missSpin=(Math.random()>.5?1:-1)*(1.9+Math.random()*1.1),e.missVelocity.copy(e.forwardVelocity).multiplyScalar(-.66),e.missVelocity.x+=(Math.random()-.5)*.22,e.missVelocity.y=.48+Math.random()*.16,e.approachTrail.visible=!1},ur=(e,t,n)=>{let r=new Le;r.setAttribute(`position`,new Ze([e.x,e.y,e.z,t.x,t.y,t.z],3));let i=Tn[Math.min(Tn.length-1,Math.floor(n*Tn.length))],a=new Fe({color:i,transparent:!0,opacity:.38+n*.44,blending:2,depthWrite:!1}),o=new Ie(r,a);U.add(o),K.push({mesh:o,geometry:r,material:a,age:0,life:.26+n*.18,baseOpacity:a.opacity}),K.length>34&&nr(0)},dr=e=>{for(let t=K.length-1;t>=0;--t){let n=K[t];n.age+=e;let r=k.clamp(1-n.age/n.life,0,1);n.material.opacity=n.baseOpacity*r*r,r<=0&&nr(t)}},fr=e=>{for(let t=q.length-1;t>=0;--t){let n=q[t];n.age+=e;let r=k.clamp(n.age/n.life,0,1),i=1-(1-r)**2;n.ring.scale.setScalar(k.lerp(.55,3.8,i)),n.ring.material.opacity=n.ringOpacity*(1-r)**1.7,n.flash.scale.setScalar(k.lerp(.7,2.2,i)),n.flash.material.opacity=n.flashOpacity*(1-r)**2.4,r>=1&&(ar(n),q.splice(t,1))}},pr=()=>{_t.position.set(X.x,-1.346,X.z),B.position.set(X.x,-1.342,X.z),bt.position.set(X.x,-1.316,X.z),V.position.set(Z.x,-1.312,Z.z)},mr=(e,t,n,r,i,a)=>{e.progress+=n/e.travelDuration;let o=e.progress,s=k.clamp(e.progress,0,1);e.group.position.lerpVectors(e.lane.start,e.lane.hit,o),e.group.scale.setScalar(.2+s*.68+Math.sin(t/170+e.wobble)*.014);let c=k.lerp(.18,1.2,1-s);e.approachTrail.position.copy(e.group.position).addScaledVector(e.approachDirection,-c*.5),e.approachTrail.scale.set(1,c,1),e.approachTrailMaterial.opacity=e.approachTrailMaterial.userData.baseOpacity*k.lerp(.34,1,1-s),e.body.rotation.x+=e.spin.x*n,e.body.rotation.y+=e.spin.y*n,e.body.rotation.z+=e.spin.z*n,e.edges.rotation.copy(e.body.rotation),r&&i>_n&&ir(e.group.position)<=vn&&cr(e,Nt,a,Lt)},hr=(e,t)=>{e.cutAge+=t;let n=k.clamp(e.cutAge/e.cutLife,0,1),r=1-(1-n)**2;if(e.pieces.length===2){e.pieces[0].position.copy(e.pieceCenters[0]),e.pieces[1].position.copy(e.pieceCenters[1]);let i=r*e.splitSpeed;e.pieces[0].position.addScaledVector(e.splitNormalLocal,i),e.pieces[1].position.addScaledVector(e.splitNormalLocal,-i),e.pieces[0].position.y+=Math.sin(n*Math.PI)*.06,e.pieces[1].position.y+=Math.sin(n*Math.PI)*.04,e.pieces[0].rotation.z+=-t*1.8,e.pieces[1].rotation.z+=t*1.8}if(e.fallVelocity-=1.9*t,e.group.position.addScaledVector(e.cutVelocity,t),e.group.position.y+=e.fallVelocity*t,e.group.rotation.z+=e.cutSpin*t,Wn(e,1-n),e.cutRim){let t=k.clamp(1-e.cutAge/.16,0,1);e.cutRim.material.opacity=e.cutRim.material.userData.baseOpacity*t*t}},gr=(e,t)=>{e.missAge+=t;let n=k.clamp(e.missAge/e.missLife,0,1),r=Math.sin(Math.min(1,e.missAge/.16)*Math.PI);e.missVelocity.y-=2.7*t,e.group.position.addScaledVector(e.missVelocity,t),e.group.rotation.z+=e.missSpin*t,e.group.rotation.x+=e.missSpin*.42*t;let i=.88*(1-n*.08);e.group.scale.set(i*(1+r*.1),i*(1-r*.13),i*(1+r*.1)),Wn(e,k.clamp((1-n)*1.9,0,1))},_r=e=>{let t=Sn.filter(t=>(At.get(t.id)||0)<=e&&!J.includes(t.id)),n=Sn.filter(e=>e.id!==J[J.length-1]),r=t.length>0?t:n,i=r[Math.floor(Math.random()*r.length)];return At.set(i.id,e+fn),J.push(i.id),J.length>pn&&J.shift(),i},vr=(e,t,n,r,i)=>{if(e>=Hn&&G.length<mn){sr(_r(e));let t=k.clamp((e-Vn)/dn,0,1);Hn=e+k.lerp(ln,un,t)*(.88+Math.random()*.28)}for(let a=G.length-1;a>=0;--a){let o=G[a];o.state===`active`?mr(o,e,t,n,r,i):o.state===`cut`?hr(o,t):gr(o,t);let s=o.state===`active`&&(o.group.position.z>=xn||o.progress>1.35),c=o.state===`cut`&&o.cutAge>=o.cutLife,l=o.state===`missed`&&o.missAge>=o.missLife;s&&lr(o),(c||l)&&(Gn(o),G.splice(a,1))}},yr=new ve,br=new ve,xr=new ve,Sr=new N,Cr=new N,wr=new N,Tr=new N,Er=!1,Dr=a.current,Or=0,kr=0,Ar=performance.now(),jr=()=>{let{clientWidth:e,clientHeight:n}=t,r=Math.max(1,e),i=Math.max(1,n);o.aspect=r/i,o.updateProjectionMatrix(),l.setSize(r,i,!1),m.setSize(r,i)},Mr=new ResizeObserver(jr);Mr.observe(t),jr();let Nr=t=>{let n=Math.min(.05,(t-Ar)/1e3);if(Ar=t,o.position.copy(s),o.lookAt(c),In>0){In=Math.max(0,In-n),Zn(t,n),m.render(n),kr=requestAnimationFrame(Nr);return}let r=e.current,i=En(yr,r),l=d(r),u=te(r),f=u.rotationRate||{},p=Math.hypot(Number.isFinite(f.alpha)?f.alpha:0,Number.isFinite(f.beta)?f.beta:0,Number.isFinite(f.gamma)?f.gamma:0),h=k.clamp((p-Jt)/(Yt-Jt),0,1),g=!1;if(a.current!==Dr&&(Dr=a.current,Er=!1),i&&l>0&&Or>0&&l-Or>qt&&(Er=!1),l>Or&&(Or=l),i){if(Er||(xr.copy(yr).invert(),Er=!0,g=!0),br.copy(xr).multiply(yr),g)T.quaternion.copy(br);else if(T.quaternion.angleTo(br)>k.lerp(Xt,Zt,h)){let e=k.lerp(Qt,$t,h);T.quaternion.slerp(br,rn(e,n))}}else T.rotation.y+=n*.45,T.rotation.x=Math.sin(t/1200)*.16;let _=u.acceleration||{};wr.set(an(_.x,en),an(_.y,en),an(_.z,en)),Tr.copy(wr),i&&Tr.applyQuaternion(T.quaternion),Sr.set(k.clamp(Tr.x*.045,-.65,.65),k.clamp(Tr.y*.045,-.42,.42),k.clamp(Tr.z*.035,-.48,.48));let ee=k.clamp(Tr.length()/8,0,1),v=k.lerp(tn,nn,ee);Cr.lerp(Sr,rn(v,n)),Sr.lengthSq()===0&&Cr.lengthSq()<9e-4&&Cr.set(0,0,0),T.position.copy(on).add(Cr),X.set(0,0,fe),Z.set(0,0,he),O.localToWorld(X),O.localToWorld(Z),pr();let y=0,b=0,ne=!1;i&&!g?(Fn&&n>0&&(Nt.copy(Z).sub(Mt),y=Nt.length()/n+p*.006,b=k.clamp((y-hn)/6.8,0,1),ne=y>_n,b>gn&&ur(Mt,Z,b)),jt.copy(X),Mt.copy(Z),Fn=!0):(Nt.set(0,0,0),Fn=!1),dr(n),fr(n),er(n);let re=(t-Vn)/1e3*Cn;ht.position.z=re%wn,vr(t,n,ne,y,b),xe.emissiveIntensity=.46+Math.sin(t/180)*.025,Me.emissiveIntensity=.94+Math.sin(t/260+.6)*.07,z.scale.setScalar(1+Math.sin(t/150)*.18);let ie=1+Math.sin(t/520)*.055;_t.scale.setScalar(ie),B.scale.setScalar(1+Math.sin(t/430+.8)*.04),Zn(t,n),m.render(n),kr=requestAnimationFrame(Nr)};return kr=requestAnimationFrame(Nr),()=>{for(cancelAnimationFrame(kr),Mr.disconnect(),t.removeChild(l.domElement);G.length>0;)Gn(G.pop());for(;K.length>0;)tr(K.pop());for(;q.length>0;)ar(q.pop());for(;kt.length>0;)Qn(kt.pop());window.removeEventListener(`pointerdown`,Jn),window.removeEventListener(`keydown`,Jn),Bn?.close().catch(()=>{}),ne.forEach(e=>e.dispose()),ie.forEach(e=>e.dispose()),p.dispose(),g.dispose(),m.dispose(),l.dispose()}},[e]),(0,Q.jsx)(`div`,{className:`motion-scene`,ref:r,"aria-label":`Live phone orientation scene`})}),In=`(max-width: 760px)`,Ln=({value:e})=>{let t=(0,I.useMemo)(()=>{try{return vt(e)}catch{return null}},[e]);return t?(0,Q.jsxs)(`svg`,{className:`motion-qr`,viewBox:`0 0 ${t.size} ${t.size}`,role:`img`,"aria-label":`Phone pairing QR code`,shapeRendering:`crispEdges`,children:[(0,Q.jsx)(`rect`,{width:t.size,height:t.size,fill:`#ffffff`}),(0,Q.jsx)(`path`,{d:t.path,fill:`#000000`})]}):(0,Q.jsx)(`div`,{className:`motion-qr-fallback`,children:(0,Q.jsx)(et,{size:22})})},Rn=()=>{let[e,t]=(0,I.useState)(()=>typeof window<`u`?window.matchMedia(In).matches:!1);return(0,I.useEffect)(()=>{let e=window.matchMedia(In),n=e=>t(e.matches);return e.addEventListener(`change`,n),()=>e.removeEventListener(`change`,n)},[]),e},zn=()=>{let e=Rn(),t=(0,I.useMemo)(()=>h(),[]),[n,r]=(0,I.useState)(c),[d,f]=(0,I.useState)(null),[re,ie]=(0,I.useState)(`connecting`),[x,S]=(0,I.useState)(null),[C,w]=(0,I.useState)(0),[ae,oe]=(0,I.useState)(0),[T,se]=(0,I.useState)(0),[E,ce]=(0,I.useState)(!1),[D,le]=(0,I.useState)(!1),[ue,O]=(0,I.useState)(!1),[k,A]=(0,I.useState)({hits:0,misses:0}),[de,fe]=(0,I.useState)(()=>Date.now()),pe=(0,I.useRef)(null),me=(0,I.useRef)(0),he=(0,I.useRef)([]);(0,I.useEffect)(()=>{if(e)return;let n=!1;return fetch(_(t,g)).then(e=>e.ok?e.json():Promise.reject(Error(`Relay config unavailable`))).then(e=>{n||f({...e,relayAvailable:!0})}).catch(()=>{n||(ie(`unavailable`),f({preferredOrigin:window.location.origin,localOrigin:window.location.origin,lanOrigins:[],relayAvailable:!1,secure:window.isSecureContext}))}),()=>{n=!0}},[e,t]),(0,I.useEffect)(()=>{if(e)return;let t=window.setInterval(()=>{let e=performance.now()-1e3,t=he.current,n=0;for(;n<t.length&&t[n]<e;)n+=1;t.splice(0,n),S(pe.current),w(me.current),oe(t.length),fe(Date.now())},E?100:250);return()=>window.clearInterval(t)},[e,E]),(0,I.useEffect)(()=>{if(e||!d||d.relayAvailable===!1)return;let r=new EventSource(_(t,`/api/motion/events?s=${encodeURIComponent(n)}`)),i=!1,a=e=>{i=!1,ie(e)};return r.onopen=()=>a(`ready`),r.onerror=()=>a(`reconnecting`),r.addEventListener(`hello`,()=>a(`ready`)),r.addEventListener(`sensor`,e=>{let t=JSON.parse(e.data),n=performance.now();he.current.push(n),pe.current=t,me.current+=1,i||(i=!0,ie(`live`))}),()=>r.close()},[d,e,t,n]);let ge=t===window.location.origin&&d?.preferredOrigin||window.location.origin,_e=t===window.location.origin?ge:t,ve=(0,I.useMemo)(()=>p(ge,n,_e),[ge,_e,n]),ye=x?.relayReceivedAt?de-x.relayReceivedAt:1/0,j=ye<1600,be=u(x),xe=te(x),Se=xe.acceleration,Ce=xe.accelerationIncludingGravity,we=xe.rotationRate,Te=d?.secure||window.isSecureContext,Ee=d?.relayAvailable!==!1,De=k.hits+k.misses,Oe=De>0?Math.round(k.hits/De*100):null,ke=!j&&!ue||D,Ae=[`motion-lab`,ke?``:`pair-hidden`,E?`stream-expanded`:`stream-collapsed`].filter(Boolean).join(` `),je=()=>{ie(`connecting`),r(c()),pe.current=null,me.current=0,S(null),w(0),oe(0),A({hits:0,misses:0}),se(e=>e+1),ce(!1),le(!1),O(!1),he.current=[]},Me=()=>{le(!1),O(!0)},Ne=()=>{le(!0),O(!1)},Pe=(0,I.useCallback)((e,r={})=>{A(t=>({hits:t.hits+ +(e===`hit`),misses:t.misses+ +(e===`miss`)})),e===`hit`&&Ee&&fetch(_(t,ee),{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sessionId:n,feedback:`hit`,intensity:r.intensity||0,color:r.color})}).catch(()=>{})},[Ee,t,n]);return e?(0,Q.jsx)(`section`,{className:`motion-lab-phone-message`,role:`status`,"aria-live":`polite`,children:(0,Q.jsxs)(`div`,{className:`motion-lab-phone-message-panel`,children:[(0,Q.jsx)(`span`,{className:`motion-lab-phone-message-icon`,children:(0,Q.jsx)(s,{size:36})}),(0,Q.jsx)(`h1`,{children:`Best viewed on larger screens`}),(0,Q.jsx)(`p`,{children:`Motion Lab uses a desktop viewport for the 3D scene and pairing controls.`})]})}):(0,Q.jsxs)(`section`,{className:Ae,children:[ke&&(0,Q.jsxs)(`div`,{className:`motion-win7-window motion-pair-panel`,id:`motion-pair-panel`,children:[(0,Q.jsx)(`div`,{className:`motion-win7-glow`,"aria-hidden":`true`}),(0,Q.jsxs)(`div`,{className:`motion-win7-titlebar`,children:[(0,Q.jsxs)(`div`,{className:`motion-win7-title`,children:[(0,Q.jsx)(`span`,{className:`motion-win7-favicon accent-blue`,children:(0,Q.jsx)(s,{size:14})}),(0,Q.jsx)(`span`,{children:`Motion Lab`}),(0,Q.jsxs)(`small`,{children:[`Session `,n.toUpperCase()]})]}),(0,Q.jsx)(`div`,{className:`motion-win7-controls`,children:(0,Q.jsx)(`button`,{type:`button`,"aria-label":`Close Motion Lab pairing panel`,onClick:Me,children:(0,Q.jsx)(y,{size:14})})})]}),(0,Q.jsxs)(`div`,{className:`motion-win7-body`,children:[(0,Q.jsx)(Ln,{value:ve}),(0,Q.jsxs)(`div`,{className:`motion-url-box`,children:[(0,Q.jsx)(et,{size:15}),(0,Q.jsx)(`a`,{href:ve,target:`_blank`,rel:`noreferrer`,children:ve})]}),(0,Q.jsx)(`div`,{className:`motion-alignment-note`,children:(0,Q.jsx)(`span`,{children:`Hold the phone straight and vertical before starting sensors. The first live orientation packet becomes the sword's upright zero.`})}),(0,Q.jsxs)(`div`,{className:`motion-pair-actions`,children:[(0,Q.jsxs)(`button`,{type:`button`,className:`motion-secondary-button`,onClick:je,children:[(0,Q.jsx)(tt,{size:16}),`New session`]}),(0,Q.jsxs)(`button`,{type:`button`,className:`motion-secondary-button`,onClick:()=>se(e=>e+1),children:[(0,Q.jsx)(o,{size:16}),`Calibrate`]})]}),(0,Q.jsxs)(`div`,{className:`motion-context-list`,children:[(0,Q.jsx)(`span`,{className:Te?`ok`:`warn`,children:Te?`Trusted origin`:`HTTPS needed for phone sensors`}),(0,Q.jsx)(`span`,{children:d?.lanOrigins?.[0]?`LAN address detected`:`Using current origin`}),(0,Q.jsx)(`span`,{className:Ee?`ok`:`warn`,children:Ee?`Local relay ready`:`Relay unavailable on static hosting`})]})]})]}),(0,Q.jsxs)(`div`,{className:`motion-win7-window motion-viewport-panel`,children:[(0,Q.jsx)(`div`,{className:`motion-win7-glow`,"aria-hidden":`true`}),(0,Q.jsxs)(`div`,{className:`motion-win7-titlebar`,children:[(0,Q.jsxs)(`div`,{className:`motion-win7-title`,children:[(0,Q.jsx)(`span`,{className:`motion-win7-favicon accent-cyan`,children:(0,Q.jsx)(a,{size:14})}),(0,Q.jsx)(`span`,{children:`3D Viewport`}),(0,Q.jsx)(`small`,{children:j?`Live`:re===`unavailable`?`No relay`:re===`reconnecting`?`Waiting`:`Ready`})]}),!E&&(0,Q.jsx)(`div`,{className:`motion-win7-controls`,children:(0,Q.jsxs)(`button`,{type:`button`,className:`motion-titlebar-action`,onClick:()=>ce(!0),"aria-controls":`motion-sensor-stream`,"aria-expanded":!1,children:[(0,Q.jsx)(b,{size:13}),`Show stream`]})})]}),(0,Q.jsxs)(`div`,{className:`motion-win7-body motion-viewport-body`,children:[(0,Q.jsx)(Fn,{packetRef:pe,calibrateKey:T,onBlockScored:Pe}),(0,Q.jsxs)(`div`,{className:`motion-scene-overlay`,children:[(0,Q.jsxs)(`div`,{className:`motion-scene-left`,children:[(0,Q.jsxs)(`div`,{className:`motion-live-status`,children:[(0,Q.jsx)(`span`,{className:`motion-live-dot ${j?`live`:``}`}),(0,Q.jsx)(`strong`,{children:j?`Live`:re===`unavailable`?`No relay`:re===`reconnecting`?`Waiting`:`Ready`}),(0,Q.jsx)(`small`,{children:Number.isFinite(ye)?`${Math.round(ye)} ms ago`:re})]}),!ke&&(0,Q.jsxs)(`button`,{type:`button`,className:`motion-overlay-button`,onClick:Ne,"aria-controls":`motion-pair-panel`,"aria-expanded":`false`,children:[(0,Q.jsx)(s,{size:15}),`Show QR`]})]}),(0,Q.jsxs)(`div`,{className:`motion-scene-actions`,children:[(0,Q.jsxs)(`div`,{className:`motion-scoreboard`,"aria-label":`Cube score`,children:[(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`small`,{children:`Hits`}),(0,Q.jsx)(`strong`,{children:k.hits})]}),(0,Q.jsxs)(`span`,{children:[(0,Q.jsx)(`small`,{children:`Hit %`}),(0,Q.jsx)(`strong`,{children:Oe===null?`--`:`${Oe}%`})]})]}),(0,Q.jsxs)(`div`,{className:`motion-scene-readout`,children:[(0,Q.jsxs)(`span`,{children:[`Hz `,ae]}),(0,Q.jsxs)(`span`,{children:[`Packets `,C]})]})]})]})]})]}),E&&(0,Q.jsxs)(`div`,{className:`motion-win7-window motion-data-panel`,id:`motion-sensor-stream`,children:[(0,Q.jsx)(`div`,{className:`motion-win7-glow`,"aria-hidden":`true`}),(0,Q.jsxs)(`div`,{className:`motion-win7-titlebar`,children:[(0,Q.jsxs)(`div`,{className:`motion-win7-title`,children:[(0,Q.jsx)(`span`,{className:`motion-win7-favicon accent-violet`,children:(0,Q.jsx)(b,{size:14})}),(0,Q.jsx)(`span`,{children:`Sensor Stream`}),(0,Q.jsx)(`small`,{children:x?.seen?.orientation||x?.seen?.motion?`Phone sensors active`:`No phone packets yet`})]}),(0,Q.jsx)(`div`,{className:`motion-win7-controls`,children:(0,Q.jsx)(`button`,{type:`button`,"aria-label":`Close`,className:`motion-win7-close`,onClick:()=>ce(!1),children:(0,Q.jsx)(ne,{size:14})})})]}),(0,Q.jsx)(`div`,{className:`motion-win7-body`,children:(0,Q.jsxs)(`div`,{className:`motion-telemetry-grid`,children:[(0,Q.jsx)(v,{label:`Orientation`,value:`${l(be.alpha)} deg`,detail:`beta ${l(be.beta)} / gamma ${l(be.gamma)}`,icon:(0,Q.jsx)(o,{size:16})}),(0,Q.jsx)(v,{label:`Accel`,value:m(Se),detail:`m/s2, linear`,icon:(0,Q.jsx)(i,{size:16})}),(0,Q.jsx)(v,{label:`Gravity`,value:m(Ce),detail:`m/s2, total`,icon:(0,Q.jsx)(nt,{size:16})}),(0,Q.jsx)(v,{label:`Gyro`,value:`${l(we?.alpha)} / ${l(we?.beta)} / ${l(we?.gamma)}`,detail:`deg/s alpha beta gamma`,icon:(0,Q.jsx)(a,{size:16})})]})})]})]})};export{zn as default};