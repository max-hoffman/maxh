---
title: "Unrealistic DS - Spark Tensorflow"
type: "data science"
date: 2020-05-27T14:38:49-07:00
draft: true
---

_“People aren't afraid of autocrats. People are afraid of being
different from thier neighbors.” -Jacob Snell (Ozark)_ 

These are a few ideas that might not be possible
to develop right now (or might not even be good ideas in practice),
but originate from pain points in my work.

 * [Pandas subset that matches Spark
   syntax](../pandas-spark-dataframes)
 * [Minimalist workflow execution
   language](../minimalist-workflow-execution')
 * [__Spark Tensorflow__](../spark-tf)
 * Database native spark/custom udfs lifecycles

## Tensorflow/Pytorch on Spark

I think an ML training framework with primitives designed for
a Spark cluster would help bridge the gap between research and
production machine learning. Most data scientists and ML
researchers have strong opinions in the other direction, however,
favoring solutions that would shore up Python's weaknesses. I want
to walk through my opinions in response to common converns regarding
ML in the JVM.

**1) Python syntax is unrivaled in two dimensiions: i) ease of pseudocode
"just working", and ii) entrenched familiarity by scientists,
researchers and industry experts.**

Python syntax is nice and easy to get immediate feedback using, but
Scala interfaces should feel familiar to Python users. Scala's
library structure and language features diverge,
and compiling/debugging/testing feels different, but I do not
think Scala syntax would trip up data scientists writing model code.

Personal language and feature preferences are subjective, and I have
room to agree that a portion of productivity comes down to individual
opinion. Python is socially dominant, it feels good to agree with neighbors.
I think it is objective that Python exclusive modelers will be increasingly
handicapped in a world of growing data, complexity and competition.
Learning how to do your work at production scale,
removing the need for a second group of specialists to rewrite your code is
different than say, learning "functional programming" or "lisp" to grow
as a developer.

**2) Python's library and tooling ecosystems allow for code-reuse throughout
academia and industry in ways that are distinct from the social moat.**

I think this is a valid critique. Communities move forward with open research,
shared code, and reproducible work. I do not want to have to rewrite and
retrain an entire BERT model to test an NLP solution; I want to download
and reuse someone else's weights, architecture and hyperparameters.

The nature of how machine learning work is so interdependent dovetails nicely
into why translating code to production is so hard, however. Code that
researchers and data scientists write is rarely suitable for
production. Forgetting performance concerns, the structure of how
data scientists tinker, feature engineer and train in test sandboxes is incompatible
with the MLOps lifecycle required to create, evaluate, ship and monitor
most online and offline ML solutions (and usually multiple use-cases are
required).

I think a Spark backend would need to support training and shipping
models written in other ML frameworks. The history of ML is written in
Python, and it will continue to be written in Python. All of that work is wasted if
models do not make it to production, however. Perhaps Spark operators
that plug into the ONNX standard, or some other interoperability
technique could satisfy the best of both worlds.

**3) Dependency headaches can be abstracted by container images.
the build process and cluster configs are more valid techincal
critiques.**

Packaging dependencies into containers abstracts one level of issues, but
neglects the scheduling, orchestration and networking barriers that made
Spark so powerful. ML training is different than sorting a Petabyte of
data with 1000 machines, but both are fundamentally distributed IO and
computation.

JVM packaging and dependencies are headaches of their own, and Spark
configuration managment is non-trivial. Once you get the hang of
uberjars, they can actually be helpful. And in my experience, trying to
manually download or compile compatible versions of Pytorch and
Tensorflow with the rest of your dependencies is similarly painful to
MVN shading and spark-confs incapatibilities.

**4) Proposed "static language performance improvements" underplay three key
points: i) performance optimizations can only improve runtimes when targeting
throughput bottlenecks, ii) neural net training is often bottlenecked by
matrix arithmetic, and iii) matrix operations invoked by Python interfaces
already performed by C++ shared libraries.**

I agree that "doing ML in C++/Rust/Julia" would not bring meaningful
performance improvements to ML. Data is half of the equation in
ML training/serving/batch inferencing/streaming, thoough, and moving data between
datastores/memory/queues/swapped between
processes/pushed to logging services, involves a lot of overhead.
Schema enforcement, scheduling operations and data movements, catching
packet and node loss, checkpointing, service discovery, autoscaling, etc
are all as important as "does the model code work".

**5) Tools like Dask and Horovod are proof that Python-first solutions can
be created for data science scaling problems.**

I think the Python tooling points are valid, but unsupported by existing
examples in the space. Dask and Horovod are rigid and do not support
as many use-cases as Spark because of the abstraction-levels with
which they were built. I think this all comes back to whether a product
captures a simple open-source niche that competitors love too much to
compete with with. A ring-all-reduce for Tensoflow and Pytorch works
nicely in some cases, but even small organizations have a variety of
processing and training use-cases that won't fit Horovod's mold. At some
point engineers will build in-house wrappers to support almost-identical
use-cases, and then eventually resort to additional and mostly redundant
compute architectures to save dev time. I have seen duplicate workflow
systems act as intermediaries between multiple "specialized" data scheduling
solutions that turned out to not be general enough.

## Distributed-first tooling

Python in its current form does not provide the open-source tools to
train, ship and monitor neural nets simply, powerfully and at scale in
industry. Developing these characteristics will be necessary for the
field to move into a similar state of maturity as software engineering.

One path towards achieving that goal is bringing the JVM closer to
machine learning. Spark is a powerful abstraction for moving
data at scale, with a programming interface that I think is simple
enough for data scientists to use. Both of these features I think lend
naturally towards Spark as a backend for model training.

Any training library would need to design custom primitives for
executing training code
in Java/on Spark's as a backend, and more importantly win
the hearts of data scientists. H20.ai's attempt at providing such a
library is example that provides a small subset of what you would find in
Tensorflow or Pytorch. The attractiveness of training libraries will
be baselined by the user-experience expectations set by Python libraries,
however.

An alternative to data science moving closer to the JVM are Python
libraries moving closer towards the distributed power of Spark. I
will talk about the advantages and disadvantages of that approach
in a separate article.

