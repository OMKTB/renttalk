const{connectLambda,getStore}=require("@netlify/blobs");
const C={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","Content-Type":"application/json"};

exports.handler=async(event)=>{
  connectLambda(event);
  const store=getStore({name:"renttalk-survey"});

  if(event.httpMethod==="OPTIONS") return{statusCode:200,headers:C,body:""};

  // GET — read all responses
  if(event.httpMethod==="GET"){
    try{
      const d=await store.get("responses",{type:"json"});
      return{statusCode:200,headers:C,body:JSON.stringify({responses:d||[]})};
    }catch(e){
      return{statusCode:200,headers:C,body:JSON.stringify({responses:[]})};
    }
  }

  // PUT — atomic full replace (used for seeding / bulk restore)
  if(event.httpMethod==="PUT"){
    try{
      const body=JSON.parse(event.body);
      const arr=body.responses||body;
      await store.setJSON("responses",arr);
      return{statusCode:200,headers:C,body:JSON.stringify({ok:true,count:arr.length})};
    }catch(e){
      return{statusCode:500,headers:C,body:JSON.stringify({error:e.message})};
    }
  }

  // POST — append one response
  if(event.httpMethod==="POST"){
    try{
      const nr=JSON.parse(event.body);
      let ex=[];
      try{ex=await store.get("responses",{type:"json"})||[];}catch(e){ex=[];}
      ex.push(nr);
      await store.setJSON("responses",ex);
      return{statusCode:200,headers:C,body:JSON.stringify({ok:true,count:ex.length})};
    }catch(e){
      return{statusCode:500,headers:C,body:JSON.stringify({error:e.message})};
    }
  }

  // DELETE — clear all
  if(event.httpMethod==="DELETE"){
    try{
      await store.setJSON("responses",[]);
      return{statusCode:200,headers:C,body:JSON.stringify({ok:true})};
    }catch(e){
      return{statusCode:500,headers:C,body:JSON.stringify({error:e.message})};
    }
  }

  return{statusCode:405,headers:C,body:"{}"};
};
