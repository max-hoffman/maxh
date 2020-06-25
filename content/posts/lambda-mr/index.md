---
title: "Lambda MR"
type: "post"
date: 2020-06-05T10:51:04-07:00
tags: ["data", "spark", "map-reduce", "ml", "mlops"]
resources:
- src: 'img/segment.png'
  name: Segment
  title: segment
draft: true
---

## What problems to Spark and Map Reduce solve?

Was Spark the next generation of MapReduce? Do they solve the same
problem? Is Spark is quick and failure-prone, while MapReduce is slow
and reliable?

To play devil's advocate, I think MapReduce was the right abstraction
for the wrong problem. There are several reasons why Spark is easier on
developers than MapReduce, but at their core both attempted to solve the
problem of data ETL at scale. Why Spark is different, and I think
outcompeted
MapReduce, is that Spark is better tailored for actually doing data
transformations. The Spark model is faster, easier to write, and offers
more features; MapReduce provides limited functionality, slower performance
and agonizingly boilerplate code. Spark chose
SQL as the core abstraction, and SQL is always going to win in a data
abstraction fist-fight.

MapReduce was better for everything outside of data ETL - where joins, key
aggregations, window operations, and the rest of SQL operations and
optimizations do not apply. Reliably calling a set of chained functions
with a limited set of reduction primitives is still a legitimate
problem. Most people do not want to write thousands of lines of Java
code everytime they want highly stable and reliable workflow function
calls, however.

Google's Apache Beam is worth mentioning here as an attempt to move
away from Lambda architectures. By providing a library that lets you run
processing pipelines on various streaming and batch pipeline backends
with a single set of code, they tried to outdo Spark's base syntax
without forcing users to abandon Spark's backend model. The library also
supports more flexible Python code than Spark, moving closer to a map-reduce
compute abstraction. Beam failed to gain tractions for two
reasons, however. First, most people do not need their code to run on
outside of Spark, because Spark supports streaming and batch processing.
Beam helps those already relient on legacy compute backends, or
"Runners" in Beam terminology. Second, the programming interface is
restricted to the same class of data processing steps as Spark and
MapReduce. Those two points make Beam  a direct competitor to
Spark's Dataframe interface. That was not Google's original
intention when releasing the library, but in practice is mostly true
given the current product landscape and common use-cases in industry.

## What does Spark and MapReduce lack?

This provides an opportunity for a product that uses map-reduce in a
more general way to solve a different problem than the MapReduce, Spark and
Apache Beam family of SQL processing tools. In-between Spark's data
efficiency and AWS Lambda's execution flexibility is a cloud-native
map-reduce product that might capture the consistency, reliability and backend
portability of MapReduce without the structural limitations of trying to
compete with big data ETL platforms. Functions in Docker containers can
be written in arbitrary languages, chained in arbitrary DAGs, offer
optional schema enforcement, support built-in monitoring and logging, and
provide an open-source means for engineers to customize.

One use-case might be deploying ML models for online and offline
processing. Data scientists write preprocessing and model evaluation in
Python, but deploying that code to batch and real-time
pipelines usually requires reformatting, glue code, and/or code
restructuring to meet production use-cases. A multi-backend chaining
wrapper might
offer a more direct deployment of code to production than would
otherwise be possible by (ex) individually writing JNI wrappers for Spark
batch processing, and Terraform/Serverless deployment scripts for
setting up real-time APIs.

## Model evaluation example case

In my work at Factual, I worked on a project that involved running our
Place Attachment model on trillions of locations in America cities. The
purpose of this project was to create a map of the entire input/output
space for the model domain. Unlike other machine learning problems, like
computer vision, the entire input space for location modeling is
two-dimensional - the surface of the earth. By running an entire city
through the model, I can visualize exactly which areas of space the
model is attributing to which stores.

<!--<div class="center">-->
  <!--{{< figure src="img/segment.png" name="Segment" width="400" >}}-->
<!--</div>-->
{{< img src="posts/lambda-mr/img/segment.png" class="large" caption="Segments" >}}

To give some additional background, running the model over a space lets
me quantify properties of the model using its output topology.
I can count the numbers of (segments) in a city, the square meters of
a segment, the average segment area by place category or store name, the
overlap percentage between a segment and a building store outline, and
(most importantly) compare the shapes of two segments for two different
sets of model parameters.

In order to do all of the work visualizing and quantifying those values,
I first had to run our model in Spark. A second special attribute of
location modeling was that the category space was massive - 100's of
millions of potential classes for every input tuple. Obviously a
location signal in e.g. Chicago should be mapped to places nearby, but
the sheer volume of classes introduced a complicated logic for accessing
potential candidates. Our solution downloaded gigabyte-sized shards of
cities locally to disk in an LRU cache, which works fine for most
use-cases, but stubbornly fails to interoperate with Spark or MapReduce.

Spark and MapReduce have a difficult time running the model code for
diferent reasons, but the problems can be summarized into 1) partitioning and 2) memory
management issues. Rows of data sharing the same LRU shard need to be ran
on the same compute nodes, and Spark needs to __not__ chain/pipeline data
transformations while blind to gigabytes of shard data in the C++ memory
space.

Separating preprocessing and model evaluation steps from the data
postprocessing would have provided a more natural abstraction for the
workloads. Postprocessing is Spark's break and butter - e.g. aggregating, averaging
and running custom UDFs on rows of input/output data, and joining the
results with external datasets to supply supplementary metadata.
The preprocessing steps do not fit an SQL abstraction,
however, and it took months of fighting to run evaluation in an unnatural
environment.

A lambda architecture that could chain a preprocessing step to an
evluation function would have made my life easier. The same setup could
have been used for streaming servers and API endpoints with the right
backend abstraction, I think, saving the need to write custom code
everytime new "model evaluation" use-cases arise.

## Conclusion

Spark, MapReduce and Apache Beam all have different redeeming features,
but ultimately target the same problem on the customer end. Data
processing at scale will continue to favor in-memory SQL abstractions
until someone comes up with a better schema-based database model.

What SQL and Spark do not solve is everything else function-chaining
related. I think the map-reduce model's reliability and simplicity have
merits, and might lend nicely to capturing the function
chaining/lambda architecture space if implemented with a general enough
abstraction.

Serving machine learning models is one key area I have personally
experienced friction in Spark, and I think the
nature of model preprocessing and evaluation is general enough beachhead
for a Lambda MR library to add value to the work of data scientists and
machine learning engineers. A clean-enough implementation might
offer a shared model for online and offline processing, in the same way
Apache Beam ships to multiple backends. And because preprocessing and
model evaluation is such a large component of the machine learning lifecycle,
I believe a simple architecture might provide opportunities to
frictionlessly loop in AB testing, model monitoring, model performance,
and other stages of the MLOps lifecycle.

