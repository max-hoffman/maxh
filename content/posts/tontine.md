---
title: "Solidity & Tontines"
type: "post"
date: 2018-01-02T12:55:06-05:00
draft: false
---

I worked on a project awhile ago motivated by the inadequacies of the public pension system. We are approaching a tripling of retirement-age Americans. The pension systems are buckling due to poor market performance after the 2007 crash. Healthcare spending continues to rise ad neaseum. And Social Security, the only retirement plan for up to half of Americans, already has a set date for Trust Fund depletion: 2034.

Social security is a growing problem considered too intractable to discuss. Identity politics skews discussions, and older Americas who hold more political sway are the first to lose from imperfect budget cutting solutions proposed so far in Congress. Regardless of the political chatter, this problem of financial managing retirement is potentially solvable with current technology. An [Economist article](Social Security is the biggest challenge facing us - MarketWatch) summarizes a potential solution well:

>These ancient financial instruments are built on members paying money into a pool, which is invested and then pays out dividends once they reach a pre-agreed age. Those who live longest will see their income increase as others die; the last one standing receives the most. They are essentially a form of insurance against an unexpectedly long life.

This structure is called a tontine, which most of us have only heard of in the case of murder mysteries (or Archer). They are pretty illegal in the US for a few good reasons. At the top of the list are perverse incentives, cited in the 1774 Life Insurance Act (in Britain) as a motive for their prohibition. (i.e. benefiting from neighbors dying.) Policies in New York were replete with fraud and corruption, with managers making up and bypassing rules as they went, leading to their NY ban in 1905. An example of that kind of moral hazard is having new kinds with identical names. In general, the elderly are a  Overall, the moral ambiguity and severe under-appreciation of funds due to fraud made tontines useless. 

Despite the obvious pitfalls, the tontine might (and I think should) make a modern day comeback. Even without the modern advancements since the 1800's, Adam Smith aptly pointed out that this instrument appeals to the gambling nature of man to his own benefit. As long as the returns match expectations, the behavioral economics of the tontine draws incentivizes responsible investing for retirement. In the context of "who should pay for retirees," a logical answer is themselves, by saving when they are young. When operating smoothly, tontines can help people save for their own retirement. From a financial standpoint, I estimated that users would expect to double the real returns of the pool investment if reaching [life-expectancy](https://www.ssa.gov/oact/NOTES/as120/images/LD_fig5.html). So not only is it responsible in a societal sense, but it actually benefits those who partake.
Moving to the technological side of things, the main sources of innovation are genetic testing and blockchains.

DNA testing can be used to prove that people are who they say they are, that they are as old as they say they are, and that they are still alive. I was considering iris scanning, facial recognition, or some other kind of identifiers too. Genetic testing is much harder to spoof, and has the advantage of allowing for age estimation. Further advancements in tracking age to DNA methylation would be useful, but as of right now estimating age within 5 years would work well for a tontine. There might be ways of preserving DNA in spit after someone has passed away, but at some point you would notice the age window not shifting.

Blockchains provide anonymity and security of information. Additionally, automating the process with a smart contract removes most room for humans to interfere with or defraud investors. The anonymity and security bits are obvious for diluting some of the perverse incentives here: if your pool is 1,000 people across the world, identified only by their wallet addresses (or potentially not at all with XRM), you don't really experience the same moral ambiguity as you might with neighbors dying next to you. Security-wise, the best way to defraud and protect users is to prevent any of their data being modified. 

Smart contracts may or may not be the best way to approach this for a couple reasons. They would be useful for automating the process, ensuring as little human error as possible. Distributing funds in a pre-approved robotic manner sounds appealing. Additionally, many of the asynchrony problems that other distributed apps face are not a concern with year-long cron intervals. On the other hand, there are serious downsides to the rigidity and flaw rates of contracts. I would probably need to consult a team of experts before feeling confident in approaching the actual implementation of a tontine. Startups need to be flexible, barriers arise and plans need to change frequently, and not being able to update code sounds like a nightmare. On the plus side, tontines are legal in France, so there is a go-to introduction market if anyone is crazy enough to try this.

Tontines have a dark history, but with modern technology could make a brighter return into retiree finance.

On a final note, gaining advantages of insight is only obvious in hindsight. Learn and build what other people won't. Solve problems that other people can't.

*The repo for the app and smart contract can be found [here](https://github.com/Thesis-smartcontract/Thesis-Project). Will Wang and Jon Yi helped me build the contract. Josh Swamidass led the round table. And Colin Parsons was nice enough to review this for me.*
