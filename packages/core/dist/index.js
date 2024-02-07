#!/usr/bin/env node
import*as e from"node:fs";import t from"node:fs";import*as n from"node:path";import s from"ejs";import i from"minimist";import o from"prompts";import{grey as c,red as a,cyan as l,bold as r,green as p}from"kleur/colors";import{pathToFileURL as m}from"node:url";import u from"path";import{fileURLToPath as f}from"url";const d="yes",y="no";function g(t,s,i){for(const o of e.readdirSync(t)){if(".git"===o)continue;const c=n.resolve(t,o);e.lstatSync(c).isDirectory()?(s(c),e.existsSync(c)&&g(c,s,i)):i(c)}}function v(t,s,i){for(const o of e.readdirSync(t)){if(".git"===o)continue;const c=n.resolve(t,o);e.lstatSync(c).isDirectory()?(v(c,s,i),s(c)):i(c)}}const S=e=>e&&"object"==typeof e,h=(e,t)=>Array.from(new Set([...e,...t]));function j(e,t){for(const n of Object.keys(t)){const s=e[n],i=t[n];Array.isArray(s)&&Array.isArray(i)?e[n]=h(s,i):S(s)&&S(i)?e[n]=j(s,i):e[n]=i}return e}function w(t,s,i,o){if(e.statSync(t).isDirectory()){if("node_modules"===n.basename(t))return;e.mkdirSync(s,{recursive:!0});for(const c of e.readdirSync(t))w(n.resolve(t,c),n.resolve(s,c),i,o);return}const c=n.basename(t);if("package.json"===c&&e.existsSync(s)){const n=function(e){const t={},n=["dependencies","devDependencies","peerDependencies","optionalDependencies"];for(const s of n)e[s]&&(t[s]={},Object.keys(e[s]).sort().forEach((n=>{t[s][n]=e[s][n]})));return{...e,...t}}(j(JSON.parse(e.readFileSync(s,"utf8")),JSON.parse(e.readFileSync(t,"utf8"))));e.writeFileSync(s,JSON.stringify(n,null,2)+"\n")}else if(c.startsWith("_")&&(s=n.resolve(n.dirname(s),c.replace(/^_/,"."))),"_gitignore"===c&&e.existsSync(s)){const n=e.readFileSync(s,"utf8"),i=e.readFileSync(t,"utf8");e.writeFileSync(s,n+"\n"+i)}else{if(c.endsWith(".data.mjs"))return s=s.replace(/\.data\.mjs$/,""),void i.push((async e=>{const n=(await import(m(t).toString())).default;e[s]=await n({oldData:e[s]||{},deps:JSON.parse(o)})}));e.copyFileSync(t,s)}}const k=f(import.meta.url),b=u.dirname(k);function F(e,t,n){return"install"===t?"yarn"===e?"yarn":`${e} install`:n?"npm"===e?`npm run ${t} -- ${n}`:`${e} ${t} ${n}`:"npm"===e?`npm run ${t}`:`${e} ${t}`}function $(t){e.existsSync(t)&&v(t,(t=>e.rmdirSync(t)),(t=>e.unlinkSync(t)))}t.realpathSync(process.cwd()),async function(){console.log(`${c("create-staging")}`);const t=process.cwd(),m=i(process.argv.slice(2),{alias:{force:"f",help:"h",version:"v",ts:"typescript",eslint:"e",prettier:"p",husky:"h","lint-staged":"ls","unit-testing":"ut",jest:"j",vitest:"v"},string:["_"],boolean:!0});let u=m._[0];const f=u||"new-project",v=m.force||m.f,S="boolean"==typeof(m.ts||m.typescript||m.eslint||m.prettier||m.husky||m["lint-staged"]||m["unit-testing"]||m.jest||m.vitest);let h={};try{h=await o([{name:"projectName",type:u?null:"text",message:"Project name:",initial:f,onState:e=>u=String(e.value).trim()||f},{name:"needsTypeScript",type:()=>S?null:"toggle",message:"Use TypeScript?",initial:y,active:d,inactive:y},{name:"needsEslint",type:()=>S?null:"toggle",message:"Use ESLint?",initial:y,active:d,inactive:y},{name:"needsPrettier",type:()=>S?null:"toggle",message:"Use Prettier?",initial:y,active:d,inactive:y},{name:"needsHusky",message:"Use Husky?",type:()=>S?null:"toggle",initial:y,active:d,inactive:y},{name:"needsLintStaged",type:()=>S?null:"toggle",message:"Use lint-staged?",initial:y,active:d,inactive:y},{name:"needsUnitTesting",type:()=>S?null:"select",message:"Use unit testing?",hint:"choose a testing framework",initial:0,choices:()=>[{title:"No",value:!1},{title:"Jest",value:"Jest"},{title:"Vitest",value:"Vitest"}]},{name:"managementTool",type:()=>S?null:"select",message:"Use management tool?recommend pnpm.",hint:"choose a management tool",initial:0,choices:()=>[{title:"pnpm",value:"pnpm"},{title:"yarn",value:"yarn"},{title:"npm",value:"npm"}]},{name:"buildTool",type:()=>S?null:"select",message:"Use build tool?recommend vite.",hint:"choose a build tool",initial:0,choices:()=>[{title:"vite",value:"vite"},{title:"webpack",value:"webpack"},{title:"rollup",value:"rollup"}]},{name:"atomizationcss",type:()=>S?null:"select",message:"Use atomization css?",hint:"choose a atomization css",initial:0,choices:()=>[{title:"No",value:!1},{title:"tailwindcss",value:"tailwindcss"},{title:"windicss",value:"windicss"},{title:"unocss",value:"unocss"}]}])}catch(e){console.log(a("\nOperation cancelled.")),process.exit(1)}const j=h.projectName||f,k=m.ts||m.typescript||h.needsTypeScript;m.eslint||h.needsEslint;const N=m.prettier||h.needsPrettier;m.husky||h.needsHusky,m["lint-staged"]||h.needsLintStaged;const T=m["unit-testing"]||h.needsUnitTesting,U=m.jest||h.needsJest,x=m.vitest||h.needsVitest,J=h.managementTool||"pnpm",O=h.buildTool||"vite",D=h.atomizationcss||!1,_=n.join(t,u);v&&e.existsSync(_)?$(_):e.existsSync(_)||e.mkdirSync(_);const A={name:j,version:"1.0.0"};e.writeFileSync(n.resolve(_,"package.json"),JSON.stringify(A,null,2));const W=n.resolve(b,"templates"),z=[],E=function(e){w(n.resolve(W,e),_,z,JSON.stringify(h))};if(E("base"),k){E("config/typescript"),E("tsconfig/base");const t={files:[],references:[{path:"./tsconfig.node.json"},{path:"./tsconfig.app.json"}]};U&&(E("tsconfig/jest"),t.references.push({path:"./tsconfig.jest.json"})),x&&(E("tsconfig/vitest"),t.references.push({path:"./tsconfig.vitest.json"})),e.writeFileSync(n.resolve(_,"tsconfig.json"),JSON.stringify(t,null,2)+"\n","utf-8")}if(T&&(U?E("config/jest"):x&&E("config/vitest")),D)switch(D){case"tailwindcss":E("config/tailwindcss"),E("entry/tailwindcss");break;case"windicss":E("config/windicss"),E("windicss/base");break;case"unocss":E("config/unocss"),E("unocss")}switch(E("entry/default"),E("code/router"),O){case"vite":E("config/vite"),E("vite");break;case"webpack":E("config/webpack"),E("webpack/base");break;case"rollup":E("config/rollup"),E("rollup")}const P={};for(const e of z)await e(P);if(g(_,(()=>{}),(t=>{if(t.endsWith(".ejs")){const n=e.readFileSync(t,"utf-8"),i=t.replace(/\.ejs$/,"");let o="";o=i.includes("html")?s.render(n,{title:j,buildTool:O,needsTypeScript:k}):s.render(n,P[i]),e.writeFileSync(i,o),e.unlinkSync(t)}})),k){g(_,(e=>{}),(t=>{if(t.endsWith(".js")){const n=t.replace(/\.js$/,".ts");e.existsSync(n)?e.unlinkSync(t):e.renameSync(t,n)}else"jsconfig.json"===n.basename(t)&&e.unlinkSync(t)}));const t=n.resolve(_,"index.html"),s=e.readFileSync(t,"utf8");e.writeFileSync(t,s.replace("src/main.js","src/main.ts"))}else g(_,(()=>{}),(t=>{t.endsWith(".ts")&&e.unlinkSync(t)}));t!==_&&console.log(l("cd"),n.relative(t,_)),console.log(r(p(F(J,"install")))),N&&console.log(r(p(F(J,"format")))),console.log(r(p(F(J,"dev")))),console.log()}().catch((e=>{console.error(e)}));
