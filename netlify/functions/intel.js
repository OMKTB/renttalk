const{connectLambda,getStore}=require("@netlify/blobs");
const C={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Content-Type":"application/json"};

exports.handler=async(event)=>{
  connectLambda(event);
  const store=getStore({name:"renttalk-intel"});

  if(event.httpMethod==="OPTIONS") return{statusCode:200,headers:C,body:""};

  if(event.httpMethod==="GET"){
    try{
      let s=null,p=null,l=null;
      try{s=await store.get("scans",{type:"json"});}catch(e){}
      try{p=await store.get("intel_package",{type:"json"});}catch(e){}
      try{l=await store.get("lastRun",{type:"json"});}catch(e){}
      return{statusCode:200,headers:C,body:JSON.stringify({scans:s||[],lastRun:l,intel_package:p})};
    }catch(e){
      return{statusCode:200,headers:C,body:JSON.stringify({scans:[],lastRun:null,intel_package:null})};
    }
  }

  if(event.httpMethod==="POST"){
    try{
      const b=JSON.parse(event.body||"{}");
      if(b.intel_package){
        await store.setJSON("intel_package",b.intel_package);
        return{statusCode:200,headers:C,body:JSON.stringify({ok:true,updated:"intel_package"})};
      }
      if(b.scan){
        let ex=[];
        try{ex=await store.get("scans",{type:"json"})||[];}catch(e){ex=[];}
        ex.push(b.scan);
        while(ex.length>50)ex.shift();
        await store.setJSON("scans",ex);
        await store.setJSON("lastRun",new Date().toISOString());
        return{statusCode:200,headers:C,body:JSON.stringify({ok:true,scans:ex.length})};
      }
      if(b.social_scans||b.alerts||b.agencies){
        if(b.social_scans)await store.setJSON("social_scans",b.social_scans);
        if(b.alerts)await store.setJSON("alerts",b.alerts);
        if(b.agencies)await store.setJSON("agencies",b.agencies);
        return{statusCode:200,headers:C,body:JSON.stringify({ok:true})};
      }
      return{statusCode:200,headers:C,body:JSON.stringify({ok:true})};
    }catch(e){
      return{statusCode:500,headers:C,body:JSON.stringify({error:e.message})};
    }
  }

  return{statusCode:405,headers:C,body:"{}"};
};
