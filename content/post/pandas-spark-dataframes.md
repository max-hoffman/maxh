---
title: "Unrealistic DS - Pandas/Spark Subset"
type: "data science"
date: 2020-04-10T16:08:33-07:00
draft: true
---

_"Design doesn’t have to be new, but it has to be good. Research doesn’t
have to be good, but it has to be new... The best design surpasses its
predecessors by using new ideas, and the best research solves problems
that are not only new, but worth solving." - Paul Graham_

These are a few ideas that might not be possible
to develop right now (or might not even be good ideas in practice),
but originate from pain points in my work.

 * [__Pandas subset that matches Spark
   syntax__](./pandas-spark-dataframes.md)
 * Spark/Scala Tensorflow
 * Path-based airflow that supports dryruns
 * Database native spark/custom udfs lifecycles

## Pandas subset that matches Spark syntax

I try to use dataframe APIs when possible. Column-level interfaces
standardize common patterns into shorter lines of code, and reduce
boilerplate by loosening schema restrictions (i.e. you can add and drop
columns without changing/making new schemas). Standardization also
provides performance benefits, all-in-all letting engineers write faster code faster.

Pandas and Spark 2 share the similar dataframe interfaces, but were
designed by and for different engineers. Even academic labs are starting
to experience scale limits that stretch the usability of Python for data
science, however, which creates a data/compute gap that only horizontal
scaling can fill. I think the upward trends in data volume and model complexity
will make Spark and JVM fluency (or the next cluster compute paradigm) a necessity
for data people.

In my opinion, Pyspark is a suboptimal solution for both use cases.
Pyspark allows for generic Python code to be run on Hadoop clusters, but
that feature has never been particularly useful in my work. Pyspark
falls short of the production-level safety of Scala, lacks JVM
interoperability and the development flexibility Java provides, and is
equally as difficult to write and test as Scala Spark. If we are working
with small amounts of data, Pandas is faster and easier. If we need
production systems for big data, Scala Spark provides many features that
Pyspark cannot.

The first thing I noticed when transitioning to Spark was
1) Pandas and Spark are similar but often logically incompatible
2) Spark testing is slow and boilerplate-dependent

I am interested in a unified interface that allows for dataframe
transformation pipelines to use consistent logical components. And if
possible, the ability to test those workflows in the dynamic language
with syntax that extends to Spark, the more performant runtime.

Here are examples shared logical components:

Select:
```scala
df[[“col”’, “col2”]]

df.select(“col1”, “col2”)
```

Filter:
```scala
df[df.col1 > df.col2]

df.filter(col(“col1”) > col(“col2”))
```

New column:
```scala
df[“col3”] = 1

df.withColumn(“col3”, lit(1))
```

Join:
```scala
df.join(df2.set_index(“key”), on=”key”)

df.join(df2, Seq(“key”), “inner”)
```

Groupby:
```scala
df.groupyby(“col1”).mean(“col3”)

val tmp = df.groupBy(“col1”).mean(col(“col3”).as(“col3_mean”))
df.join(tmp, Seq(“col1”), “inner”)
```

Rename:
```scala
df.rename({“col1”: “c1”, “col2”: “c2”}, axis=1)

val oldCols = List(“col1”, “col2”)
val newCols = List(“c1”, “c2”)
df.select(oldCols.head, oldCols.tail: _*).toDf(newCols: _*)
```

Udf:
```scala
df[“col3”] = df.apply(lambda x: x.col1 + x.col2, axis=1)

val custom_sum = udf((c1: Double, c2: Double) => c1 + c2)
df.withColumn(“col3”, custom_sum(col(“col1”), col(“col2”))
```

Examples of Python syntax without a Spark counterpart:
```scala
df3 = pd.concat([df1, df2], axis=1)

df2 = pd.melt(df1, id_vars=[“cat1”], value_vars=[“cat2”, “cat3”])

sub_dfs = [(n, gr.values) for n, gr in df.groupBy(“cat1”)]
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
interactivity barriers of Spark/Scala, and more quickly move into dealing with SQL
plans and memory bottlenecks.

Running tests in Python based on Scala code would make debugging easier
(ignoring whatever the implementation looks like for now). The compilation -> unit
test cycle is slow beyond Scala’s type checking phase, even with Maven
as the build tool. Python will not execute the same SQL logical plan, but
tightening the 20min-1hr Spark testing feedback cycle to minutes would
be similar to the experience of switching from Tensorflow to Pytorch;
iterative correctness and intermediate-checking would be comparatively
painless. Again, this speeds developers into the code efficiency and
memory bottlenecking phase of pipeline management.

In summary, I would like a Python library that uses the Spark interface
to mutate Pandas dataframes with as many transpilation features as
possible. Research and production code can have a common set of
operators for processing data. Testing that interface in the dynamic
environment would support a smoother testing to production progression.
