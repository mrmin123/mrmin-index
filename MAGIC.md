## Calculating magic numbers

First, we start with the leading strand backbone, arbitrarily offset by (**6**, 0) units from the origin. Each row was then incrementally rotated **34.3** degrees for 10.5 basepair per full 360 degree turn.

The lagging strand backbone was then constructed, first simply set as offset by (-6, 0) units from the origin, but lagging by 3 rows. The true backbone location was then eyeballed to be offset by (**-1.9**, **5.5**) units from the origin.

The nucleotide angle (from leading strand backbone position to lagging strand backbone position) was then calculated to be **34.846** degrees:

<img src="https://render.githubusercontent.com/render/math?math={\arctan{\frac{5.5}{6 %2B 1.9} = 34.846^{\circ}}}#gh-light-mode-only">
<img src="https://render.githubusercontent.com/render/math?math={\color{white}\arctan{\frac{5.5}{6 %2B 1.9} = 34.846^{\circ}}}#gh-dark-mode-only">

The total space between the two backbones was calculated to be 9.626:

<img src="https://render.githubusercontent.com/render/math?math={(6 %2B 1.9)^2 %2B (5.5)^2 = (9.626)^2}#gh-light-mode-only">
<img src="https://render.githubusercontent.com/render/math?math={\color{white}(6 %2B 1.9)^2 %2B (5.5)^2 = (9.626)^2}#gh-dark-mode-only">

The length of the cylinder representing each nucleotide is thus 9.626 / 2 = **4.813**.

The pivot point of each cylinder, however, is halfway down its length. To find the location of the pivot points relative to the origin, the offset along the x-axis was first calculated. Dividing the total length along the x-axis by 4 yields 1.975. Using, this number, the relative offset from along the x-axis from the origin was calculated to be -1.9 + 1.975 = **0.075** for the lagging strand, and 0.075 + (2 * 1.975) = **4.125** for the leading strand.

Using the relative x-axis offsets relative to the leading strand backbone location, we calculate the offset for the other axis. First, for the leading strand:

<img src="https://render.githubusercontent.com/render/math?math={\tan{(34.846)} \cdot 1.975 = 1.375}#gh-light-mode-only">
<img src="https://render.githubusercontent.com/render/math?math={\color{white}\tan{(34.846)} \cdot 1.975 = 1.375}#gh-dark-mode-only">

Then, for the lagging strand:

<img src="https://render.githubusercontent.com/render/math?math={\tan{(34.846)} \cdot (1.975 %2B 3.95) = 4.125}#gh-light-mode-only">
<img src="https://render.githubusercontent.com/render/math?math={\color{white}\tan{(34.846)} \cdot (1.975 %2B 3.95) = 4.125}#gh-dark-mode-only">

Diagram illustrating the above:

![](diagram.png)