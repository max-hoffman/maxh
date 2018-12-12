---
title: "Multiprocessing in Python"
type: "research/project"
date: 2018-10-04T19:32:09-05:00
draft: true
resources:
- src: 'img/pipeline.png'
  name: Pipeline
  title: pipeline
---

## Context

I spent the last couple of weeks learning how to optimize multithreading and multiprocessing to increase throughput during Tensorflow training. We have been able to overcome our CPU bottleneck, making our training GPU-limited. The library's documentation is not inviting, and I found a lack of community information on the subject, so I thought I would summarize some of what I learned. I knew nothing about multiprocessing when I started this project, so hopefully everything here should not be too out of reach for beginners.

Multihreading and multiprocessing share the common goal of parallelizing code. When you want several things happening at the same time, some combination of the two can usually reduce the runtime of your application.

Python's threading and processing have different intended purposes, which can make them easy to confuse and difficult to use appropriately with Tensorflow.

 Threads are useful for compartmentalizing asynchronous pieces of code. For example, a RESTful API that makes lightweight database queries can parallelize I/O reads by taking advantage of multithreading. Threads share namespace and memory, so asynchronous calls performed as threads share the spawning parent context. Shared contexts make threads easy to write and use, because you know exactly what's happening and where it is happening.
 
 Threads fail to parallelize for any CPU-intensive operations, however. Python's Global Interpreter Lock (GIL) prevents any two simultaneous computations even if multiple cores are available. Tensorflow training therefore cannot be usefully accelerated with threads (outside of data loading/saving).

 As you might guess, multiprocessing bypasses the GIL and lets Python access CPUs at any given time. The caveat is that Python multiprocessing is memory-inefficient, and adds a data transmission barrier between processes. You should probably try to use alternatives if possible.

Possible alternatives to multiprocessing:

 + Pyro4: Uses a proxy server to run scripts across a network of resources.

 + Dask/Spark: Organizes a series of worker nodes into a cluster. Scheduler node can load data and map functions across the cluster in a distributed manner.

 + Hadoop cluster: Transfer and apply functions across a distributed data set

 + mpi4py: Low-level (language-agnostic) message passing interface that can coordinate scripts among a series of nodes.

Script-running and map/reduce libraries are difficult to orchestrate inside of a Tensorflow session. The MPI library is probably doable, and probably faster than the standard multiprocessing library, but difficult to implement. When not ran as a single script, MPI nodes require manual configuration during run-time. 

(Since originally writing this I learned about Pytorch's [generic mulitrocessing interface](https://pytorch.org/tutorials/intermediate/dist_tuto.html#communication-backends Multiprocessing Communication Backends) for TCP/MPI/Gloo, which is worth looking at.)

## Our multiprocessing model

Multiprocesseing lets us evade the GIL and parallelize input featurization. We can maximize CPU usage, letting us focus on GPU training.

Python makes it difficult to implement this system, however. Our pipeline includes several operational nodes and computational edges:

Nodes:

+ Main process

+ Worker processes

+ Index-queuer thread

+ Batch-queuer thread

Edges:

+ Index-queue

+ Batch-queue

+ Tensorflow queue (runner)


<div class="center">
  {{< figure src="img/pipeline.png" name="Pipeline" width="400" >}}
</div>

*For the sake of brevity I try to keep the descriptions here short. It would require a seperate article to explain the [code](https://bitbucket.org/mkmatlock/tflon/ Tflon)d implementation. I liked [this](https://www.geeksforgeeks.org/multiprocessing-python-set-2/ Tutorial) tutorial when getting started with multiprocessing.*

The overall goal, again, is to take unprocessed data, featurize it, and send it to the Tensorflow model. The slightly lower-level restatement is that we want to distribute batch-preprocessing among several worker processes, that then converge on a Tensorflow Queue to be fed into the model.

Our implementation begins with (all) data copied to each worker process. Workers pull indexes from an index-queue (via the index-queuer thread on main process). Workers slice batches from those indexes and pre-process the batches. Featurized batches are serialized as numpy arrays, and sent back to the main process through the batch-queue (specifically to the batch-queuer thread). Featurized batches are enqueued to the Tensorflow FIFOQueue, which is dequeud by the model.

### Implementation caveats
Many of these steps initally seem redundant. For example, why would we copy all data to every worker process? Our data sets are small (150k molecules), and the memory overhead is currently preferable to other alternatives. Sending whole batches through Queues is prohibitive in our case without MPI (we are open to other solutions). Sharding adds a barrier to measuring epochs, and can restrict the diversity of batches lumped in sharding groups.

*Efficient batch transmitting (replacing data copying + index transmission) is a desirable next step. This has the added benefit of gracefully generalizing to databases that cannot be held in memory*

Spawned processes reinstantiate normal Python classes. That means you need Pipes, Queues or Managers to share common data/classes between processes. Without the batch-queue on the main process connecting featurization and enqueueing, each worker would be stuck with its own isolated FIFOQueue. Managers that act as common sources of communication sound straightforward, but were a mess in practice. They spawn a complete extra process, perform more slowly than the Queue setup, and crash unexpectedly taking the Tensorflow session down with it. Individual Queues for each worker likewise underperform.

The last barrier to implementation is smoothly managing all running threads, processes and in particular queues. Full queues error on `.put()`, empty queues hang on `.get()`, and every queue and lock method can block, hang and die if not timed-out or restarted on a regular basis. The documentation glosses over proper process and thread managing, so it is important to be aware of these details if building your own.

### Extra tricks

+ Pickling data is error-prone and slow. We used a [numpy-optimized serializer](https://arrow.apache.org/blog/2017/10/15/fast-python-serialization-with-ray-and-arrow/ ray/pyarrow) to reduce the communication latency over our batch-queue (note that the same speedup does not work in reverse, because the unprocessed data is in molecular format.)

+ Data only leaves the index-queue from a single source after instantiation. A multiprocessing Queue allows communication of indexes between the parent and worker processes, while the custom `IndexQueue` perpetually feeds data into that loop.

+ Using a `mulitprocessing.Manager.Queue` instead of 'multiprocessing.Queue` provided more stability for us with `Python 2.7.6`. The fidelity of different implementations will depend on your particular version of Python.

### Added

We ended up using the batch-queue to replace the index-queue. Instead of copying data to each process,
we can now send serialized batches to the processes. Because multiprocessing gives us leeway with CPU-intensive operations, we can have data-efficient processes and centrally track epochs while still being GPU-limited.

I added this above already, but Pytorch's multiprocessing is pretty comprehensive and worth studying/using ([here](https://pytorch.org/tutorials/intermediate/dist_tuto.html#communication-backends)).

The [Petastorm project](https://github.com/uber/petastorm) is worth looking at regarding parallel data reading, even though it did not quite fit our needs.

### *More*

*[Similar application from Tencent engineer](https://wltrimbl.github.io/2014-06-10-spelman/intermediate/python/04-multiprocessing.html)*