---
title: "Data Chaos Monkeys"
type: "data"
date: 2020-02-29T08:41:58-08:00
draft: true
---

I entered my first dev job given simple instructions: use my scientific
background to improve a classification model. The problem focused on location
data - turning phone signals into consumer behavior. Ours was a 4-member team in
a 75-person engineering department: a couple software engineers, a systems
engineer, and myself as a cross-over data scientist.

My biggest mistake (or disadvantage) was not understanding how thoroughly the
customer experience was influenced by the output of our team. To explain, I
originally believed that my role was to ship better models. However, what
“better” means depends on the stakeholder. We were the intersection point of
three data teams, and an input to two other data teams. Half of the company sits
behind our bottleneck, half sit in front, and all of their members, managers and
customers react to the output of our model.  In a perfect world, teams
collaborating to process noisy data in pipelines would:

    1) build fault-tolerance systems to accommodate upstream data noise
    2) independently measure their processes in ways that allow for
       global variability attribution

Startups with limited resources can prioritize neither. Greenfield teams had
often been thrown-together on a month-to-month basis, with success measured by
first-to-market status. The same people would move to the next product shortly
after release. A decade of first-to-market products had therefore created
predictable sources of technical debt.  Those projects were made before common
data science tools existed, so most of the code was hand-rolled in C++, Clojure
or Ruby, and most of the workflow pipelines were organized with “not built
here”-esque solutions. My team managed to remove dozens of unnecessary steps,
tens of thousands of lines of unnecessary code, and bugs that each hand-rolled
step introduced. Most other teams are similarly refactoring their siloed sources
of technical debt.

I learned a lot about a new problem domain, more about organizing and
implementing production ML systems, and how to work around small untrust-worthy
data sets. But being distracted by a years-worth of bug fixes was ultimately
short-sighted. I was not working on a paper with established benchmarks and data
sets. Making the model better was actually the wrong metric.

In one way or another, all of our customer-facing products are comparisons of
location signals. Our sampling is imperfect, so raw numbers are not proxies for
absolute metrics. The comparison of samples, on the other hand, can help compare
differences in footfall, customer make-up, and targeting populations (i.e.
usefully differentiating an individual while serving ads). The intrinsic value
of the product lies in a change over time, space, user group segmentation, or a
combination of all three depending on the product.

So on the product side, we have ~3 controllable variables. The engineering side
has at least 5 different components, each with variables of its own, all that
feed into those same products. If every engineering department pushed changes
into production as they arose, live products would have more degrees of freedom
from engineering changes than customer-specified comparisons.

The solution to this has been the “PA release,” where our team packages many
engineering changes into a numbered-version. When our team does a  “release,”
two things happen. Upstream teams are unhappy because we did not incorporate
their newest features (in our defense, we often do not know about those features
until after a release). Downstream teams are similarly unhappy, because all of
the baselines for their products just shifted by 5 degrees of freedom. Both
occur in the absence of any process change on our team’s part, because none of
the services (including ours) were built to anticipate 1) fault tolerance in
response to data variance, and 2) a way to attribute variability to specific
data sources (some teams try to accommodate data noise, but unfortunately do so
in a way that is globally-inconsistent -- they break when upstream baselines
shift).

What I did last year was still necessary to improve our piece of the system, I
think. We lacked data and metrics, so I built an alternative data set to create
a more stable model, and designed some integration pipelines to predict
downstream changes more reliably. What we really needed were “release acceptance
criteria” from our stakeholders -- consistency guarantees for key customers,
business categories, and/or in-progress deals to make sure releases don’t
disrupt products. 

I regret that I only realized this interesting architectural problem after our
department dissolved. It will be interesting to see what happens next, though.
As a small aside, there are alternative ways of doing what we do, but all of the
good ones need to generalize beyond businesses who we’ve already hand-labeled
features for. A popular alternative to a generic model is “point-radius”, which
uses a distance metric to attribute POI-signal relationships. In practice, that
solves a different problem than one-to-one relationships, and you end up with
one signal to dozens of places. Because most downstream products depend on
differences of measurement, not absolute numbers, that approach often dampens
signal/noise ratios. Using a more complicated model to create a
point-radius-esque metric for every POI is interesting, though (i.e. a small
gaussian cluster for each POI). That has several attractive properties - low
variability, lookup table for inference, ease of interpretability. Any changes
will continue to break the stability of the system, however, until we have a way
to measure consistency between releases and attribute variability accordingly.

My main personal lesson is that data projects with multiple steps need top-down
organization to clarify confounding dependencies. My team should have
prioritized for success with consistency testing. We have the tools to attribute
variance per source, we can build models with consistency guarantees for every
product, and we can help sales engineers prototype how to better meet the needs
of edge-cases customers. At the same time, a) that work is still hard and
time-intensive, even if feasible, and b) the work did not obviously fall within
the realm of our team, because it meant doing additional layers of testing for
most other departments. The closest thing I can liken it to is chaos testing in
software engineering, where a separate department tries to anticipate unexpected
failures from the weight of system complexity. The state of industry data
infrastructure practices is in a lot of flux, but I am interested if there are
similar principles that can be organized into an industry data-chaos theory.

