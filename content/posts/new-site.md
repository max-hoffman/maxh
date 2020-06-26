---
title: "Hugo Templating"
type: "post"
tags: ["hugo", "markdown", webdev"]
date: 2018-09-29T12:55:06-05:00
draft: false
---

I used the Hugo templating framework to build this site, and will list some of the pros/cons that I noticed.

[Hugo](https://github.com/gohugoio/hugo "Hugo") originally got my attention on HN, through various projects builing landing pages with the framework.
Kubernetes also [migrated their docs](https://www.google.com "Kubernetes") to Hugo recently,
citing scaling issues with Jekyll. I was considering using Next.js to make a markdown/jsx-based site,
but Hugo was both less complex and more easily scalable than a minimalist node or React website.

### Pros:

+ Speed. The Go compiler with hot-reload are built-in and extrememly nice, and give a static folder
that is easy to deploy.

+ Themes. Community-built themes take away the need to spend days configuring custom css. I built the generic site in about 5 hours, which is mostly because now I don't have to spend a week tweaking the css to deviate satisfactorly
from the bootstrap generics.

+ Opinionated: The framework has expected ways to structure your project and organize your articles. I am
personally not interested in spending a long time trying to think about the optimal way to modularize and structure
a blog website. The writers of Hugo were interested in that, and they spent several years optimizing that,
and I'd rather not try to reinvent the wheel.
+ Flexible: Hugo has mechanisms to let you customize markdown files with html to the extent that it's possible.

### Cons:

- Docs. The written and video tutorials try to be helpful, but are lacking. It's a new framework, and
it seems like the expected user has to have a strong grasp of front-end development for Hugo to seem
approachable. Stackoverflow and their in-house forums weren't terrbily helpful.

- Flexible: Markdown rarely needs special-use code, so the overhead of learning how to use the templating,
parameter binding, and shortcoding is sort of a downside of Hugo. I think if the docs were better (maybe 
it's just me) it would be a much clearer upside.

- Templating language: I personally don't like the templating syntax style. It's kind of like Jinja. I think there
are alternatives, but if you want to stick close to the docs you have to use the default.

### Overall:
I hope that Hugo will gain traction and be able to mature as a framework. The logic behind the article structuring is there, but I think the docs could do a better job of explaining more thoroughly how to implement advanced features.

Moving forward I might rely more on trying to look at existing projects to see how they structure themselves. There's a limit to how complex a blogging website can be, and I think it will be worth my time to try to learn one framework extremely well to save myself startup costs in the future.
