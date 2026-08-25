# Social Intelligence Modeling Survey Homepage

Static GitHub Pages homepage and interactive paper explorer for:

> **Social Intelligence Modeling: A Comprehensive Survey from Social Perception to Social Simulation**  
> Zikai Song, Xiajie Li, Yunyao Zhang, Xinglang Zhang, Wei Yang, and Junqing Yu  
> Huazhong University of Science and Technology, 2026

## Contents

- `index.html` — deployed survey homepage.
- `styles.css` — responsive visual design.
- `app.js` — client-side timeline, search, filters, and sorting.
- `papers.json` — AI4SS-owned paper collection.
- `overview.png` and `category-architecture.png` — survey overview and taxonomy figures.

## Local preview

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Sources and attribution

- Paper: <https://doi.org/10.13140/RG.2.2.21157.87528>
- Paper repositories: <https://github.com/AI4SS>
- Paper and figures are reported by ResearchGate as **CC BY-NC-ND 4.0**. They remain under the authors' copyright.
- The interactive browser includes only papers represented by public repositories owned by the AI4SS GitHub account.

## Deployment

This repository is designed to be served directly from its root by GitHub Pages.
