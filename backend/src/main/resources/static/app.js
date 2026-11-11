(function () {
  "use strict";

  var state = {
    exhibits: [],
    categories: [],
    category: "全部",
    selected: null,
    messages: [],
    typing: false,
    lastQuestion: "",
    visited: [],
    activeTab: "overview"
  };

  var el = function (id) { return document.getElementById(id); };
  var qsa = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // 内容增强：每件展品的工艺步骤、材料、冷知识和参观提示。
  var EXTRAS = {
    "景德镇手工制瓷技艺": {
      quote: "白如玉，明如镜，薄如纸，声如磬。",
      funFact: "青花不是画在釉上，而是画在坯上再罩透明釉，经约 1300℃ 一次烧成。钴料在釉下发色，所以叫“釉下彩”。",
      material: "高岭土、瓷石、钴料、透明釉",
      technique: "拉坯、利坯、施釉、画坯、高温烧成",
      visitTip: "看拉坯师傅的手势，看青花线条的浓淡，再把瓷器轻轻转动，看釉面在灯下的光泽。不要用手敲击器物。",
      steps: [
        ["选料", "瓷石与高岭土按比例配制，淘洗、沉淀、练泥，去掉气泡和杂质。"],
        ["拉坯", "把泥团放在轮盘中心，用手拉出器型，器壁的厚薄全凭手感。"],
        ["利坯", "坯体半干时上车修整，修出口沿、腹部和圈足的线条。"],
        ["画坯", "用钴料在坯上绘画，青花的浓淡靠料色和笔触控制。"],
        ["施釉", "罩上一层透明釉，釉层厚薄会影响烧成后的温润度。"],
        ["烧窑", "装入窑炉，经约 1300℃ 高温烧成，泥土最终变成瓷器。"]
      ],
      related: ["龙泉青瓷传统烧制技艺"]
    },
    "苏绣": {
      quote: "一针一线，绣出江南的呼吸。",
      funFact: "最细的丝线可以劈到几十分之一；双面绣要求正反两面都完整，针脚不能互相打架。",
      material: "蚕丝线、绸缎底料、绷架",
      technique: "劈丝、平针、乱针、双面绣",
      visitTip: "先退后两步看整体气息，再靠近看针脚；侧光看丝线光泽。不要用手触摸绣面，手上的油脂会影响丝线。",
      steps: [
        ["劈丝", "把一根蚕丝线劈成更细的丝，线越细，画面越柔和。"],
        ["上绷", "把底料绷紧，保持经纬平直，针脚才不会变形。"],
        ["刺绣", "按物象纹理运针，平针求匀，乱针求光影。"],
        ["装裱", "完成后的绣面要避光、防潮，装裱时不能压伤丝线。"]
      ],
      related: ["昆曲"]
    },
    "昆曲": {
      quote: "原来姹紫嫣红开遍，似这般都付与断井颓垣。",
      funFact: "昆曲舞台常常只有一桌二椅，闺房、花园、山坡都靠演员的身段虚拟出来。",
      material: "笛、笙、琵琶、水袖、折扇",
      technique: "水磨腔、身段、水袖、台步",
      visitTip: "先看眼神和手指，再看水袖的收放，最后听笛声如何托住唱腔。听不懂方言时先看字幕。",
      steps: [
        ["起音", "笛声定调，演员从一句唱腔进入，气口要稳。"],
        ["行腔", "字头、字腹、字尾慢慢过渡，水磨腔讲究一唱三叹。"],
        ["身段", "手、眼、身、法、步配合，虚拟出开门、上楼、行船。"],
        ["收束", "鼓点与笛声收住，情绪落在最后一个眼神里。"]
      ],
      related: ["中国剪纸"]
    },
    "中国剪纸": {
      quote: "一把剪刀，剪出人间的喜气。",
      funFact: "锯齿纹和月牙纹不只是装饰，它们能让折叠后的纸在展开时保持连接，是剪纸的“结构语言”。",
      material: "红纸、剪刀、刻刀、蜡盘",
      technique: "折叠、镂空、锯齿纹、月牙纹",
      visitTip: "看线条是否一气呵成，看黑白疏密是否舒服，再看图案有没有讲出一个故事。体验课从对称窗花开始。",
      steps: [
        ["折纸", "按对称轴折叠，决定图案展开后的结构。"],
        ["起稿", "在纸上画出大形，留出连接线，避免剪断。"],
        ["剪刻", "先剪大轮廓，再刻细节，锯齿纹和月牙纹交替使用。"],
        ["展开", "轻轻展开，压平，检查线条和留白。"]
      ],
      related: ["苏绣"]
    },
    "西湖龙井茶制作技艺": {
      quote: "色绿、香郁、味甘、形美。",
      funFact: "炒茶十大手法全靠手感，同一锅鲜叶，力度和温度不同，香气会走向豆香、栗香或清香。",
      material: "一芽一叶鲜叶、铁锅、竹匾",
      technique: "采摘、摊放、杀青、理条、辉锅",
      visitTip: "看干茶是否扁平光滑，闻豆香或栗香，再用 80—85℃ 的水冲泡。不要用沸水直冲嫩芽。",
      steps: [
        ["采摘", "一芽一叶初展，晴天上午露水干后采，雨天不采。"],
        ["摊放", "鲜叶薄摊，散掉部分水分和青气。"],
        ["杀青", "高温下翻炒，破坏酶活性，固定绿色和香气。"],
        ["理条", "用手势把茶叶压扁、理直，形成龙井的外形。"],
        ["辉锅", "低温慢炒，提香、干燥，最后筛分定级。"]
      ],
      related: ["扬州漆器"]
    },
    "龙泉青瓷传统烧制技艺": {
      quote: "雨过天青云破处，梅子青时釉色新。",
      funFact: "开片原本是釉与胎收缩率不同造成的裂纹，后来被匠人发展为审美。哥窑的“金丝铁线”就是裂纹与色线的结合。",
      material: "瓷土、青釉、还原焰",
      technique: "多次施釉、1300℃还原焰、开片",
      visitTip: "看釉色是否温润，看开片是否自然，看器型是否端正。不要用手敲击器物，声音不能判断所有瓷器的好坏。",
      steps: [
        ["制胎", "瓷土淘洗、练泥，拉坯或模制成型。"],
        ["修坯", "修出器型线条，口沿和圈足要干净。"],
        ["施釉", "多次施釉，釉层厚度影响最终的粉青或梅子青。"],
        ["烧成", "约 1300℃ 还原焰烧成，火候和气氛决定釉色。"],
        ["开片", "冷却时釉与胎收缩不同，形成细密裂纹。"]
      ],
      related: ["景德镇手工制瓷技艺"]
    },
    "侗族大歌": {
      quote: "没有指挥，也没有伴奏，歌声却能彼此找到。",
      funFact: "高音声部侗语叫“所练”，低音声部叫“所吞”。两个声部不是谁伴谁，而是互相托住。",
      material: "人声、侗语、鼓楼",
      technique: "多声部、无指挥、无伴奏、口传心授",
      visitTip: "先找低音声部的“底”，再听高音如何从底上长出来。节庆时去鼓楼听现场，比耳机里更有空间感。",
      steps: [
        ["起歌", "歌师起音，歌队找到音高和呼吸。"],
        ["分声", "高音、低音各自进入，靠耳朵调整音量和音准。"],
        ["模仿", "用声音模仿蝉鸣、流水、鸟叫，把山野唱成和声。"],
        ["收歌", "尾音一起收住，留一点余响在鼓楼里。"]
      ],
      related: ["昆曲", "皮影戏"]
    },
    "扬州漆器": {
      quote: "一层漆，一层时间。",
      funFact: "大漆要在阴湿环境里慢慢氧化干燥，不能烘烤；点螺的虹彩来自贝壳本身，不需要颜料。",
      material: "大漆、夜光螺、贝壳、玉石",
      technique: "髹涂、点螺、雕漆、百宝嵌",
      visitTip: "看漆面是否温润如玉，转动看點螺的虹彩，再看刀口和镶嵌缝是否干净。好的漆器不怕看侧面。",
      steps: [
        ["制漆", "割取漆树汁液，过滤、晾晒，得到可使用的大漆。"],
        ["制胎", "木胎或脱胎成型，裱布、刮灰，反复打磨。"],
        ["髹涂", "一层一层刷漆，每层都要在阴湿环境里干燥。"],
        ["镶嵌", "点螺、百宝嵌把贝壳、玉石等材料嵌进漆面。"],
        ["推光", "打磨、推光，让漆面呈现温润的光泽。"]
      ],
      related: ["龙泉青瓷传统烧制技艺"]
    },
    "皮影戏": {
      quote: "一盏灯，一张皮，演尽人间故事。",
      funFact: "一个人物通常要三根签，签手的手指就是影子的关节。影窗后的光和雕刻的镂空一起完成表演。",
      material: "牛皮或驴皮、竹签、灯、月琴",
      technique: "选皮、镂刻、敷彩、缀结、操纵",
      visitTip: "看签手的手指，绕到影窗侧面看光如何穿过镂空，再听碗碗腔和鼓点如何与动作咬合。",
      steps: [
        ["选皮", "选厚薄均匀的牛皮或驴皮，浸泡、刮薄。"],
        ["画稿", "按人物角色画稿，设计关节和镂空。"],
        ["镂刻", "用刻刀雕出细节，透光的地方要留得均匀。"],
        ["敷彩", "用矿物或植物颜料上色，灯光下更透亮。"],
        ["缀结", "把各部件缀结，装上竹签，签手开始排练。"]
      ],
      related: ["昆曲", "侗族大歌"]
    }
  };

  function escapeHtml(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toast(message) {
    var node = el("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(node._timer);
    node._timer = setTimeout(function () { node.classList.remove("show"); }, 2600);
  }

  function fetchJson(url, options) {
    return fetch(url, options).then(function (res) {
      return res.json().then(function (body) {
        if (!res.ok || body.code !== 0) throw new Error(body.message || "请求失败");
        return body.data;
      });
    });
  }

  function categoryIndex(id) {
    for (var i = 0; i < state.exhibits.length; i++) {
      if (state.exhibits[i].id === id) return i;
    }
    return -1;
  }

  function findByName(name) {
    return state.exhibits.find(function (x) { return x.name === name; });
  }

  function loadVisited() {
    try {
      var raw = localStorage.getItem("feiyi_visited");
      state.visited = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.visited)) state.visited = [];
    } catch (e) {
      state.visited = [];
    }
  }

  function saveVisited() {
    try { localStorage.setItem("feiyi_visited", JSON.stringify(state.visited)); } catch (e) {}
  }

  function isVisited(id) { return state.visited.indexOf(id) >= 0; }

  function renderFilters() {
    var filters = el("filters");
    var all = ["全部"].concat(state.categories);
    filters.innerHTML = all.map(function (name) {
      return '<button type="button" class="filter ' + (state.category === name ? "active" : "") +
        '" data-category="' + escapeHtml(name) + '">' + escapeHtml(name) + "</button>";
    }).join("");
    qsa(".filter", filters).forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.category = btn.getAttribute("data-category");
        renderFilters();
        renderCards();
      });
    });
  }

  function renderCards() {
    var list = state.exhibits.filter(function (item) {
      return state.category === "全部" || item.category === state.category;
    });
    var grid = el("exhibitGrid");
    if (!list.length) {
      grid.innerHTML = '<div class="empty">这个类别还没有展品。</div>';
      return;
    }
    grid.innerHTML = list.map(function (item, index) {
      var no = String(state.exhibits.indexOf(item) + 1).padStart(2, "0");
      var done = isVisited(item.id) ? '<span class="card-visited">已打卡</span>' : "";
      return '<article class="exhibit-card" data-id="' + item.id + '" style="animation-delay:' + (index * 55) + 'ms">' +
        '<div class="card-image">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" loading="lazy">' +
          '<span class="card-cat">' + escapeHtml(item.category) + "</span>" +
          '<span class="card-no">NO. ' + no + "</span>" + done +
        "</div>" +
        '<div class="card-body">' +
          "<h3>" + escapeHtml(item.name) + "</h3>" +
          '<p class="card-summary">' + escapeHtml(item.summary) + "</p>" +
          '<div class="card-meta"><span>' + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.era) + "</span></div>" +
        "</div>" +
      "</article>";
    }).join("");
    qsa(".exhibit-card", grid).forEach(function (card) {
      card.addEventListener("click", function () { openDetail(Number(card.getAttribute("data-id"))); });
    });
  }

  function setTab(tab) {
    state.activeTab = tab;
    qsa(".detail-tab").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-tab") === tab); });
    qsa(".detail-panel").forEach(function (p) { p.classList.toggle("active", p.getAttribute("data-panel") === tab); });
  }

  function renderSteps(steps) {
    var box = el("craftSteps");
    if (!steps || !steps.length) { box.innerHTML = '<p class="muted">这件展品的工艺步骤正在整理。</p>'; return; }
    box.innerHTML = steps.map(function (s) {
      return '<div class="timeline-item"><strong>' + escapeHtml(s[0]) + "</strong><p>" + escapeHtml(s[1]) + "</p></div>";
    }).join("");
  }

  function renderRelated(names) {
    var box = el("relatedList");
    var items = (names || []).map(findByName).filter(Boolean);
    if (!items.length) { box.innerHTML = '<span class="muted">暂无相关展品</span>'; return; }
    box.innerHTML = items.map(function (item) {
      return '<button type="button" class="related-item" data-related="' + item.id + '">' +
        '<img src="' + escapeHtml(item.image) + '" alt=""><span>' + escapeHtml(item.name) + "</span></button>";
    }).join("");
    qsa(".related-item", box).forEach(function (b) {
      b.addEventListener("click", function () { openDetail(Number(b.getAttribute("data-related"))); });
    });
  }

  function updateCheckin() {
    var btn = el("checkinBtn");
    if (!state.selected) return;
    var done = isVisited(state.selected.id);
    btn.textContent = done ? "已打卡" : "打卡这件展品";
    btn.classList.toggle("done", done);
  }

  function openDetail(id) {
    var item = state.exhibits.find(function (x) { return x.id === id; });
    if (!item) return;
    state.selected = item;
    var extra = EXTRAS[item.name] || {
      quote: "", funFact: item.highlights, material: "—", technique: "—",
      visitTip: "现场参观请以展馆说明为准。", steps: [], related: []
    };
    el("detailImage").src = item.image;
    el("detailImage").alt = item.name;
    el("detailCategory").textContent = "非遗 · " + item.category;
    el("detailName").textContent = item.name;
    el("detailSummary").textContent = item.summary;
    el("detailDescription").textContent = item.description;
    el("detailHighlights").textContent = item.highlights;
    el("detailQuote").textContent = extra.quote || "";
    el("detailFun").textContent = extra.funFact || "";
    el("detailMaterial").textContent = extra.material || "—";
    el("detailTechnique").textContent = extra.technique || "—";
    el("detailVisitTip").textContent = extra.visitTip || "现场参观请以展馆说明为准。";
    el("detailMeta").innerHTML = "<span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.era) + "</span><span>" + escapeHtml(item.category) + "</span>";
    renderSteps(extra.steps);
    renderRelated(extra.related);
    setTab("overview");
    updateCheckin();
    el("detailModal").classList.add("open");
    el("detailModal").setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    updateContext();
    renderSuggestions();
  }

  function closeDetail() {
    el("detailModal").classList.remove("open");
    el("detailModal").setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }

  function toggleVisit() {
    if (!state.selected) return;
    var id = state.selected.id;
    if (isVisited(id)) {
      state.visited = state.visited.filter(function (x) { return x !== id; });
      toast("已取消打卡");
    } else {
      state.visited.push(id);
      toast("已打卡：" + state.selected.name);
    }
    saveVisited();
    updateCheckin();
    renderCards();
    renderVisits();
    updateVisitCount();
  }

  function updateContext() {
    var context = el("chatContext");
    if (!state.selected) { context.hidden = true; return; }
    context.hidden = false;
    el("chatContextName").textContent = state.selected.name;
  }

  function clearContext() {
    state.selected = null;
    updateContext();
    renderSuggestions();
    toast("已切换为全场讲解");
  }

  function suggestionsFor() {
    if (state.selected) {
      var map = {
        "景德镇手工制瓷技艺": ["青花瓷的蓝色从哪里来？", "七十二道工序有哪些？", "瓷器平时怎么保养？"],
        "苏绣": ["双面绣难在哪里？", "劈丝是什么意思？", "怎么欣赏一幅苏绣？"],
        "昆曲": ["昆曲为什么叫百戏之祖？", "《牡丹亭》讲了什么？", "水袖在表演里有什么用？"],
        "中国剪纸": ["窗花里藏着什么祝福？", "锯齿纹是怎么剪出来的？", "南北方剪纸有什么不同？"],
        "西湖龙井茶制作技艺": ["龙井应该怎么冲泡？", "炒茶的十大手法是什么？", "狮龙云虎梅指什么？"],
        "龙泉青瓷传统烧制技艺": ["梅子青和粉青有什么区别？", "开片是瑕疵吗？", "青瓷平时怎么保养？"],
        "侗族大歌": ["没有指挥怎么唱齐？", "大歌有哪些类型？", "为什么模仿蝉鸣？"],
        "扬州漆器": ["点螺为什么会有虹彩？", "大漆为什么要阴干？", "百宝嵌用了哪些材料？"],
        "皮影戏": ["皮影怎么动起来？", "影窗为什么透光？", "碗碗腔是什么？"]
      };
      return map[state.selected.name] || ["这件展品最值得看什么？", "它的工艺难在哪里？", "参观时要注意什么？"];
    }
    return ["先看哪几件展品比较好？", "什么是非物质文化遗产？", "参观非遗展要注意什么？", "青花瓷的蓝色从哪里来？"];
  }

  function renderSuggestions() {
    var box = el("chatSuggestions");
    box.innerHTML = suggestionsFor().map(function (q) {
      return '<button type="button" data-q="' + escapeHtml(q) + '">' + escapeHtml(q) + "</button>";
    }).join("");
    qsa("button", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var q = btn.getAttribute("data-q");
        el("chatInput").value = q;
        sendQuestion(q);
      });
    });
  }

  function labelFor(role) { return role === "user" ? "你" : "AI 讲解员"; }

  function renderMessages() {
    var box = el("chatMessages");
    var html = state.messages.map(function (m, index) {
      var isUser = m.role === "user";
      var sources = "";
      if (!isUser && m.sources && m.sources.length) {
        sources = '<div class="message-sources">' + m.sources.map(function (s) {
          return '<button type="button" class="source-chip" data-source="' + (s.exhibitId || "") + '">' +
            escapeHtml(s.title) + "</button>";
        }).join("") + "</div>";
      }
      var speak = !isUser ? '<button type="button" class="speak-btn" data-speak="' + index + '">◉ 朗读</button>' : "";
      if (!isUser && m.needHuman) sources += '<div class="human-note">这个问题建议到展厅现场咨询讲解员。</div>';
      var engine = (!isUser && m.engine) ? '<span class="engine-badge ' + (m.engine === "deepseek" ? "ds" : "") + '">' +
        (m.engine === "deepseek" ? "DeepSeek" : "AI") + "</span>" : "";
      return '<div class="message ' + (isUser ? "user" : "assistant") + '">' +
        '<span class="message-label">' + labelFor(m.role) + engine + "</span>" +
        '<div class="bubble">' + escapeHtml(m.content) + "</div>" + sources + speak +
      "</div>";
    }).join("");
    if (state.typing) {
      html += '<div class="message assistant"><span class="message-label">AI 讲解员</span><div class="bubble typing"><i></i><i></i><i></i></div></div>';
    }
    box.innerHTML = html;
    qsa("[data-source]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-source"));
        if (id) openDetail(id); else toast("这是通用参观指南");
      });
    });
    qsa("[data-speak]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var msg = state.messages[Number(btn.getAttribute("data-speak"))];
        if (msg) speak(msg.content);
      });
    });
    box.scrollTop = box.scrollHeight;
  }

  function addMessage(role, content, sources, needHuman, engine) {
    state.messages.push({ role: role, content: content, sources: sources || [], needHuman: !!needHuman, engine: engine || "" });
    renderMessages();
  }

  function sendQuestion(question) {
    var q = String(question || "").trim();
    if (!q || state.typing) return;
    state.lastQuestion = q;
    openChat();
    addMessage("user", q);
    state.typing = true;
    renderMessages();
    var body = { question: q };
    if (state.selected) body.exhibitId = state.selected.id;
    fetchJson("/api/chat/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (data) {
      state.typing = false;
      addMessage("assistant", data.answer, data.sources, data.needHuman, data.engine);
    }).catch(function (err) {
      state.typing = false;
      addMessage("assistant", "讲解员暂时走神了：" + err.message + "。请稍后再试。");
    });
  }

  function openChat() {
    el("chatPanel").classList.add("open");
    el("chatPanel").setAttribute("aria-hidden", "false");
    updateContext();
    renderSuggestions();
    setTimeout(function () { el("chatInput").focus(); }, 220);
  }

  function closeChat() {
    el("chatPanel").classList.remove("open");
    el("chatPanel").setAttribute("aria-hidden", "true");
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) { toast("当前浏览器不支持语音朗读"); return; }
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(String(text || ""));
    utter.lang = "zh-CN";
    utter.rate = 0.9;
    utter.pitch = 1;
    var voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
      if (voices[i].lang && voices[i].lang.toLowerCase().indexOf("zh") === 0) { utter.voice = voices[i]; break; }
    }
    window.speechSynthesis.speak(utter);
    toast("正在朗读");
  }

  function updateVisitCount() {
    var count = state.visited.length;
    el("visitCount").textContent = count;
    el("visitProgress").textContent = count + " / " + state.exhibits.length;
    el("visitBar").style.width = state.exhibits.length ? (count / state.exhibits.length * 100) + "%" : "0%";
  }

  function renderVisits() {
    var box = el("visitList");
    var items = state.exhibits.filter(function (e) { return isVisited(e.id); });
    if (!items.length) {
      box.innerHTML = '<div class="visit-empty">还没有打卡。<br>打开一件展品，点“打卡这件展品”，就会出现在这里。</div>';
    } else {
      box.innerHTML = items.map(function (e) {
        return '<div class="visit-item"><img src="' + escapeHtml(e.image) + '" alt="">' +
          "<div><strong>" + escapeHtml(e.name) + "</strong><small>" + escapeHtml(e.region) + "</small></div>" +
          '<button type="button" data-remove-visit="' + e.id + '" aria-label="移除">×</button></div>';
      }).join("");
      qsa("[data-remove-visit]", box).forEach(function (b) {
        b.addEventListener("click", function () {
          state.visited = state.visited.filter(function (x) { return x !== Number(b.getAttribute("data-remove-visit")); });
          saveVisited(); renderVisits(); updateVisitCount(); renderCards();
          if (state.selected) updateCheckin();
        });
      });
    }
    updateVisitCount();
  }

  function openVisits() {
    renderVisits();
    el("visitDrawer").classList.add("open");
    el("visitDrawer").setAttribute("aria-hidden", "false");
    el("visitBackdrop").classList.add("open");
    document.body.classList.add("locked");
  }

  function closeVisits() {
    el("visitDrawer").classList.remove("open");
    el("visitDrawer").setAttribute("aria-hidden", "true");
    el("visitBackdrop").classList.remove("open");
    document.body.classList.remove("locked");
  }

  function makeRoute() {
    var items = state.exhibits.filter(function (e) { return isVisited(e.id); });
    if (!items.length) { toast("先打卡几件展品，再生成路线"); return; }
    var lines = ["你的参观路线（约 " + (items.length * 8 + 10) + " 分钟）"];
    items.forEach(function (e, i) {
      var extra = EXTRAS[e.name] || {};
      var hint = extra.visitTip ? extra.visitTip.split("。")[0] : e.highlights.split("；")[0];
      lines.push((i + 1) + ". " + e.name + "｜" + e.region + "\n   " + hint + "。");
    });
    lines.push("路线按展品顺序排列；现场可根据人流调整。");
    el("routeBox").textContent = lines.join("\n");
  }

  function clearVisits() {
    if (!state.visited.length) return;
    if (!window.confirm("确定清空所有打卡记录吗？")) return;
    state.visited = [];
    saveVisited(); renderVisits(); updateVisitCount(); renderCards();
    if (state.selected) updateCheckin();
    el("routeBox").textContent = "";
    toast("足迹已清空");
  }

  function setupVoice() {
    var mic = el("micBtn");
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { mic.style.display = "none"; return; }
    var rec = new SR();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    var listening = false;
    mic.addEventListener("click", function () {
      if (listening) { rec.stop(); return; }
      try { rec.start(); } catch (e) { toast("语音输入启动失败"); }
    });
    rec.onstart = function () { listening = true; mic.classList.add("listening"); toast("请说话…"); };
    rec.onend = function () { listening = false; mic.classList.remove("listening"); };
    rec.onerror = function () { listening = false; mic.classList.remove("listening"); toast("没有听清，再试一次"); };
    rec.onresult = function (event) {
      var text = event.results[0][0].transcript;
      el("chatInput").value = text;
      el("chatInput").focus();
      toast("已转成文字，可修改后发送");
    };
  }

  function loadData(attempt) {
    Promise.all([fetchJson("/api/exhibits"), fetchJson("/api/categories"), fetchJson("/api/health")])
      .then(function (data) {
        state.exhibits = data[0] || [];
        state.categories = data[1] || [];
        if (!state.exhibits.length && attempt < 10) {
          setTimeout(function () { loadData(attempt + 1); }, 1000);
          return;
        }
        var stats = data[2] || {};
        el("statExhibits").textContent = String(stats.exhibits || state.exhibits.length).padStart(2, "0");
        el("statDocs").textContent = stats.documents || "16";
        el("statChunks").textContent = stats.chunks || "50";
        el("aboutExhibits").textContent = stats.exhibits || state.exhibits.length;
        el("aboutChunks").textContent = stats.chunks || "50";
        renderFilters();
        renderCards();
        renderVisits();
        updateVisitCount();
        handleHash();
      })
      .catch(function (err) {
        if (attempt < 10) setTimeout(function () { loadData(attempt + 1); }, 1000);
        else toast("知识库加载失败：" + err.message);
      });
  }

  function handleHash() {
    if (location.hash.indexOf("#detail-") === 0) {
      var id = Number(location.hash.replace("#detail-", ""));
      if (id) openDetail(id);
    } else if (location.hash === "#chat") {
      openChat();
    } else if (location.hash === "#visits") {
      openVisits();
    }
  }

  function init() {
    loadVisited();
    setupVoice();
    if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = function () {};
    loadData(0);

    el("heroForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = el("heroInput").value;
      if (!q.trim()) { el("heroInput").focus(); return; }
      sendQuestion(q);
      el("heroInput").value = "";
    });

    el("navAsk").addEventListener("click", openChat);
    el("chatFab").addEventListener("click", openChat);
    el("chatClose").addEventListener("click", closeChat);
    el("modalClose").addEventListener("click", closeDetail);
    el("detailModal").addEventListener("click", function (e) { if (e.target.getAttribute("data-close")) closeDetail(); });
    qsa(".detail-tab").forEach(function (b) {
      b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); });
    });
    el("listenBtn").addEventListener("click", function () {
      if (!state.selected) return;
      var extra = EXTRAS[state.selected.name] || {};
      speak(state.selected.name + "。" + state.selected.summary + "。" + (extra.quote || "") + "。" + state.selected.description);
    });
    el("askAboutBtn").addEventListener("click", function () { closeDetail(); openChat(); el("chatInput").focus(); });
    el("checkinBtn").addEventListener("click", toggleVisit);
    el("clearContext").addEventListener("click", clearContext);
    el("chatForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = el("chatInput").value;
      if (!q.trim()) return;
      sendQuestion(q);
      el("chatInput").value = "";
    });

    el("randomBtn").addEventListener("click", function () {
      if (!state.exhibits.length) return;
      var item = state.exhibits[Math.floor(Math.random() * state.exhibits.length)];
      openDetail(item.id);
    });
    el("visitBtn").addEventListener("click", openVisits);
    el("visitClose").addEventListener("click", closeVisits);
    el("visitBackdrop").addEventListener("click", closeVisits);
    el("routeBtn").addEventListener("click", makeRoute);
    el("clearVisits").addEventListener("click", clearVisits);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDetail(); closeChat(); closeVisits(); }
    });

    addMessage("assistant", "你好，我是见物·知艺的 AI 讲解员。你可以问我一件展品的历史、工艺、纹样，也可以让我用一分钟讲给你听。");
    renderSuggestions();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
