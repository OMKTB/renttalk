const BLOB = "https://jsonblob.com/api/jsonBlob/019d3aec-1fd0-7391-86f3-9e085eba2130";
exports.handler = async (event) => {
  const h = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Content-Type":"application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:h,body:""};
  if (event.httpMethod === "GET") { const r = await fetch(BLOB,{headers:{"Content-Type":"application/json","Accept":"application/json"}}); const d = await r.json(); return {statusCode:200,headers:h,body:JSON.stringify(d)}; }
  if (event.httpMethod === "POST") { const n = JSON.parse(event.body); const r = await fetch(BLOB,{headers:{"Content-Type":"application/json","Accept":"application/json"}}); const d = await r.json(); const rs = Array.isArray(d.responses)?d.responses:[]; rs.push({...n,ts:Date.now()}); await fetch(BLOB,{method:"PUT",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({responses:rs})}); return {statusCode:200,headers:h,body:JSON.stringify({ok:true,count:rs.length})}; }
  if (event.httpMethod === "DELETE") { await fetch(BLOB,{method:"PUT",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({responses:[]})}); return {statusCode:200,headers:h,body:JSON.stringify({ok:true})}; }
  return {statusCode:405,headers:h,body:"{}"};
};
