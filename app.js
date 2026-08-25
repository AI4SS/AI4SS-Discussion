const DEFAULT_TRACKS = ["Logical Reasoning", "Social Simulation", "Social Understanding", "Multimodal Prediction"];
const COLORS = {
  "Logical Reasoning": "#7659a8",
  "Social Simulation": "#274f70",
  "Social Understanding": "#62a982",
  "Multimodal Prediction": "#528fc1",
};

const state = {
  papers: [],
  filtered: [],
  search: "",
  level: "",
  task: "",
  year: "",
  sort: "recent",
  visible: 36,
  tracks: [],
};

const selectors = {
  search: document.querySelector("#paper-search"),
  task: document.querySelector("#task-filter"),
  year: document.querySelector("#year-filter"),
  sort: document.querySelector("#paper-sort"),
  clear: document.querySelector("#clear-filters"),
  levelFilters: document.querySelector("#level-filters"),
  list: document.querySelector("#paper-list"),
  resultCount: document.querySelector("#result-count"),
  loadMore: document.querySelector("#load-more"),
  timeline: document.querySelector("#timeline-matrix"),
  copyBibtex: document.querySelector("#copy-bibtex"),
  bibtex: document.querySelector("#bibtex"),
};

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function normalize(value) {
  return String(value || "").toLocaleLowerCase();
}

function levelClass(level) {
  return `level-${normalize(level).replace(/[^a-z0-9]+/g, "-")}`;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildFilters(metadata) {
  selectors.levelFilters.replaceChildren();
  state.tracks = metadata.trackOrder || DEFAULT_TRACKS.filter((track) => metadata.levelCounts[track]);
  state.tracks.forEach((level) => {
    const button = element("button", `level-filter ${levelClass(level)}`);
    button.type = "button";
    button.dataset.level = level;
    button.setAttribute("aria-pressed", "false");
    button.style.setProperty("--level-color", COLORS[level]);
    button.style.setProperty("--level-soft", `${COLORS[level]}18`);
    button.textContent = `${level} · ${metadata.levelCounts[level]}`;
    selectors.levelFilters.append(button);
  });

  const tasks = [...new Set(state.papers.map((paper) => paper.task).filter(Boolean))].sort();
  tasks.forEach((task) => {
    const option = element("option", "", task);
    option.value = task;
    selectors.task.append(option);
  });

  const years = [...new Set(state.papers.map((paper) => paper.year).filter(Boolean))].sort((a, b) => b - a);
  years.forEach((year) => {
    const option = element("option", "", String(year));
    option.value = String(year);
    selectors.year.append(option);
  });

}

function buildTimeline() {
  const core = state.tracks;
  const years = [...new Set(state.papers.map((paper) => paper.year).filter((year) => year && year >= 2016))].sort((a, b) => a - b);
  const counts = new Map();
  let max = 1;
  core.forEach((level) => {
    years.forEach((year) => {
      const count = state.papers.filter((paper) => paper.level === level && paper.year === year).length;
      counts.set(`${level}:${year}`, count);
      max = Math.max(max, count);
    });
  });

  selectors.timeline.style.gridTemplateColumns = `132px repeat(${years.length}, minmax(56px, 1fr))`;
  selectors.timeline.replaceChildren();
  selectors.timeline.append(element("div", "timeline-year", "Level / year"));
  years.forEach((year) => selectors.timeline.append(element("div", "timeline-year", String(year))));

  core.forEach((level) => {
    const label = element("div", "timeline-label", level);
    label.style.color = COLORS[level];
    selectors.timeline.append(label);
    years.forEach((year) => {
      const count = counts.get(`${level}:${year}`) || 0;
      const cell = element("div", `timeline-cell${count / max > .52 ? " is-hot" : ""}`, String(count));
      cell.style.setProperty("--cell-color", COLORS[level]);
      cell.style.backgroundColor = hexToRgba(COLORS[level], .08 + (count / max) * .82);
      cell.title = `${level}, ${year}: ${count} papers`;
      selectors.timeline.append(cell);
    });
  });
}

function matches(paper) {
  if (state.level && paper.level !== state.level) return false;
  if (state.task && paper.task !== state.task) return false;
  if (state.year && String(paper.year) !== state.year) return false;
  if (!state.search) return true;
  const haystack = normalize([
    paper.title,
    paper.authors,
    paper.venue,
    paper.level,
    paper.task,
    paper.categoryPath.join(" "),
    paper.summary,
  ].join(" "));
  return haystack.includes(normalize(state.search));
}

function sorted(papers) {
  const copy = [...papers];
  if (state.sort === "oldest") {
    copy.sort((a, b) => (a.year || 0) - (b.year || 0) || a.title.localeCompare(b.title));
  } else if (state.sort === "title") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    copy.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));
  }
  return copy;
}

