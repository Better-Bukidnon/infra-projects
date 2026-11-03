---
name: audit-data
description: Audit data/projects.json for data-quality problems (bad geotags, projects with no city/municipality, "Other" categories, odd statuses) and propose fixes to the cleanup rules in scripts/sync.mjs. Use when asked to check, audit or improve the project data, or when a sync reports more bad geotags or unmatched LGUs than usual.
---

# Audit project data

Run this report from the repo root:

```sh
node -e "
const d=require('./data/projects.json'), P=d.projects;
const by=(k)=>Object.entries(P.reduce((a,p)=>(a[p[k]]=(a[p[k]]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
console.log('count',d.count,'mapped',d.mapped,'synced',d.lastSyncedAt);
console.log('status',by('status'));
console.log('category',by('category'));
console.log('office',by('office'));
const show=(label,xs)=>{console.log('\n'+label,xs.length);xs.slice(0,15).forEach(p=>console.log(' ',p.id,'|',p.lgu,'|',p.title.slice(0,110)))};
show('BAD GEOTAG',P.filter(p=>p.badGeotag));
show('NO LGU',P.filter(p=>!p.lgu));
show('CATEGORY Other',P.filter(p=>p.category==='Other'));
"
```

## What to look for and where to fix it

All cleanup lives in `scripts/sync.mjs`. After changing it, run `npm run sync` and rerun the report.

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| No LGU, but the title names a town | Spelling variant, e.g. "Impasugong", "Mlaybalay", "M. Fortich" | Add an alias to `LGU_PATTERNS` |
| Wrong LGU picked | The title names two towns, e.g. a road "from X to Y" | `findLgu` takes the last one mentioned. Check that this is right for that title pattern. |
| Pin is in the wrong town but inside Bukidnon | Bad geotag at the source | The bounding box can't catch this. Note it; don't hand-edit the data. |
| Pin is outside Bukidnon | Bad geotag | It's already dropped by `BBOX`. Only tighten `BBOX` if real Bukidnon points aren't being dropped. |
| Category "Other" | A new raw category string | Add a keyword to `CATEGORIES` |

Don't hand-edit `data/projects.json`. The next sync overwrites it. Report numbers before and after any rule change.
