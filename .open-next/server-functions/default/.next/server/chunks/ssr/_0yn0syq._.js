module.exports=[37936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(11857)},13095,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})},53678,a=>{"use strict";var b=a.i(37936);async function c(a){return console.info("Feedback received locally:",{type:a.type,rating:a.rating,hasMessage:!!a.message,hasEmail:!!a.email}),{success:!0,message:"Transmission received."}}(0,a.i(13095).ensureServerEntryExports)([c]),(0,b.registerServerReference)(c,"400456721cc96848c1e054957744585ce34e622b22",null),a.s(["submitFeedback",0,c])},16785,a=>{"use strict";var b=a.i(37936),c=a.i(97729);a.i(91455);var d=a.i(82555),e=a.i(18558),f=a.i(13095);async function g(){try{return await c.sql`
      SELECT *
      FROM "Feedback"
      ORDER BY "createdAt" DESC
    `}catch(a){throw console.error("Error fetching feedback:",a),Error("Could not retrieve feedback data.")}}async function h(a){if(!a)return{success:!1,error:"ID parameter is required."};try{return await c.sql`
      DELETE FROM "Feedback"
      WHERE id = ${a}
    `,(0,e.revalidatePath)("/abmin"),{success:!0}}catch(a){return console.error("Error deleting feedback:",a),{success:!1,error:"Could not execute deletion query."}}}async function i(a){try{if(a)return await c.sql`
        SELECT *
        FROM "VideoSource"
        WHERE type = ${a}
        ORDER BY priority DESC
      `;return await c.sql`
      SELECT *
      FROM "VideoSource"
      ORDER BY priority DESC
    `}catch(a){throw console.error("Error fetching video sources:",a),Error("Could not retrieve video sources list.")}}async function j(a){try{if(!a||"object"!=typeof a)return{success:!1,error:"Invalid database payload."};let b=a.id,f=a.name?.trim()||"Unnamed Source",g=a.url?.trim()||"",h=a.params?.trim()||null,i="tv"===a.type?"tv":"movie",j=Number.isInteger(Number(a.priority))?Number(a.priority):0,k=!1!==a.active,l=a.icon?.trim()||"Play",m=a.description?.trim()||null,n=!!a.download,o=!!a.parseUrl,p=["query","path-slash","path-hyphen-mapi","cinesrc"].includes(a.paramStyle)?a.paramStyle:"query",q=[];Array.isArray(a.features)?q=a.features.filter(a=>"string"==typeof a&&""!==a.trim()):"string"==typeof a.features&&(q=a.features.split(",").map(a=>a.trim()).filter(Boolean));let r=JSON.stringify(q);if(!g)return{success:!1,error:"Base player URL is required."};return b?await c.sql`
        UPDATE "VideoSource"
        SET
          name = ${f},
          url = ${g},
          params = ${h},
          type = ${i},
          priority = ${j},
          active = ${k},
          icon = ${l},
          features = ${r},
          description = ${m},
          download = ${n},
          "parseUrl" = ${o},
          "paramStyle" = ${p},
          "updatedAt" = NOW()
        WHERE id = ${b}
      `:await c.sql`
        INSERT INTO "VideoSource" (
          id,
          name,
          url,
          params,
          type,
          priority,
          active,
          icon,
          features,
          description,
          download,
          "parseUrl",
          "paramStyle",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${(0,d.createId)()},
          ${f},
          ${g},
          ${h},
          ${i},
          ${j},
          ${k},
          ${l},
          ${r},
          ${m},
          ${n},
          ${o},
          ${p},
          NOW(),
          NOW()
        )
      `,(0,e.revalidatePath)("/abmin"),{success:!0}}catch(a){return console.error("Error saving video source:",a),{success:!1,error:"Database operation transaction failed."}}}async function k(a){if(!a)return{success:!1,error:"ID parameter is required."};try{return await c.sql`
      DELETE FROM "VideoSource"
      WHERE id = ${a}
    `,(0,e.revalidatePath)("/abmin"),{success:!0}}catch(a){return console.error("Error deleting video source:",a),{success:!1,error:"Could not execute deletion query."}}}process.env.ANALYTICS_TIMEZONE,(0,f.ensureServerEntryExports)([g,h,i,j,k]),(0,b.registerServerReference)(g,"0082a706c549a5ba5926d7cdd7223ffb5012f756a7",null),(0,b.registerServerReference)(h,"409c1b464a49147ba6976b4d387b23043a255d1d64",null),(0,b.registerServerReference)(i,"4057acf15edd365e58b628753cbc738f230be569ec",null),(0,b.registerServerReference)(j,"40499cceec8cf9021dc51314ec0a8ce6b35845fe89",null),(0,b.registerServerReference)(k,"40a3541bf453330e3b331813607a699fc0dddf76ed",null),a.s(["deleteFeedback",0,h,"deleteVideoSource",0,k,"getFeedback",0,g,"getVideoSources",0,i,"saveVideoSource",0,j])},46860,a=>{"use strict";var b=a.i(53678),c=a.i(16785);a.s([],27198),a.i(27198),a.s(["0082a706c549a5ba5926d7cdd7223ffb5012f756a7",()=>c.getFeedback,"400456721cc96848c1e054957744585ce34e622b22",()=>b.submitFeedback,"40499cceec8cf9021dc51314ec0a8ce6b35845fe89",()=>c.saveVideoSource,"4057acf15edd365e58b628753cbc738f230be569ec",()=>c.getVideoSources,"409c1b464a49147ba6976b4d387b23043a255d1d64",()=>c.deleteFeedback,"40a3541bf453330e3b331813607a699fc0dddf76ed",()=>c.deleteVideoSource],46860)}];

//# sourceMappingURL=_0yn0syq._.js.map