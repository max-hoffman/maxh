---
title: "Pandas subset that matches Spark syntax"
type: "Data science"
date: 2020-04-10T16:08:33-07:00
draft: true
---

>Design doesn’t have to be new, but it has to be good. Research doesn’t
have to be good, but it has to be new... The best design surpasses its
predecessors by using new ideas, and the best research solves problems
that are not only new, but worth solving. - Paul Graham

Unrealistic Data Science Libraries Pt 1

 * __Pandas subset that matches Spark syntax__
 * Spark/Scala Tensorflow 
 * Path-based airflow that supports dryruns
 * Database native spark/custom udfs lifecycles

This is my attempt to write down ideas that a) might not be possible
to develop cleanly, but b) have been big enough pain points in my work
that I think they're worth writing down.

## Pandas subset that matches Spark syntax

I try to use dataframe APIs wherever possible. Column-level interfaces
distill data transformations into fewer lines of code by standardizing
common patterns, and reduce boilerplate by loosening schema-level
restrictions. Standardization also provides performance benefits,
all-in-all letting engineers write faster code faster.

Pandas and Spark 2 share the similar dataframe interfaces, but were
designed by and for different engineers. Even academic labs are starting
to experience scale limits that stretch the usability of Python for data
science, however, which creates a data/compute gap that only horizontal
scaling can fill. I think the trends of data size and model complexity
will make it difficult for data people to lack Spark and JVM fluency.

In my opinion, Pyspark is a suboptimal solution for both use cases.
Pyspark allows for generic Python code to be run on Hadoop clusters, but
that feature has never been particularly useful in my work. Pyspark
falls short of the production-level safety of Scala, lacks JVM
interoperability and the development flexibility it provides, and is
equally as difficult to write and test as Scala Spark. If we are working
with small amounts of data, Pandas is faster and easier. If we need
production systems for big data, Scala Spark provides many features that
Pyspark cannot.

The first thing I noticed when transitioning to Spark was
1) Pandas and Spark are similar but often logically incompatible
2) Spark testing is slow/boilerplate-dependent

I am interested in a unified interface that allows for dataframe
transformation pipelines to use consistent logical components. And if
possible, the ability to test those workflows in the dynamic language
with syntax that extends to Spark, the more performant runtime.

Here are examples shared logical components:

Select
```
df[[“col”’, “col2”]]
df.select(“col1”, “col2”)
```

Filter
```
df[df.col1 > df.col2]
df.filter(col(“col1”) > col(“col2”))
```

New column:
```
df[“col3”] = 1
df.withColumn(“col3”, lit(1))
```

Join:
```
df.join(df2.set_index(“key”), on=”key”)
df.join(df2, Seq(“key”), “inner”)
```

Groupyby:
```
df.groupyby(“col1”).mean(“col3”)

val tmp = df.groupBy(“col1”).mean(col(“col3”).as(“col3_mean”))
df.join(tmp, Seq(“col1”), “inner”)
```

Rename:
```
df.rename({“col1”: “c1”, “col2”: “c2”}, axis=1)

val oldCols = List(“col1”, “col2”)
val newCols = List(“c1”, “c2”)
df.select(oldCols.head, oldCols.tail: _*).toDf(newCols: _*)
```

Udfs:
```
df[“col3”] = df.apply(lambda x: x.col1 + x.col2, axis=1)

val custom_sum = udf((c1: Double, c2: Double) => c1 + c2)
df.withColumn(“col3”, custom_sum(col(“col1”), col(“col2”))
```

Examples of Python syntax without a Spark counterpart:
```
df3 = pd.concat([df1, df2], axis=1)

df2 = pd.melt(df1, id_vars=[“cat1”], value_vars=[“cat2”, “cat3”])

sub_df = [(n, gr.values) for n, gr in df.groupBy(“cat1”)]
```

Generally, there is a Spark equivalent for every Pandas pipeline. But
Python lets you take shortcuts that can be self-defeating when upgrading
to SQL engine support. Overall, maintaining two logical patterns
between similar pieces of code in Python and Scala is annoying.

Switching costs for Pandas to Spark use would also be lower for data
scientists who have never used the JVM. Currently, you have to create a
new mental model for how to organize data transforms in Spark, on top of
all of the other complications of Scala, uberjars and Hadoop clusters.
Developers could learn Spark syntax without having to deal with any of the download or
interactivity barriers of Spark/Scala, and move into dealing with SQL
plans and memory bottlenecks sooner.

Running tests in Python based on Scala code would make debugging easier
(idk about the implementation, would be tricky). The compilation -> unit
test cycle is slow beyond Scala’s type checking phase, even with Maven
as the build tool. Python will not do the same SQL plan conversion, but
tightening the 20min-1hr Spark testing feedback cycle to minutes would
be similar to the experience of switching from Tensorflow to Pytorch;
iterative correctness and intermediate-checking would be comparatively
painless. Again, this speeds developers into the code efficiency and
memory bottlenecking phase of pipeline management.

In summary, I would like a Python library that uses the Spark interface
to mutate Pandas dataframes. Mental model consistency of core data
manipulations between testing and production code would be helpful, and
might allow for

