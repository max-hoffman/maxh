---
title: "Smaker"
date: 2019-05-25T15:28:52-07:00
draft: false
type: "post"
tags: ["workflow automation", "data", "smaker", "ml"]
resources:
- src: 'img/snakemake-dsl.png'
  name: Pipeline
  title: pipeline
---

# Smaker Workflow Helper

## Motivation
My second project at Factual involved re-evaluating our team's
workflow automation software. The existing system used
[Drake](https://github.com/Factual/drake) to run our pre-processing,
training and evalutation scripts. Drake introduces many pain-points
in the process of writing and maintaining workflows, but I was more
concerned with the lack of certain features that I considered important
for our use cases:

+ Run production/daily training jobs
+ Run A/B tests

Whose requirements are:

+ Move fast: Code reuse, flexibility of logic, flexibility of
  parameters/DAG checking
+ Be organized: Provenance /clarity of workflow parameters (small # of
  configs, repeatable)/code reuse, monitoring+logging
+ Go big: DAG checking/resource management/parallel execution/dep
  management/monitoring+logging

The variety use-cases between organizations have resulted in
[dozens of workflow automation systems](
https://github.com/pditommaso/awesome-pipeline). Unfortunately,
none of those stood out as standalone solutions for our us.

I ended up taking an existing library that covered most features, and adding
some middleware to fill the gaps. The resulting middleware is
called [Smaker](https::/github.com/Factual/smaker), and freely available
for anyone else with similar problems/taste in workflow automation.

## Technical overview

The gist is that [Snakemake](https://snakemake.readthedocs.io)
satisfies most of the three high-level requirements, but lacks the
generality in order to quickly A/B test with re-usable code.

This is a simple example of the Snakemake DSL from their docs:

<div class="center">
  {{< figure src="img/snakemake-dsl.png" name="Snakemake DSL" width="400" >}}
</div>

This simplicity stands out compared to wost workflow languages I have used.
DAG checking allows for verifying dependencies before runtime, a
built in executor manages parallel job and resource management, a
tunable logger makes it easy to organize, sift through and print logs on
local or external servers, in addition to as a host of other "batteries
included" features. Because it is all written in Python, there are no
cryptic serialization, build-time or run-time errors that disrupt the
Pythonic debugging process. Maybe more importantly, that also means you can
include generic Python in Snakemake rules to fiddle with the logic and
control flow (the main reason why I could build Smaker so easily).

The main problem, again, is that parameters are baked-into path names,
which means that adding/changing parameters and sharing rules between
workflows is pretty difficult. A single rule that needs to be changed
for an AB test will not be backwards-compatible, resulting in entire
files copied just to change dependency path names.

Smaker makes it possible to generalize the wildcard names through a
config variable provided at runtime. That makes it easier to quickly
add parameters and share distinct Snakemake files. Sub-workflows
do not need to be aware of the parameters used by other workflows
as long as the file basenames match.

The source code of smaker is pretty small, and there are example
projects that function as a tutorial after cloning the repo and pip
installing the bundled dependencies.

<script id="asciicast-246004" src="https://asciinema.org/a/246004.js" async></script>

I would love feedback and comments, especially if I overlooked other
systems that accomplish the same task more elegantly.

