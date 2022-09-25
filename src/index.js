import brand_traits from "../data/brand_traits.json";

addEventListener("fetch", (event) => {
  event.respondWith(
    handleRequest(event.request).catch(
      (err) => new Response(err.stack, {
        status: 500
      })
    )
  );
});

const UA = "Mozilla/5.0 (compatible; GearsToRSS/0.0; +https://gist.github.com/iovxw/a726c8322f7663e1b810963903579796)";

const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  hour: "numeric",
  hour12: false,
  weekday: "long",
  timeZone: "Asia/Shanghai",
});

async function handleRequest(request) {
  const {
    origin,
    pathname,
  } = new URL(request.url);

  if (pathname.startsWith("/limitedGears")) {
    const resp = await fetch("https://splatoon3.ink/data/gear.json", {
      headers: {
        "User-Agent": UA,
      }
    });
    const data = await resp.json();
    const sales = data.data.gesotown.limitedGears;
    let items = "";
    for (const sale of sales) {
      const powers = [sale.gear.primaryGearPower, ...sale.gear.additionalGearPowers].map((power) => power.name);
      const brand = sale.gear.brand.name;
      const brand_info = brand_traits[brand];
      const end = Date.parse(sale.saleEndTime);
      items += `<item>
  <title>${sale.gear.name}</title>
  <description><![CDATA[
    <img src="${sale.gear.image.url}" ><br/>
    PRICE: ${sale.price}<br/>
    END TIME: ${formatter.format(end)}<br/>
    BRAND: ${sale.gear.brand.name}<br/>
    POWERS: ${powers.join(", ")}<br/>
    ${brand_info.name}: ➕${brand_info.usual} ➖${brand_info.unusual}
  ]]></description>
  <guid isPermaLink="false">${sale.id}</guid>
  <link>${origin}/goto/${sale.id}</link>
 </item>`
    }
    rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
 <title>SplatNet Gear</title>
 <link>https://splatoon3.ink/gear</link>
 <ttl>60</ttl>
 ${items}
 </channel>
</rss>`
    return new Response(rss);
  }

  if (pathname.startsWith("/goto/")) {
    const id = pathname.split("/")[2];
    return Response.redirect(`com.nintendo.znca://znca/game/4834290508791808?p=/gesotown/${id}`, 301)
  }

  return fetch("https://welcome.developers.workers.dev");
}
