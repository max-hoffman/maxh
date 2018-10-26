---
title: "Tflon"
type: "project"
date: 2018-09-30T06:55:06-05:00
draft: true
---

The Swamidass lab I am researching with has a tooling framework called Tflon. Matthew Mattlock, who wrote most of Tflon, first described the project as his attempt to provide tooling that shared Keras's ease of use, but allowed for the full flexibiliy of Tensorflow.

I have never used Keras personally, but I think a more robust version of the project would be a boon to academics and engineers that frequently prototype machine learning projects.

# Modules
A Tflon model is built with a pipeline of modules. Individual modules represent bundled units of preprocessing and/or tflon graph operations.

To separate those two pieces out - module objects can:

+ Preprocess the original input data. This could be normalization, special featurization, padding, etc. We work with graph objects in our lab, which frequently require restructuring before being passed into the Tensorflow graph.

+ Create callable groups of Tensorflow operations. After preprocessing, data is fed into  operations that collectively represent the model. Modules that can abstract clodgy blocks of code for namespaces, weights and biases make model code more organized and readable.

Few operations require proprocessing, and most modules act as a common interface to implement one or the other. Those that do require both are often important and difficult to test and implement. however. The upfront cost of organizing and testing that code in my experieince makes it easier for you and others to reuse and scale complex models.

# Abstraction Layers
In order for the module system to work for Tflon, the process of reading in data and training has to be abstracted from the end-user.

Currently this is solved with:

+ custom Schema and Feed classes to manage input data

+ custom Tower and Trainer classes that parse, organize and run the user-defined Model on Tensorflow

This can be great for users if all of those custom classes are robust, cover edge-cases/special features, and have detailed documentation for their APIs. The truth is that Tflon is in the process of building out those features, and right now you have to understand the abstraction layers to usefully apply Tflon to anything besides the straightforward models.

# Summary
I think Tflon's modular organization and bundled preprocessing/Tensorflow ops could provide a fast and scalable workflow pattern. The current use for the project is for molecular modeling, so most of the updates only bolster the graph-recurrant neural networks we use in lab. We make generalizable improvements when we can - such as buit-in support for multiprocessing to maximize CPU-intensive featurization - but it will take many more man-hours of coding to fill in Tflon's gaps. If that does happen, I think it could be an out-of-the-box solution to quickly and flexiblly test ML prototypes regardless of your skill with Tensorflow.

*The lab plans on open-sourcing the project at some point in the next year.*