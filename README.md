# Social Intelligence Modeling Survey Homepage

Static GitHub Pages homepage and interactive paper explorer for:

> **Social Intelligence Modeling: A Comprehensive Survey from Social Perception to Social Simulation**  
> Zikai Song, Xiajie Li, Yunyao Zhang, Xinglang Zhang, Wei Yang, and Junqing Yu  
> Huazhong University of Science and Technology, 2026

## Contents

- `index.html` — deployed survey homepage.
- `assets/css/styles.css` — responsive visual design.
- `assets/js/app.js` — client-side timeline, search, filters, and sorting.
- `assets/data/papers.json` — normalized unique selected-paper collection.
- `assets/img/` — survey overview and taxonomy figures.

## Local preview

```bash
python -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Sources and attribution

- Paper: <https://doi.org/10.13140/RG.2.2.21157.87528>
- Living collection: <https://github.com/sait-crypto/Awesome-Social-Intelligence-Modeling-System>
- Paper and figures are reported by ResearchGate as **CC BY-NC-ND 4.0**. They remain under the authors' copyright.
- The normalized browser data is derived from the public companion repository and preserves outgoing links to the original papers.

## Deployment

This repository is designed to be served directly from its root by GitHub Pages.
