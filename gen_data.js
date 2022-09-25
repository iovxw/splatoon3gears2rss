#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

const PREFIX = "leanny.github.io/splat3/data/";

async function parse_languages() {
  const p = PREFIX+'language/';
  let r = {};
  
  const files = await fs.readdir(p);
  for (const file of files) {
    const language = path.basename(file, ".json");
    const data = JSON.parse(await fs.readFile(p+file));
    for (const [module, translate] of Object.entries(data)) {
      for (const [key, str] of Object.entries(translate)) {
        if (!r[module]) {
          r[module]={}
        }
        if (!r[module][key]) { r[module][key]={} }
        r[module][key][language]=str
      }
    }
  }
  
  return r;
}

async function gen_brand_traits(lang_dict, version) {
  const f = PREFIX+'parameter/'+version+'/misc/spl__BrandTraitsParam.spl__BrandTraitsParam.json';
  const brand_names = lang_dict["CommonMsg/Gear/GearBrandName"];
  const power_names = lang_dict["CommonMsg/Gear/GearPowerName"];
  const traits = JSON.parse(await fs.readFile(f))['Traits'];
  let r = {};
  for (const [id, val] of Object.entries(traits)) {
    if (!brand_names[id]) { 
      console.log(id);
      continue;
    }
    const name_en = brand_names[id]["USen"];
    const name_zh = brand_names[id]["CNzh"];
    r[name_en] = {
       name: name_zh,
       usual: power_names[val["UsualGearSkill"]]['CNzh'],
       unusual: power_names[val["UnusualGearSkill"]]['CNzh'],
    };
  }
  return r;
}

async function main() {
  const lang_dict = await parse_languages();
  const brand_traits = await gen_brand_traits(lang_dict, 111);
  await fs.writeFile('data/brand_traits.json', JSON.stringify(brand_traits));
}

main().catch(err => console.log(err));
