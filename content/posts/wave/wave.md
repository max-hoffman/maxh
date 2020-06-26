---
title: "Graph Think with WAVE"
type: "post"
tags: ["graph-rnn", "ml", "washu", "research", "data"]
date: 2019-01-08T14:52:05-06:00
draft: false
---

I spent some time working with graph recurrent neural networks at WashU. One of the key motivations of the project was to design a system that played to a graph's strengths, rather reusing models designed for different applications.

As a lab engineer, I did not own any of the science, so I did not spend the bulk of my time trying to understand the literature or design careful experiements. I'm just going to try to outline some of the graph-think I learned while working in the lab, and why it kind of made sense to rebuild the wheel in this case.

## Vector-think

Because digital systems store data in arrays, our intuitions of vector-based applications (like images) translate nicely into deep learning. High level optimizations like convolution and residual nets are easy to whiteboard with matrices, and predictably performant when applied to image classification.

Vector-think fails to capture the variety of real-world systems, however. Video, text, speech and graphs do not fit into matrices as easily as images, leading to a break-down of performance in those domains (i.e. [performance falls off with data size](https://blog.acolyer.org/2018/03/28/deep-learning-scaling-is-predictable-empirically/)). In the same way that convolution makes sense for images, I think vectors do not naturally capture language. The non-linear structure and temporal-dimension are difficult to represent in arrays.

## Problem-scope

The application was drugs/molecules/chemicals added to batteries and nanomaterials. We were interested in using the local electronic properties of atoms to predict non-local/diffuse/structural characteristics of molecules as a whole. In the traditional sense, we were trying to peek at the output of complex quantum wave equations without having to predict the trajectory of every electron in the system. If accurate, the model could save chemists from having to manually trial individual chemicals for their particualr application. If someone were interested in building better batteries for windfarms, they could screen hundreds of thousands of potential chemicals for electronic properties that played well within their physical restrictions for such a battery.[^1]

[^1]: Super-resolution images are also being studied in this lab (with the same graph techniques). Collections of pixels in histology tissue slides can be traversed as if an image were a big graph. Patterns of disease are traced the same way a rat searches for peices of cheese in a maze. This is counter-intuitive to the "convolution is for images" argument, but is another good example of how appropriate data representations and models change per application.

My first exposure to graph modelling was via adjacency matrices. This was essentially taking a graph and converting it into a 2d matrix, something mathematicians could more easily conceptualize. Most graph modelling historically did something similar, either by making an `n x n` matrix of atomic repulsion pairs, or by bucketing bond types by frequency anc aggregating output in a feature vector. More recent developments left the graph in-place, and performed layers of local convolution on nodes (equivalent to convolutional filters on images).

## Limitations

Serialized graphs usually include a list of node identifiers, edge identifiers, and properties per node and/or edge. That information is translated to matrices because machine learning models use feature vectors to train models of weight matrices.

What are the relevant features of a graph? How do you best represent those features as vectors to pool spatial and non-local relationships relevant to your prediction criteria? If you cannot aggregate salient information apriori, how do the operators of your model transform and share that data in a memory and time-efficient manner?

For small graphs, coarse grain aggregation is sufficient. Serialized graphs translate to matrices non-linearly, however, so at scale several things happen. The in-memory requirements grow. Information is more diffuse, and larger state sizes are needed to capture the full complexity of the solution space. In practice, that means `n x n` feature models performed terribly at scale in the domains we were studying.

This is a "round peg in a square-hole" kind of problem.[^2] We can't change the data loading formats required to do deep learning, but we can change how the information flows within those models to better match the spatial relationship of graphs.

[^2]: Multiple types of targets are also a problem. Different feature and intermediate representations that capture a certain target functions well might fail for predicting other targets. So simultaneous target prediction can suffer in several different ways, in addition to input/output range and variance non-overlap causing trade-offs when tuning model weights.

## Graph-think

Electron density is distributed between bonds according wave functions (like (s)pheres, (p)eanuts or (d)onuts). Our lab's idea was to replicate that oscillatory data flow by ordering state updates between nodes.

The WAVE model moves data in passes through the graph, starting from a central node. Each node is updated once per pass, spreading along nearby neighbors in a breadth-first search step order. Only forward facing BFS connections contribute to node updates, with the the inverse applying to backward passes. Each node acts as a recurrant unit between passes, aggregating information between waves.

In summary, a WAVE model is a network of recurrent units shaped liked the graph of interest. Data moves through the graph in a breadth-first search order. A collection of special gates allow the state space to approximate sinusoidal functions. These two properties allow for more efficient data traversal along the graph to best represent real wave functions.

## Conclusion

By tweaking the model structure, we managed to more accurately capture the spatial relationships of graphs. There are many other competing models in the molecule space, but the inital results of stepping away from orthodoxy has scaled promisingly so far.

Different graph types and application domains will require specialized solutions, but I think the takeaways are transferable regardless of whether WAVE is appropriate in every scenario. Change feature serialization and model architecture to work with the inherent data structure. Members of my lab are convinced that [grid cells](https://deepmind.com/blog/grid-cells/) are doing the same thing for navigational machine learning[^3], and [capsule nets](https://arxiv.org/abs/1710.09829) might be a step beyond convolution towards human-level focus[^4]. From my perspective, anything that deviates from the norm to ask critical and thoughtful questions about a design pattern is worth studying.

[^3]: Navigation is suposedly the iterative application of simple directional movements. i.e. Going from New York to Los Angeles fundamentally invovles the same fundamental set of movements as moving from your living to bed room. Translating that to nerual nets looks like modular (as in mod arithmetic) units of computation (modular-patterned state-space activations). Other researchers have pushed this concept further to suggest that [generic brain function may derive from a modular arithmetic of basic concepts](http://dx.doi.org/10.1101/442418).

[^4]: A neuroscientist that I spoke to at WashU who researches the macaque visual cortex thought dynamic routing was a necessary (if not yet understood) factor in human vision. The implementation is variable, but the general idea is that processing an image fully on a single pass is tough and unnecessary. Animals use feedback loops to more efficiently synthesize and condense information (i.e. maintain some kind of temporary state to confidently converge prediction), and clever ML implementations might lead to better computer vision.
