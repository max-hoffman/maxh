---
title: "MLOps Segmentation"
type: "post"
tags: ["data", "market analysis", "mlops", "data science"]
keywords: ["data science", "mlops", "market analysis"]
date: 2020-06-02T16:31:38-07:00
draft: false
---

I was doing some market analysis on data science tools, and broke down
categories along a "hand-holding" metric. I think this falls
back to the same "correctness principle" that I mentioned in the [workflow
article](../minimalist-workflow-execution), where there is a balance
between lightweight tools that flexibly bend to the user's need, and
heavy-weight tools that do "everything" in a narrow and opinionated way.

Heavy-weight tools are those that carry data scientists from testing
through to deployed models. These products look like AWS Sagemaker and
Google AutoML: closed-source, proprietary, inflexible, and provide the
infrastructure experience for data scientists.

At the other end are lightweight, flexible and imperfect open source tools
that do one thing well. Spark, Grafana, Pytorch, Airflow, and
Kubernetes are all similarly-spirited tools that are dominant but often
require individual user customization.

Middle-of-the-road (or multi-integration) products in my opinion
try to do too much, and
end up being tools that provide some structure, but little
flexibility and incomplete platform support. Unlike fully-featured
platforms, these tools take one set of sofware engineering pain
points and transform them into a second similar but equally time-consuming set of
engineering pain points. BentoML, MLFlow, CortexML and H20.ai are a few
examples of products that I think try to accomplish several steps of the
ML lifecycle.

I have a couple personal opinions regarding multi-integration products.
First, software engineers are wary of creating new problems for themselves by too
swiftly adopting libraries that offer structure but no new
functionality. Engineers that are good enough to integrate those systems
with legacy software usually prefer to use the underlying components
instead. I think this leads to the prodominance of these products
expanding primarily along enterprise models, rather than open-source
communities. Enterprise software that is specific to a business sector is
has value, but lacks the ubiquity of design simplicity and community growth
desired by open-source projects.

A handful of large companies have enough resources to provide
heavy-weight closed-source tools. The remaining products will be judged
by the winners in the open-source space. Tools that become best practices
define community thought patterns and abstractions, leaving
middle-of-the road solutions outside of best-practices by definition.

__A longer (non-exhaustive) list of MLOps companies/projets:__

Hand-holding:

 * Datarobot
 * Databricks
 * Sagemaker
 * Google AutoML
 * FBLearner
 * Domino

Narrow tools/products:

 * Snowflake
 * Airflow
 * Grafana
 * TFServing
 * Jenkins
 * Kafka
 * Datadog
 * ONNX
 * Artifactory
 * RabbitMQ
 * (Octo.ml?)
 * (Tecton.ai?)
 * (Kubernetes maybe)
 * Spark(Databricks), TF, Pytorch, etc

Middle of the road:

 * H20.ai
 * Algorithmia
 * Segment
 * Mlflow
 * Metaflow
 * BentoML
 * CortexML
 * GraphPipe
 * Weights and biases
 * Kubeflow pipelines

Other:

 * GraphPipe
 * [Denzel](https://github.com/eliorc/denzel)
 * Clipper
 * Ray
 * TVM/Halide
 * [Kedro](https://kedro.readthedocs.io)
