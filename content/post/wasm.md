---
title: "Pytorch, Production ML & WASM"
type: "tinkering"
date: 2018-11-22T06:55:06-05:00
draft: true
---

Pytorch released version 1.0 in May, the ["production ready pytorch"](https://pytorch.org/blog/the-road-to-1_0/). "Married to Caffe2" and true production-readiness are still ideals on the horizon rather than present realities. Still, the idealogical shift points at a larger universal goal shared by the builders and users of ML infrastructure.

Pytorch is weak shipping to production, while Tensorflow's API and interface are complex and inconsistent. The way the two libraries are changing to address those shortcomings are critial: Tensorflow is moving in the direction of Pytorch by adding dynamic sandboxing and removing duplciate libraries. Pytorch is moving more in the direction of becoming more extremely dynamic while building tools to make the backend graph-implementation irrelevent.

The [ONNX specification](https://onnx.ai) and [TVM compiler](https://github.com/dmlc/tvm) highlight the importance of Pytorch's plans. ONNX is a Facebook-led project formalizing a consistent graph protocol to shift models between ML frameworks. Sharing and cross-translation is good for the community, and might allow for the trivial conversion of Pytorch to Caffe2 (or Tensorflow).

If ONNX lets model code shift between different frameworks, the TVM compiler supports a one-way transformation of models to pluggable hardware backends. The Amazon and Washington University project includes automatic optimization of their low-level representation, and the ability to supplement their work with custom hardware optimizations.

I think there are two important insights here. The obvious one is that top frameworks are moving in the direction of dynamic and Python-esque interfaces. If each model can be cross-compiled, or sub-compiled and optimized for various backends, the choice of framework will be independent of training speed or production-ease. The best UI will win.

My more intereseting hypothesis is that we should deploy models differently. (Summary of current state of model servers [here](https://medium.com/@vikati/the-rise-of-the-model-servers-9395522b6c58).) TFServing is complete in the same sense that AWS is, but is similarly unapproachable to new-users. Furthermore, the ability to convert models to forms like WebAssembly (WASM) opens new options for the kind of servers that can run inference. Edge deployment can offer lower-latency, higher-throughput and lower-cost predictions than any localized servers ([cloudflare workers](https://blog.cloudflare.com/serverless-performance-comparison-workers-lambda/)).

It is (kind of) possible to take a Pytorch model, convert it to a low-level specification, and  compile it to WASM with something like the [Emscripten compiler](https://kripken.github.io/emscripten-site/). A multi-stage Docker pipeline on a web server could build, version, archive and deploy models to perform inference at edge. Cloudflare's Workers can run highly parellel WASM scripts with <10ms latency on edge using the Javascript V8 engine on hundreds of servers in their CDN.

Unfortunately, every step of that process involves engineering hurdles that are beyond my expertise:

+ Pytorch tracing fails with dynamic models are unpredictable at runtime

+ ONNX conversions have fluctuating dependencies. I could only test the library with official Docker images

+ TVM's code and documentation is tough to understand. The only way I could figure out how to extract an executable WASM from it and Emscripten was probably an abuse of the compiler.

+ Properly building and running a WASM script requires pre- and post-js files (and probably a custom C++ template file) that differ per application. Loading model weights into the script before compilation was also above my head, but seems necessary from production deployment.

+ The Emscripten compiler and WASM are both in development, and might not always work as expected.

I have a feeling these technical problems will be smoothed out over time. I also think someone who knows a lot more about compilers and low-level graph representation of ML models than me will figure out how to commercialize a more modern form of Pytorch deployment by that point.

Check out this [Unreal Engine Sun Temple demo](https://s3.amazonaws.com/mozilla-games/tmp/2017-02-21-SunTemple/SunTemple.html)(doesn't work in Safari). Written in C++, compiled to WASM, and loaded to run in-browser with JavaScript. If this can be run in WebAssembly, someone should be able to operationalize machine learning inference using systems like Cloudflare's Web Workers.

*This is pretty hand-wavy, and I'm not a C engineer, so open to thoughts/feedback/criticism if anyone feels strongly about these technologies. If anyone knows someone building this as a research project or startup I'd be interested to hear about it.*


