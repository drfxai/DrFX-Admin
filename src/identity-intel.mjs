/**
 * DrFX Admin Identity Intelligence (best-effort, not exhaustive).
 * Never infer trading prices from detected identifiers or image OCR.
 */
const PATTERNS=[
 ['email',/[\w.+%-]+@[\w.-]+\.[A-Za-z]{2,24}/gi],
 ['link',/(?:https?:\/\/|www\.|t\.me\/|telegram\.me\/|wa\.me\/)[^\s<>"'()[\]{}]+/gi],
 ['domain',/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|info|io|co|me|app|site|ai|dev|xyz|company|online|ir|uk|ae|tv|gg|cc|link|ly|pro|biz)(?:\/[^\s<>"'()[\]{}]*)?/gi],
 ['handle',/@[A-Za-z][A-Za-z0-9_.]{2,31}\b/g],
 ['phone',/(?:\+\d[\d ().-]{7,18}\d|\b0\d{9,12}\b)/g],
 ['numeric_id',/\b(?:telegram|channel|chat|user|account)\s*(?:id|شناسه)\s*[:：#]?\s*-?\d{7,18}\b/gi]
];
const cleanTail=x=>String(x).replace(/[.,;:!؟،؛]+$/u,'');
function identifierOwn(type,value,{handle='@DrFXAi',website='https://drfx.company'}={}){
 const h=String(handle||'@DrFXAi').toLowerCase().replace(/^@/,'');
 const site=String(website||'https://drfx.company').toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
 const v=String(value).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'');
 if(type==='handle'||type==='email')return type==='handle'&&v==='@'+h;
 if(type==='phone'||type==='numeric_id')return false;
 if(/^(?:t\.me|telegram\.me)\//.test(v))return v.replace(/^(?:t\.me|telegram\.me)\//,'').replace(/^@/,'').split(/[/?#]/)[0]===h;
 return !!site&&(v===site||v.startsWith(site+'/')||v.startsWith(site+'?')||v.startsWith(site+'#'));
}
export function detectIdentifiers(text,options={}){
 const input=String(text??'').slice(0,9000).replace(/[\u200b\u200c\u200d\u2060]/g,'');
 const matches=[];
 for(const [type,re] of PATTERNS){
  re.lastIndex=0;
  for(const match of input.matchAll(re)){
   const value=cleanTail(match[0]);if(!value)continue;
   const start=match.index,end=start+value.length;
   matches.push({type,value,start,end,own:identifierOwn(type,value,options)});
   if(matches.length>=120)break;
  }
 }
 const priority={email:0,link:1,domain:2,numeric_id:3,handle:4,phone:5};
 matches.sort((a,b)=>a.start-b.start||priority[a.type]-priority[b.type]||b.end-a.end);
 const out=[];
 for(const x of matches){if(out.some(p=>p.start<x.end&&x.start<p.end))continue;out.push(x);if(out.length>=32)break;}
 return out;
}
export function cleanExternalIdentifiers(text,options={}){
 let result=String(text??'');
 const ids=detectIdentifiers(result,options).filter(x=>!x.own);
 for(const id of ids.reverse())result=result.slice(0,id.start)+' '+result.slice(id.end);
 return result.replace(/[ \t]{2,}/g,' ').replace(/[ \t]+(?=\n)/g,'');
}
