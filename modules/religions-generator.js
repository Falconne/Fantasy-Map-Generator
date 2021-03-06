(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Religions = factory());
}(this, (function () {'use strict';

  // name generation approach and relative chance to be selected
  const approach = {"Number":1, "Being":3, "Adjective":5, "Color + Animal":5, 
    "Adjective + Animal":5, "Adjective + Being":5, "Adjective + Genitive":1, 
    "Color + Being":3, "Color + Genitive":3, "Being + of + Genitive":2, "Being + of the + Genitive":1, 
    "Animal + of + Genitive":1, "Adjective + Being + of + Genitive":2, "Adjective + Animal + of + Genitive":2};

  // turn weighted array into simple array
  const approaches = [];
  for (const a in approach) {
    for (let j=0; j < approach[a]; j++) {
      approaches.push(a);
    }
  }

  const base = {
    number: ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"],
    being: ["God", "Goddess", "Lord", "Lady", "Deity", "Creator", "Maker", "Overlord", "Ruler", "Chief", "Master", "Spirit", "Ancestor", "Father", "Forebear", "Forefather", "Mother", "Brother", "Sister", "Elder", "Numen", "Ancient", "Virgin", "Giver", "Council", "Guardian", "Reaper"],
    animal: ["Antelope", "Ape", "Badger", "Bear", "Beaver", "Bison", "Boar", "Buffalo", "Cat", "Cobra", "Crane", "Crocodile", "Crow", "Deer", "Dog", "Eagle", "Elk", "Fox", "Goat", "Goose", "Hare", "Hawk", "Heron", "Horse", "Hyena", "Ibis", "Jackal", "Jaguar", "Lark", "Leopard", "Lion", "Mantis", "Marten", "Moose", "Mule", "Narwhal", "Owl", "Panther", "Rat", "Raven", "Rook", "Scorpion", "Shark", "Sheep", "Snake", "Spider", "Swan", "Tiger", "Turtle", "Viper", "Vulture", "Walrus", "Wolf", "Wolverine", "Worm",  "Camel", "Falcon", "Hound", "Ox", "Serpent"],
    adjective: ["New", "Good", "High", "Old", "Great", "Big", "Young", "Major", "Strong", "Happy", "Last", "Main", "Huge", "Far", "Beautiful", "Wild", "Fair", "Prime", "Crazy", "Ancient", "Golden", "Proud", "Secret", "Lucky", "Sad", "Silent", "Latter", "Severe", "Fat", "Holy", "Pure", "Aggressive", "Honest", "Giant", "Mad", "Pregnant", "Distant", "Lost", "Broken", "Blind", "Friendly", "Unknown", "Sleeping", "Slumbering", "Loud", "Hungry", "Wise", "Worried", "Sacred", "Magical", "Superior", "Patient", "Dead", "Deadly", "Peaceful", "Grateful", "Frozen", "Evil", "Scary", "Burning", "Divine", "Bloody", "Dying", "Waking", "Brutal", "Unhappy", "Calm", "Cruel", "Favorable", "Blond", "Explicit", "Disturbing", "Devastating", "Brave", "Sunny", "Troubled", "Flying", "Sustainable", "Marine", "Fatal", "Inherent", "Selected", "Naval", "Cheerful", "Almighty", "Benevolent", "Eternal", "Immutable", "Infallible"],
    genitive: ["Day", "Life", "Death", "Night", "Home", "Fog", "Snow", "Winter", "Summer", "Cold", "Springs", "Gates", "Nature", "Thunder", "Lightning", "War", "Ice", "Frost", "Fire", "Doom", "Fate", "Pain", "Heaven", "Justice", "Light", "Love", "Time", "Victory"],
    theGenitive: ["World", "Word", "South", "West", "North", "East", "Sun", "Moon", "Peak", "Fall", "Dawn", "Eclipse", "Abyss", "Blood", "Tree", "Earth", "Harvest", "Rainbow", "Sea", "Sky", "Stars", "Storm", "Underworld", "Wild"],
    color: ["Dark", "Light", "Bright", "Golden", "White", "Black", "Red", "Pink", "Purple", "Blue", "Green", "Yellow", "Amber", "Orange", "Brown", "Grey"]
  };

  const forms = {
    Folk:{"Shamanism":2, "Animism":2, "Ancestor worship":1, "Polytheism":2},
    Organized:{"Polytheism":5, "Dualism":1, "Monotheism":4, "Non-theism":1},
    Cult:{"Cult":1, "Dark Cult":1},
    Heresy:{"Heresy":1}
  };

  const methods = {"Random + type":3, "Random + ism":1, "Supreme + ism":5, "Faith of + Supreme":3, "Place + ism":1, "Culture + ism":1, "Place + ian + type":6, "Culture + type":4};

  const types = {
    "Shamanism":{"Beliefs":3, "Shamanism":2, "Spirits":1},
    "Animism":{"Spirits":1, "Beliefs":1},
    "Ancestor worship":{"Beliefs":1, "Forefathers":2, "Ancestors":2},
    "Polytheism":{"Deities":3, "Faith":1, "Gods":1, "Pantheon":1},

    "Dualism":{"Religion":3, "Faith":1, "Cult":1},
    "Monotheism":{"Religion":1, "Church":1},
    "Non-theism":{"Beliefs":3, "Spirits":1},

    "Cult":{"Cult":4, "Sect":4, "Worship":1, "Orden":1, "Coterie":1, "Arcanum":1},
    "Dark Cult":{"Cult":2, "Sect":2, "Occultism":1, "Idols":1, "Coven":1, "Circle":1, "Blasphemy":1},

    "Heresy":{"Heresy":3, "Sect":2, "Schism":1, "Dissenters":1, "Circle":1, "Brotherhood":1, "Society":1, "Iconoclasm":1, "Dissent":1, "Apostates":1}
  };

  const generate = function() {
    console.time('generateReligions');
    const cells = pack.cells, states = pack.states, cultures = pack.cultures;
    const religions = pack.religions = [];
    cells.religion = new Uint16Array(cells.culture); // cell religion; initially based on culture

    // add folk religions
    pack.cultures.forEach(c => {
      if (!c.i) {religions.push({i: 0, name: "No religion"}); return;}
      const form = rw(forms.Folk);
      const name = c.name + " " + rw(types[form]);
      const deity = form === "Animism" ? null : getDeityName(c.i);
      const color = `url(#hatch${rand(8,13)})`;
      religions.push({i: c.i, name, color, culture: c.i, type:"Folk", form, deity});
    });

    if (religionsInput.value == 0 || pack.cultures.length < 2) return;

    const sorted = cells.i.filter(i => cells.s[i] > 2).sort((a, b) => cells.s[b] - cells.s[a]); // filtered and sorted array of indexes
    const religionsTree = d3.quadtree();
    const spacing = (graphWidth + graphHeight) / 6 / religionsInput.value; // base min distance between towns
    const cultsCount = Math.floor(rand(10, 40) / 100 * religionsInput.value);
    const count = +religionsInput.value - cultsCount + religions.length;

    // generate organized religions
    for (let i=0; religions.length < count && i < 1000; i++) {
      let center = sorted[biased(0, sorted.length-1, 5)]; // religion center
      const form = rw(forms.Organized);
      const state = cells.state[center];
      const culture = cells.culture[center];

      const deity = form === "Non-theism" ? null : getDeityName(culture);
      const [name, expansion] = getReligionName(form, deity, center);

      if (expansion === "state" && state && Math.random() > .5) center = states[state].center;
      if (expansion === "culture" && culture && Math.random() > .5) center = cultures[culture].center;
      if (!cells.burg[center] && cells.c[center].some(c => cells.burg[c])) center = cells.c[center].find(c => cells.burg[c]);
      const x = cells.p[center][0], y = cells.p[center][1];

      const s = spacing * gauss(1, .3, .2, 2, 2); // randomize to make the placement not uniform
      if (religionsTree.find(x, y, s) !== undefined) continue; // to close to existing religion

      const expansionism = rand(3, 8);
      const color = `url(#hatch${rand(0,5)})`;
      religions.push({i: religions.length, name, color, culture, type:"Organized", form, deity, expansion, expansionism, center});
      religionsTree.add([x, y]);
      //debug.append("circle").attr("cx", x).attr("cy", y).attr("r", 2).attr("fill", "blue");
    }

    // generate cults
    for (let i=0; religions.length < count + cultsCount && i < 1000; i++) {
      const form = rw(forms.Cult);
      let center = sorted[biased(0, sorted.length-1, 1)]; // religion center
      if (!cells.burg[center] && cells.c[center].some(c => cells.burg[c])) center = cells.c[center].find(c => cells.burg[c]);
      const x = cells.p[center][0], y = cells.p[center][1];

      const s = spacing * gauss(2, .3, 1, 3, 2); // randomize to make the placement not uniform
      if (religionsTree.find(x, y, s) !== undefined) continue; // to close to existing religion

      const culture = cells.culture[center];
      const deity = getDeityName(culture);
      const name = getCultName(form, center);
      const expansionism = gauss(1.1, .5, 0, 5);
      religions.push({i: religions.length, name, color: "url(#hatch7)", culture, type:"Cult", form, deity, expansion:"global", expansionism, center});
      religionsTree.add([x, y]);
      //debug.append("circle").attr("cx", x).attr("cy", y).attr("r", 2).attr("fill", "red");
    }

    expandReligions();

    // generate heresies
    religions.filter(r => r.type === "Organized").forEach(r => {
      if (r.expansionism < 3) return;
      const count = gauss(0, 1, 0, 3);
      for (let i=0; i < count; i++) {
        let center = ra(cells.i.filter(i => cells.religion[i] === r.i && cells.c[i].some(c => cells.religion[c] !== r.i)));
        if (!center) continue;
        if (!cells.burg[center] && cells.c[center].some(c => cells.burg[c])) center = cells.c[center].find(c => cells.burg[c]);
        const x = cells.p[center][0], y = cells.p[center][1];
        if (religionsTree.find(x, y, spacing / 10) !== undefined) continue; // to close to other

        const culture = cells.culture[center];
        const name = getCultName("Heresy", center);
        const expansionism = gauss(1.2, .5, 0, 5);
        religions.push({i: religions.length, name, color:"url(#hatch6)", culture, type:"Heresy", form:"Heresy", deity: r.deity, expansion:"global", expansionism, center});
        religionsTree.add([x, y]);
        //debug.append("circle").attr("cx", x).attr("cy", y).attr("r", 2).attr("fill", "green");
      }
    });

    expandHeresies();

    console.timeEnd('generateReligions');
  }

  const add = function(center) {
    const cells = pack.cells, religions = pack.religions;
    const r = cells.religion[center];
    const i = religions.length;
    const culture = cells.culture[center];
    const color = getRandomColor();

    const type = religions[r].type === "Organized" ? rw({Organized:4, Cult:1, Heresy:2}) : rw({Organized:5, Cult:2});
    const form = rw(forms[type]);
    const deity = form === "Heresy" ? religions[r].deity : form === "Non-theism" ? null : getDeityName(culture);
    
    let name, expansion;
    if (type === "Organized") [name, expansion] = getReligionName(form, deity, center)
    else {name = getCultName(form, center); expansion = "global";}

    religions.push({i, name, color, culture, type, form, deity, expansion, expansionism:0, center, area: 0, rural: 0, urban: 0});
  }

  // growth algorithm to assign cells to religions
  const expandReligions = function() {
    console.time("expandReligions");
    const cells = pack.cells, religions = pack.religions;
    const queue = new PriorityQueue({comparator: (a, b) => a.p - b.p});
    const cost = [];

    religions.filter(r => r.type === "Organized" || r.type === "Cult").forEach(r => {
      cells.religion[r.center] = r.i;
      queue.queue({e:r.center, p:0, r:r.i}); 
      cost[r.center] = 1;
    });

    const neutral = cells.i.length / 5000 * 200 * gauss(1, .3, .2, 2, 2) * neutralInput.value; // limit cost for organized religions growth

    while (queue.length) {
      const next = queue.dequeue(), n = next.e, p = next.p, r = next.r;
      const expansion = religions[r].expansion;

      cells.c[n].forEach(function(e) {
        const cultureCost = expansion === "culture" ? religions[r].culture == cells.culture[e] ? 0 : 20000 : 10;
        const stateCost = expansion === "state" ? cells.state[religions[r].center] == cells.state[e] ? 0 : 20000 : 10;
        const biomeCost = cells.road[e] ? 0 : biomesData.cost[cells.biome[e]];
        const heightCost = Math.max(cells.h[e], 20) - 20;
        const waterCost = cells.h[e] < 20 ? cells.road[e] ? 50 : 1000 : 0;
        const totalCost = p + (cultureCost + stateCost + biomeCost + heightCost + waterCost) / religions[r].expansionism;

        if (totalCost > neutral) return;

        if (!cost[e] || totalCost < cost[e]) {
          if (cells.h[e] >= 20 && cells.culture[e]) cells.religion[e] = r; // assign religion to cell
          cost[e] = totalCost;
          queue.queue({e, p:totalCost, r});
        }
      });
    }
    //debug.selectAll(".text").data(cost).enter().append("text").attr("x", (d, e) => cells.p[e][0]-1).attr("y", (d, e) => cells.p[e][1]-1).text(d => d ? rn(d) : "").attr("font-size", 2);
    console.timeEnd("expandReligions");
  }

    // growth algorithm to assign cells to heresies
  const expandHeresies = function() {
    console.time("expandHeresies");
    const cells = pack.cells, religions = pack.religions;
    const queue = new PriorityQueue({comparator: (a, b) => a.p - b.p});
    const cost = [];

    religions.filter(r => r.form === "Heresy").forEach(r => {
      const b = cells.religion[r.center]; // "base" religion id
      cells.religion[r.center] = r.i; // heresy id
      queue.queue({e:r.center, p:0, r:r.i, b}); 
      cost[r.center] = 1;
    });

    const neutral = cells.i.length / 5000 * 500 * neutralInput.value; // limit cost for heresies growth

    while (queue.length) {
      const next = queue.dequeue(), n = next.e, p = next.p, r = next.r, b = next.b;

      cells.c[n].forEach(function(e) {
        const religionCost = cells.religion[e] === b ? 0 : 2000;
        const biomeCost = cells.road[e] ? 0 : biomesData.cost[cells.biome[e]];
        const heightCost = Math.max(cells.h[e], 20) - 20;
        const waterCost = cells.h[e] < 20 ? cells.road[e] ? 50 : 1000 : 0;
        const totalCost = p + (religionCost + biomeCost + heightCost + waterCost) / Math.max(religions[r].expansionism, .1);

        if (totalCost > neutral) return;

        if (!cost[e] || totalCost < cost[e]) {
          if (cells.h[e] >= 20 && cells.culture[e]) cells.religion[e] = r; // assign religion to cell
          cost[e] = totalCost;
          queue.queue({e, p:totalCost, r});
        }
      });
    }
    //debug.selectAll(".text").data(cost).enter().append("text").attr("x", (d, e) => cells.p[e][0]-1).attr("y", (d, e) => cells.p[e][1]-1).text(d => d ? rn(d) : "").attr("font-size", 2);
    console.timeEnd("expandHeresies");
  }

  // get supreme deity name
  const getDeityName = function(culture) {
    if (culture === undefined) {console.error("Please define a culture"); return;}
    const meaning = generateMeaning();
    const cultureName = Names.getCulture(culture, null, null, "", .8);
    return cultureName + ", The " + meaning;
  }

  function generateMeaning() {
    const a = ra(approaches); // select generation approach
    if (a === "Number") return ra(base.number);
    if (a === "Being") return ra(base.being);
    if (a === "Adjective") return ra(base.adjective);
    if (a === "Color + Animal") return ra(base.color) + " " + ra(base.animal);
    if (a === "Adjective + Animal") return ra(base.adjective) + " " + ra(base.animal);
    if (a === "Adjective + Being") return ra(base.adjective) + " " + ra(base.being);
    if (a === "Adjective + Genitive") return ra(base.adjective) + " " + ra(base.genitive);
    if (a === "Color + Being") return ra(base.color) + " " + ra(base.being);
    if (a === "Color + Genitive") return ra(base.color) + " " + ra(base.genitive); 
    if (a === "Being + of + Genitive") return ra(base.being) + " of " + ra(base.genitive);
    if (a === "Being + of the + Genitive") return ra(base.being) + " of the " + ra(base.theGenitive);
    if (a === "Animal + of + Genitive") return ra(base.animal) + " of " + ra(base.genitive); 
    if (a === "Adjective + Being + of + Genitive") return ra(base.adjective) + " " + ra(base.being) + " of " + ra(base.genitive);
    if (a === "Adjective + Animal + of + Genitive") return ra(base.adjective) + " " + ra(base.animal) + " of " + ra(base.genitive);
  }

  function getReligionName(form, deity, center) {
    const cells = pack.cells;
    const random = function() {return Names.getCulture(cells.culture[center], null, null, "", 0);}
    const type = function() {return rw(types[form]);}
    const supreme = function() {return deity.split(/[ ,]+/)[0];}
    const place = function(adj) {
      const base = cells.burg[center] ? pack.burgs[cells.burg[center]].name : pack.states[cells.state[center]].name;
      let name = trimVowels(base.split(/[ ,]+/)[0]);
      return adj ? getAdjective(name) : name;
    }
    const culture = function() {return pack.cultures[cells.culture[center]].name;}

    const m = rw(methods);
    if (m === "Random + type") return [random() + " " + type(), "global"];
    if (m === "Random + ism") return [trimVowels(random()) + "ism", "global"];
    if (m === "Supreme + ism" && deity) return [trimVowels(supreme()) + "ism", "global"];
    if (m === "Faith of + Supreme" && deity) return ["Faith of " + supreme(), "global"];
    if (m === "Place + ism") return [place() + "ism", "global"];
    if (m === "Culture + ism") return [trimVowels(culture()) + "ism", "culture"];
    if (m === "Place + ian + type") return [place("adj") + " " + type(), "state"];
    if (m === "Culture + type") return [culture() + " " + type(), "culture"];
    return [trimVowels(random()) + "ism", "global"]; // else
  }

  function getCultName(form, center) {
    const cells = pack.cells;
    const type = function() {return rw(types[form]);}
    const random = function() {return trimVowels(Names.getCulture(cells.culture[center], null, null, "", 0).split(/[ ,]+/)[0]);}
    const burg = function() {return trimVowels(pack.burgs[cells.burg[center]].name.split(/[ ,]+/)[0]);}
    if (cells.burg[center]) return burg() + "ian " + type();
    if (Math.random() > .5) return random() + "ian " + type();
    return type() + " of the " + generateMeaning();
  };

  return {generate, add, getDeityName, expandReligions};

})));