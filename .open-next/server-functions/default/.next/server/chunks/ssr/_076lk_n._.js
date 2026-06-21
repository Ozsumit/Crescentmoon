module.exports=[37936,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(11857)},13095,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})},53678,a=>{"use strict";var b=a.i(37936);async function c(a){return console.info("Feedback received locally:",{type:a.type,rating:a.rating,hasMessage:!!a.message,hasEmail:!!a.email}),{success:!0,message:"Transmission received."}}(0,a.i(13095).ensureServerEntryExports)([c]),(0,b.registerServerReference)(c,"400456721cc96848c1e054957744585ce34e622b22",null),a.s(["submitFeedback",0,c])},61137,a=>{"use strict";var b=a.i(37936),c=a.i(97729);a.i(91455);var d=a.i(82555),e=a.i(18558);async function f(){return await c.sql`
    SELECT *
    FROM "Feedback"
    ORDER BY "createdAt" DESC
  `}async function g(a){await c.sql`
    DELETE FROM "Feedback"
    WHERE id = ${a}
  `,(0,e.revalidatePath)("/abmin")}async function h(a){try{if("movie"===a||"tv"===a)return await c.sql`
        SELECT *
        FROM "VideoSource"
        WHERE active = true
          AND type = ${a}
        ORDER BY priority DESC
      `;return await c.sql`
      SELECT *
      FROM "VideoSource"
      WHERE active = true
      ORDER BY priority DESC
    `}catch(a){return console.error("Failed to fetch video sources:",a),[]}}async function i(a){return await (0,e.unstable_cache)(async()=>h(a),["video-sources",a||"all"],{tags:["video-sources",`video-sources-${a||"all"}`],revalidate:3600})()}async function j(a){let{id:b,...f}=a;if(b)await c.sql`
      UPDATE "VideoSource"
      SET
        name = ${f.name},
        url = ${f.url},
        params = ${f.params??null},
        type = ${f.type},
        priority = ${f.priority},
        active = ${f.active},
        icon = ${f.icon??null},
        features = ${JSON.stringify(f.features??null)},
        description = ${f.description??null},
        download = ${f.download??!1},
        "parseUrl" = ${f.parseUrl??!1},
        "paramStyle" = ${f.paramStyle??"query"},
        "updatedAt" = NOW()
      WHERE id = ${b}
    `;else{let a=(0,d.createId)();await c.sql`
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
        ${a},
        ${f.name},
        ${f.url},
        ${f.params??null},
        ${f.type},
        ${f.priority??0},
        ${f.active??!0},
        ${f.icon??null},
        ${JSON.stringify(f.features??null)},
        ${f.description??null},
        ${f.download??!1},
        ${f.parseUrl??!1},
        ${f.paramStyle??"query"},
        NOW(),
        NOW()
      )
    `}(0,e.revalidatePath)("/abmin"),(0,e.revalidateTag)("video-sources")}async function k(a){await c.sql`
    DELETE FROM "VideoSource"
    WHERE id = ${a}
  `,(0,e.revalidatePath)("/abmin"),(0,e.revalidateTag)("video-sources")}async function l(){for(let a of[])if(0===(await c.sql`
      SELECT id
      FROM "VideoSource"
      WHERE name = ${a.name}
        AND type = ${a.type}
      LIMIT 1
    `).length){let b=(0,d.createId)();await c.sql`
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
          ${b},
          ${a.name},
          ${a.url},
          ${a.params??null},
          ${a.type},
          ${a.priority??0},
          ${a.active??!0},
          ${a.icon??null},
          ${JSON.stringify(a.features??null)},
          ${a.description??null},
          ${a.download??!1},
          ${a.parseUrl??!1},
          ${a.paramStyle??"query"},
          NOW(),
          NOW()
        )
      `}(0,e.revalidatePath)("/abmin"),(0,e.revalidateTag)("video-sources")}(0,a.i(13095).ensureServerEntryExports)([f,g,i,j,k,l]),(0,b.registerServerReference)(f,"00721b3853858af2791b0a4d6faca242b4b1cb7cce",null),(0,b.registerServerReference)(g,"40b86f7cd70eecd1e6e7cd4fa25c860f7477385bc1",null),(0,b.registerServerReference)(i,"40e3d0096d8d0dc74020e530ba49e1bcdd25aae042",null),(0,b.registerServerReference)(j,"401e01149a01946e884e8ea59c656e021af92f0b3a",null),(0,b.registerServerReference)(k,"405be4ad5f9a069c9b3e9a585e5196825e2e754d1b",null),(0,b.registerServerReference)(l,"009ab9888d632cb3c124d0b7afec92faa10615feda",null),a.s(["deleteFeedback",0,g,"deleteVideoSource",0,k,"getFeedback",0,f,"getVideoSources",0,i,"saveVideoSource",0,j,"seedVideoSources",0,l])},66297,a=>{"use strict";var b=a.i(53678),c=a.i(61137);a.s([],73670),a.i(73670),a.s(["00721b3853858af2791b0a4d6faca242b4b1cb7cce",()=>c.getFeedback,"009ab9888d632cb3c124d0b7afec92faa10615feda",()=>c.seedVideoSources,"400456721cc96848c1e054957744585ce34e622b22",()=>b.submitFeedback,"401e01149a01946e884e8ea59c656e021af92f0b3a",()=>c.saveVideoSource,"405be4ad5f9a069c9b3e9a585e5196825e2e754d1b",()=>c.deleteVideoSource,"40b86f7cd70eecd1e6e7cd4fa25c860f7477385bc1",()=>c.deleteFeedback,"40e3d0096d8d0dc74020e530ba49e1bcdd25aae042",()=>c.getVideoSources],66297)}];

//# sourceMappingURL=_076lk_n._.js.map