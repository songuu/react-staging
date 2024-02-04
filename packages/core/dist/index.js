#!/usr/bin/env node
import*as e from"node:fs";import t from"node:fs";import*as n from"node:path";import i from"ejs";import s from"minimist";import o from"prompts";import{grey as r,red as c}from"kleur/colors";import{pathToFileURL as a}from"node:url";import l from"path";import{fileURLToPath as p}from"url";const m="yes",f="no";function y(t,i,s){for(const o of e.readdirSync(t)){if(".git"===o)continue;const r=n.resolve(t,o);e.lstatSync(r).isDirectory()?(i(r),e.existsSync(r)&&y(r,i,s)):s(r)}}function u(t,i,s){for(const o of e.readdirSync(t)){if(".git"===o)continue;const r=n.resolve(t,o);e.lstatSync(r).isDirectory()?(u(r,i,s),i(r)):s(r)}}const d=e=>e&&"object"==typeof e,g=(e,t)=>Array.from(new Set([...e,...t]));function v(e,t){for(const n of Object.keys(t)){const i=e[n],s=t[n];Array.isArray(i)&&Array.isArray(s)?e[n]=g(i,s):d(i)&&d(s)?e[n]=v(i,s):e[n]=s}return e}function S(t,i,s){if(e.statSync(t).isDirectory()){if("node_modules"===n.basename(t))return;e.mkdirSync(i,{recursive:!0});for(const o of e.readdirSync(t))S(n.resolve(t,o),n.resolve(i,o),s);return}const o=n.basename(t);if("package.json"===o&&e.existsSync(i)){const n=function(e){const t={},n=["dependencies","devDependencies","peerDependencies","optionalDependencies"];for(const i of n)e[i]&&(t[i]={},Object.keys(e[i]).sort().forEach((n=>{t[i][n]=e[i][n]})));return{...e,...t}}(v(JSON.parse(e.readFileSync(i,"utf8")),JSON.parse(e.readFileSync(t,"utf8"))));e.writeFileSync(i,JSON.stringify(n,null,2)+"\n")}else if(o.startsWith("_")&&(i=n.resolve(n.dirname(i),o.replace(/^_/,"."))),"_gitignore"===o&&e.existsSync(i)){const n=e.readFileSync(i,"utf8"),s=e.readFileSync(t,"utf8");e.writeFileSync(i,n+"\n"+s)}else{if(o.endsWith(".data.mjs"))return i=i.replace(/\.data\.mjs$/,""),void s.push((async e=>{const n=(await import(a(t).toString())).default;e[i]=await n({oldData:e[i]||{}})}));e.copyFileSync(t,i)}}const h=p(import.meta.url),j=l.dirname(h);function k(t){e.existsSync(t)&&u(t,(t=>e.rmdirSync(t)),(t=>e.unlinkSync(t)))}t.realpathSync(process.cwd()),async function(){console.log(`${r("create-staging")}`);const t=process.cwd(),a=s(process.argv.slice(2),{alias:{force:"f",help:"h",version:"v",ts:"typescript",eslint:"e",prettier:"p",husky:"h","lint-staged":"ls","unit-testing":"ut",jest:"j",vitest:"v"},string:["_"],boolean:!0});let l=a._[0];const p=l||"new-project",u=a.force||a.f,d="boolean"==typeof(a.ts||a.typescript||a.eslint||a.prettier||a.husky||a["lint-staged"]||a["unit-testing"]||a.jest||a.vitest);let g={};try{g=await o([{name:"projectName",type:l?null:"text",message:"Project name:",initial:p,onState:e=>l=String(e.value).trim()||p},{name:"needsTypeScript",type:()=>d?null:"toggle",message:"Use TypeScript?",initial:f,active:m,inactive:f},{name:"needsEslint",type:()=>d?null:"toggle",message:"Use ESLint?",initial:f,active:m,inactive:f},{name:"needsPrettier",type:()=>d?null:"toggle",message:"Use Prettier?",initial:f,active:m,inactive:f},{name:"needsHusky",message:"Use Husky?",type:()=>d?null:"toggle",initial:f,active:m,inactive:f},{name:"needsLintStaged",type:()=>d?null:"toggle",message:"Use lint-staged?",initial:f,active:m,inactive:f},{name:"needsUnitTesting",type:()=>d?null:"select",message:"Use unit testing?",hint:"choose a testing framework",initial:0,choices:()=>[{title:"No",value:!1},{title:"Jest",value:"Jest"},{title:"Vitest",value:"Vitest"}]},{name:"managementTool",type:()=>d?null:"select",message:"Use management tool?recommend pnpm.",hint:"choose a management tool",initial:0,choices:()=>[{title:"pnpm",value:"pnpm"},{title:"yarn",value:"yarn"},{title:"npm",value:"npm"}]},{name:"buildTool",type:()=>d?null:"select",message:"Use build tool?recommend vite.",hint:"choose a build tool",initial:0,choices:()=>[{title:"vite",value:"vite"},{title:"webpack",value:"webpack"},{title:"rollup",value:"rollup"}]}])}catch(e){console.log(c("\nOperation cancelled.")),process.exit(1)}const v=g.projectName||p,h=a.ts||a.typescript||g.needsTypeScript;a.eslint||g.needsEslint,a.prettier||g.needsPrettier,a.husky||g.needsHusky,a["lint-staged"]||g.needsLintStaged;const w=a["unit-testing"]||g.needsUnitTesting,b=a.jest||g.needsJest,F=a.vitest||g.needsVitest;g.managementTool,g.buildTool;const U=n.join(t,l);u&&e.existsSync(U)?k(U):e.existsSync(U)||e.mkdirSync(U);const T={name:v,version:"1.0.0"};e.writeFileSync(n.resolve(U,"package.json"),JSON.stringify(T,null,2));const x=n.resolve(j,"templates"),J=[],N=function(e){S(n.resolve(x,e),U,J)};if(N("base"),h){N("config/typescript"),N("tsconfig/base");const t={files:[],references:[{path:"./tsconfig.node.json"},{path:"./tsconfig.app.json"}]};b&&(N("tsconfig/jest"),t.references.push({path:"./tsconfig.jest.json"})),F&&(N("tsconfig/vitest"),t.references.push({path:"./tsconfig.vitest.json"})),e.writeFileSync(n.resolve(U,"tsconfig.json"),JSON.stringify(t,null,2)+"\n","utf-8")}w&&(b?N("jest"):F&&N("config/vitest"));const O={};for(const e of J)await e(O);y(U,(()=>{}),(t=>{if(t.endsWith(".ejs")){const n=e.readFileSync(t,"utf-8"),s=t.replace(/\.ejs$/,""),o=i.render(n,O[s]);e.writeFileSync(s,o),e.unlinkSync(t)}}))}().catch((e=>{console.error(e)}));