function paperCard(paper) {
  const article = element("article", "paper-card");
  article.dataset.level = paper.level;
  article.style.setProperty("--level-color", COLORS[paper.level] || "#60666f");

  const meta = element("div", "paper-meta");
  meta.append(element("span", "", paper.level));
  meta.append(element("span", "", paper.year ? String(paper.year) : "Year unknown"));
  article.append(meta);

  const heading = element("h3");
  const link = element("a", "", paper.title);
  link.href = paper.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  heading.append(link);
  article.append(heading);

  if (paper.authors) article.append(element("p", "paper-authors", paper.authors));
  if (paper.summary) article.append(element("p", "paper-summary", paper.summary));

  const tags = element("div", "paper-tags");
  [paper.task, paper.venue].filter(Boolean).forEach((value) => tags.append(element("span", "tag", value)));
  if (paper.repoUrl) {
    const codeLink = element("a", "tag code-tag", "Code ↗");
    codeLink.href = paper.repoUrl;
    codeLink.target = "_blank";
    codeLink.rel = "noopener noreferrer";
    tags.append(codeLink);
  }
  article.append(tags);
  return article;
}

function render() {
  state.filtered = sorted(state.papers.filter(matches));
  selectors.resultCount.textContent = String(state.filtered.length);
  selectors.list.replaceChildren();

  const visiblePapers = state.filtered.slice(0, state.visible);
  if (!visiblePapers.length) {
    selectors.list.append(element("div", "empty-state", "No papers match these filters."));
  } else {
    const fragment = document.createDocumentFragment();
    visiblePapers.forEach((paper) => fragment.append(paperCard(paper)));
    selectors.list.append(fragment);
  }

  selectors.loadMore.hidden = state.visible >= state.filtered.length;
  selectors.levelFilters.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.level === state.level));
  });
}

function resetVisibleAndRender() {
  state.visible = 36;
  render();
}

let searchTimer;
selectors.search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = selectors.search.value.trim();
    resetVisibleAndRender();
  }, 120);
});
selectors.task.addEventListener("change", () => { state.task = selectors.task.value; resetVisibleAndRender(); });
selectors.year.addEventListener("change", () => { state.year = selectors.year.value; resetVisibleAndRender(); });
selectors.sort.addEventListener("change", () => { state.sort = selectors.sort.value; resetVisibleAndRender(); });
selectors.levelFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-level]");
  if (!button) return;
  state.level = state.level === button.dataset.level ? "" : button.dataset.level;
  resetVisibleAndRender();
});
selectors.clear.addEventListener("click", () => {
  Object.assign(state, { search: "", level: "", task: "", year: "", sort: "recent", visible: 36 });
  selectors.search.value = "";
  selectors.task.value = "";
  selectors.year.value = "";
  selectors.sort.value = "recent";
  render();
});
selectors.loadMore.addEventListener("click", () => { state.visible += 36; render(); });
selectors.copyBibtex.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(selectors.bibtex.textContent);
    selectors.copyBibtex.textContent = "Copied";
    setTimeout(() => { selectors.copyBibtex.textContent = "Copy BibTeX"; }, 1600);
  } catch {
    selectors.copyBibtex.textContent = "Select and copy";
  }
});

async function init() {
  try {
    const response = await fetch("papers.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.papers = data.papers || [];
    buildFilters(data.metadata || {});
    buildTimeline();
    render();
  } catch (error) {
    selectors.list.replaceChildren(element("div", "empty-state", "The paper collection could not be loaded."));
    console.error(error);
  }
}

init();
