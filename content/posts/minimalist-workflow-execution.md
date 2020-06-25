---
title: "Unrealistic DS - Minimalist Workflows"
type: "post"
date: 2020-04-14T15:32:59-07:00
draft: true
---

>Right-thing philosophy is based on letting the experts do their expert
thing all the way to the end before users get their hands on it. [But]
in some cases, the software system that succeeds starts with a kernel of
good technology, but it is not committed to fully realizing that
technology. By enabling users to live in the implementation to some
extent or to mold the technology to users’ needs while dropping hurdles
to the use of the technology, that system is able to survive and
evolve. - Richard P Gabriel

These are a few ideas that might not be possible
to develop right now (or might not even be good ideas in practice),
but originate from pain points in my work.

 * [Pandas subset that matches Spark
   syntax](../pandas-spark-dataframes)
 * [__Minimalist workflow execution
   language__](../minimalist-workflow-execution')
 * [Spark Tensorflow](../spark-tf)
 * Database native spark/custom udfs lifecycles

## Minimalist workflow exectuion language
Characterizing products as good or bad examples of “right-thing”
philosophy is difficult, because success metrics vary depending on the
user. The author of the above quote chose PC/Mac as an example of Apple
as a “right-thing” philosophy failure, for example, citing a 30/70%
market share ratio as proof of Apple’s failure. Apple had double the
revenue of Microsoft in 2019, however, and an equivalent market cap.
When it comes to user-facing products, whether something worked or not
really depends on whether it sells.

When it comes to developer-specific tools, “wrong-thing” philosophy
seems like the rule rather than the exception. Terraform, for example,
lacks most of the organizational-level features required to actually
maintain Cloud-infrastructure state as code. Every organization has to
find their own way to separate testing resources, reduce code
redundancy, coordinate state updates, keep secrets out of version
control, ...etc. But Terraform’s code and interface is so stupidly
simple that it is hard to imagine a better replacement.

Workflow execution management is an area of data science/data pipelining
that needs a “wrong-thing” product. Current solutions are
unsatisfactory, but are also not simple or extensible enough to be
dominantly exceptional.

* Dryruns
* DAG chaining
* Control flow / composability
* Sliding scale of formality / version-control

## Dryruns
A dryrun is a way to test the logic of a workflow pipeline. The depth of
information dryruns provide depends on:

* The amount of extra code you need to write: Overcomplicating workflow
  definitions to the point of blocking development is comparable to
  verbose and unnecessary unit tests.

* The amount of time it takes to do the dryrun: Dryruns aren’t helpful
  if they don’t run quickly enough to be an immediate-feedback
  debugging/CI tool.

* The level of configuration verified in a dryrun: Dryruns can only
  test certain failure cases. Examples of helpful failure cases are total
  rule/argument summaries for a DAG, path verification between dependent
  sub-tasks, and testing any glue code outside of core time/compute-heavy
  scripts/tasks. A key sub-feature here is what steps are going to run,
  because you might want to take advantage of cached steps when possible.

Workflow writers should be able to extend and curtail these features.
Path-based verification of job connectability is the best system I’ve
seen for supporting this feature so far, but Snakemake’s interface for
doing so makes it difficult to customize. Relying on file timestamps
rather than dependency hashes for caching / not re-running steps also
has downsides.

```snakemake
# dryruns will raise syntax error for custom logic outside of main rule commands
source_path = os.path.jon(sys.getcwd(), '..', 'source.csv')

# dryrun creates a dependency graph using input and output files
# create_A -> create_B -> finish
# or
# create_B -> finish (if A.csv already exists)
rule create_A:
    input:
        source_path
    output:
        'A.csv'
    shell:
        'script_A.sh {input} {output}'

rule create_B:
    input:
        # dryrun will raise error for path name inconsistencies
        'a.csv'
    output:
        'B.csv'
    shell:
        'script_B.sh {input} {output}'
```

Luigi's interface for defining job success on an individual basis
is customizable, but is tied to a verbose interface that requires
code duplication that makes simple jobs difficult to maintain.

```python3
# Luigi's output method can be overwridden to customize task success conditions
class DailyReport(luigi.Task):
    date = luigi.DateParameter()
    def output(self):
        return luigi.contrib.hdfs.HdfsTarget(self.date.strftime('/reports/%Y-%m-%d'))
    # ...
```

## DAG chaining
Workflows often have multiple layers of logical components (or are
connected to other workflows), but workflow languages don’t always
support sectional composiblity. For example, say I had a set of 20 rules
that ETL and join separate data sources into a database, and then
another set of 10 rules that use the database for training a machine
learning model, and finally a set of 15 rules that do compute-intensive
QA with a combination of the model and the database sources. It might
make sense to break those rules into logical components, partially for
code organization, but also because you might not always want to run all
three at the same time.

Airflow jobs are a good example of composability. New jobs can be
created and chained to old jobs without dependent processes needing to
be aware of each other.

```python3
# the three tasks here do not share dependencies, but can be ran together
with DAG('my_dag', start_date=datetime(2020, 1, 1)) as dag:
    (
        DummyOperator(task_id='dummy_1')
        >> BashOperator(
            task_id='bash_1',
            bash_command='echo "HELLO!"')
        >> PythonOperator(
            task_id='python_1',
            python_callable=lambda: print("GOODBYE!"))
    )
```

My research lab at WashU provided wrapped Scons with an interface
for running disparate jobs in a more scriptable way than Airflow:

```python3
@sciscons.make_procedure
def step1(exp):
    pass

@sciscons.make_procedure
def step2(exp):
    pass

env = sciscons.Env()
step1 | step2 | env.create_endpoint( 'experiment_name' )
```

## Control flow / self-composability
A workflow language should be able to iteratively run jobs with
different sets of parameters / optionally call steps. Continuing with
the previous example, a machine learning engineer should be able to
flexibly re-run the training step with different parameters without
having to use a bash script or copying and pasting yamls.

Snakemake’s wildcards are an interesting innovation in this direction,
which let developers pass a list of arguments for specific option names.
The rules for wildcard use simultaneously loose and
strict, however, which can make the code hard to debug/reason about.

```snakemake
output_files = [f"radius={r}_result.csv" for r in range(4)]

rule all:
    input: output_files

rule create_A:
    input:
        source_path
    output:
        'radius={radius}_intermediate.csv'
    shell:
        'script_A.sh {input} {output}'

rule create_B:
    input:
        'radius={radius}.csv'
    output:
        'radius={radius}_result.csv'
    run:
        if int(wildcards.radius) > 2:
            shell('script_B.sh {input} {output}')
        else:
            shell('touch {output}')
```

## Version control
Optionally versioning code and referencing by version can be helpful.
Three existing ways of doing this and their trade-offs:

* Data Version Control (DVC): DVC's whole pitch is to version
  every step of a data pipeline; i.e. their design is the deepest versioning rabbit-hole.
  You use their interface to register data sources, register scripts,
  and register pipelines. In my opinion, the downside is losing sight of the
  forest by focusing too strongly on every tree. Operational barriers make
  it difficult to move quickly with any of the other features I desire.

```bash
$ dvc run -f featurize.dvc \
    -d src/featurization.py -d data/prepared \
    -o data/features \
    python src/featurization.py \
         data/prepared data/features

$ dvc run -f train.dvc \
    -d src/train.py -d data/features \
    -o model.pkl \
    python src/train.py data/features model.pkl

$ git add data/.gitignore .gitignore featurize.dvc train.dvc
$ git commit -m "Create featurization and training stages"
$ dvc push

$ dvc pipeline show --ascii train.dvc --commands
          +-------------------------------------+
          | python src/prepare.py data/data.xml |
          +-------------------------------------+
                          *
                          *
                          *
   +---------------------------------------------------------+
   | python src/featurization.py data/prepared data/features |
   +---------------------------------------------------------+
                          *
                          *
                          *
          +---------------------------------------------+
          | python src/train.py data/features model.pkl |
          +---------------------------------------------+
```


* Common Workflow Language (CWL): Snakemake has a way to reference jobs
  in a separate repository by version (commit hash). I like this idea best
  in theory, and this is the same design pattern Ops people use for
  versioning infrastructure code in Terraform. Snakemake’s failure to
  match Airflow’s production-readiness in other dimensions means that
  I have never used it, however.

```
rule samtools_sort:
    input:
        input="mapped/{sample}.bam"
    output:
        output_path="mapped/{sample}.sorted.bam"
    params:
        version="fb406c95"
    cwl:
        "https://github.com/common-workflow-language/workflows/blob/{params.version}/tools/samtools-sort.cwl"
```

* Airflow - The whole branch is used to produce Airflow DAG
  definitions. A version-controlled Airflow code base has not been helpful
  to me the same way a code-committed Jenkins repo is. Data processing
  steps need to be more flexible than CI, so while ultimately the whole
  thing needs to be code-committed, I think requiring you to push code
  before running production jobs does not add intrinsic value (and
  introduces operability barriers).

As for most features, I think the best interface would be lightweight
enough to support customization. Extra complexity is burdensome
when unused, but sensitive use-cases might need mechanisms to reliably upgrade / fall
back to safe versions.

